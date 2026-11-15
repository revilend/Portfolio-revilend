"""Tests for /api/report, /api/ping and the weekly summary in main.py.

Run with:  .venv/bin/python -m pytest tests -q
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta

import pytest
from aiohttp.test_utils import TestClient, TestServer

import main as bot_main
from telemetry import Telemetry, seconds_until_next_report, utc_day


class FakeBot:
    """Records what would have been sent to Telegram."""

    def __init__(self, fail: bool = False) -> None:
        self.fail = fail
        self.sent: list[dict] = []

    async def send_message(self, chat_id, text, **kwargs):
        if self.fail:
            raise RuntimeError("telegram is down")
        self.sent.append({"chat_id": chat_id, "text": text, **kwargs})


ALLOWED = "https://revilend.uz"


@pytest.fixture(autouse=True)
def reset_state(monkeypatch, tmp_path):
    bot_main._requests_by_ip.clear()
    bot_main._reports_by_ip.clear()
    bot_main._pings_by_ip.clear()
    bot_main._recent_signatures.clear()
    monkeypatch.setattr(bot_main, "bot", None)
    monkeypatch.setattr(bot_main, "ADMIN_ID", 0)
    monkeypatch.setattr(bot_main, "ALLOWED_ORIGINS", {ALLOWED})
    monkeypatch.setattr(bot_main, "TELEMETRY", Telemetry(tmp_path / "telemetry.json"))
    monkeypatch.setattr(bot_main, "_telemetry_saved_at", 0.0)
    yield


def run(coroutine):
    return asyncio.run(coroutine)


async def call(method: str, path: str, *, payload=None, headers=None):
    async with TestClient(TestServer(bot_main.create_app())) as client:
        response = await client.request(method, path, json=payload, headers=headers)
        try:
            body = await response.json()
        except Exception:
            body = None
        return response.status, body


def configure_bot(monkeypatch, *, fail: bool = False) -> FakeBot:
    fake = FakeBot(fail=fail)
    monkeypatch.setattr(bot_main, "bot", fake)
    monkeypatch.setattr(bot_main, "ADMIN_ID", 42)
    return fake


# --- /api/report -----------------------------------------------------------


def test_report_returns_503_without_bot():
    status, body = run(call("POST", "/api/report", payload={"kind": "error", "message": "boom"}))
    assert status == 503
    assert body == {"ok": False, "error": "report_unavailable"}


def test_report_forwards_an_escaped_message(monkeypatch):
    fake = configure_bot(monkeypatch)
    status, body = run(
        call(
            "POST",
            "/api/report",
            payload={
                "kind": "error",
                "message": "<b>ReferenceError</b> x is not defined",
                "stack": "at scene.js:12",
                "source": "/loyiha/echoes-of-room-404/",
                "ua": "Mozilla/5.0",
            },
        )
    )

    assert status == 200
    assert body == {"ok": True}
    assert len(fake.sent) == 1
    text = fake.sent[0]["text"]
    assert fake.sent[0]["chat_id"] == 42
    assert "&lt;b&gt;ReferenceError&lt;/b&gt;" in text
    assert "<pre>at scene.js:12</pre>" in text
    assert "WebGL" not in text


def test_report_counts_as_an_error_and_webgl_loss(monkeypatch):
    configure_bot(monkeypatch)
    run(call("POST", "/api/report", payload={"kind": "webgl", "message": "kontekst yoqoldi"}))

    window = bot_main.TELEMETRY.window()
    assert window["reports"] == 1
    assert window["webgl"] == 1
    assert window["top_errors"] == [("webgl: kontekst yoqoldi", 1)]


def test_report_ignores_an_identical_failure_within_the_hour(monkeypatch):
    fake = configure_bot(monkeypatch)
    payload = {"kind": "error", "message": "render loop crashed"}

    first = run(call("POST", "/api/report", payload=payload))
    second = run(call("POST", "/api/report", payload=payload))

    assert first == (200, {"ok": True})
    assert second == (200, {"ok": True, "deduped": True})
    assert len(fake.sent) == 1
    assert bot_main.TELEMETRY.window()["reports"] == 1


def test_report_rejects_unknown_kind_and_empty_message(monkeypatch):
    configure_bot(monkeypatch)

    assert run(call("POST", "/api/report", payload={"kind": "panic", "message": "x"})) == (
        422,
        {"ok": False, "error": "invalid_kind"},
    )
    assert run(call("POST", "/api/report", payload={"kind": "error", "message": "  "})) == (
        422,
        {"ok": False, "error": "empty_message"},
    )


def test_report_truncates_a_long_message(monkeypatch):
    fake = configure_bot(monkeypatch)
    status, _ = run(
        call("POST", "/api/report", payload={"kind": "error", "message": "x" * 5000})
    )

    assert status == 200
    text = fake.sent[0]["text"]
    assert "x" * bot_main.MAX_REPORT_MESSAGE in text
    assert "x" * (bot_main.MAX_REPORT_MESSAGE + 1) not in text


def test_report_rate_limit_stops_a_flood(monkeypatch):
    configure_bot(monkeypatch)
    statuses = [
        run(call("POST", "/api/report", payload={"kind": "error", "message": f"boom {i}"}))[0]
        for i in range(bot_main.REPORT_LIMIT_MAX + 1)
    ]

    assert statuses[: bot_main.REPORT_LIMIT_MAX] == [200] * bot_main.REPORT_LIMIT_MAX
    assert statuses[-1] == 429


def test_report_reports_delivery_failure_without_counting_it(monkeypatch):
    configure_bot(monkeypatch, fail=True)
    status, body = run(call("POST", "/api/report", payload={"kind": "error", "message": "boom"}))

    assert status == 502
    assert body == {"ok": False, "error": "delivery_failed"}
    assert bot_main.TELEMETRY.window()["reports"] == 0


def test_report_rejects_non_post():
    status, _ = run(call("GET", "/api/report"))
    assert status == 405


# --- /api/ping -------------------------------------------------------------


def test_ping_counts_a_view_and_a_unique_visitor():
    status, body = run(call("POST", "/api/ping", payload={}))

    assert status == 200
    assert body == {"ok": True}
    window = bot_main.TELEMETRY.window()
    assert window["views"] == 1
    assert window["visitors"] == 1


def test_ping_does_not_inflate_within_the_window():
    run(call("POST", "/api/ping", payload={}))
    run(call("POST", "/api/ping", payload={}))

    assert bot_main.TELEMETRY.window()["views"] == 1


def test_ping_works_without_a_bot():
    # Analytics must not fail closed: a missing token is not a visitor's problem.
    status, _ = run(call("POST", "/api/ping", payload={}))
    assert status == 200


# --- weekly summary --------------------------------------------------------


def test_weekly_summary_sends_the_window_to_the_admin(monkeypatch):
    fake = configure_bot(monkeypatch)
    day = utc_day()
    bot_main.TELEMETRY.bump(day, "views", 120)
    bot_main.TELEMETRY.bump(day, "contacts", 3)
    bot_main.TELEMETRY.note_visitor(day, "digest-a")

    assert run(bot_main.send_weekly_summary()) is True

    text = fake.sent[-1]["text"]
    assert "Haftalik xulosa" in text
    assert "120" in text
    assert "Kontakt xabarlari: <b>3</b>" in text


def test_weekly_summary_skips_without_a_bot():
    assert run(bot_main.send_weekly_summary()) is False


def test_weekly_summary_survives_a_failed_send(monkeypatch):
    configure_bot(monkeypatch, fail=True)
    assert run(bot_main.send_weekly_summary()) is False


def test_next_report_is_the_next_monday_morning():
    now = datetime(2026, 11, 15, 12, 0)
    delay = seconds_until_next_report(now)
    target = now + timedelta(seconds=delay)

    assert target.weekday() == 0
    assert (target.hour, target.minute) == (9, 0)
    assert 0 < delay <= 7 * 24 * 3600


def test_summary_is_honest_about_partial_coverage():
    text = Telemetry(None).summary_text()
    assert "kunni qamraydi" in text


def test_telemetry_persists_and_rolls_old_days(tmp_path):
    path = tmp_path / "telemetry.json"
    telemetry = Telemetry(path)
    telemetry.bump(utc_day(), "views", 5)
    telemetry.note_visitor(utc_day(), "digest-b")
    telemetry.save()

    reloaded = Telemetry(path)
    assert reloaded.window()["views"] == 5
    assert reloaded.window()["visitors"] == 1

    reloaded.roll(datetime.now(UTC) + timedelta(days=30))
    assert reloaded.window()["views"] == 0
