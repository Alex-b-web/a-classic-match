import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Flame, Minus, Plus } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { BOOKS } from "@/data/books";
import { Cover } from "@/components/BookCard";
import { useShelf } from "@/hooks/use-shelf";
import { useReadingLog, today } from "@/hooks/use-reading-log";
import { bookLine, paceLine, streakLine } from "@/lib/motivation";
import { AccountNav } from "@/components/AccountNav";

export const Route = createFileRoute("/reading")({
  head: () => ({
    meta: [
      { title: "Reading Record — A Classic Match" },
      {
        name: "description",
        content:
          "Log the pages you read each day, watch each classic fill up, keep your streak alive and get a nudge to keep going.",
      },
      { property: "og:title", content: "Reading Record — A Classic Match" },
      {
        property: "og:description",
        content: "Log your pages each day, keep your streak and finish the classics you started.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReadingPage,
});

const GOAL = 20;
const QUICK = [10, 20, 30, 50] as const;

function ReadingPage() {
  const { ids } = useShelf();
  const { addPages, setPages, totalFor, pagesOn, pagesOnDay, totalPages, streak, last7 } =
    useReadingLog();
  const [custom, setCustom] = useState<Record<string, string>>({});

  const books = ids
    .map((id) => BOOKS.find((b) => b.id === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const date = today();
  const pagesToday = pagesOnDay(date);
  const weekPages = last7.reduce((n, d) => n + d.pages, 0);
  const best = Math.max(1, ...last7.map((d) => d.pages));
  const y = (pages: number) => 62 - (pages / best) * 54;
  const points = last7.map((d, i) => `${i * (280 / 6)},${y(d.pages)}`).join(" ");

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
        <nav className="flex items-center gap-4">
          <Link
            to="/plan"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
          >
            Plan
          </Link>
          <Link
            to="/list"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
          >
            List
          </Link>
          <AccountNav />
        </nav>
      </header>

      <Link
        to="/list"
        className="mt-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="size-4" /> Back to my list
      </Link>

      <h1 className="mt-8 font-serif text-3xl text-foreground">Your reading record</h1>

      {books.length === 0 ? (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Save a book to your list first, then come back to log the pages you read each day.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-xs uppercase tracking-[0.2em] text-accent-foreground"
          >
            Take the quiz
          </Link>
        </>
      ) : (
        <>
          <div className="mt-6 rounded-md border border-border bg-card p-5">
            <div className="flex items-center gap-2 font-serif text-xs uppercase tracking-[0.3em] text-accent">
              <Flame className="size-4" /> {streak} day {streak === 1 ? "streak" : "streak"}
            </div>
            <p className="mt-3 font-serif text-xl leading-snug text-foreground">
              {streakLine(streak, pagesToday)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {pagesToday} {pagesToday === 1 ? "page" : "pages"} today · {paceLine(weekPages, GOAL)}{" "}
              · {totalPages} pages logged in all.
            </p>

            <div className="mt-5">
              <svg
                viewBox="0 0 280 90"
                className="h-28 w-full overflow-visible"
                role="img"
                aria-label={`Pages read over the last seven days: ${last7
                  .map((d) => `${d.date} ${d.pages}`)
                  .join(", ")}`}
              >
                <defs>
                  <linearGradient id="readingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 1, 2].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    x2="280"
                    y1={8 + i * 27}
                    y2={8 + i * 27}
                    className="stroke-border"
                    strokeWidth="1"
                  />
                ))}
                <polygon
                  className="text-accent"
                  fill="url(#readingFill)"
                  points={`0,62 ${points} 280,62`}
                />
                <polyline
                  points={points}
                  fill="none"
                  className="stroke-accent"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {last7.map((d, i) => (
                  <g key={d.date}>
                    <circle
                      cx={i * (280 / 6)}
                      cy={y(d.pages)}
                      r="3.5"
                      className="fill-accent"
                    />
                    {d.pages > 0 && (
                      <text
                        x={i * (280 / 6)}
                        y={y(d.pages) - 8}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[9px]"
                      >
                        {d.pages}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
              <div className="mt-1 flex">
                {last7.map((d) => (
                  <span
                    key={d.date}
                    className="flex-1 text-center text-[0.6rem] uppercase tracking-widest text-muted-foreground"
                  >
                    {new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
                      weekday: "narrow",
                    })}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <h2 className="mt-10 font-serif text-xs uppercase tracking-[0.3em] text-accent">
            Log today&rsquo;s pages
          </h2>

          <div className="mt-3 space-y-4">
            {books.map((b) => {
              const read = totalFor(b.id);
              const pct = Math.min(100, Math.round((read / b.pages) * 100));
              const doneToday = pagesOn(b.id, date);
              return (
                <article key={b.id} className="rounded-md border border-border bg-card p-4">
                  <div className="flex gap-3">
                    <Cover book={b} className="h-20 w-14 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-lg leading-tight text-foreground">
                        {b.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{b.author}</p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {read} of {b.pages} pages · {pct}%
                      </p>
                      <p className="mt-1.5 font-serif text-sm italic text-foreground/80">
                        {bookLine(read, b.pages)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {QUICK.map((n) => (
                      <button
                        key={n}
                        onClick={() => addPages(b.id, n)}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs tracking-wide text-foreground transition-colors hover:bg-secondary"
                      >
                        <Plus className="size-3" /> {n}
                      </button>
                    ))}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const n = Number(custom[b.id]);
                        if (Number.isFinite(n) && n > 0) addPages(b.id, Math.round(n));
                        setCustom((c) => ({ ...c, [b.id]: "" }));
                      }}
                      className="flex items-center gap-2"
                    >
                      <label className="sr-only" htmlFor={`pages-${b.id}`}>
                        Pages read today for {b.title}
                      </label>
                      <input
                        id={`pages-${b.id}`}
                        type="number"
                        min={1}
                        inputMode="numeric"
                        placeholder="Pages"
                        value={custom[b.id] ?? ""}
                        onChange={(e) =>
                          setCustom((c) => ({ ...c, [b.id]: e.target.value }))
                        }
                        className="w-20 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-accent px-3 py-1.5 text-xs uppercase tracking-widest text-accent-foreground"
                      >
                        Log
                      </button>
                    </form>
                    {doneToday > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground">
                          {doneToday} logged today
                        </span>
                        <button
                          onClick={() => setPages(b.id, 0)}
                          aria-label={`Clear today's pages for ${b.title}`}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs tracking-wide text-muted-foreground hover:bg-secondary"
                        >
                          <Minus className="size-3" /> Clear
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
