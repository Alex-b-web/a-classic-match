import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Library, Sparkles } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { questionsFor, recommend } from "@/data/quiz";
import { QUOTES, randomQuote } from "@/data/quotes";

import { BookCard } from "@/components/BookCard";
import { useShelf } from "@/hooks/use-shelf";
import { PRO_PRICE, useTier } from "@/hooks/use-tier";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Classic Match — Find Your Next Classic" },
      {
        name: "description",
        content:
          "Nine questions, ten classic novels chosen for you — with covers, page counts, authors and the year each was written.",
      },
      { property: "og:title", content: "A Classic Match — Find Your Next Classic" },
      {
        property: "og:description",
        content: "Nine questions, ten classic novels chosen for you.",
      },
    ],
  }),
  component: Index,
});

type Stage = "quote" | "quiz" | "results";

function Index() {
  const [stage, setStage] = useState<Stage>("quote");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const { toggle, has } = useShelf();
  const { isPro } = useTier();
  const QUESTIONS = useMemo(() => questionsFor(isPro), [isPro]);
  // Pick a fresh quote after hydration so each page load shows a different one.
  const [quote, setQuote] = useState(QUOTES[0]!);
  useEffect(() => setQuote(randomQuote()), []);
  const results = useMemo(
    () => (stage === "results" ? recommend(answers, isPro) : []),
    [stage, answers, isPro],
  );

  const pick = (qid: string, i: number) => {
    setAnswers((a) => ({ ...a, [qid]: i }));
    if (step + 1 < QUESTIONS.length) setStep(step + 1);
    else setStage("results");
  };


  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 pb-20 pt-8">
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-serif text-sm uppercase tracking-[0.3em] text-muted-foreground">
          <img
            src={logoAsset.url}
            alt="A Classic Match"
            className="size-7"
            loading="eager"
          />
          A Classic Match
        </span>
        <nav className="flex items-center gap-4">
          <Link
            to="/browse"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
          >
            Browse
          </Link>
          <Link
            to="/pro"
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-accent hover:opacity-80"
          >
            <Sparkles className="size-4" /> {isPro ? "Pro" : `Pro ${PRO_PRICE}`}
          </Link>
          <Link
            to="/list"
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
          >
            <Library className="size-4" /> List
          </Link>
        </nav>

      </header>

      {stage === "quote" && (
        <section className="animate-[var(--animate-rise)] pt-24">
          <p className="font-serif text-xs uppercase tracking-[0.35em] text-accent">
            Before we begin
          </p>
          <blockquote
            key={quote.author + quote.text}
            className="mt-6 animate-[var(--animate-rise)] font-serif text-[2rem] leading-[1.2] italic text-foreground"
          >
            “{quote.text}”
          </blockquote>
          <footer className="mt-5 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            — {quote.author}
          </footer>

          <div className="mt-14 h-px w-24 bg-gilt" />
          <p className="mt-6 max-w-sm font-serif text-lg leading-snug text-foreground/80">
            {QUESTIONS.length === 1 ? "One question" : `${QUESTIONS.length} questions`}. Ten
            classics chosen for the reader you actually are.
          </p>
          {!isPro && (
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Free gives you {QUESTIONS.length} questions and a shorter shelf.{" "}
              <Link to="/pro" className="text-accent underline decoration-gilt/60">
                Pro is {PRO_PRICE}
              </Link>
              .
            </p>
          )}

          <button
            onClick={() => setStage("quiz")}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Begin the quiz <ArrowRight className="size-4" />
          </button>
        </section>
      )}

      {stage === "quiz" && (
        <section className="pt-16">
          <div className="flex items-center gap-3">
            {QUESTIONS.map((q, i) => (
              <span
                key={q.id}
                className={`h-px flex-1 ${i <= step ? "bg-accent" : "bg-border"}`}
              />
            ))}
          </div>
          <p className="mt-6 font-serif text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <h1
            key={QUESTIONS[step]!.id}
            className="mt-3 animate-[var(--animate-rise)] font-serif text-3xl leading-tight text-foreground"
          >
            {QUESTIONS[step]!.prompt}
          </h1>
          <div className="mt-8 space-y-3">
            {QUESTIONS[step]!.options.map((o, i) => (
              <button
                key={o.label}
                onClick={() => pick(QUESTIONS[step]!.id, i)}
                className="w-full rounded-md border border-border bg-card px-4 py-4 text-left font-serif text-lg text-foreground transition-colors hover:border-accent hover:bg-secondary"
              >
                {o.label}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="mt-8 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
            >
              ← Previous question
            </button>
          )}
        </section>
      )}

      {stage === "results" && (
        <section className="pt-12">
          <p className="font-serif text-xs uppercase tracking-[0.3em] text-accent">Your shelf</p>
          <h1 className="mt-2 font-serif text-3xl leading-tight text-foreground">
            Ten classics for you
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Save the ones you like — your list keeps a buy link for each.
          </p>
          {!isPro && (
            <p className="mt-4 rounded-md border border-gilt/50 bg-secondary/40 px-4 py-3 text-sm text-foreground/80">
              Pro adds three more questions, the full library and a % match score on each book.{" "}
              <Link to="/pro" className="text-accent underline decoration-gilt/60">
                Upgrade for {PRO_PRICE}
              </Link>
              .
            </p>
          )}
          <div className="mt-6">
            {results.map((r, i) => (
              <BookCard
                key={r.book.id}
                book={r.book}
                rank={i + 1}
                {...(isPro ? { match: r.match } : {})}
                saved={has(r.book.id)}
                onToggle={() => toggle(r.book.id)}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/list"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs uppercase tracking-[0.2em] text-accent-foreground"
            >
              <Library className="size-4" /> View my list
            </Link>
            <button
              onClick={() => {
                setAnswers({});
                setStep(0);
                setStage("quiz");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-foreground hover:bg-secondary"
            >
              Retake quiz
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
