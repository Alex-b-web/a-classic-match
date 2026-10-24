import { useState } from "react";
import { Award, Star } from "lucide-react";
import { BOOKS } from "@/data/books";
import { useReadingLog } from "@/hooks/use-reading-log";
import { useRatings } from "@/hooks/use-ratings";

const BADGES = [
  { n: 1, name: "First Chapter", text: "Finished your first classic" },
  { n: 3, name: "Bookworm", text: "Finished 3 classics" },
  { n: 5, name: "Well Read", text: "Finished 5 classics" },
  { n: 10, name: "Scholar", text: "Finished 10 classics" },
  { n: 25, name: "Literary Sage", text: "Finished 25 classics" },
  { n: 50, name: "Living Library", text: "Finished 50 classics" },
];

/** Finished books, yearly goal, badges and rate-and-review. */
export function Achievements() {
  const { log, totalFor, streak, totalPages } = useReadingLog();
  const { ratings, rate, goal, setGoal } = useRatings();
  const year = String(new Date().getFullYear());

  const finished = BOOKS.filter((b) => totalFor(b.id) >= b.pages).map((b) => {
    const days = Object.keys(log[b.id] ?? {}).sort();
    return { book: b, finishedOn: days[days.length - 1] ?? "" };
  });
  const thisYear = finished.filter((f) => f.finishedOn.startsWith(year)).length;
  const pct = Math.min(100, Math.round((thisYear / goal) * 100));

  // Distinct centuries the reader has finished a classic from (BC years count separately).
  const centuries = new Set(
    finished.map(({ book }) =>
      book.year < 0
        ? `bc${Math.ceil(Math.abs(book.year) / 100)}`
        : String(Math.ceil(book.year / 100)),
    ),
  ).size;

  const extra = [
    { ok: streak >= 7, name: "Week Streak", text: "Read 7 days in a row" },
    { ok: streak >= 30, name: "Month Streak", text: "Read 30 days in a row" },
    { ok: totalPages >= 1000, name: "1,000 Pages", text: "Read 1,000 pages in total" },
    {
      ok: centuries >= 4,
      name: "Across the Centuries",
      text: `Finished classics from 4 different centuries (${Math.min(centuries, 4)} of 4)`,
    },
  ];

  return (
    <section className="mt-10">
      <h2 className="font-serif text-xs uppercase tracking-[0.3em] text-accent">
        {year} reading goal
      </h2>
      <div className="mt-3 rounded-md border border-border bg-card p-4">
        <p className="font-serif text-2xl text-foreground">
          {thisYear} of {goal} books
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          Books this year
          <input
            type="number"
            min={1}
            value={goal}
            onChange={(e) => Number(e.target.value) > 0 && setGoal(Number(e.target.value))}
            className="w-20 rounded-full border border-border bg-background px-3 py-1 text-foreground"
          />
        </label>
      </div>

      <h2 className="mt-10 font-serif text-xs uppercase tracking-[0.3em] text-accent">Badges</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ...BADGES.map((b) => ({ ok: finished.length >= b.n, name: b.name, text: b.text })),
          ...extra,
        ].map((b) => (
          <div
            key={b.name}
            className={`rounded-md border p-3 ${b.ok ? "border-accent bg-card" : "border-border opacity-50"}`}
          >
            <Award className={`size-5 ${b.ok ? "text-accent" : "text-muted-foreground"}`} />
            <p className="mt-1 font-serif text-base text-foreground">{b.name}</p>
            <p className="text-xs text-muted-foreground">{b.text}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-serif text-xs uppercase tracking-[0.3em] text-accent">
        Finished books
      </h2>
      {finished.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Log every page of a book and it will appear here for you to rate and review. Your ratings
          shape future recommendations.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {finished.map(({ book }) => (
            <RateCard
              key={book.id}
              title={book.title}
              author={book.author}
              initial={ratings[book.id]}
              onSave={(s, r) => rate(book.id, s, r)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RateCard({
  title,
  author,
  initial,
  onSave,
}: {
  title: string;
  author: string;
  initial?: { stars: number; review: string } | undefined;
  onSave: (stars: number, review: string) => void;
}) {
  const [stars, setStars] = useState(initial?.stars ?? 0);
  const [review, setReview] = useState(initial?.review ?? "");
  const [saved, setSaved] = useState(false);
  return (
    <article className="rounded-md border border-border bg-card p-4">
      <h3 className="font-serif text-lg text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{author}</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`}>
            <Star
              className={`size-5 ${n <= stars ? "fill-accent text-accent" : "text-muted-foreground"}`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="What did you think?"
        rows={2}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
      />
      <button
        disabled={stars === 0}
        onClick={() => {
          onSave(stars, review.trim());
          setSaved(true);
        }}
        className="mt-2 rounded-full bg-accent px-4 py-1.5 text-xs uppercase tracking-widest text-accent-foreground disabled:opacity-50"
      >
        {saved ? "Saved" : "Save review"}
      </button>
    </article>
  );
}
