"""Email content and sending for A Classic Match.

Pure Python with no Firebase imports, so it can be tested offline (see tests/).
Templates live in templates/. A placeholder looks like {{ name }}. Values are
HTML-escaped automatically, except names ending in _html, which you pre-escape yourself.
"""
import html as _html
import json
import re
import urllib.error
import urllib.request
from pathlib import Path

CONTACT_EMAIL = "hello@aclassicmatch.com"
DEFAULT_FROM = f"A Classic Match <{CONTACT_EMAIL}>"
DEFAULT_SITE = "https://www.aclassicmatch.com"

SUBJECT_SIGN_IN = "Your sign-in link for A Classic Match"
SUBJECT_WELCOME = "Welcome to A Classic Match"

TEMPLATES = Path(__file__).parent / "templates"
_PLACEHOLDER = re.compile(r"\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}")
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def is_valid_email(value: str) -> bool:
    return bool(value) and len(value) <= 254 and _EMAIL.match(value) is not None


def render(name: str, values: dict, html: bool = True) -> str:
    """Fill the {{ placeholders }} in templates/<name>."""
    source = (TEMPLATES / name).read_text(encoding="utf-8")

    def fill(match: re.Match) -> str:
        key = match.group(1)
        if key not in values:
            raise KeyError(f"{name}: no value for {{{{ {key} }}}}")
        text = str(values[key])
        if html and not key.endswith("_html"):
            text = _html.escape(text, quote=True)
        return text

    return _PLACEHOLDER.sub(fill, source)


def sign_in_email(link: str) -> tuple[str, str]:
    """Returns (html, text) for the sign-in email."""
    return (
        render("sign-in.html", {"link": link}, html=True),
        render("sign-in.txt", {"link": link}, html=False),
    )


def welcome_email() -> tuple[str, str]:
    return (
        render("welcome.html", {}, html=True),
        render("welcome.txt", {}, html=False),
    )


def suggested_pages(pages_left):
    if pages_left is None:
        return 20
    return max(1, min(20, pages_left))


def reminder_subject(streak: int, title) -> str:
    if title:
        return f"{streak} {'day' if streak == 1 else 'days'} with {title}. Keep it going?"
    return f"Your {streak}-day reading streak ends at midnight"


def reminder_email(streak: int, title, pages_left, site_url: str) -> tuple[str, str]:
    """Returns (html, text) for a streak reminder."""
    pages = suggested_pages(pages_left)
    if title:
        lead_text = f"You're on a {streak}-day streak with {title}. {pages} pages tonight?"
        lead_html = (
            f"You&rsquo;re on a <strong>{streak}-day streak</strong> with "
            f"<em>{_html.escape(title)}</em>. {pages} pages tonight?"
        )
    else:
        lead_text = f"You're on a {streak}-day reading streak. {pages} pages tonight keeps it alive."
        lead_html = (
            f"You&rsquo;re on a <strong>{streak}-day reading streak</strong>. "
            f"{pages} pages tonight keeps it alive."
        )
    values = {"lead_html": lead_html, "lead_text": lead_text, "site_url": site_url, "contact": CONTACT_EMAIL}
    return render("reminder.html", values, html=True), render("reminder.txt", values, html=False)


def send(
    api_key: str,
    *,
    to: str,
    subject: str,
    html_body: str,
    text_body: str,
    sender: str = DEFAULT_FROM,
    reply_to: str = CONTACT_EMAIL,
    unsubscribe_url: str | None = None,
) -> int:
    """Sends one email through Resend. Raises RuntimeError with Resend's reason if refused."""
    payload = {
        "from": sender,
        "to": [to],
        "reply_to": reply_to,
        "subject": subject,
        "html": html_body,
        "text": text_body,
    }
    if unsubscribe_url:
        payload["headers"] = {"List-Unsubscribe": f"<{unsubscribe_url}>"}
    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            # Resend's firewall rejects requests with Python's default user agent.
            "User-Agent": "aclassicmatch-functions/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return response.status
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", "replace")[:300]
        raise RuntimeError(f"Resend refused the email ({error.code}): {detail}") from error
