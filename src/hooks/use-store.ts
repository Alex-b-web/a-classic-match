import { useCallback, useEffect, useState } from "react";
import { DEFAULT_STORE, detectStore, STORES, type StoreCode } from "@/lib/amazon";

const KEY = "acm-store";

/**
 * Which Amazon storefront buy links point at. Detected from the browser
 * locale, but the reader can override it — the choice is remembered locally.
 */
export function useStore() {
  const [store, setStore] = useState<StoreCode>(DEFAULT_STORE);
  const [overridden, setOverridden] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* storage unavailable */
    }
    if (saved && saved in STORES) {
      setStore(saved as StoreCode);
      setOverridden(true);
    } else {
      setStore(detectStore());
    }
  }, []);

  const choose = useCallback((code: StoreCode) => {
    setStore(code);
    setOverridden(true);
    try {
      localStorage.setItem(KEY, code);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const reset = useCallback(() => {
    setOverridden(false);
    setStore(detectStore());
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return { store, choose, reset, overridden };
}
