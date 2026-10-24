# A Classic Match on Firebase Hosting

Firebase only replaces **Hostinger**, as the place the website files live. Everything else stays the same:

- **Supabase** still handles accounts, sign-in links and saved data.
- **Resend** still sends the emails.
- **Outlook** still receives the replies.

**First, do steps 1–6 of `HOSTINGER-SETUP.md`** (Supabase, Resend, the email templates, the three functions and the hourly reminders). Then follow the steps below instead of step 7 there.

The main difference from Hostinger: Firebase has no file manager, so you can't edit files on the server. You change files on your computer (or in GitHub) and **publish** again. Each publish takes about a minute.

---

## 1. Get the code ready on a computer (10 min)

1. Install **Node.js LTS** from nodejs.org.
2. Unzip `a-classic-match-hostinger-source.zip`, or clone your GitHub repository, and open a terminal in that folder.
3. Open **`public/config.js`** and fill in your Supabase details (from step 1 of the Hostinger guide):
   ```js
   window.ACM_CONFIG = {
     supabaseUrl: "https://abcdefgh.supabase.co",
     supabaseKey: "sb_publishable_…",
     signInWith: [],
   };
   ```
4. Run `npm install` once.

## 2. Create the Firebase project (5 min)

1. Go to **console.firebase.google.com** → **Create a project**. Name it `a-classic-match`. Google Analytics isn't needed.
2. The free **Spark** plan is enough for hosting.
3. Note the **Project ID** (Project settings → General). Put it in **`.firebaserc`** in place of `YOUR-FIREBASE-PROJECT-ID`.

## 3. Publish (5 min)

In the project folder:

```bash
npx firebase-tools@14 login        # opens a browser to sign in with your Google account
npm run deploy:firebase            # builds the site and publishes it
```

The site is now live at `https://YOUR-PROJECT-ID.web.app`. Add that address to Supabase → **Authentication → URL Configuration → Redirect URLs** as `https://YOUR-PROJECT-ID.web.app/**`, so you can test sign-in there before moving the domain.

Whenever you change anything, including `config.js`, run `npm run deploy:firebase` again. Firebase keeps every earlier version: **Hosting → Release history → Roll back** undoes a bad publish in one click.

## 4. Point aclassicmatch.com at Firebase (15 min, then wait for SSL)

1. Firebase console → **Hosting → Add custom domain** → `www.aclassicmatch.com`. Then add `aclassicmatch.com` and choose **Redirect to www.aclassicmatch.com**.
2. Firebase shows a **TXT** record (to prove you own the domain) and **A** records. Add them where your DNS is managed (GoDaddy → Domain → DNS, or Hostinger if the nameservers point there):
   - Replace only the existing **A** / **CNAME** records for `@` and `www`. Those are the ones currently pointing at Hostinger.
   - **Do not touch** the **MX**, **autodiscover**, Microsoft **SPF** or **Resend** records, or `hello@` and the emails will stop working.
3. Wait for Firebase to show **Connected**. The free SSL certificate is added automatically, usually within an hour and sometimes up to 24 hours.
4. Once the site works at `https://www.aclassicmatch.com`, you can cancel the Hostinger hosting plan. Don't cancel the domain if it's registered with GoDaddy.

## 5. Connect GitHub so every push publishes (15 min, one time)

After this, pushing to the `main` branch on GitHub publishes the website and the Firestore rules automatically. You can also run it by hand from **GitHub → Actions → Deploy to Firebase → Run workflow**.

**Before you start:** the project folder must be a GitHub repository (for example `a-classic-match`), and the code must be on the `main` branch.

**A. Connect the repository (Firebase does the work)**

1. In the project folder, run:
   ```bash
   npx firebase-tools@14 login
   npx firebase-tools@14 init hosting:github
   ```
2. Sign in to GitHub when asked. Choose your repository and the `main` branch.
3. Answer the questions:
   - **Project:** pick `a-classic-match` (the Firebase project from section 2).
   - **Public directory:** `dist/client` (it may already be filled in).
   - **Single-page app:** No.
   - **Automatic builds and deploys with GitHub:** Yes.
4. Firebase creates a service account, adds its key to your GitHub repository as the secret **`FIREBASE_SERVICE_ACCOUNT`**, and may add a new workflow file. Keep the workflow file that is already in the project (`.github/workflows/firebase-hosting.yml`). If Firebase adds a second file, delete that one so there is only one pipeline.

**B. Allow the service account to deploy the Firestore rules (5 min)**

The first time, the service account may only be allowed to publish the website. To publish the Firestore rules too:

1. Google Cloud console (console.cloud.google.com) → choose the project → **IAM & Admin → IAM**.
2. Find the service account whose name ends in `@…iam.gserviceaccount.com` (it was created by step A).
3. Click the pencil icon → **Add another role** → **Firebase Rules Admin** → **Save**.

**C. Check the first run**

1. Commit and push your changes to `main` (or run the workflow by hand).
2. Open the **Actions** tab on GitHub. The run should turn green within about 2 minutes.
3. If it turns red, open the run and read the message at the failed step. A missing secret or a wrong project ID are the usual causes.

**D. Make the Firestore database (one time)**

1. Firebase console → **Build → Firestore Database → Create database**.
2. Choose **Production mode** and the **London (europe-west2)** location. Once created, the location can't be changed.
3. The rules in `firestore.rules` are published by the pipeline. They lock everything until the app is connected to Firestore.

Whenever you change anything, including `config.js`, push again and the site updates. Firebase keeps every earlier version: **Hosting → Release history → Roll back** undoes a bad publish in one click.

---

### What's in the code for Firebase

| File                                     | What it does                                                                                                                                                                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `firebase.json`                          | Publishes the `dist/client` folder and builds it first. It gives clean addresses (`/about`), shows `404.html` for unknown pages, makes pages and `config.js` always load fresh, and lets browsers cache the app files for a year. |
| `.firebaserc`                            | Which Firebase project to publish to.                                                                                                                                                                                             |
| `.github/workflows/firebase-hosting.yml` | Automatic deploy of the website and Firestore rules on every push to `main`.                                                                                                                                                      |
| `firestore.rules`                        | Who may read and write the Firestore database. Currently everything is locked.                                                                                                                                                    |
| `firestore.indexes.json`                 | Search indexes for Firestore (none yet).                                                                                                                                                                                          |
| `package.json` → `deploy:firebase`       | The one command for publishing by hand.                                                                                                                                                                                           |

`public/.htaccess` is only used by Hostinger. Firebase ignores it, and it's left in so the same code still works on either host.
