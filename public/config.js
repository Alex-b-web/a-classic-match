/*
 * A Classic Match — site settings.
 * Edit this file on the web host (Hostinger: File Manager → public_html/config.js).
 *
 * supabaseUrl / supabaseKey: Supabase → Project Settings → API Keys (and Data API for the URL).
 *   Use the Project URL and the "publishable" key (or the legacy "anon public" key).
 *   Both are safe to be public. Never put a "secret" or "service_role" key here.
 *
 * signInWith: which extra sign-in buttons to show. Add "google" only after
 *   switching that provider on in Supabase → Authentication → Sign In / Providers.
 *   Email sign-in always works.
 */
window.ACM_CONFIG = {
  supabaseUrl: "https://YOUR-PROJECT-REF.supabase.co",
  supabaseKey: "YOUR-PUBLISHABLE-OR-ANON-KEY",
  signInWith: [], // e.g. ["google"]
};
