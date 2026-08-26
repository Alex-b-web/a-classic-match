import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { BOOKS } from "@/data/books";
import { FREE_LIBRARY_SIZE, FREE_QUESTION_COUNT, QUESTIONS } from "@/data/quiz";
import { PRO_PRICE, useTier } from "@/hooks/use-tier";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: `Pro — ${PRO_PRICE} for the full library | A Classic Match` },
      {
        name: "description",
        content:
          "Upgrade to Pro for £5: all nine matching questions, the complete classics library and a % match score on every recommendation.",
      },
      { property: "og:title", content: "A Classic Match Pro — £5 one-off" },
      {
        property: "og:description",
        content: "Nine questions, the full classics library and match percentages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProPage,
});

function ProPage() {
  const { isPro, setPro } = useTier();

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 pb-20 pt-8">
      <header className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-serif text-sm uppercase tracking-[0.3em] text-muted-foreground"
        >
          <img src={logoAsset.url} alt="A Classic Match" className="size-7" loading="eager" />
          A Classic Match
        </Link>
        <Link
          to="/browse"
          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
        >
          Browse
        </Link>
      </header>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="size-4" /> Back to the quiz
      </Link>

      <p className="mt-10 font-serif text-xs uppercase tracking-[0.35em] text-accent">
        A Classic Match Pro
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground">
        The whole canon, {PRO_PRICE} once.
      </h1>
      <p className="mt-3 max-w-md font-serif text-lg leading-snug text-foreground/80">
        The free quiz gives you a taste. Pro reads you properly.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-5">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Free
          </p>
          <p className="mt-2 font-serif text-3xl text-foreground">£0</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>{FREE_QUESTION_COUNT} matching questions</li>
            <li>{FREE_LIBRARY_SIZE} classics in the library</li>
            <li>Ten recommendations, no match scores</li>
            <li>Reading list and buy links</li>
          </ul>
        </div>
        <div className="rounded-md border border-gilt/70 bg-secondary/50 p-5">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-accent">Pro</p>
          <p className="mt-2 font-serif text-3xl text-foreground">
            {PRO_PRICE}
            <span className="ml-2 align-middle text-xs uppercase tracking-widest text-muted-foreground">
              one-off
            </span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-foreground/85">
            {[
              `All ${QUESTIONS.length} matching questions`,
              `The full library — ${BOOKS.length} classics`,
              "% match score on every recommendation",
              "Search and sort the entire library",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isPro ? (
        <div className="mt-10">
          <p className="font-serif text-lg italic text-accent">
            Pro is active — every question, every classic, every match score.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs uppercase tracking-[0.2em] text-accent-foreground"
            >
              Take the full quiz
            </Link>
            <button
              onClick={() => setPro(false)}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
            >
              Switch back to free
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <button
            onClick={() => setPro(true)}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Unlock Pro — {PRO_PRICE}
          </button>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-muted-foreground">
            Card checkout isn’t live yet — this button unlocks Pro in preview so you can test the
            experience. Once payments are switched on, the same button takes {PRO_PRICE} through
            Stripe.
          </p>
        </div>
      )}
    </main>
  );
}
