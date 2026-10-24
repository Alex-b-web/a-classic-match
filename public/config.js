/*
 * A Classic Match — site settings.
 * The site is deployed from the GitHub repository, so edit this file there (public/config.js).
 *
 * firebase: Firebase → Project settings → General → Your apps → Web app → SDK setup and
 *   configuration. Copy apiKey and appId from the firebaseConfig block. These values are public
 *   and safe to be seen. Never put a service account key or any other secret here.
 *
 * Until apiKey and appId are filled in, the site still works, and sign-in shows a
 * "not set up" message instead.
 */
window.ACM_CONFIG = {
  firebase: {
    apiKey: "YOUR-WEB-API-KEY",
    authDomain: "aclassicmatch.firebaseapp.com",
    projectId: "aclassicmatch",
    appId: "YOUR-WEB-APP-ID",
  },
};
