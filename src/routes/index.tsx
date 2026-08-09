import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Library } from "lucide-react";
import { QUESTIONS, recommend } from "@/data/quiz";
import { BookCard } from "@/components/BookCard";
import { useShelf } from "@/hooks/use-shelf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Standing Canon — Find Your Next Classic" },
      {
        name: "description",
        content:
          "Six questions, ten classic novels chosen for you — with covers, page counts, authors and the year each was written.",
      },
      { property: "og:title", content: "The Standing Canon — Find Your Next Classic" },
      {
        property: "og:description",
        content: "Six questions, ten classic novels chosen for you.",
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
  const results = useMemo(() => (stage === "results" ? recommend(answers) : []), [stage, answers]);

  const pick = (qid: string, i: number) => {
    setAnswers((a) => ({ ...a, [qid]: i }));
    if (step + 1 < QUESTIONS.length) setStep(step + 1);
    else setStage("results");
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 pb-20 pt-8">
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-serif text-sm uppercase tracking-[0.3em] text-muted-foreground">
          <BookOpen className="size-4 text-accent" />
          The Standing Canon
        </span>
        <Link
          to="/list"
          className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
        >
          <Library className="size-4" /> List
        </Link>
      </header>

      {stage === "quote" && (
        <section className="animate-[var(--animate-rise)] pt-24">
          <p className="font-serif text-xs uppercase tracking-[0.35em] text-accent">
            Before we begin
          </p>
          <blockquote className="mt-6 font-serif text-[2rem] leading-[1.2] italic text-foreground">
            “A classic is a book which with each rereading offers as much of a sense of discovery as
            the first reading.”
          </blockquote>
          <footer className="mt-5 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            — Italo Calvino
          </footer>
          <div className="mt-14 h-px w-24 bg-gilt" />
          <p className="mt-6 max-w-sm font-serif text-lg leading-snug text-foreground/80">
            Six questions. Ten classics chosen for the reader you actually are.
          </p>
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
          <div className="mt-6">
            {results.map((b, i) => (
              <BookCard
                key={b.id}
                book={b}
                rank={i + 1}
                saved={has(b.id)}
                onToggle={() => toggle(b.id)}
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
