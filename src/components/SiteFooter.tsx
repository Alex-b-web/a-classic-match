import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "acm-cookie-notice-v1";

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-2xl flex-wrap gap-x-5 gap-y-2 border-t border-border px-5 py-8 text-xs uppercase tracking-widest text-muted-foreground">
      <Link to="/about" className="hover:text-accent">About</Link>
      <Link to="/privacy" className="hover:text-accent">Privacy</Link>
      <Link to="/cookies" className="hover:text-accent">Cookies</Link>
      <Link to="/account" className="hover:text-accent">Account</Link>
    </footer>
  );
}

/** We only use strictly necessary storage, so this is a notice, not a consent wall. */
export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(!localStorage.getItem(KEY));
    } catch {
      /* ignore */
    }
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-4 shadow-lg">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-3">
        <p className="flex-1 text-sm text-foreground">
          We only use essential storage to keep you signed in and remember your list, plan and
          reading log. No advertising or tracking cookies.{" "}
          <Link to="/cookies" className="underline hover:text-accent">Learn more</Link>
        </p>
        <button
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setShow(false);
          }}
          className="rounded-full bg-accent px-5 py-2 text-xs uppercase tracking-[0.2em] text-accent-foreground"
        >
          OK
        </button>
      </div>
    </div>
  );
}
