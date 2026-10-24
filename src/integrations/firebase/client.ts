// The browser's connection to Firebase: sign-in, the reader's saved data and the server functions.
// Settings come from public/config.js (window.ACM_CONFIG.firebase). They are public values, safe to
// be seen by anyone; what protects the data is the Firestore rules and the server functions.
import { initializeApp, type FirebaseApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  functions: Functions;
};

type Settings = { apiKey: string; authDomain: string; projectId: string; appId: string };

/** Placeholder values (starting with "YOUR") count as not filled in. */
function filled(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed && !trimmed.startsWith("YOUR") ? trimmed : undefined;
}

function readSettings(): Settings | null {
  const cfg = (
    window as unknown as {
      ACM_CONFIG?: {
        firebase?: { apiKey?: unknown; authDomain?: unknown; projectId?: unknown; appId?: unknown };
      };
    }
  ).ACM_CONFIG?.firebase;
  const apiKey = filled(cfg?.apiKey);
  const authDomain = filled(cfg?.authDomain);
  const projectId = filled(cfg?.projectId);
  const appId = filled(cfg?.appId);
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return { apiKey, authDomain, projectId, appId };
}

/** London, next to the database. Must match REGION in functions/main.py. */
const FUNCTIONS_REGION = "europe-west2";

let cached: FirebaseServices | null | undefined;

/**
 * The Firebase services, or null when config.js hasn't been filled in yet.
 * The site still works without them: the quiz, list and record stay in this browser.
 */
export function getFirebase(): FirebaseServices | null {
  if (typeof window === "undefined") return null; // build-time rendering has no browser settings
  if (cached !== undefined) return cached;
  const settings = readSettings();
  if (!settings) {
    cached = null;
    return null;
  }
  try {
    const app = initializeApp(settings);
    const auth = getAuth(app);
    // Keep readers signed in on this device until they press Sign out.
    setPersistence(auth, browserLocalPersistence).catch((e) =>
      console.error("Could not keep sign-in", e),
    );
    cached = {
      app,
      auth,
      db: getFirestore(app),
      functions: getFunctions(app, FUNCTIONS_REGION),
    };
  } catch (e) {
    console.error("Firebase could not start", e);
    cached = null;
  }
  return cached;
}
