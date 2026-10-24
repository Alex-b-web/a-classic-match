# Hostinger and GoDaddy: what still lives there

The website itself no longer runs on Hostinger. It runs on Firebase (see `FIREBASE-SETUP.md`). Hostinger, or GoDaddy if the nameservers still point there, now does only two jobs:

- **Domain names (DNS):** tells the internet where `aclassicmatch.com` points.
- **Email for `hello@aclassicmatch.com`:** Outlook receives the replies.

Resend sends the outgoing emails (sign-in links, the welcome email, streak reminders). Its domain is already verified, so there is nothing to set up again.

## DNS records to keep

| Record                                                                     | Action                                                                       |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **MX** records                                                             | **Keep.** Without them, `hello@` stops receiving mail.                       |
| **autodiscover** records                                                   | **Keep.** Outlook setup depends on them.                                     |
| Microsoft **SPF** TXT (`spf.protection.outlook.com` or `secureserver.net`) | **Keep.**                                                                    |
| Resend **DKIM** TXT and the **send** / **rsend** records                   | **Keep.** Resend signs and delivers the emails with them.                    |
| `www` **CNAME**                                                            | Point to `aclassicmatch.web.app` (Firebase shows this under Custom domains). |
| Apex (`@`) **A** records                                                   | Replace with the A addresses Firebase shows under Custom domains.            |
| Old Hostinger website records (`www` pointing to `…hstgr.net`)             | Remove, they point at the old site.                                          |

Change only the last three rows. Everything else stays exactly as it is.

## Where to make the changes

- **GoDaddy:** My Products → Domain → **DNS**.
- **Hostinger:** hPanel → **Domains → DNS / Nameservers**.

Changes can take a few minutes to a few hours to spread. Firebase shows **Connected** when it sees them.

## Resend (sending the emails)

- The domain `aclassicmatch.com` is **Verified** in Resend.
- The sending key is stored as the GitHub secret `RESEND_API_KEY`. The Deploy pipeline installs it into Firebase on every run.
- To replace the key: Resend → **API Keys** → create a new key, then GitHub → **Settings → Secrets and variables → Actions** → update `RESEND_API_KEY`. The next deploy picks it up.

## The old Supabase project

The earlier version of the site kept accounts and saved data in Supabase. That was never used by real readers, so nothing needs moving. The Supabase project is no longer used by the site and can be paused or deleted from supabase.com.
