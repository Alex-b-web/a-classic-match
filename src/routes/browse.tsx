import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { BOOKS } from "@/data/books";
import { libraryFor } from "@/data/quiz";
import { BookCard } from "@/components/BookCard";
import { useShelf } from "@/hooks/use-shelf";
import { PRO_PRICE, useTier } from "@/hooks/use-tier";


export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse the Classics — A Classic Match" },
      {
        name: "description",
        content:
          "Search every classic in the library by title, author, era or theme — with covers, page counts and a buy link.",
      },
      { property: "og:title", content: "Browse the Classics — A Classic Match" },
      {
        property: "og:description",
        content: "Search the full library of classic novels by title, author or theme.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrowsePage,
});

type SortKey = "title" | "author" | "year" | "pages";

function BrowsePage() {
  const { toggle, has } = useShelf();
  const { isPro } = useTier();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("title");

  const library = useMemo(() => libraryFor(isPro), [isPro]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? library.filter((b) =>
          [b.title, b.author, String(b.year), ...b.tags].join(" ").toLowerCase().includes(q),
        )
      : library;
    return [...filtered].sort((a, b) => {
      if (sort === "year") return a.year - b.year;
      if (sort === "pages") return a.pages - b.pages;
      if (sort === "author") return a.author.localeCompare(b.author);
      return a.title.localeCompare(b.title);
    });
  }, [query, sort, library]);


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

      <h1 className="mt-8 font-serif text-3xl text-foreground">The library</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every classic we match on — search by title, author, year or theme.
      </p>

      {!isPro && (
        <p className="mt-4 text-sm text-muted-foreground">
          You’re browsing the free shelf of {library.length} classics.
        </p>
      )}


      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-2.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classics…"
            aria-label="Search classic books"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort books"
          className="rounded-full border border-border bg-secondary/60 px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground"
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="year">Year</option>
          <option value="pages">Pages</option>
        </select>
      </div>

      <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
        {results.length} {results.length === 1 ? "book" : "books"}
      </p>

      <div className="mt-2">
        {results.map((b) => (
          <BookCard key={b.id} book={b} saved={has(b.id)} onToggle={() => toggle(b.id)} />
        ))}
      </div>

      {results.length === 0 && (
        <p className="mt-8 font-serif text-lg italic text-muted-foreground">
          Nothing matches “{query}”.
        </p>
      )}
    </main>
  );
}
