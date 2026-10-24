# A Classic Match: how the site runs and what needs doing

The whole site now runs on Google Firebase. Nothing depends on Lovable or Supabase any more.

| Part               | What it does                                                                      | Where it lives                                                              |
| ------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Website            | Pages, book logo, quiz                                                            | Firebase Hosting (`aclassicmatch.web.app`, then `www.aclassicmatch.com`)    |
| Sign-in            | One-tap email link, no passwords                                                  | Firebase Authentication                                                     |
| Saved reading data | Each reader's list, page log, ratings and reminder settings                       | Firestore database, London (`europe-west2`)                                 |
| Emails             | Sign-in link, welcome email, streak reminders, all from `hello@aclassicmatch.com` | Resend, sent by Python functions running on Firebase (`functions/`, London) |
| Publishing         | Runs the tests, then publishes the site, database rules and functions             | GitHub Actions (`.github/workflows/deploy.yml`), on every merge into `main` |
| Domain and inbox   | Where `aclassicmatch.com` points, and Outlook for `hello@`                        | Your domain DNS (GoDaddy or Hostinger). See `HOSTINGER-SETUP.md`            |

---

## What you need to do

These are the only steps that need a person. Everything else is automatic.

1. **Fill in the Firebase web settings.** Firebase console → **Project settings → General → Your apps** → the Web app → **SDK setup and configuration**. Copy the `apiKey` and `appId` values into `public/config.js` (the values are public and safe to share). Until this is done, the site works but sign-in shows a "not set up" message.
2. **Switch on email-link sign-in.** Firebase console → **Authentication → Sign-in method → Email/Password** → switch on **Email link (passwordless sign-in)** → **Save**.
3. **Allow the website's address for sign-in.** Firebase console → **Authentication → Settings → Authorized domains** → **Add domain**: `aclassicmatch.com` and `www.aclassicmatch.com`. Without this, the link in the email won't bring people back to the site.
4. **Point the domain at Firebase.** In your DNS (GoDaddy, or Hostinger if the nameservers point there):
   - `www` should be a **CNAME** to `aclassicmatch.web.app`.
   - Add the **A** records and the **TXT** record that Firebase shows under **Hosting → Custom domains** for `aclassicmatch.com`.
   - Wait until Firebase shows **Connected**. The free SSL certificate follows automatically.
   - Do **not** change the **MX**, **autodiscover**, Outlook **SPF**, or the Resend records. Those keep `hello@` and the emails working.
5. **Protect the main branch on GitHub.** GitHub → repository **Settings → Rules → Rulesets → "Protect main"** → set to **Active** and save. This stops anything reaching the live site without passing the tests.

---

## How a change goes live

1. Make the change on a branch and open a **pull request** into `main`.
2. The **Tests** run: secret scan, lint, type check, build, browser tests, and the Python function tests. Any failure blocks the merge.
3. When you merge, the **Deploy** workflow runs the tests again, then publishes the website, the Firestore rules and the functions.
4. Check the **Actions** tab. A green run means it is live at `https://aclassicmatch.web.app`.

If a run turns red, open it and read the message at the failed step. Firebase keeps every earlier website version: **Hosting → Release history → Roll back** undoes a bad publish in one click.

---

## Where things are in the code

| File                                          | What it does                                                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `public/config.js`                            | Firebase web settings (`apiKey`, `appId`). Public values only.                                                       |
| `src/integrations/firebase/client.ts`         | Connects the website to Firebase.                                                                                    |
| `src/routes/auth.tsx`                         | The sign-in page: sends the link, then finishes sign-in when the link is opened.                                     |
| `src/lib/sync.ts`                             | Saves each signed-in reader's data to `users/{uid}` in Firestore.                                                    |
| `functions/main.py`                           | Server functions: `send_sign_in_link`, `send_welcome_email`, `delete_account`, `streak_reminders`.                   |
| `functions/emails.py`, `functions/templates/` | The email designs (sign-in, welcome, reminder) and the code that sends them through Resend.                          |
| `functions/books.py`, `functions/streaks.py`  | The book page counts and the streak rules used by the reminders.                                                     |
| `firestore.rules`                             | Each reader can read and write only their own document. Everything else is locked.                                   |
| `firebase.json`                               | What Firebase publishes, the clean web addresses, and the function settings.                                         |
| `.github/workflows/ci.yml`                    | The tests (run on every pull request and before every deploy).                                                       |
| `.github/workflows/deploy.yml`                | Publishes everything to Firebase after the tests pass.                                                               |
| `functions/.env`                              | Non-secret function settings (the site address and the sender). The Resend key is a GitHub secret, not in this file. |

**Secrets.** The only secrets are the `FIREBASE_SERVICE_ACCOUNT` and `RESEND_API_KEY` values stored in GitHub (**Settings → Secrets and variables → Actions**). They are never written into the code. See `SECURITY.md`.
