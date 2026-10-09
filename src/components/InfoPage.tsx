import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 pb-12 pt-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="size-4" /> A Classic Match
      </Link>
      <h1 className="mt-8 font-serif text-3xl text-foreground">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </main>
  );
}

export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} — A Classic Match` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — A Classic Match` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
