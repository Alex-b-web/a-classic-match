import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebase } from "@/integrations/firebase/client";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // If the site's Firebase settings are missing, carry on signed out instead of crashing:
    // the quiz, list and record still work in this browser.
    const fb = getFirebase();
    if (!fb) {
      setReady(true);
      return undefined;
    }
    return onAuthStateChanged(fb.auth, (current) => {
      setUser(current);
      setReady(true);
    });
  }, []);

  return { user, ready };
}
