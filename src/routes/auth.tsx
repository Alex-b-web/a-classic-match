import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { getFirebase } from "@/integrations/firebase/client";

/** Remembers the address the link was sent to, so the link can finish on this device. */
const EMAIL_KEY = "acm-signin-email";

const NOT_SET_UP =
  "Sign-in isn't set up on this site yet. (Site owner: fill in the firebase section of public/config.js.)";

/** Turns Firebase error codes into plain words. */
function friendly(e: unknown): string {
  const code = String((e as { code?: unknown } | null)?.code ?? "");
  if (code === "functions/invalid-argument") return "Please enter a valid email address.";
  if (code === "auth/invalid-email")
    return "That address doesn't match the one the sign-in link was sent to. Please enter it again.";
  if (code === "functions/resource-exhausted" || code === "auth/too-many-requests")
    return "Too many sign-in emails were requested. Please wait a few minutes and try again.";
  if (code === "auth/invalid-action-code" || code === "auth/expired-action-code")
    return "This sign-in link has expired or has already been used. Please request a new one.";
  if (code === "auth/user-disabled")
    return "This account can't be used. Please contact hello@aclassicmatch.com.";
  if (
    code === "auth/network-request-failed" ||
    code === "functions/unavailable" ||
    code === "functions/deadline-exceeded"
  )
    return "We couldn't reach the sign-in service. Please check your connection and try again.";
  return "Something went wrong. Please try again in a minute.";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: "signup" } =>
    s["mode"] === "signup" ? { mode: "signup" } : {},
  head: () => ({
    meta: [
      { title: "Sign In or Create an Account — A Classic Match" },
      {
        name: "description",
        content:
          "Create a free account to keep your saved classics, reading plan and daily page log safe on every device you read on.",
      },
      { property: "og:title", content: "Sign In or Create an Account — A Classic Match" },
      {
        property: "og:description",
        content: "Keep your saved classics, reading plan and page log on every device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);
  // Opened from a sign-in link on a device that doesn't remember the address: ask for it.
  const [needsEmail, setNeedsEmail] = useState(false);

  const finish = async (address: string) => {
    const fb = getFirebase();
    if (!fb) {
      setError(NOT_SET_UP);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailLink(fb.auth, address, window.location.href);
      try {
        localStorage.removeItem(EMAIL_KEY);
      } catch {
        /* storage unavailable */
      }
      navigate({ to: "/", replace: true });
    } catch (e) {
      setError(friendly(e));
      setBusy(false);
    }
  };

  // Arriving from a sign-in link: finish signing in with the address saved on this device.
  useEffect(() => {
    const fb = getFirebase();
    if (!fb || !isSignInWithEmailLink(fb.auth, window.location.href)) return;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(EMAIL_KEY);
    } catch {
      /* storage unavailable */
    }
    if (saved) void finish(saved);
    else setNeedsEmail(true);
    // Runs once, when the page is first opened from the link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim().toLowerCase();
    if (needsEmail) return finish(address);

    const fb = getFirebase();
    if (!fb) {
      setError(NOT_SET_UP);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // Emails the one-tap link from hello@aclassicmatch.com. Creates the account on first use.
      const sendSignInLink = httpsCallable<{ email: string }, { ok: boolean }>(
        fb.functions,
        "send_sign_in_link",
      );
      await sendSignInLink({ email: address });
      try {
        localStorage.setItem(EMAIL_KEY, address);
      } catch {
        /* storage unavailable */
      }
      setLinkSent(true);
    } catch (err) {
      setError(friendly(err));
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-20 pt-8">
      <header className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-serif text-sm uppercase tracking-[0.3em] text-muted-foreground"
        >
          <img src="/logo.svg" alt="A Classic Match" className="size-7" loading="eager" />A Classic
          Match
        </Link>
      </header>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="size-4" /> Back to the quiz
      </Link>

      {linkSent ? (
        <section className="mt-8">
          <h1 className="font-serif text-3xl text-foreground">Check your inbox</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We&rsquo;ve sent a sign-in link to <strong className="text-foreground">{email}</strong>.
            Open it on this device and you&rsquo;ll be signed in, with everything you&rsquo;ve saved
            here moved into your account.
          </p>
          <div className="mt-6 h-px w-24 bg-gilt" />
          <button
            onClick={() => setLinkSent(false)}
            className="mt-6 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
          >
            Use a different email
          </button>
        </section>
      ) : (
        <>
          <h1 className="mt-8 font-serif text-3xl text-foreground">
            {needsEmail ? "Confirm your email" : "Sign in or create an account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {needsEmail
              ? "To finish signing in, enter the address the sign-in link was sent to."
              : "Your saved books, reading plan and page log are kept with your account, so they follow you to any device."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
              />
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-accent px-5 py-3 text-xs uppercase tracking-[0.2em] text-accent-foreground disabled:opacity-60"
            >
              {busy ? "One moment…" : needsEmail ? "Finish signing in" : "Email me a sign-in link"}
            </button>
            {!needsEmail && (
              <p className="text-center text-xs text-muted-foreground">
                No password needed. We&rsquo;ll email you a link that signs you in, new or
                returning.
              </p>
            )}
          </form>
        </>
      )}
    </main>
  );
}
