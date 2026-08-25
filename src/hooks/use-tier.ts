import { useCallback, useEffect, useState } from "react";

const KEY = "acm-tier";

/**
 * Free vs Pro access. Pro is stored locally for now; once Stripe checkout is
 * live the success handler is what flips this flag.
 */
export function useTier() {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    try {
      setIsPro(localStorage.getItem(KEY) === "pro");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setPro = useCallback((value: boolean) => {
    setIsPro(value);
    try {
      if (value) localStorage.setItem(KEY, "pro");
      else localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return { isPro, setPro };
}

export const PRO_PRICE = "£5";
