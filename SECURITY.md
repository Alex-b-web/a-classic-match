# Security

## Reporting a problem

Email **hello@aclassicmatch.com** with a short description and steps to reproduce. Please don't post
details in a public issue. You'll get a reply within a few working days.

## Rules for this repository

- **Never commit keys, passwords or service account files.** The `.gitignore` blocks the usual file
  names, and the CI pipeline scans every commit for leaked keys (Gitleaks).
- The **publishable** Supabase key in `public/config.js` is meant to be public. Never add a secret or
  `service_role` key to the website.
- Keys live only in **GitHub → Settings → Secrets and variables → Actions** or in Google Secret Manager.

## Secrets the pipeline uses

| Name | Where it's used | How to create it |
| --- | --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | Deploys to Firebase | Google Cloud → service account JSON key |
| `RESEND_API_KEY` | Sends the emails | Resend → API Keys (sending access only) |

## Deployments

- Pull requests and branches run the tests only (`.github/workflows/ci.yml`).
- Merging into `main` runs the tests, then deploys (`.github/workflows/deploy.yml`) to the **production**
  environment. Nothing is deployed unless every test passes.
- After each deploy the pipeline checks that the live site answers.
