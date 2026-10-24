# A Classic Match on Hostinger: setup guide

This version of the site no longer needs Lovable. Four services each do one job:

| Service               | What it does                                                                                                     | Cost                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **Hostinger**         | Holds the website files (pages, pictures, logo)                                                                  | Your current plan (any plan works) |
| **Supabase**          | Accounts, sign-in links, saved reading data, and the small "functions" that send the welcome and reminder emails | Free plan is enough to start       |
| **Resend**            | Actually delivers the emails, from `hello@aclassicmatch.com`                                                     | Free up to 3,000 emails a month    |
| **Outlook (GoDaddy)** | Where you read and answer replies to `hello@aclassicmatch.com`                                                   | Your current plan                  |

**Why it said "Load failed".** That is Safari's way of saying "I couldn't reach the server". The old code was built to run on Lovable's servers. Sign-in and Apple login went through Lovable's own sign-in service, and the logo was stored on Lovable. None of that exists on Hostinger. This version removes every Lovable dependency.

Do the steps in order. Allow about an hour, plus waiting time for the domain checks (step 3).

---

## 1. Create the Supabase project (10 min)

1. Go to **supabase.com** → sign up (free) → **New project**. Name it `a-classic-match` and choose the **London (eu-west-2)** region, which keeps the data in the UK. Save the database password somewhere safe.
2. When it's ready, open **SQL Editor** → **New query**. Paste the whole of `supabase/setup.sql` and press **Run**. This creates the table that stores each reader's list, page log, ratings and reminder settings, so that each reader can only see their own data.
3. Open **Project Settings → API Keys** and copy:
   - the **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - the **publishable** key (or the legacy **anon public** key)

   You need both in step 7. Never copy the **secret** / **service_role** key into the website.

## 2. Tell Supabase about your web address (2 min)

**Authentication → URL Configuration**

- **Site URL:** `https://www.aclassicmatch.com`
- **Redirect URLs**, add both:
  - `https://www.aclassicmatch.com/**`
  - `https://aclassicmatch.com/**`

Without this, the link in the sign-in email can't bring people back to the site.

## 3. Set up Resend to send the emails (15 min, then wait for verification)

1. Sign up at **resend.com** → **Domains → Add domain** → `aclassicmatch.com`. Choose the **EU (Ireland)** region if it asks.
2. Resend shows a few DNS records (a DKIM `TXT`, plus an `MX` and `TXT` on the **`send`** subdomain). Add them wherever the domain's DNS is managed:
   - If the domain's nameservers are still **GoDaddy**: GoDaddy → My Products → Domain → **DNS**.
   - If you pointed the nameservers to **Hostinger**: hPanel → **Domains → DNS / Nameservers**.

   **Important for Outlook:** only _add_ records. Never delete or change the existing **MX**, **autodiscover** or Microsoft **SPF** (`v=spf1 … include:secureserver.net` / `spf.protection.outlook.com`) records. If you ever moved the nameservers to Hostinger, check that those Outlook records were copied across too, or `hello@` will stop receiving mail.

3. Wait until Resend shows the domain as **Verified**. This is usually minutes, sometimes a few hours.
4. **API Keys → Create API key** (Sending access). Copy it. It starts with `re_`.

## 4. Make Supabase send the sign-in emails through Resend (5 min)

**Authentication → Emails → SMTP Settings** → turn on **Enable custom SMTP**:

| Field        | Value                        |
| ------------ | ---------------------------- |
| Sender email | `hello@aclassicmatch.com`    |
| Sender name  | `A Classic Match`            |
| Host         | `smtp.resend.com`            |
| Port         | `465`                        |
| Username     | `resend`                     |
| Password     | your Resend API key (`re_…`) |

Then **Authentication → Emails → Templates**:

- **Magic Link:** Subject `Your sign-in link for A Classic Match`. Body: paste all of `email-templates/magic-link.html`.
- **Confirm signup** (used only when someone chooses a password): you can paste the same file, which uses the same link placeholder.

Finally, under **Authentication → Rate Limits**, raise **"Rate limit for sending emails"** to about **100 per hour**. The default is low, and new sign-ups would otherwise get stuck.

## 5. Add the three email and account functions (15 min)

These are in `supabase/functions/`. Each one is a single file.

For **each** of `delete-account`, `welcome-email` and `streak-reminders`:

1. Supabase → **Edge Functions → Deploy a new function → Via Editor**.
2. Name it **exactly** as above.
3. Delete the sample code, paste the whole `index.ts` from that folder, and press **Deploy**.
4. In the function's **Details / Settings**, switch **off** "Verify JWT" (it may be labelled "Enforce JWT verification"). Each function checks who is calling it by itself.

Then **Edge Functions → Secrets** → add:

| Name             | Value                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY` | your Resend key (`re_…`)                                                                          |
| `CRON_SECRET`    | a long random password you make up (for example 30+ letters and numbers). Keep a copy for step 6. |
| `REMINDER_FROM`  | `A Classic Match <hello@aclassicmatch.com>`                                                       |
| `SITE_URL`       | `https://www.aclassicmatch.com`                                                                   |

_Developer option:_ instead of the dashboard, run `npx supabase login` and then `npx supabase functions deploy --project-ref YOUR-PROJECT-REF` from the project folder. Set `project_id` in `supabase/config.toml` first.

## 6. Switch on the hourly streak reminders (3 min)

Open `supabase/schedule-reminders.sql` and replace `YOUR-PROJECT-REF` (from Project Settings → General) and `YOUR-CRON-SECRET` (from step 5). Paste it into **SQL Editor** and press **Run**.

From now on, every hour Supabase emails readers who turned reminders on, haven't read yet today, and whose chosen hour it is.

## 7. Upload the website to Hostinger (10 min)

1. hPanel → **Websites → Manage → File Manager** → open **`public_html`**.
2. Download a backup of what's there, then delete the old site files.
3. Upload **`hostinger-upload.zip`** into `public_html` and **Extract** it. `index.html`, `config.js`, `.htaccess` and the folders must sit directly inside `public_html`, not in a subfolder.
4. Open **`config.js`** (right-click → Edit) and fill in the two values from step 1:
   ```js
   window.ACM_CONFIG = {
     supabaseUrl: "https://abcdefgh.supabase.co",
     supabaseKey: "sb_publishable_…",
     signInWith: [],
   };
   ```
   Save. You can change this file any time without rebuilding the site.
5. hPanel → **Security → SSL**: make sure SSL is **active** for `aclassicmatch.com` and `www`.

## 8. Optional: Google sign-in

Email sign-in works without this step. The Google button appears only after you add `"google"` to `signInWith` in `config.js`.

The return address Google needs is:
`https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`

- **Google (free):** Google Cloud Console → APIs & Services → **Credentials → Create OAuth client ID → Web application**. Add the return address above under _Authorised redirect URIs_. Copy the Client ID and Secret into Supabase → **Authentication → Sign In / Providers → Google** and switch it on. Then set `signInWith: ["google"]`.

Apple sign-in is not offered on the site.

## 9. Test it

1. Open `https://www.aclassicmatch.com`. The book logo shows top-left.
2. **Sign in → enter your email → Email me a sign-in link.** The email arrives from _A Classic Match_. Tap **Sign in** and you land back on the site, signed in.
3. Within a minute the **welcome email** arrives, once only.
4. On **Record**, switch on streak reminders and pick the next hour. Log nothing that day; the reminder arrives at that hour if you read the day before.
5. Reply to any of the emails and check that the reply lands in the Outlook inbox for `hello@`.

**If something fails:**

- _"We couldn't reach the sign-in service"_: check the Supabase address in `config.js`.
- _"This web address isn't allowed to sign in"_: check step 2.
- No email arrives: check that the Resend domain is Verified and that the SMTP settings in step 4 are correct. Resend → **Emails** shows every message and whether it was delivered.
- Reminders: in Supabase → SQL Editor, run `select * from cron.job_run_details order by start_time desc limit 5;`.

**Accounts made on the old Lovable site** stayed in Lovable's database. Those readers simply sign in again on the new site, and anything saved in their browser moves into the new account automatically.

---

## For developers: rebuilding the site

```bash
npm install
npm run build        # outputs the site to dist/client
```

Upload the contents of `dist/client` to `public_html`. Keep the edited `config.js` on the server; the build ships a blank one.
