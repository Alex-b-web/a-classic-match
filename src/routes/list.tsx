import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { BOOKS } from "@/data/books";
import { BookCard } from "@/components/BookCard";
import { useShelf } from "@/hooks/use-shelf";

export const Route = createFileRoute("/list")({
  head: () => ({
    meta: [
      { title: "My Reading List — A Classic Match" },
      {
        name: "description",
        content: "The classics you saved, with page counts, authors and a buy link for each.",
      },
      { property: "og:title", content: "My Reading List — A Classic Match" },
      { property: "og:description", content: "The classics you saved, ready to buy." },
    ],
  }),
  component: ListPage,
});

function ListPage() {
  const { ids, toggle, has } = useShelf();
  const saved = ids
    .map((id) => BOOKS.find((b) => b.id === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 pb-20 pt-8">
      <header className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-serif text-sm uppercase tracking-[0.3em] text-muted-foreground">
          <img
            src={logoAsset.url}
            alt="A Classic Match"
            className="size-6"
            loading="eager"
          />
          A Classic Match
        </Link>
      </header>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="size-4" /> Back to the quiz
      </Link>
      <h1 className="mt-8 font-serif text-3xl text-foreground">My reading list</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {saved.length === 0
          ? "Nothing saved yet."
          : `${saved.length} ${saved.length === 1 ? "book" : "books"} · ${saved.reduce(
              (n, b) => n + b.pages,
              0,
            )} pages ahead of you.`}
      </p>
      <div className="mt-6">
        {saved.map((b) => (
          <BookCard key={b.id} book={b} saved={has(b.id)} onToggle={() => toggle(b.id)} />
        ))}
      </div>
      {saved.length === 0 && (
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-xs uppercase tracking-[0.2em] text-accent-foreground"
        >
          Take the quiz
        </Link>
      )}
    </main>
  );
}
