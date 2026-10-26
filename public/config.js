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
  // Amazon Associates tag for each store. Each store's Buy links go to that country's Amazon
  // site with its tag. Ireland uses amazon.co.uk, so it uses the UK tag. Stores left empty get
  // plain links (no commission).
  amazonTags: {
    GB: "tugcealex-21",
    IE: "tugcealex-21",
    US: "tugcealex-20",
    CA: "tugcealex07-20",
    AU: "tugcealex-22",
    DE: "tugcealex0f-21",
    FR: "tugcealex09-21",
    ES: "tugcealex0b-21",
    IT: "tugcealex06b-21",
    NL: "tugcealex07-21",
    SE: "tugcealex08-21",
    PL: "tugcealex0d-21",
    SG: "tugcealex09-22",
  },
  firebase: {
    apiKey: "AIzaSyBAamRcGmq46ieARfpMielrC_kz7_V4C3g",
    authDomain: "aclassicmatch.firebaseapp.com",
    projectId: "aclassicmatch",
    appId: "1:92432845453:web:d553b688705446227830c4",
  },
};
