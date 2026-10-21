import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { ReminderSettings } from "@/components/ReminderSettings";

const LOCAL_KEYS = [
  "canon-shelf-v1",
  "acm-reading-log-v1",
  "acm-answers-v1",
  "acm-plan-v1",
  "acm-ratings-v1",
  "acm-goal-v1",
  "acm-reminders-v1",
];

export const Route = createFileRoute("/account")({
  head: () =>
    meta("Your Account", "Manage your A Classic Match account, sign out or delete your data."),
  component: AccountPage,
});

function AccountPage() {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearLocal = () => LOCAL_KEYS.forEach((k) => localStorage.removeItem(k));

  if (!ready) return <InfoPage title="Your account">{null}</InfoPage>;
  if (!user)
    return (
      <InfoPage title="Your account">
        <p>You're not signed in.</p>
        <Link
          to="/auth"
          className="inline-block rounded-full bg-accent px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-accent-foreground"
        >
          Sign in
        </Link>
      </InfoPage>
    );

  return (
    <InfoPage title="Your account">
      <p>
        Signed in as <strong>{user.email}</strong>
      </p>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          navigate({ to: "/", replace: true });
        }}
        className="rounded-full border border-border px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-foreground hover:bg-secondary"
      >
        Sign out
      </button>

      <h2>Emails</h2>
      <ReminderSettings />

      <h2>Delete account</h2>
      <p>
        This permanently deletes your account and all saved books, plans, page logs, ratings and
        reviews. It can't be undone.
      </p>
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="rounded-full border border-destructive px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-destructive"
        >
          Delete my account
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                // Runs the "delete-account" Supabase function, which erases the account and its data.
                const { error: fnError } = await supabase.functions.invoke("delete-account", {
                  method: "POST",
                });
                if (fnError) throw fnError;
                clearLocal();
                await supabase.auth.signOut();
                navigate({ to: "/", replace: true });
              } catch {
                setError("Something went wrong. Please try again.");
                setBusy(false);
              }
            }}
            className="rounded-full bg-destructive px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-destructive-foreground disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Yes, delete everything"}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="rounded-full border border-border px-5 py-2.5 text-xs uppercase tracking-[0.2em]"
          >
            Cancel
          </button>
        </div>
      )}
      {error && <p className="text-destructive">{error}</p>}
    </InfoPage>
  );
}
