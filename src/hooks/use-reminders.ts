import { useCallback, useEffect, useState } from "react";

export const REMINDERS_KEY = "acm-reminders-v1";
const EVT = "acm-reminders-change";

/** Streak reminder email settings. Off until the reader turns them on (consent under UK GDPR). */
export type Reminders = { on: boolean; hour: number; tz: string };

const DEFAULTS: Reminders = { on: false, hour: 19, tz: "Europe/London" };

function localTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULTS.tz;
  } catch {
    return DEFAULTS.tz;
  }
}

export function readReminders(): Reminders {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Reminders>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useReminders() {
  const [reminders, setState] = useState<Reminders>(DEFAULTS);

  useEffect(() => {
    const sync = () => setState(readReminders());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<Reminders>) => {
    const next = { ...readReminders(), ...patch, tz: localTz() };
    try {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
    } catch {
      /* ignore storage failures */
    }
    window.dispatchEvent(new Event(EVT));
  }, []);

  return { reminders, update };
}
