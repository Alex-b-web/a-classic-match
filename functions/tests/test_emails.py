"""Offline tests: python3 -m unittest discover -s tests -v   (run from the functions folder)"""
import sys
import unittest
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import emails  # noqa: E402
import streaks  # noqa: E402

TZ = "Europe/London"


def day(offset: int) -> str:
    return (datetime.now(ZoneInfo(TZ)) - timedelta(days=offset)).strftime("%Y-%m-%d")


class Templates(unittest.TestCase):
    def test_no_placeholders_left_behind(self):
        html, text = emails.sign_in_email("https://x.example/?a=1")
        self.assertNotIn("{{", html)
        self.assertNotIn("{{", text)
        html, text = emails.welcome_email()
        self.assertNotIn("{{", html + text)
        html, text = emails.reminder_email(3, "Jane Eyre", 200, emails.DEFAULT_SITE)
        self.assertNotIn("{{", html + text)

    def test_sign_in_link_is_escaped_in_html_but_not_text(self):
        link = "https://x.example/auth?oob=abc&mode=signIn"
        html, text = emails.sign_in_email(link)
        self.assertIn("oob=abc&amp;mode=signIn", html)
        self.assertIn(link, text)

    def test_title_is_escaped(self):
        html, _ = emails.reminder_email(2, "<script>x</script>", 10, emails.DEFAULT_SITE)
        self.assertNotIn("<script>x</script>", html)
        self.assertIn("&lt;script&gt;", html)

    def test_missing_value_fails_loudly(self):
        with self.assertRaises(KeyError):
            emails.render("sign-in.html", {}, html=True)


class Reminder(unittest.TestCase):
    def test_subjects(self):
        self.assertEqual(emails.reminder_subject(1, "Dracula"), "1 day with Dracula. Keep it going?")
        self.assertEqual(emails.reminder_subject(6, "Jane Eyre"), "6 days with Jane Eyre. Keep it going?")
        self.assertEqual(emails.reminder_subject(4, None), "Your 4-day reading streak ends at midnight")

    def test_suggested_pages_bounds(self):
        self.assertEqual(emails.suggested_pages(None), 20)
        self.assertEqual(emails.suggested_pages(0), 1)
        self.assertEqual(emails.suggested_pages(5), 5)
        self.assertEqual(emails.suggested_pages(500), 20)


class Streaks(unittest.TestCase):
    def test_streak_counts_back_from_yesterday(self):
        log = {"dracula": {day(1): 10, day(2): 10, day(3): 5}}
        self.assertEqual(streaks.streak_at_risk(log, TZ), 3)

    def test_streak_stops_at_a_gap(self):
        log = {"dracula": {day(1): 10, day(3): 10}}
        self.assertEqual(streaks.streak_at_risk(log, TZ), 1)

    def test_no_streak_when_yesterday_empty(self):
        log = {"dracula": {day(2): 10}}
        self.assertEqual(streaks.streak_at_risk(log, TZ), 0)

    def test_current_book_is_most_recent_unfinished(self):
        log = {
            "dracula": {day(5): 100},
            "jane-eyre": {day(1): 50},
        }
        title, left = streaks.current_book(log)
        self.assertEqual(title, "Jane Eyre")
        self.assertEqual(left, 532 - 50)

    def test_finished_books_are_skipped(self):
        log = {"gatsby": {day(1): 180}, "dracula": {day(4): 10}}
        title, left = streaks.current_book(log)
        self.assertEqual(title, "Dracula")

    def test_unknown_book_ids_are_ignored(self):
        self.assertEqual(streaks.current_book({"nope": {day(1): 3}}), (None, None))


class Emails(unittest.TestCase):
    def test_valid_addresses(self):
        self.assertTrue(emails.is_valid_email("reader@example.com"))
        self.assertFalse(emails.is_valid_email("not-an-email"))
        self.assertFalse(emails.is_valid_email("a b@example.com"))
        self.assertFalse(emails.is_valid_email(""))


if __name__ == "__main__":
    unittest.main()
