import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // If the site's Supabase settings are missing, carry on signed out instead of crashing:
    // the quiz, list and record still work in this browser.
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setReady(true);
      });
      void supabase.auth
        .getSession()
        .then(({ data: s }) => {
          setUser(s.session?.user ?? null);
          setReady(true);
        })
        .catch(() => setReady(true));
      return () => data.subscription.unsubscribe();
    } catch (e) {
      console.error(e);
      setReady(true);
      return undefined;
    }
  }, []);

  return { user, ready };
}
