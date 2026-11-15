"""Revilend Telegram bot: the mini-app entry point plus the /api/contact bridge.

The site posts {name, contact, message} here and the payload is forwarded to the
admin chat. Nothing is stored server-side.

Configuration (environment):
    BOT_TOKEN        Telegram bot token. Missing -> /api/contact answers 503.
    ADMIN_ID         Numeric chat id that receives the messages.
    PORT             HTTP port, default 10000.
    ALLOWED_ORIGINS  Comma-separated CORS allowlist for the contact form.

The endpoint fails closed: without BOT_TOKEN and ADMIN_ID it answers 503 rather
than accepting a message it cannot deliver, and it only answers {"ok": true}
after Telegram accepted the message.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from collections import defaultdict, deque
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


def _is_rate_limited(ip: str) -> bool:
    now = time.monotonic()
    window = _requests_by_ip[ip]

    while window and now - window[0] > RATE_LIMIT_WINDOW:
        window.popleft()

    if len(window) >= RATE_LIMIT_MAX:
        return True

    window.append(now)

    if len(_requests_by_ip) > MAX_TRACKED_IPS:
        for key in [key for key, stamps in _requests_by_ip.items() if not stamps]:
            _requests_by_ip.pop(key, None)
        while len(_requests_by_ip) > MAX_TRACKED_IPS:
            _requests_by_ip.pop(next(iter(_requests_by_ip)))

    return False


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
    return web.json_response({"ok": True}, headers=headers)


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

    try:
        if bot is None:
            # Keep serving the health check and honest 503s without a bot.
            await asyncio.Event().wait()
        else:
            await dp.start_polling(bot)
    finally:
        await runner.cleanup()
        if bot is not None:
            await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        LOGGER.info("Shutting down")
