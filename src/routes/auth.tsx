import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

/** Turns low-level errors (Safari says "Load failed", Chrome "Failed to fetch") into plain words. */
function friendly(message: string): string {
  if (/load failed|failed to fetch|networkerror|fetch/i.test(message))
    return "We couldn't reach the sign-in service. Please check your connection and try again. (Site owner: check the Supabase address in config.js.)";
  if (/redirect/i.test(message))
    return "This web address isn't allowed to sign in yet. (Site owner: add it under Supabase → Authentication → URL Configuration.)";
  if (/missing supabase/i.test(message))
    return "Sign-in isn't set up on this site yet. (Site owner: fill in config.js with your Supabase details.)";
  if (/rate limit|too many/i.test(message))
    return "Too many sign-in emails were requested. Please wait a few minutes and try again.";
  return message;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: "signup" } =>
    s.mode === "signup" ? { mode: "signup" } : {},
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
  const { user, ready } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">(Route.useSearch().mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Default to a one-tap email link; a password stays available for readers who prefer it.
  const [usePassword, setUsePassword] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  // Apple / Google buttons appear only once they are switched on in config.js (signInWith),
  // so readers never land on an error page for a provider that isn't set up yet.
  const [providers, setProviders] = useState<Array<"google" | "apple">>([]);
  useEffect(() => {
    const list = (window as unknown as { ACM_CONFIG?: { signInWith?: string[] } }).ACM_CONFIG
      ?.signInWith;
    if (Array.isArray(list))
      setProviders((["google", "apple"] as const).filter((p) => list.includes(p)));
  }, []);

  const sendLink = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin, shouldCreateUser: true },
      });
      if (err) setError(friendly(err.message));
      else setLinkSent(true);
    } catch (e) {
      setError(friendly(e instanceof Error ? e.message : String(e)));
    }
    setBusy(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usePassword) return sendLink();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (err) setError(friendly(err.message));
        else if (!data.session)
          setNotice("Check your email and open the link we sent to finish creating your account.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) setError(friendly(err.message));
      }
    } catch (e) {
      setError(friendly(e instanceof Error ? e.message : String(e)));
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
            {usePassword
              ? mode === "signin"
                ? "Welcome back"
                : "Create your account"
              : "Sign in or create an account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your saved books, reading plan and page log are kept with your account, so they follow
            you to any device.
          </p>

          <div className="mt-6 space-y-2">
            {providers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={async () => {
                  setError(null);
                  // Hands over to Google or Apple, then comes back to the site signed in.
                  let err: unknown = null;
                  try {
                    ({ error: err } = await supabase.auth.signInWithOAuth({
                      provider: p,
                      options: { redirectTo: window.location.origin },
                    }));
                  } catch (e) {
                    err = e;
                  }
                  if (err)
                    setError(
                      `${p === "google" ? "Google" : "Apple"} sign-in isn't switched on yet. Please use email for now.`,
                    );
                }}
                className="w-full rounded-full border border-border bg-card px-5 py-3 text-xs uppercase tracking-[0.2em] text-foreground hover:bg-secondary"
              >
                Continue with {p === "google" ? "Google" : "Apple"}
              </button>
            ))}
            {providers.length > 0 && (
              <p className="pt-2 text-center text-xs uppercase tracking-widest text-muted-foreground">
                or use email
              </p>
            )}
          </div>

          <form onSubmit={submit} className="mt-3 space-y-3">
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
            {usePassword && (
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Password
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2.5 text-base text-foreground outline-none focus:border-accent"
                />
              </label>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-muted-foreground">{notice}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-accent px-5 py-3 text-xs uppercase tracking-[0.2em] text-accent-foreground disabled:opacity-60"
            >
              {busy
                ? "One moment…"
                : !usePassword
                  ? "Email me a sign-in link"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
            </button>
            {!usePassword && (
              <p className="text-center text-xs text-muted-foreground">
                No password needed. We&rsquo;ll email you a link that signs you in, new or
                returning.
              </p>
            )}
          </form>

          <button
            type="button"
            onClick={() => {
              setUsePassword(!usePassword);
              setError(null);
              setNotice(null);
            }}
            className="mt-4 block text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
          >
            {usePassword ? "Email me a link instead" : "Use a password instead"}
          </button>

          {usePassword && (
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
              className="mt-6 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          )}
        </>
      )}
    </main>
  );
}
