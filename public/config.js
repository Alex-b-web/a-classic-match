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
  // Amazon Associates tag (UK). Every Buy link goes to amazon.co.uk with this tag, and Amazon's
  // global redirect sends each shopper to their local Amazon store, keeping the tag.
  amazonTag: "tugcealex-21",
  firebase: {
    apiKey: "AIzaSyBAamRcGmq46ieARfpMielrC_kz7_V4C3g",
    authDomain: "aclassicmatch.firebaseapp.com",
    projectId: "aclassicmatch",
    appId: "1:92432845453:web:d553b688705446227830c4",
  },
};
