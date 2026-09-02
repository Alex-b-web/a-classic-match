import { useState } from "react";
import { Bookmark, BookmarkCheck, ShoppingCart } from "lucide-react";
import { coverUrl, type Book } from "@/data/books";
import { amazonUrlFor } from "@/lib/amazon";
import { useStore } from "@/hooks/use-store";

export function Cover({ book, className = "" }: { book: Book; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`relative overflow-hidden rounded-sm bg-secondary shadow-[var(--shadow-book)] ${className}`}
    >
      {failed ? (
        <div className="flex h-full w-full flex-col justify-between border border-border/60 bg-secondary p-3">
          <span className="font-serif text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {book.year < 0 ? `${Math.abs(book.year)} BC` : book.year}
          </span>
          <span className="font-serif text-base leading-tight text-foreground">{book.title}</span>
          <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            {book.author}
          </span>
        </div>
      ) : (
        <img
          src={coverUrl(book)}
          alt={`Front cover of ${book.title} by ${book.author}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export function BookCard({
  book,
  rank,
  match,
  saved,
  onToggle,
}: {
  book: Book;
  rank?: number;
  match?: number;
  saved: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="flex gap-4 border-b border-border/60 py-5">
      <Cover book={book} className="h-36 w-24 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          {rank !== undefined && (
            <span className="font-serif text-xs tracking-[0.25em] text-accent">
              {String(rank).padStart(2, "0")}
            </span>
          )}
          {match !== undefined && (
            <span className="shrink-0 rounded-full border border-gilt/60 px-2.5 py-0.5 font-serif text-xs tracking-widest text-accent">
              {match}% match
            </span>
          )}
        </div>
        <h3 className="font-serif text-xl leading-tight text-foreground">{book.title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{book.author}</p>
        <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
          {book.year < 0 ? `c. ${Math.abs(book.year)} BC` : book.year} · {book.pages} pages
        </p>

        <p className="mt-2 font-serif text-sm italic leading-snug text-foreground/80">
          {book.blurb}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={onToggle}
            aria-pressed={saved}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs tracking-wide transition-colors ${
              saved
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-foreground hover:bg-secondary"
            }`}
          >
            {saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
            {saved ? "On your list" : "Add to list"}
          </button>
          <a
            href={amazonUrl(book)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ShoppingCart className="size-3.5" />
            Buy
          </a>
        </div>
      </div>
    </article>
  );
}
