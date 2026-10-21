# Changes — October 2026

## Firebase Hosting option (18 October)

The same site can now also be published on **Firebase Hosting** instead of Hostinger. Supabase, Resend and the emails are unchanged. See `FIREBASE-SETUP.md`. Added: `firebase.json`, `.firebaserc`, `.github/workflows/firebase-hosting.yml` (auto-publish from GitHub) and the `npm run deploy:firebase` command.

## Hostinger version (18 October): no longer depends on Lovable

**Set-up steps: see `HOSTINGER-SETUP.md`.**

- **Static website.** It builds to plain HTML files (`dist/client`) that any Hostinger plan can serve. `vite.config.ts` pre-renders every page and switches off the Cloudflare server build. `public/.htaccess` adds https and a "page not found" page (`public/404.html`).
- **Settings in `config.js`.** The Supabase address and public key are read from `public/config.js`, which can be edited on Hostinger without rebuilding. The old Lovable Cloud `.env` was removed, and `.env.example` shows the optional build-time variables.
- **Sign-in.** Apple and Google now use Supabase's own sign-in, replacing Lovable's sign-in service. Their buttons only appear once listed in `config.js` → `signInWith`. Sign-in errors are now explained in plain words; previously Safari showed "Load failed".
- **Emails and account deletion run as Supabase functions** (`supabase/functions/`):
  - `welcome-email` is sent once after a reader's first sign-in.
  - `streak-reminders` runs hourly via `supabase/schedule-reminders.sql`.
  - `delete-account` replaces the old Lovable server function.

  Sign-in link emails are sent by Supabase through Resend SMTP, using `email-templates/magic-link.html`.
- **New book logo** (`public/logo.svg`, plus `favicon.png` and `apple-touch-icon.png`). It replaces the logo that was hosted on Lovable.
- **The site keeps working if `config.js` isn't filled in yet.** Only sign-in is unavailable until then.
- **Removed:** the Lovable-only cron route and the server function.

---

## Earlier changes (October)


## What's new

1. **About page** — Alex's story replaces the "coming soon" placeholder (`src/routes/about.tsx`). An **About** link is added to the homepage menu.
2. **Email sign-in link (no password)** — the sign-in page now emails a one-tap link by default. "Use a password instead" keeps the old option (`src/routes/auth.tsx`).
3. **Streak reminder emails** — readers switch them on from the Record page or the Account page, and pick a time. They are off by default, which keeps them consent-based under UK GDPR.
   - Setting: `src/hooks/use-reminders.ts`, `src/components/ReminderSettings.tsx`. It is saved to the account through `src/lib/sync.ts`.
   - Email: `src/lib/reminder-email.ts`, for example "You're on a 6-day streak with *Jane Eyre*. 20 pages tonight?"
   - Hourly job: `src/routes/api/cron/streak-reminders.ts`. It emails only readers whose streak is alive, who haven't logged pages yet today, at the hour they picked in their own time zone.
4. **Retake the quiz skips books you've already read** — finished books are now left out, not only rated ones. The results page says how many were skipped (`src/data/quiz.ts`, `src/routes/index.tsx`).
5. **"Across the Centuries" badge** — finish classics from 4 different centuries. It shows progress such as "3 of 4" (`src/components/Achievements.tsx`).
6. Cookie notice text now mentions the reminder setting.
7. **Country selector removed.** Browse and My list no longer show the Amazon country picker. Buy links still go to each reader's local Amazon, which is detected from their browser.
8. **Alex's photo on the About page** (`public/alex.jpg`).
9. **Emails use hello@aclassicmatch.com** as the contact and reply address. This covers the new sign-in email design (`email-templates/magic-link.html` and `.txt`), the reminder emails (replies go to hello@) and the privacy policy contact.

10. **Welcome email** (`email-templates/welcome.html` and `.txt`). It is sent once, when a reader creates an account. Subject: "Welcome to A Classic Match". To switch it on in Lovable, ask: *"Send the welcome email in email-templates/welcome.html once to every new user right after they sign up, from A Classic Match with reply-to hello@aclassicmatch.com."*

These were already in the code and are unchanged: the "Save your matches" prompt after the quiz, Google/Apple sign-in, moving browser data into the account on first sign-in, ratings and reviews, the yearly goal, the privacy policy, the cookie notice and account deletion.


*The Lovable-specific email setup that used to be here has been replaced by `HOSTINGER-SETUP.md`.*
