"""Browser tests for the built website (run by CI after `npm run build`).

Usage: python3 tests/browser/test_static.py dist/client [screenshots-dir]

It serves the built site the way the host does (unknown addresses get 404.html) and checks:
  • the home page, logo and quiz work with no settings
  • the email sign-in link request is sent, and the "check your inbox" message appears
  • the Google button goes to the sign-in provider when it is switched on
  • a signed-in reader gets the welcome email request, and can delete their account
  • arriving from a sign-in link signs the reader in
Supabase is replaced by a local stand-in, so no real emails or accounts are touched.
"""
import base64
import http.server
import io
import json
import os
import re
import socketserver
import sys
import tempfile
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(sys.argv[1]).resolve()
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else tempfile.mkdtemp(prefix="acm-shots-"))
OUT.mkdir(parents=True, exist_ok=True)
if not (ROOT / "index.html").exists() and not (ROOT / "404.html").exists():
    sys.exit(f"Built site not found in {ROOT}. Run `npm run build` first.")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *args):
        pass

    def send_head(self):
        path = ROOT / self.path.split("?")[0].lstrip("/")
        if not (path.is_file() or (path.is_dir() and (path / "index.html").exists())):
            body = (ROOT / "404.html").read_bytes()  # same as ErrorDocument 404 in .htaccess
            self.send_response(404)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            return io.BytesIO(body)
        return super().send_head()


socketserver.ThreadingTCPServer.allow_reuse_address = True
server = socketserver.ThreadingTCPServer(("127.0.0.1", 0), Handler)
server.daemon_threads = True
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{server.server_address[1]}"
SUPA = "https://testproj.supabase.co"
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ") + name, detail)


def b64(obj):
    return base64.urlsafe_b64encode(json.dumps(obj).encode()).decode().rstrip("=")


exp = int(time.time()) + 86400
user = {"id": "11111111-2222-4333-8444-555555555555", "aud": "authenticated", "role": "authenticated",
        "email": "reader@example.com", "app_metadata": {}, "user_metadata": {},
        "created_at": "2026-10-01T00:00:00Z"}
jwt = b64({"alg": "HS256", "typ": "JWT"}) + "." + b64({"sub": user["id"], "exp": exp, "role": "authenticated"}) + ".x"
session = {"access_token": jwt, "token_type": "bearer", "expires_in": 86400, "expires_at": exp,
           "refresh_token": "r", "user": user}


def stand_in(calls):
    def handle(route):
        req = route.request
        calls.append((req.method, req.url.replace(SUPA, ""), req.post_data, req.headers.get("authorization", "")))
        url = req.url
        cors = {"access-control-allow-origin": "*", "access-control-allow-headers": "*"}
        if "/auth/v1/otp" in url:
            return route.fulfill(json={})
        if "/auth/v1/user" in url:
            return route.fulfill(json=user)
        if "/auth/v1/authorize" in url:
            return route.fulfill(status=200, content_type="text/html", body="<h1>Provider sign-in page</h1>")
        if "/functions/v1/" in url:
            if req.method == "OPTIONS":
                return route.fulfill(status=200, headers=cors, body="ok")
            return route.fulfill(json={"ok": True}, headers=cors)
        if "/rest/v1/reader_state" in url:
            if req.method == "GET":
                return route.fulfill(status=200, json=[], headers=cors)
            return route.fulfill(status=201, body="", headers=cors)
        return route.fulfill(json={})
    return handle


def config_js(providers):
    return (f'window.ACM_CONFIG = {{ supabaseUrl: "{SUPA}", supabaseKey: "sb_publishable_test", '
            f'signInWith: {json.dumps(providers)} }};')


def new_context(browser, providers=None, storage=None):
    context = browser.new_context(viewport={"width": 420, "height": 860}, device_scale_factor=2)
    context.route("**/covers.openlibrary.org/**", lambda r: r.fulfill(status=404, body=""))
    if providers is not None:
        context.route("**/config.js", lambda r: r.fulfill(body=config_js(providers), content_type="text/javascript"))
    if storage:
        context.add_init_script(storage)
    return context


with sync_playwright() as p:
    browser = p.chromium.launch()

    # 1. Set-up not finished yet: config.js has placeholders, so no provider buttons
    context = new_context(browser)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(BASE + "/")
    page.wait_for_load_state("networkidle")
    check("home page renders without settings", page.get_by_text("Begin the quiz").count() > 0)
    logo_width = page.evaluate(
        "() => { const i = document.querySelector('header img'); return i && i.complete ? i.naturalWidth : 0 }")
    check("book logo loads", logo_width > 0, f"width={logo_width}")
    page.screenshot(path=str(OUT / "home.png"))
    page.goto(BASE + "/auth")
    page.wait_for_load_state("networkidle")
    page.fill("input[type=email]", "reader@example.com")
    page.get_by_role("button", name="Email me a sign-in link").click()
    page.wait_for_timeout(800)
    message = page.locator("p.text-destructive").first.text_content() if page.locator("p.text-destructive").count() else ""
    check("Google button hidden until switched on", page.get_by_role("button", name="Continue with Google").count() == 0)
    check("clear message when config.js is empty", "isn't set up" in (message or ""), message)
    check("Apple sign-in is not offered anywhere", page.get_by_text("Apple", exact=False).count() == 0)
    page.goto(BASE + "/no-such-page")
    page.wait_for_load_state("networkidle")
    check("unknown address shows the page-not-found page", page.get_by_text("on our shelves").count() > 0)
    check("no script errors", not errors, "; ".join(errors[:2]))
    context.close()

    # 2. Set up: config.js filled in, Google switched on, stand-in for Supabase
    calls = []
    context = new_context(browser, providers=["google"])
    context.route(SUPA + "/**", stand_in(calls))
    page = context.new_page()
    page.goto(BASE + "/auth")
    page.wait_for_load_state("networkidle")
    page.fill("input[type=email]", "reader@example.com")
    page.get_by_role("button", name="Email me a sign-in link").click()
    page.wait_for_timeout(800)
    otp = [c for c in calls if "/auth/v1/otp" in c[1]]
    body = json.loads(otp[0][2]) if otp and otp[0][2] else {}
    check("email link request sent to Supabase", bool(otp) and body.get("email") == "reader@example.com",
          json.dumps(body)[:120])
    check("'Check your inbox' shown", page.get_by_text("Check your inbox").count() > 0)
    page.screenshot(path=str(OUT / "inbox.png"))

    page.goto(BASE + "/auth")
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="Continue with Google").click()
    page.wait_for_url("**/auth/v1/authorize**", timeout=5000)
    check("Google button goes to the sign-in provider", "provider=google" in page.url, page.url[:120])
    context.close()

    # 3. Signed in: welcome email request, then delete the account
    calls.clear()
    session_js = (f"localStorage.setItem('sb-testproj-auth-token', {json.dumps(json.dumps(session))});"
                  "localStorage.setItem('acm-cookie-notice-v1','1');")
    context = new_context(browser, providers=["google"], storage=session_js)
    context.route(SUPA + "/**", stand_in(calls))
    page = context.new_page()
    page.goto(BASE + "/account")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1500)
    check("signed in on the account page", page.get_by_text("reader@example.com").count() > 0)
    welcome = [c for c in calls if "/functions/v1/welcome-email" in c[1] and c[0] == "POST"]
    check("welcome email requested once, with the reader's token",
          len(welcome) == 1 and welcome[0][3].startswith("Bearer "), f"{len(welcome)} call(s)")
    page.screenshot(path=str(OUT / "account.png"))
    page.get_by_role("button", name="Delete my account").click()
    page.get_by_role("button", name="Yes, delete everything").click()
    page.wait_for_timeout(1500)
    deleted = [c for c in calls if "/functions/v1/delete-account" in c[1] and c[0] == "POST"]
    check("delete account calls the delete-account function", len(deleted) == 1, f"{len(deleted)} call(s)")
    context.close()

    # 4. Arriving from the sign-in link (tokens in the address)
    calls.clear()
    context = new_context(browser, providers=["google"])
    context.route(SUPA + "/**", stand_in(calls))
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(BASE + f"/#access_token={jwt}&refresh_token=r&expires_in=86400&expires_at={exp}"
                     "&token_type=bearer&type=magiclink")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1500)
    check("sign-in link signs the reader in",
          page.get_by_text("Account", exact=True).count() > 0 and "access_token" not in page.url)
    page.get_by_role("button", name=re.compile("Begin the quiz")).click()
    page.wait_for_timeout(300)
    for _ in range(9):
        page.locator("main section button.w-full").first.click()
        page.wait_for_timeout(150)
    page.wait_for_timeout(600)
    check("quiz works on the built site", page.get_by_text("Ten classic books for you").count() > 0)
    page.get_by_role("link", name=re.compile("View my list")).click()
    page.wait_for_timeout(800)
    check("moving between pages works", "/list" in page.url and page.get_by_text("My reading list").count() > 0)
    check("no script errors after sign-in", not errors, "; ".join(errors[:2]))
    page.goto(BASE + "/")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(800)
    page.screenshot(path=str(OUT / "home-signed-in.png"))
    context.close()
    browser.close()

server.shutdown()
passed = sum(ok for _, ok in results)
print(f"{passed}/{len(results)} checks passed. Screenshots: {OUT}")
sys.exit(0 if passed == len(results) else 1)
