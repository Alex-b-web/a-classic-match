"""Browser tests for the built website (run by CI after `npm run build`).

Usage: python3 tests/browser/test_static.py dist/client [screenshots-dir]

It serves the built site the way the host does (unknown addresses get 404.html) and checks:
  • the home page, logo and quiz work with no settings
  • the sign-in page says clearly when Firebase isn't set up yet
  • with settings filled in, the sign-in link is requested through the server function
  • opening the sign-in link signs the reader in and sends the welcome email once
  • the account page shows the reader, and "delete my account" calls the delete function
  • a sign-in link opened on a device that doesn't know the address asks for it
Firebase is replaced by a local stand-in, so no real emails or accounts are touched.
"""
import http.server
import io
import json
import socketserver
import sys
import tempfile
import threading
import time
import base64
from pathlib import Path
import re

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

PROJECT = "testproj"
FN = f"https://europe-west2-{PROJECT}.cloudfunctions.net/"  # callable functions
IDT = "https://identitytoolkit.googleapis.com/"  # Firebase Auth
SECURE = "https://securetoken.googleapis.com/"  # Firebase Auth tokens
FS = "https://firestore.googleapis.com/**"  # Firestore: blocked here, so nothing real is read
EMAIL = "reader@example.com"
UID = "11111111-2222-4333-8444-555555555555"
FB_CONFIG = {
    "apiKey": "test-api-key",
    "authDomain": f"{PROJECT}.firebaseapp.com",
    "projectId": PROJECT,
    "appId": "1:123:web:abc",
}
CORS = {"access-control-allow-origin": "*", "access-control-allow-headers": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS"}
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ") + name, detail)


CURRENT_PAGE = [None]  # the page in use; waiting through it lets the stand-in answer requests


def wait_for(cond, timeout=10):
    """Waits until cond() is true. Pumps the browser, so requests keep being answered meanwhile."""
    end = time.time() + timeout
    while time.time() < end:
        if cond():
            return True
        if CURRENT_PAGE[0] is not None:
            CURRENT_PAGE[0].wait_for_timeout(200)
        else:
            time.sleep(0.2)
    return cond()


def b64(obj):
    return base64.urlsafe_b64encode(json.dumps(obj).encode()).decode().rstrip("=")


now = int(time.time())
id_token = (b64({"alg": "RS256", "kid": "test"}) + "." + b64({
    "iss": f"https://securetoken.google.com/{PROJECT}", "aud": PROJECT, "auth_time": now,
    "user_id": UID, "sub": UID, "iat": now, "exp": now + 3600, "email": EMAIL,
    "email_verified": True, "firebase": {"sign_in_provider": "emailLink"}}) + ".signature")


def reply(route, body, status=200):
    route.fulfill(status=status, headers=CORS, content_type="application/json", body=json.dumps(body))


def firebase_stand_in(calls):
    def handle(route):
        req = route.request
        if req.method == "OPTIONS":
            return route.fulfill(status=204, headers=CORS, body="")
        url = req.url
        calls.append((req.method, url, req.post_data or "", req.headers.get("authorization", "")))
        if url.startswith(FN):
            return reply(route, {"result": {"ok": True, "sent": True}})
        if "accounts:signInWithEmailLink" in url:
            return reply(route, {"kind": "identitytoolkit#EmailLinkSigninResponse", "localId": UID,
                                 "email": EMAIL, "idToken": id_token, "refreshToken": "r",
                                 "expiresIn": "3600", "isNewUser": False, "registered": True})
        if "accounts:lookup" in url:
            return reply(route, {"kind": "identitytoolkit#GetAccountInfoResponse", "users": [{
                "localId": UID, "email": EMAIL, "emailVerified": True, "lastLoginAt": str(now * 1000),
                "createdAt": str(now * 1000),
                "providerUserInfo": [{"providerId": "password", "federatedId": EMAIL, "email": EMAIL,
                                      "rawId": EMAIL}]}]})
        if "/token" in url:
            return reply(route, {"access_token": id_token, "expires_in": "3600", "token_type": "Bearer",
                                 "refresh_token": "r", "id_token": id_token, "user_id": UID,
                                 "project_id": PROJECT})
        return reply(route, {})
    return handle


def install_firebase(context, calls):
    handle = firebase_stand_in(calls)
    context.route(FN + "**", handle)
    context.route(IDT + "**", handle)
    context.route(SECURE + "**", handle)
    context.route(FS, lambda r: r.abort())


def config_js(configured):
    fb = FB_CONFIG if configured else {
        "apiKey": "YOUR-WEB-API-KEY", "authDomain": f"{PROJECT}.firebaseapp.com",
        "projectId": PROJECT, "appId": "YOUR-WEB-APP-ID"}
    return "window.ACM_CONFIG = " + json.dumps({"firebase": fb}) + ";"


def new_context(browser, configured=None, storage=None):
    context = browser.new_context(viewport={"width": 420, "height": 860}, device_scale_factor=2)
    context.route("**/covers.openlibrary.org/**", lambda r: r.fulfill(status=404, body=""))
    if configured is not None:
        context.route("**/config.js", lambda r: r.fulfill(
            body=config_js(configured), content_type="text/javascript"))
    if storage:
        context.add_init_script(storage)
    return context


LINK = f"/auth?mode=signIn&oobCode=test-code&apiKey={FB_CONFIG['apiKey']}&lang=en"
SAVED_EMAIL = (f"localStorage.setItem('acm-signin-email', {json.dumps(EMAIL)});"
               "localStorage.setItem('acm-cookie-notice-v1','1');")
NOTICE_ONLY = "localStorage.setItem('acm-cookie-notice-v1','1');"

with sync_playwright() as p:
    browser = p.chromium.launch()

    # 1. Not set up yet: config.js still has placeholders
    context = new_context(browser, configured=False)
    page = context.new_page()
    CURRENT_PAGE[0] = page
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
    page.fill("input[type=email]", EMAIL)
    page.get_by_role("button", name="Email me a sign-in link").click()
    page.wait_for_timeout(800)
    message = page.locator("p.text-destructive").first.text_content() if page.locator("p.text-destructive").count() else ""
    check("clear message when Firebase settings are empty", "isn't set up" in (message or ""), message)
    check("Apple sign-in is not offered anywhere", page.get_by_text("Apple", exact=False).count() == 0)
    check("Google sign-in is not offered", page.get_by_text("Google", exact=False).count() == 0)
    page.goto(BASE + "/no-such-page")
    page.wait_for_load_state("networkidle")
    check("unknown address shows the page-not-found page", page.get_by_text("on our shelves").count() > 0)
    check("no script errors", not errors, "; ".join(errors[:2]))
    context.close()

    # 2. Settings filled in: the sign-in link is requested through the server function
    calls = []
    context = new_context(browser, configured=True)
    install_firebase(context, calls)
    page = context.new_page()
    CURRENT_PAGE[0] = page
    page.goto(BASE + "/auth")
    page.wait_for_load_state("networkidle")
    page.fill("input[type=email]", EMAIL)
    page.get_by_role("button", name="Email me a sign-in link").click()
    wait_for(lambda: any(c[1] == FN + "send_sign_in_link" for c in calls))
    sent = [c for c in calls if c[1] == FN + "send_sign_in_link"]
    body = json.loads(sent[0][2]).get("data", {}) if sent else {}
    check("sign-in link requested through the server function", body.get("email") == EMAIL,
          json.dumps(body)[:120])
    check("'Check your inbox' shown", wait_for(lambda: page.get_by_text("Check your inbox").count() > 0))
    page.screenshot(path=str(OUT / "inbox.png"))
    context.close()

    # 3. Opening the link on the device that asked for it: signed in, welcome email once
    calls = []
    context = new_context(browser, configured=True, storage=SAVED_EMAIL)
    install_firebase(context, calls)
    page = context.new_page()
    CURRENT_PAGE[0] = page
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(BASE + LINK)
    check("sign-in link finishes sign-in",
          wait_for(lambda: any("accounts:signInWithEmailLink" in c[1] for c in calls)))
    check("the sign-in link is not left in the address bar",
          wait_for(lambda: "oobCode" not in page.url), page.url[:80])
    wait_for(lambda: any(c[1] == FN + "send_welcome_email" for c in calls))
    welcome = [c for c in calls if c[1] == FN + "send_welcome_email"]
    check("welcome email requested once, signed in as the reader",
          len(welcome) == 1 and welcome[0][3].startswith("Bearer "), f"{len(welcome)} call(s)")

    # 3b. The account page shows the reader, and deleting the account calls the delete function
    calls.clear()
    page.goto(BASE + "/account")
    check("account page shows the signed-in reader", wait_for(lambda: page.get_by_text(EMAIL).count() > 0))
    page.screenshot(path=str(OUT / "account.png"))
    page.get_by_role("button", name="Delete my account").click()
    page.get_by_role("button", name="Yes, delete everything").click()
    wait_for(lambda: any(c[1] == FN + "delete_account" for c in calls))
    deleted = [c for c in calls if c[1] == FN + "delete_account"]
    check("delete account calls the delete function", len(deleted) == 1, f"{len(deleted)} call(s)")
    check("no script errors after sign-in", not errors, "; ".join(errors[:2]))
    context.close()

    # 4. Opened on a device that doesn't know the address: the reader is asked for it
    calls = []
    context = new_context(browser, configured=True, storage=NOTICE_ONLY)
    install_firebase(context, calls)
    page = context.new_page()
    CURRENT_PAGE[0] = page
    page.goto(BASE + LINK)
    check("asks for the address when this device doesn't know it",
          wait_for(lambda: page.get_by_text("Confirm your email").count() > 0))
    page.fill("input[type=email]", EMAIL)
    page.get_by_role("button", name="Finish signing in").click()
    check("address entered, sign-in finished",
          wait_for(lambda: any("accounts:signInWithEmailLink" in c[1] for c in calls)))
    context.close()

    # 5. The quiz and the list work on the built site with no account
    context = new_context(browser, configured=True)
    page = context.new_page()
    CURRENT_PAGE[0] = page
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(BASE + "/")
    page.wait_for_load_state("networkidle")
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
    check("no script errors on the quiz and list", not errors, "; ".join(errors[:2]))
    page.goto(BASE + "/")
    page.wait_for_load_state("networkidle")
    page.screenshot(path=str(OUT / "home-quiz.png"))
    context.close()
    browser.close()

server.shutdown()
passed = sum(ok for _, ok in results)
print(f"{passed}/{len(results)} checks passed. Screenshots: {OUT}")
sys.exit(0 if passed == len(results) else 1)
