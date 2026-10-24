"""A Classic Match: Firebase Cloud Functions (Python).

Three functions:
  send_sign_in_link     callable: emails a one-tap sign-in link from hello@aclassicmatch.com
  send_welcome_email    callable: sends the welcome email once per account
  streak_reminders      scheduled hourly: streak reminders at each reader's chosen hour

Data: Firestore collection "users", one document per reader (document id = Firebase uid).
The document holds "state", the same JSON the app keeps for a reader (log, reminders).
"""
import logging

from firebase_admin import auth, firestore, initialize_app
from firebase_functions import https_fn, scheduler_fn
from firebase_functions.params import SecretParam, StringParam
from google.cloud.firestore_v1.base_query import FieldFilter

import emails
import streaks

initialize_app()
logger = logging.getLogger("aclassicmatch")

REGION = "europe-west2"  # London, next to the Firestore database
RESEND_API_KEY = SecretParam("RESEND_API_KEY")
SITE_URL = StringParam("SITE_URL", default=emails.DEFAULT_SITE)
REMINDER_FROM = StringParam("REMINDER_FROM", default=emails.DEFAULT_FROM)


def _site() -> str:
    return SITE_URL.value.rstrip("/")


@https_fn.on_call(region=REGION, secrets=[RESEND_API_KEY], timeout_sec=60)
def send_sign_in_link(req: https_fn.CallableRequest):
    """Creates a one-time sign-in link for the address and emails it. Always answers ok,
    so the response can't be used to find out which addresses have accounts."""
    email = str((req.data or {}).get("email", "")).strip().lower()
    if not emails.is_valid_email(email):
        raise https_fn.HttpsError(
            https_fn.FunctionsErrorCode.INVALID_ARGUMENT, "Please enter a valid email address."
        )
    settings = auth.ActionCodeSettings(url=f"{_site()}/auth", handle_code_in_app=True)
    link = auth.generate_sign_in_with_email_link(email, settings)
    html_body, text_body = emails.sign_in_email(link)
    emails.send(
        RESEND_API_KEY.value,
        to=email,
        subject=emails.SUBJECT_SIGN_IN,
        html_body=html_body,
        text_body=text_body,
        sender=REMINDER_FROM.value,
    )
    return {"ok": True}


@https_fn.on_call(region=REGION, secrets=[RESEND_API_KEY], timeout_sec=60)
def send_welcome_email(req: https_fn.CallableRequest):
    """Sends the welcome email once. The app calls this after a reader's first sign-in."""
    if req.auth is None:
        raise https_fn.HttpsError(https_fn.FunctionsErrorCode.UNAUTHENTICATED, "Sign in first.")
    uid = req.auth.uid
    email = auth.get_user(uid).email
    if not email:
        return {"sent": False}

    db = firestore.client()
    ref = db.collection("users").document(uid)

    @firestore.transactional
    def claim(transaction):
        snap = ref.get(transaction=transaction)
        if snap.exists and (snap.to_dict() or {}).get("welcomeSent"):
            return False
        transaction.set(ref, {"welcomeSent": True}, merge=True)
        return True

    if not claim(db.transaction()):
        return {"sent": False}
    try:
        html_body, text_body = emails.welcome_email()
        emails.send(
            RESEND_API_KEY.value,
            to=email,
            subject=emails.SUBJECT_WELCOME,
            html_body=html_body,
            text_body=text_body,
            sender=REMINDER_FROM.value,
            unsubscribe_url=f"{_site()}/account",
        )
    except Exception:
        ref.set({"welcomeSent": False}, merge=True)  # allow a retry next time
        raise
    return {"sent": True}


@scheduler_fn.on_schedule(schedule="0 * * * *", region=REGION, secrets=[RESEND_API_KEY], timeout_sec=540)
def streak_reminders(event: scheduler_fn.ScheduledEvent) -> None:
    """Every hour: email readers whose chosen hour it is, who haven't logged today, and whose
    streak is still alive. One reader's failure never stops the others."""
    db = firestore.client()
    query = db.collection("users").where(filter=FieldFilter("state.reminders.on", "==", True))
    checked = sent = failed = 0

    for doc in query.stream():
        checked += 1
        try:
            state = (doc.to_dict() or {}).get("state") or {}
            reminders = state.get("reminders") or {}
            tz = reminders.get("tz") or "Europe/London"
            hour = reminders.get("hour", 19)
            log = state.get("log") or {}

            if streaks.local_hour(tz) != hour:
                continue  # not their chosen time yet
            if streaks.pages_on_day(log, streaks.local_date(tz)) > 0:
                continue  # already read today
            streak = streaks.streak_at_risk(log, tz)
            if streak < 1:
                continue  # nothing to keep alive

            email = auth.get_user(doc.id).email
            if not email:
                continue
            title, pages_left = streaks.current_book(log)
            html_body, text_body = emails.reminder_email(streak, title, pages_left, _site())
            emails.send(
                RESEND_API_KEY.value,
                to=email,
                subject=emails.reminder_subject(streak, title),
                html_body=html_body,
                text_body=text_body,
                sender=REMINDER_FROM.value,
                unsubscribe_url=f"{_site()}/account",
            )
            sent += 1
        except Exception:
            failed += 1
            logger.exception("Reminder failed for %s", doc.id)

    logger.info("Streak reminders: checked=%d sent=%d failed=%d", checked, sent, failed)
