import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import type { Book } from "@/data/books";
import { useReminders } from "@/hooks/use-reminders";
import { useSession } from "@/hooks/use-session";
import { reminderSubject, suggestedPages } from "@/lib/reminder-email";

const HOURS = [7, 8, 12, 17, 18, 19, 20, 21];
const label = (h: number) =>
  new Date(2000, 0, 1, h).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

/** Streak reminder email switch, with a preview of the email on the Record page. */
export function ReminderSettings({
  preview,
}: {
  preview?: { streak: number; book: Book | null; read: (id: string) => number };
}) {
  const { user, ready } = useSession();
  const { reminders, update } = useReminders();
  if (!ready) return null;

  const bookTitle = preview?.book?.title ?? null;
  const pagesLeft = preview?.book ? preview.book.pages - preview.read(preview.book.id) : null;
  const streak = preview?.streak ?? 1;

  return (
    <section className={preview ? "mt-6 rounded-md border border-border bg-card p-5" : ""}>
      {preview && (
        <div className="flex items-center gap-2 font-serif text-xs uppercase tracking-[0.3em] text-accent">
          <Mail className="size-4" /> Streak reminders
        </div>
      )}

      {!user ? (
        <div className={preview ? "mt-3" : ""}>
          <p className="font-serif text-lg leading-snug text-foreground">
            Get a gentle nudge by email on days you haven&rsquo;t read yet.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-flex rounded-full bg-accent px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-accent-foreground"
          >
            Sign in to turn on
          </Link>
        </div>
      ) : (
        <div className={`space-y-3 ${preview ? "mt-3" : ""}`}>
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm text-foreground">Email me if my streak is about to break</span>
            <button
              type="button"
              role="switch"
              aria-checked={reminders.on}
              onClick={() => update({ on: !reminders.on })}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                reminders.on ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-card shadow transition-all ${
                  reminders.on ? "left-[1.375rem]" : "left-0.5"
                }`}
              />
            </button>
          </label>
          {reminders.on && (
            <label className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              Send at
              <select
                value={reminders.hour}
                onChange={(e) => update({ hour: Number(e.target.value) })}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs normal-case tracking-normal text-foreground focus:border-accent focus:outline-none"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {label(h)}
                  </option>
                ))}
              </select>
              <span className="normal-case tracking-normal">
                only on days you haven&rsquo;t logged pages
              </span>
            </label>
          )}
        </div>
      )}

      {preview && (
        <div className="mt-5 rounded-md border border-border/70 bg-background p-4">
          <p className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            Preview · {reminderSubject({ streak, bookTitle, pagesLeft, siteUrl: "" })}
          </p>
          <p className="mt-2 font-serif text-lg leading-snug text-foreground">
            You&rsquo;re on a {streak}-day streak
            {bookTitle ? (
              <>
                {" "}
                with <em>{bookTitle}</em>
              </>
            ) : null}
            . {suggestedPages(pagesLeft)} pages tonight?
          </p>
        </div>
      )}
    </section>
  );
}
