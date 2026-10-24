"""Reading-streak logic (ported from supabase/functions/streak-reminders).

The reader's state is the same JSON shape as before:
  state = {"log": {book_id: {"YYYY-MM-DD": pages}}, "reminders": {"on": bool, "hour": int, "tz": str}}
Pure Python, no Firebase imports.
"""
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from books import BOOKS


def local_date(tz: str, offset_days: int = 0) -> str:
    moment = datetime.now(ZoneInfo(tz)) - timedelta(days=offset_days)
    return moment.strftime("%Y-%m-%d")


def local_hour(tz: str) -> int:
    return datetime.now(ZoneInfo(tz)).hour


def pages_on_day(log: dict, date: str) -> int:
    return sum(days.get(date, 0) for days in log.values())


def total(days: dict) -> int:
    return sum(days.values())


def streak_at_risk(log: dict, tz: str) -> int:
    """Streak counted back from yesterday. Today hasn't been logged yet, which is why we're writing."""
    count = 0
    for offset in range(1, 400):
        if pages_on_day(log, local_date(tz, offset)) <= 0:
            break
        count += 1
    return count


def current_book(log: dict):
    """The unfinished book the reader logged most recently: (title or None, pages left or None)."""
    best = None
    for book_id, days in log.items():
        book = BOOKS.get(book_id)
        if not book or total(days) >= book[1]:
            continue
        last = max(days.keys()) if days else ""
        if best is None or last > best[1]:
            best = (book_id, last)
    if best is None:
        return None, None
    title, pages = BOOKS[best[0]]
    return title, pages - total(log[best[0]])
