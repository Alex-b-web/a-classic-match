import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Plus } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { recommend, type Match } from "@/data/quiz";
import { Cover } from "@/components/BookCard";
import { useShelf } from "@/hooks/use-shelf";
import { ANSWERS_KEY } from "@/lib/answers";
import { PLAN_KEY } from "@/lib/sync";
import { AccountNav } from "@/components/AccountNav";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Build Your Reading Plan — A Classic Match" },
      {
        name: "description",
        content:
          "Turn your quiz answers into a paced reading plan: pick the classics you want, set your pages a day and see when you will finish each one.",
      },
      { property: "og:title", content: "Build Your Reading Plan — A Classic Match" },
      {
        property: "og:description",
        content: "Pick your classics, set a pace and see when you will finish each book.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanPage,
});

const PACES = [10, 20, 30, 50] as const;

function PlanPage() {
  const { toggle, has } = useShelf();
  const [answers, setAnswers] = useState<Record<string, number> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pace, setPace] = useState<number>(20);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ANSWERS_KEY);
      if (raw) setAnswers(JSON.parse(raw) as Record<string, number>);
    } catch {
      /* ignore unreadable answers */
    }
    setLoaded(true);
  }, []);

  // Remember the plan itself, so it survives a reload and syncs to the account.
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(PLAN_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as { picked?: string[]; pace?: number };
        if (Array.isArray(saved.picked)) setPicked(saved.picked);
        if (typeof saved.pace === "number") setPace(saved.pace);
      } catch {
        /* ignore unreadable plan */
      }
    };
    load();
    window.addEventListener("acm-plan-change", load);
    return () => window.removeEventListener("acm-plan-change", load);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify({ picked, pace }));
    } catch {
      /* ignore storage failures */
    }
  }, [picked, pace, loaded]);

  const matches: Match[] = useMemo(
    () => (answers ? recommend(answers, 20) : []),
    [answers],
  );

  const plan = useMemo(() => {
    const chosen = matches.filter((m) => picked.includes(m.book.id));
    let day = 0;
    const start = new Date();
    return chosen.map((m) => {
      day += Math.max(1, Math.ceil(m.book.pages / pace));
      const finish = new Date(start);
      finish.setDate(start.getDate() + day);
      return { ...m, days: Math.max(1, Math.ceil(m.book.pages / pace)), finish };
    });
  }, [matches, picked, pace]);

  const totalDays = plan.length ? plan[plan.length - 1]!.days : 0;
  const totalPages = plan.reduce((n, p) => n + p.book.pages, 0);
  const endDate = plan.length ? plan[plan.length - 1]!.finish : null;

  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

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
          to="/list"
          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
        >
          List
        </Link>
      </header>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="size-4" /> Back to the quiz
      </Link>

      <h1 className="mt-8 font-serif text-3xl text-foreground">Your reading plan</h1>

      {loaded && !answers && (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Take the quiz first and we will build a plan around your answers.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-xs uppercase tracking-[0.2em] text-accent-foreground"
          >
            Take the quiz
          </Link>
        </>
      )}

      {answers && (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose the classics you want to read, set your pace, and we will lay them out in order.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Pages a day
            </span>
            {PACES.map((p) => (
              <button
                key={p}
                onClick={() => setPace(p)}
                aria-pressed={pace === p}
                className={`rounded-full border px-3 py-1.5 text-xs tracking-wide transition-colors ${
                  pace === p
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border text-foreground hover:bg-secondary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <h2 className="mt-10 font-serif text-xs uppercase tracking-[0.3em] text-accent">
            Books matched to you
          </h2>
          <div className="mt-3">
            {matches.map((m) => {
              const on = picked.includes(m.book.id);
              return (
                <article
                  key={m.book.id}
                  className="flex items-center gap-3 border-b border-border/60 py-3"
                >
                  <Cover book={m.book} className="h-16 w-11 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-serif text-base text-foreground">
                      {m.book.title}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.book.author} · {m.book.pages} pages · {m.match}% match
                    </p>
                    {m.reasons.length > 0 && (
                      <p className="truncate text-xs text-muted-foreground">
                        Suits your taste for {m.reasons.join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => togglePick(m.book.id)}
                    aria-pressed={on}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs tracking-wide transition-colors ${
                      on
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    {on ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                    {on ? "In plan" : "Add"}
                  </button>
                </article>
              );
            })}
          </div>

          <h2 className="mt-10 font-serif text-xs uppercase tracking-[0.3em] text-accent">
            The plan
          </h2>
          {plan.length === 0 ? (
            <p className="mt-3 font-serif text-lg italic text-muted-foreground">
              Add a few books above to build your plan.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.length} {plan.length === 1 ? "book" : "books"} · {totalPages} pages ·{" "}
                {totalDays} days at {pace} pages a day
                {endDate ? ` · finished by ${endDate.toLocaleDateString()}` : ""}.
              </p>
              <ol className="mt-4 space-y-3">
                {plan.map((p, i) => (
                  <li
                    key={p.book.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3"
                  >
                    <span className="font-serif text-xs tracking-[0.25em] text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-base text-foreground">
                        {p.book.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.days} {p.days === 1 ? "day" : "days"} · done by{" "}
                        {p.finish.toLocaleDateString()}
                      </p>
                    </div>
                    {!has(p.book.id) && (
                      <button
                        onClick={() => toggle(p.book.id)}
                        className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs tracking-wide text-foreground hover:bg-secondary"
                      >
                        Save to list
                      </button>
                    )}
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => plan.forEach((p) => !has(p.book.id) && toggle(p.book.id))}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs uppercase tracking-[0.2em] text-accent-foreground"
                >
                  Save the whole plan
                </button>
                <Link
                  to="/list"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-foreground hover:bg-secondary"
                >
                  View my list
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
