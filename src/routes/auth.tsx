import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/auth")({
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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) navigate({ to: "/", replace: true });
  }, [ready, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (err) setError(err.message);
      else if (!data.session)
        setNotice("Check your email and open the link we sent to finish creating your account.");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
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
          <img src={logoAsset.url} alt="A Classic Match" className="size-7" loading="eager" />
          A Classic Match
        </Link>
      </header>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="size-4" /> Back to the quiz
      </Link>

      <h1 className="mt-8 font-serif text-3xl text-foreground">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your saved books, reading plan and page log are kept with your account, so they follow
        you to any device.
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
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
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

        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-muted-foreground">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-accent px-5 py-3 text-xs uppercase tracking-[0.2em] text-accent-foreground disabled:opacity-60"
        >
          {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setNotice(null);
        }}
        className="mt-6 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
      >
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </main>
  );
}
