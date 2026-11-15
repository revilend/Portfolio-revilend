"""Revilend Telegram bot: the mini-app entry point and the site's bridges.

Routes:
    /api/contact  {name, contact, message} from the contact form.
    /api/report   frontend crashes and WebGL context loss, so a broken page on a
                  visitor's phone reaches the admin instead of nobody noticing.
    /api/ping     one page-view ping, feeding the weekly summary.

A weekly summary (Monday 09:00) reports views, unique visitors, contact
submissions and frontend errors for the last seven days.

The site-facing endpoints fail closed: without BOT_TOKEN and ADMIN_ID they answer
503 rather than accepting a message they cannot deliver, and they only answer
{"ok": true} after Telegram accepted it.

Configuration (environment):
    BOT_TOKEN        Telegram bot token. Missing -> the site endpoints answer 503.
    ADMIN_ID         Numeric chat id that receives the messages.
    PORT             HTTP port, default 10000.
    ALLOWED_ORIGINS  Comma-separated CORS allowlist for the site endpoints.
    TELEMETRY_PATH   Where counters are mirrored (unset -> memory only).
"""

from __future__ import annotations

import asyncio
import contextlib
import hashlib
import json
import logging
import os
import secrets
import time
from collections import defaultdict, deque
from datetime import datetime
from html import escape
from typing import Any

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)
from aiohttp import web

from telemetry import Telemetry, seconds_until_next_report, utc_day

LOGGER = logging.getLogger("revilend.bot")

SITE_URL = "https://revilend.uz"
DEFAULT_ORIGINS = f"{SITE_URL},https://www.revilend.uz"

# Telegram caps a message at 4096 characters, so the body is capped below that
# after the labels are added. src/components/Contact.jsx mirrors these numbers.
MAX_NAME = 80
MAX_CONTACT = 120
MIN_MESSAGE = 10
MAX_MESSAGE = 3500

RATE_LIMIT_WINDOW = 600  # seconds
RATE_LIMIT_MAX = 5  # requests per IP per window
MAX_TRACKED_IPS = 2048  # keeps a public endpoint's memory bounded

# --- frontend reporting ------------------------------------------------------
# An endpoint that can write into the admin chat has to be narrower than the
# contact form: small fields, a tighter window and one identical report per hour,
# so a broken render loop on one device cannot flood Telegram.
MAX_REPORT_MESSAGE = 400
MAX_REPORT_STACK = 1200
MAX_REPORT_SOURCE = 200
MAX_REPORT_UA = 160
REPORT_KINDS = {"error", "unhandledrejection", "webgl", "webgl-restored"}

REPORT_LIMIT_WINDOW = 600  # seconds
REPORT_LIMIT_MAX = 6  # reports per IP per window
REPORT_DEDUPE_WINDOW = 3600  # an identical report is forwarded once an hour
MAX_REPORT_SIGNATURES = 512

PING_WINDOW = 60  # one page-view ping per IP per minute
TELEMETRY_SAVE_INTERVAL = 30  # seconds between disk writes

WEEKLY_REPORT_WEEKDAY = 0  # 0 = Monday
WEEKLY_REPORT_HOUR = 9


def _int_env(name: str, default: int) -> int:
    raw = os.getenv(name, "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        LOGGER.warning("%s=%r is not an integer; using %s instead", name, raw, default)
        return default


BOT_TOKEN = (os.getenv("BOT_TOKEN") or "").strip()
ADMIN_ID = _int_env("ADMIN_ID", 0)
PORT = _int_env("PORT", 10000)
ALLOWED_ORIGINS = {
    origin.strip().rstrip("/")
    for origin in (os.getenv("ALLOWED_ORIGINS") or DEFAULT_ORIGINS).split(",")
    if origin.strip()
}

# aiogram refuses to build a Bot without a token, so the web side has to survive
# without one: the process keeps serving and /api/contact answers 503.
bot = Bot(token=BOT_TOKEN) if BOT_TOKEN else None
dp = Dispatcher()

_requests_by_ip: dict[str, deque[float]] = defaultdict(deque)
_reports_by_ip: dict[str, deque[float]] = defaultdict(deque)
_pings_by_ip: dict[str, deque[float]] = defaultdict(deque)
_recent_signatures: dict[str, float] = {}

# A per-process salt keeps visitor digests unlinkable between restarts; no IP is
# ever written to disk.
_VISITOR_SALT = secrets.token_hex(8)
TELEMETRY = Telemetry(os.getenv("TELEMETRY_PATH") or None)
_telemetry_saved_at = 0.0


class OrderState(StatesGroup):
    waiting_text = State()


def main_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🌐 Revilend.uz (3D Portfolio)",
                    web_app=WebAppInfo(url=SITE_URL),
                )
            ],
            [
                InlineKeyboardButton(
                    text="🎮 Revilend Games", url="https://t.me/revilend_gamesbot"
                ),
                InlineKeyboardButton(
                    text="🎵 @revilendmusic", url="https://youtube.com/@revilendmusic"
                ),
            ],
            [InlineKeyboardButton(text="📩 Buyurtma / Loyiha yuborish", callback_data="order")],
        ]
    )


@dp.message(CommandStart())
async def cmd_start(message: Message) -> None:
    # first_name is user-controlled, so it is escaped for the same reason the
    # web payload is: an unbalanced tag would abort the send.
    await message.answer(
        f"Salom, {escape(message.from_user.first_name)}! 👋\n\n"
        "Bu — <b>Revilend</b> ekotizimining rasmiy markazi.\n"
        "Portfolio saytni Mini App sifatida ochishingiz, loyihalar bilan tanishishingiz "
        "yoki bot/sayt buyurtma qoldirishingiz mumkin:",
        reply_markup=main_menu(),
        parse_mode="HTML",
    )


@dp.callback_query(F.data == "order")
async def ask_order(call: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(OrderState.waiting_text)
    await call.message.answer(
        "✍️ Qanday bot, sayt yoki loyiha kerakligini yozib yuboring "
        "(aloqa uchun @username ham qoldiring):"
    )
    await call.answer()


@dp.message(OrderState.waiting_text)
async def send_order(message: Message, state: FSMContext) -> None:
    await state.clear()
    user = message.from_user
    text = (
        "📥 <b>Yangi buyurtma (@revilendbot)</b>\n"
        f"👤 {escape(user.full_name)} (@{escape(user.username or 'yoq')}) | ID: <code>{user.id}</code>\n\n"
        f"💬 {escape(message.text or '')}"
    )
    if ADMIN_ID:
        try:
            await bot.send_message(ADMIN_ID, text, parse_mode="HTML")
        except Exception:
            LOGGER.exception("Failed to deliver a bot order")
            await message.answer("⚠️ Xabar yuborilmadi. Birozdan soʻng qayta urinib koʻring.")
            return
    await message.answer("✅ Xabaringiz yuborildi! Tez orada javob beramiz.", reply_markup=main_menu())


def _cors_headers(origin: str) -> dict[str, str]:
    headers = {
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "600",
        "X-Content-Type-Options": "nosniff",
    }
    normalized = origin.rstrip("/")
    if normalized and normalized in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = normalized
    return headers


def _client_ip(request: web.Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    peer = request.transport.get_extra_info("peername") if request.transport else None
    return peer[0] if peer else "unknown"


def _window_limited(
    store: dict[str, deque[float]], ip: str, limit: int, window: int
) -> bool:
    """Sliding-window limiter over a bounded per-IP store.

    True means the caller is over the limit; otherwise the request is recorded
    and False is returned. The store drops the oldest entries once it grows past
    MAX_TRACKED_IPS, so a public endpoint cannot grow it without bound.
    """
    now = time.monotonic()
    stamps = store[ip]

    while stamps and now - stamps[0] > window:
        stamps.popleft()

    if len(stamps) >= limit:
        return True

    stamps.append(now)

    if len(store) > MAX_TRACKED_IPS:
        for key in [key for key, value in store.items() if not value]:
            store.pop(key, None)
        while len(store) > MAX_TRACKED_IPS:
            store.pop(next(iter(store)))

    return False


def _is_rate_limited(ip: str) -> bool:
    return _window_limited(_requests_by_ip, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)


def _read_field(payload: dict[str, Any], key: str, limit: int) -> str:
    value = payload.get(key)
    if not isinstance(value, str):
        return ""
    return value.strip()[:limit]


async def handle_web_contact(request: web.Request) -> web.Response:
    headers = _cors_headers(request.headers.get("Origin", ""))

    if request.method == "OPTIONS":
        return web.Response(status=204, headers=headers)

    if request.method != "POST":
        return web.json_response(
            {"ok": False, "error": "method_not_allowed"},
            status=405,
            headers={**headers, "Allow": "POST, OPTIONS"},
        )

    # Fail closed: never accept a message that cannot be delivered.
    if bot is None or not ADMIN_ID:
        LOGGER.warning("Contact request refused: BOT_TOKEN or ADMIN_ID is missing")
        return web.json_response(
            {"ok": False, "error": "contact_unavailable"}, status=503, headers=headers
        )

    if _is_rate_limited(_client_ip(request)):
        return web.json_response(
            {"ok": False, "error": "rate_limited"},
            status=429,
            headers={**headers, "Retry-After": str(RATE_LIMIT_WINDOW)},
        )

    try:
        payload = await request.json()
    except (json.JSONDecodeError, ValueError, UnicodeDecodeError):
        return web.json_response(
            {"ok": False, "error": "invalid_json"}, status=400, headers=headers
        )

    if not isinstance(payload, dict):
        return web.json_response(
            {"ok": False, "error": "invalid_payload"}, status=400, headers=headers
        )

    name = _read_field(payload, "name", MAX_NAME) or "Nomaʼlum"
    contact = _read_field(payload, "contact", MAX_CONTACT) or "Koʻrsatilmagan"
    message = _read_field(payload, "message", MAX_MESSAGE)

    if len(message) < MIN_MESSAGE:
        return web.json_response(
            {"ok": False, "error": "message_too_short"}, status=422, headers=headers
        )

    # parse_mode="HTML" with every user value escaped: Markdown metacharacters a
    # visitor types stay literal instead of breaking the send.
    text = (
        "🌐 <b>Revilend.uz saytidan yangi xabar!</b>\n\n"
        f"👤 <b>Ism:</b> {escape(name)}\n"
        f"📞 <b>Aloqa:</b> {escape(contact)}\n"
        f"💬 <b>Xabar:</b> {escape(message)}"
    )

    try:
        await bot.send_message(
            ADMIN_ID, text, parse_mode="HTML", disable_web_page_preview=True
        )
    except Exception:
        LOGGER.exception("Failed to deliver a contact message")
        return web.json_response(
            {"ok": False, "error": "delivery_failed"}, status=502, headers=headers
        )

    LOGGER.info(
        "Contact message delivered (name=%d chars, message=%d chars)",
        len(name),
        len(message),
    )
    TELEMETRY.bump(utc_day(), "contacts")
    _maybe_save_telemetry()
    return web.json_response({"ok": True}, headers=headers)


def _visitor_digest(ip: str) -> str:
    """Salted digest: visitors stay countable without storing an address."""
    return hashlib.sha256(f"{_VISITOR_SALT}:{ip}".encode()).hexdigest()[:16]


def _report_signature(kind: str, message: str) -> str:
    return f"{kind}: {message}"[:200]


def _is_duplicate_report(signature: str) -> bool:
    """Forward one identical failure per hour instead of every occurrence."""
    now = time.monotonic()

    for key, stamp in list(_recent_signatures.items()):
        if now - stamp > REPORT_DEDUPE_WINDOW:
            _recent_signatures.pop(key, None)

    if signature in _recent_signatures:
        return True

    if len(_recent_signatures) >= MAX_REPORT_SIGNATURES:
        _recent_signatures.pop(next(iter(_recent_signatures)))

    _recent_signatures[signature] = now
    return False


def _maybe_save_telemetry(force: bool = False) -> None:
    global _telemetry_saved_at
    now = time.monotonic()
    if not force and now - _telemetry_saved_at < TELEMETRY_SAVE_INTERVAL:
        return
    _telemetry_saved_at = now
    TELEMETRY.save()


async def handle_ping(request: web.Request) -> web.Response:
    """One page view per IP per minute, feeding the weekly summary.

    Always answers ok: a visitor's browser must never show a failure because of
    analytics.
    """
    headers = _cors_headers(request.headers.get("Origin", ""))

    if request.method == "OPTIONS":
        return web.Response(status=204, headers=headers)

    if request.method != "POST":
        return web.json_response(
            {"ok": False, "error": "method_not_allowed"},
            status=405,
            headers={**headers, "Allow": "POST, OPTIONS"},
        )

    ip = _client_ip(request)
    if not _window_limited(_pings_by_ip, ip, 1, PING_WINDOW):
        day = utc_day()
        TELEMETRY.bump(day, "views")
        TELEMETRY.note_visitor(day, _visitor_digest(ip))
        _maybe_save_telemetry()

    return web.json_response({"ok": True}, headers=headers)


async def handle_report(request: web.Request) -> web.Response:
    """Frontend crash and WebGL context-loss reports, forwarded to the admin."""
    headers = _cors_headers(request.headers.get("Origin", ""))

    if request.method == "OPTIONS":
        return web.Response(status=204, headers=headers)

    if request.method != "POST":
        return web.json_response(
            {"ok": False, "error": "method_not_allowed"},
            status=405,
            headers={**headers, "Allow": "POST, OPTIONS"},
        )

    # Fail closed: a report that cannot be delivered is not "received".
    if bot is None or not ADMIN_ID:
        LOGGER.warning("Report refused: BOT_TOKEN or ADMIN_ID is missing")
        return web.json_response(
            {"ok": False, "error": "report_unavailable"}, status=503, headers=headers
        )

    if _window_limited(
        _reports_by_ip, _client_ip(request), REPORT_LIMIT_MAX, REPORT_LIMIT_WINDOW
    ):
        return web.json_response(
            {"ok": False, "error": "rate_limited"},
            status=429,
            headers={**headers, "Retry-After": str(REPORT_LIMIT_WINDOW)},
        )

    try:
        payload = await request.json()
    except (json.JSONDecodeError, ValueError, UnicodeDecodeError):
        return web.json_response(
            {"ok": False, "error": "invalid_json"}, status=400, headers=headers
        )

    if not isinstance(payload, dict):
        return web.json_response(
            {"ok": False, "error": "invalid_payload"}, status=400, headers=headers
        )

    kind = payload.get("kind")
    if kind not in REPORT_KINDS:
        return web.json_response(
            {"ok": False, "error": "invalid_kind"}, status=422, headers=headers
        )

    message = _read_field(payload, "message", MAX_REPORT_MESSAGE)
    if not message:
        return web.json_response(
            {"ok": False, "error": "empty_message"}, status=422, headers=headers
        )

    stack = _read_field(payload, "stack", MAX_REPORT_STACK)
    source = _read_field(payload, "source", MAX_REPORT_SOURCE)
    user_agent = _read_field(payload, "ua", MAX_REPORT_UA)

    signature = _report_signature(kind, message)
    if _is_duplicate_report(signature):
        return web.json_response({"ok": True, "deduped": True}, headers=headers)

    # Every value is escaped: a message or stack may contain characters that would
    # break the HTML parse or inject markup into the admin chat.
    text = (
        "🛠 <b>Saytda xato</b>\n\n"
        f"🧨 <b>Turi:</b> {escape(kind)}\n"
        f"💬 <b>Xabar:</b> {escape(message)}\n"
        f"🌐 <b>Manba:</b> {escape(source or 'nomaʼlum')}\n"
        f"📱 <b>Qurilma:</b> {escape(user_agent or 'nomaʼlum')}"
    )
    if stack:
        text += f"\n\n<pre>{escape(stack[:MAX_REPORT_STACK])}</pre>"

    try:
        await bot.send_message(
            ADMIN_ID, text, parse_mode="HTML", disable_web_page_preview=True
        )
    except Exception:
        LOGGER.exception("Failed to deliver a frontend report")
        return web.json_response(
            {"ok": False, "error": "delivery_failed"}, status=502, headers=headers
        )

    day = utc_day()
    TELEMETRY.bump(day, "reports")
    if kind.startswith("webgl"):
        TELEMETRY.bump(day, "webgl")
    TELEMETRY.note_error(day, signature)
    _maybe_save_telemetry(force=True)

    return web.json_response({"ok": True}, headers=headers)


async def send_weekly_summary(now: datetime | None = None) -> bool:
    """Sends the seven-day summary to the admin. Returns False when undeliverable."""
    if bot is None or not ADMIN_ID:
        LOGGER.warning("Weekly summary skipped: BOT_TOKEN or ADMIN_ID is missing")
        return False

    try:
        await bot.send_message(
            ADMIN_ID, TELEMETRY.summary_text(now=now), parse_mode="HTML"
        )
    except Exception:
        LOGGER.exception("Failed to deliver the weekly summary")
        return False

    TELEMETRY.roll(now)
    TELEMETRY.save()
    LOGGER.info("Weekly summary delivered")
    return True


async def weekly_summary_loop() -> None:
    """Sleeps until Monday 09:00, then sends the summary. Never dies on errors."""
    while True:
        delay = seconds_until_next_report(
            weekday=WEEKLY_REPORT_WEEKDAY, hour=WEEKLY_REPORT_HOUR
        )
        LOGGER.info("Next weekly summary in %.0f s", delay)
        await asyncio.sleep(delay)
        await send_weekly_summary()


async def health(_request: web.Request) -> web.Response:
    return web.json_response(
        {
            "ok": True,
            "service": "revilendbot",
            "contact_ready": bot is not None and bool(ADMIN_ID),
        }
    )


def create_app() -> web.Application:
    app = web.Application()
    app.router.add_get("/", health)
    app.router.add_route("*", "/api/contact", handle_web_contact)
    app.router.add_route("*", "/api/report", handle_report)
    app.router.add_route("*", "/api/ping", handle_ping)
    return app


async def main() -> None:
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s"
    )

    if bot is None:
        LOGGER.error(
            "BOT_TOKEN is not set: /api/contact will answer 503 and polling is disabled"
        )
    elif not ADMIN_ID:
        LOGGER.error("ADMIN_ID is not set: /api/contact will answer 503")

    runner = web.AppRunner(create_app())
    await runner.setup()
    await web.TCPSite(runner, "0.0.0.0", PORT).start()
    LOGGER.info("HTTP listening on 0.0.0.0:%s", PORT)

    summary_task = asyncio.create_task(weekly_summary_loop())

    try:
        if bot is None:
            # Keep serving the health check and honest 503s without a bot.
            await asyncio.Event().wait()
        else:
            await dp.start_polling(bot)
    finally:
        summary_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await summary_task
        TELEMETRY.save()
        await runner.cleanup()
        if bot is not None:
            await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        LOGGER.info("Shutting down")
