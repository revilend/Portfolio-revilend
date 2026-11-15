"""Weekly traffic / contact / frontend-error counters for the Revilend bot.

The portfolio itself is a static build served elsewhere, so "traffic" here means
what actually reaches this process: the page-view ping the site sends on first
load, contact submissions and frontend error reports.

Counters live in memory and are mirrored to a small JSON file, because a deploy
restarts the process and an in-memory-only counter would silently report zero.
The summary says how many days it actually covers for the same reason.

Nothing here stores an IP address: visitors are counted through a salted digest
that is regenerated on every process start.
"""

from __future__ import annotations

import json
import logging
import os
from collections import Counter
from datetime import UTC, date, datetime, timedelta
from html import escape
from pathlib import Path
from typing import Any

LOGGER = logging.getLogger("revilend.telemetry")

KEEP_DAYS = 14
MAX_ERROR_KINDS = 25
MAX_VISITORS_PER_DAY = 5000

EMPTY_BUCKET = {"views": 0, "contacts": 0, "reports": 0, "webgl": 0}


def utc_day(now: datetime | None = None) -> str:
    """ISO date of `now` in UTC — the key every bucket is stored under."""
    moment = now or datetime.now(UTC)
    return moment.astimezone(UTC).date().isoformat()


def _thousands(value: int) -> str:
    return f"{value:,}".replace(",", " ")


def seconds_until_next_report(
    now: datetime | None = None, weekday: int = 0, hour: int = 9
) -> float:
    """Seconds until the next `weekday` (0 = Monday) at `hour`, local time."""
    moment = now or datetime.now()
    days_ahead = (weekday - moment.weekday()) % 7
    target = (moment + timedelta(days=days_ahead)).replace(
        hour=hour, minute=0, second=0, microsecond=0
    )
    if target <= moment:
        target += timedelta(days=7)
    return (target - moment).total_seconds()


class Telemetry:
    """Per-day counters with a seven-day view and a Telegram-ready summary."""

    def __init__(
        self, path: str | os.PathLike[str] | None = None, keep_days: int = KEEP_DAYS
    ) -> None:
        self.path = Path(path) if path else None
        self.keep_days = keep_days
        self.days: dict[str, dict[str, Any]] = {}
        self.started_at = datetime.now(UTC)
        self.load()

    # --- writing ---------------------------------------------------------
    def _bucket(self, day: str) -> dict[str, Any]:
        bucket = self.days.get(day)
        if bucket is None:
            bucket = {**EMPTY_BUCKET, "visitors": [], "errors": {}}
            self.days[day] = bucket

        for key, value in EMPTY_BUCKET.items():
            bucket.setdefault(key, value)
        bucket.setdefault("visitors", [])
        bucket.setdefault("errors", {})
        return bucket

    def bump(self, day: str, metric: str, amount: int = 1) -> None:
        if metric not in EMPTY_BUCKET:
            raise ValueError(f"unknown metric: {metric}")
        bucket = self._bucket(day)
        bucket[metric] = int(bucket.get(metric, 0)) + amount

    def note_visitor(self, day: str, digest: str) -> None:
        bucket = self._bucket(day)
        visitors = bucket["visitors"]
        if digest not in visitors and len(visitors) < MAX_VISITORS_PER_DAY:
            visitors.append(digest)

    def note_error(self, day: str, signature: str) -> None:
        errors = self._bucket(day)["errors"]
        if signature not in errors and len(errors) >= MAX_ERROR_KINDS:
            return
        errors[signature] = int(errors.get(signature, 0)) + 1

    # --- reading ---------------------------------------------------------
    def window(self, days: int = 7, now: datetime | None = None) -> dict[str, Any]:
        moment = now or datetime.now(UTC)
        start = (moment - timedelta(days=days - 1)).date()

        totals: dict[str, Any] = {**EMPTY_BUCKET, "visitors": 0}
        visitors: set[str] = set()
        errors: Counter[str] = Counter()
        covered = 0

        for day_key, bucket in self.days.items():
            try:
                parsed = date.fromisoformat(day_key)
            except ValueError:
                continue
            if parsed < start:
                continue

            covered += 1
            for metric in EMPTY_BUCKET:
                totals[metric] += int(bucket.get(metric, 0))
            visitors.update(bucket.get("visitors", []))
            for signature, count in bucket.get("errors", {}).items():
                errors[signature] += int(count)

        totals["visitors"] = len(visitors)
        totals["top_errors"] = errors.most_common(3)
        totals["days_covered"] = covered
        totals["day_span"] = days
        return totals

    def summary_text(self, days: int = 7, now: datetime | None = None) -> str:
        moment = now or datetime.now(UTC)
        data = self.window(days, moment)
        end = moment.astimezone(UTC).date()
        start = end - timedelta(days=days - 1)

        lines = [
            f"📊 <b>Haftalik xulosa</b> · {start.strftime('%d.%m')}–{end.strftime('%d.%m')}",
            f"🌐 Koʻrishlar: <b>{_thousands(data['views'])}</b>",
            f"👥 Noyob tashrifchilar: <b>{_thousands(data['visitors'])}</b>",
            f"📨 Kontakt xabarlari: <b>{data['contacts']}</b>",
            f"⚠️ Frontend xatolari: <b>{data['reports']}</b> · WebGL: {data['webgl']}",
        ]

        if data["top_errors"]:
            lines.append("🔝 Eng koʻp takrorlangan:")
            for signature, count in data["top_errors"]:
                lines.append(f"  • {escape(signature)[:120]} ×{count}")

        if data["days_covered"] < days:
            lines.append(
                f"<i>Hisob {data['days_covered']} kunni qamraydi — jarayon qayta "
                "ishga tushganda yangidan boshlanadi.</i>"
            )

        return "\n".join(lines)

    # --- persistence -----------------------------------------------------
    def save(self) -> None:
        if not self.path:
            return
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            temp = self.path.with_suffix(".tmp")
            temp.write_text(
                json.dumps({"days": self.days}, ensure_ascii=False), encoding="utf-8"
            )
            temp.replace(self.path)
        except OSError:
            LOGGER.warning("Could not persist telemetry to %s", self.path, exc_info=True)

    def load(self) -> None:
        if not self.path or not self.path.exists():
            return
        try:
            raw = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            LOGGER.warning("Could not read telemetry from %s", self.path, exc_info=True)
            return

        days = raw.get("days") if isinstance(raw, dict) else None
        if isinstance(days, dict):
            self.days = {
                day: bucket
                for day, bucket in days.items()
                if isinstance(bucket, dict)
            }

    def roll(self, now: datetime | None = None) -> None:
        moment = now or datetime.now(UTC)
        cutoff = moment.astimezone(UTC).date() - timedelta(days=self.keep_days)

        for day_key in list(self.days):
            try:
                parsed = date.fromisoformat(day_key)
            except ValueError:
                self.days.pop(day_key, None)
                continue
            if parsed < cutoff:
                self.days.pop(day_key, None)
