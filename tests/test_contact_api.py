"""Tests for the /api/contact hardening in main.py.

Run with:  .venv/bin/python -m pytest tests -q
"""

from __future__ import annotations

import asyncio

import pytest
from aiohttp.test_utils import TestClient, TestServer

import main as bot_main


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
def reset_state(monkeypatch):
    bot_main._requests_by_ip.clear()
    monkeypatch.setattr(bot_main, "RATE_LIMIT_MAX", 5)
    monkeypatch.setattr(bot_main, "bot", None)
    monkeypatch.setattr(bot_main, "ADMIN_ID", 0)
    monkeypatch.setattr(bot_main, "ALLOWED_ORIGINS", {ALLOWED})
    yield
    bot_main._requests_by_ip.clear()


def run(coroutine):
    return asyncio.run(coroutine)


async def call(method: str, path: str, *, payload=None, headers=None, data=None):
    """Send one request through a fresh aiohttp test server."""

    async with TestClient(TestServer(bot_main.create_app())) as client:
        response = await client.request(
            method, path, json=payload, headers=headers, data=data
        )
        try:
            body = await response.json()
        except Exception:
            body = None
        return response.status, response.headers, body


def configure_bot(monkeypatch, *, fail: bool = False) -> FakeBot:
    fake = FakeBot(fail=fail)
    monkeypatch.setattr(bot_main, "bot", fake)
    monkeypatch.setattr(bot_main, "ADMIN_ID", 42)
    return fake


# --- fail closed -----------------------------------------------------------


def test_returns_503_when_bot_token_is_missing():
    status, _, body = run(call("POST", "/api/contact", payload={"message": "Salom, loyiha bor"}))
    assert status == 503
    assert body == {"ok": False, "error": "contact_unavailable"}


def test_returns_503_when_admin_id_is_missing(monkeypatch):
    monkeypatch.setattr(bot_main, "bot", FakeBot())
    monkeypatch.setattr(bot_main, "ADMIN_ID", 0)

    status, _, body = run(call("POST", "/api/contact", payload={"message": "Salom, loyiha bor"}))
    assert status == 503
    assert body["error"] == "contact_unavailable"


def test_health_reports_contact_readiness(monkeypatch):
    status, _, body = run(call("GET", "/"))
    assert status == 200
    assert body["contact_ready"] is False

    configure_bot(monkeypatch)
    status, _, body = run(call("GET", "/"))
    assert status == 200
    assert body["contact_ready"] is True


# --- delivery --------------------------------------------------------------


def test_delivers_and_escapes_user_text(monkeypatch):
    fake = configure_bot(monkeypatch)

    status, _, body = run(
        call(
            "POST",
            "/api/contact",
            payload={
                "name": "<b>Aziz</b>",
                "contact": "*@aziz_test*",
                "message": "<script>alert(1)</script> **not bold** _x_",
            },
        )
    )

    assert status == 200
    assert body == {"ok": True}
    assert len(fake.sent) == 1

    sent = fake.sent[0]
    assert sent["chat_id"] == 42
    assert sent["parse_mode"] == "HTML"
    assert "<script>" not in sent["text"]
    assert "&lt;script&gt;" in sent["text"]
    assert "<b>Aziz</b>" not in sent["text"]
    # Markdown metacharacters are literal under HTML mode, not a format error.
    assert "**not bold**" in sent["text"]
    assert "_x_" in sent["text"]


def test_reports_delivery_failure_without_claiming_success(monkeypatch):
    configure_bot(monkeypatch, fail=True)

    status, _, body = run(
        call("POST", "/api/contact", payload={"message": "Salom, loyiha bor"})
    )

    assert status == 502
    assert body == {"ok": False, "error": "delivery_failed"}
    # No internals leaked to the caller.
    assert "telegram is down" not in str(body)


def test_truncates_long_message_below_telegram_limit(monkeypatch):
    fake = configure_bot(monkeypatch)

    status, _, _ = run(
        call("POST", "/api/contact", payload={"message": "x" * 5000})
    )

    assert status == 200
    assert len(fake.sent[0]["text"]) <= 4096


def test_truncates_long_name_and_contact(monkeypatch):
    fake = configure_bot(monkeypatch)

    status, _, _ = run(
        call(
            "POST",
            "/api/contact",
            payload={"name": "n" * 300, "contact": "c" * 300, "message": "Salom, loyiha bor"},
        )
    )

    assert status == 200
    text = fake.sent[0]["text"]
    assert "n" * 300 not in text
    assert "c" * 300 not in text


# --- validation ------------------------------------------------------------


def test_rejects_short_message(monkeypatch):
    fake = configure_bot(monkeypatch)

    status, _, body = run(call("POST", "/api/contact", payload={"message": "qisqa"}))

    assert status == 422
    assert body["error"] == "message_too_short"
    assert fake.sent == []


def test_rejects_invalid_json(monkeypatch):
    configure_bot(monkeypatch)

    status, _, body = run(
        call(
            "POST",
            "/api/contact",
            data="{not json",
            headers={"Content-Type": "application/json"},
        )
    )

    assert status == 400
    assert body["error"] == "invalid_json"


def test_rejects_non_object_payload(monkeypatch):
    configure_bot(monkeypatch)

    status, _, body = run(call("POST", "/api/contact", payload=["Salom", "loyiha"]))

    assert status == 400
    assert body["error"] == "invalid_payload"


def test_rejects_get(monkeypatch):
    configure_bot(monkeypatch)

    status, headers, body = run(call("GET", "/api/contact"))

    assert status == 405
    assert body["error"] == "method_not_allowed"
    assert headers["Allow"] == "POST, OPTIONS"


# --- rate limiting ---------------------------------------------------------


def test_rate_limits_repeated_requests_from_one_ip(monkeypatch):
    configure_bot(monkeypatch)
    monkeypatch.setattr(bot_main, "RATE_LIMIT_MAX", 2)
    headers = {"X-Forwarded-For": "203.0.113.7"}

    statuses = [
        run(call("POST", "/api/contact", payload={"message": "Salom, loyiha bor"}, headers=headers))[0]
        for _ in range(3)
    ]

    assert statuses == [200, 200, 429]


def test_rate_limit_is_per_ip(monkeypatch):
    configure_bot(monkeypatch)
    monkeypatch.setattr(bot_main, "RATE_LIMIT_MAX", 1)

    first = run(
        call(
            "POST",
            "/api/contact",
            payload={"message": "Salom, loyiha bor"},
            headers={"X-Forwarded-For": "203.0.113.7"},
        )
    )[0]
    second = run(
        call(
            "POST",
            "/api/contact",
            payload={"message": "Salom, loyiha bor"},
            headers={"X-Forwarded-For": "198.51.100.9"},
        )
    )[0]

    assert (first, second) == (200, 200)


def test_rate_limit_reports_retry_after(monkeypatch):
    configure_bot(monkeypatch)
    monkeypatch.setattr(bot_main, "RATE_LIMIT_MAX", 1)
    headers = {"X-Forwarded-For": "203.0.113.7"}

    run(call("POST", "/api/contact", payload={"message": "Salom, loyiha bor"}, headers=headers))
    status, response_headers, _ = run(
        call("POST", "/api/contact", payload={"message": "Salom, loyiha bor"}, headers=headers)
    )

    assert status == 429
    assert response_headers["Retry-After"] == str(bot_main.RATE_LIMIT_WINDOW)


# --- CORS ------------------------------------------------------------------


def test_allows_configured_origin(monkeypatch):
    configure_bot(monkeypatch)

    _, headers, _ = run(
        call(
            "POST",
            "/api/contact",
            payload={"message": "Salom, loyiha bor"},
            headers={"Origin": ALLOWED},
        )
    )

    assert headers["Access-Control-Allow-Origin"] == ALLOWED


def test_omits_acao_for_foreign_origin(monkeypatch):
    configure_bot(monkeypatch)

    _, headers, _ = run(
        call(
            "POST",
            "/api/contact",
            payload={"message": "Salom, loyiha bor"},
            headers={"Origin": "https://evil.example"},
        )
    )

    assert "Access-Control-Allow-Origin" not in headers
    assert headers["Vary"] == "Origin"


def test_preflight_is_answered(monkeypatch):
    status, headers, _ = run(call("OPTIONS", "/api/contact", headers={"Origin": ALLOWED}))

    assert status == 204
    assert headers["Access-Control-Allow-Origin"] == ALLOWED
    assert headers["Access-Control-Allow-Methods"] == "POST, OPTIONS"
