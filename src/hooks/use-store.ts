import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_STORE,
  detectStore,
  lookupCountry,
  STORES,
  storeForCountry,
  type StoreCode,
} from "@/lib/amazon";

const KEY = "acm-store";

/**
 * Which Amazon storefront buy links point at. Detected from the reader's country (looked up
 * once per device), with the browser locale as the instant fallback. The reader can override
 * it, and the choice is remembered locally.
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
      return;
    }
    setStore(detectStore());
    let active = true;
    void lookupCountry().then((code) => {
      if (active) setStore(storeForCountry(code));
    });
    return () => {
      active = false;
    };
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
