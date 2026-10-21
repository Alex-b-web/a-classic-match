import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { InfoPage, meta } from "@/components/InfoPage";

export const Route = createFileRoute("/about")({
  head: () =>
    meta(
      "About",
      "How a student who fell for To Kill a Mockingbird built A Classic Match to find the next classic that fits.",
    ),
  component: AboutPage,
});

function AboutPage() {
  return (
    <InfoPage title="About A Classic Match">
      <p className="font-serif text-xs uppercase tracking-[0.35em] text-accent">
        It started with one book
      </p>
      <figure className="!mt-6 max-w-xs">
        <img
          src="/alex.jpg"
          alt="Alex, founder of A Classic Match, standing in front of shelves of classic books"
          width={900}
          height={1200}
          loading="eager"
          className="aspect-[3/4] w-full rounded-sm object-cover shadow-[var(--shadow-book)]"
        />
        <figcaption className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
          Alex, founder
        </figcaption>
      </figure>
      <p className="font-serif text-2xl leading-snug text-foreground">Hi, I&rsquo;m Alex.</p>
      <p>
        A while ago I was in exam preparation, and like a lot of students, I wanted to start reading
        the classics properly. The problem was knowing where to begin. There are hundreds of
        &ldquo;books you must read,&rdquo; and picking the wrong one can put you off reading
        altogether.
      </p>
      <p className="font-serif text-xl italic leading-snug text-foreground">
        Then I read To Kill a Mockingbird.
      </p>
      <p>
        I loved it. I couldn&rsquo;t put it down, and when I finished, I immediately wanted another
        book that would make me feel the same way. But when I went looking, all I found were generic
        &ldquo;Top 100 Classics&rdquo; lists. None of them told me which classic would suit me.
      </p>
      <p>That&rsquo;s when the idea for A Classic Match was born.</p>
      <p>
        I wanted to build the thing I was searching for: a simple way to find classics that fit your
        own taste, mood and reading style. You answer nine quick questions, and you get ten classic
        novels chosen for you, with everything you need to decide what to read next.
      </p>
      <p>
        But finding the right book is only half of it. The other half is actually reading it. So I
        added tools to help build the habit: a reading plan, a list to save your matches, and a
        reading record where you can log your pages each day and keep your streak going.
        They&rsquo;re the same tools that helped me stay on track.
      </p>
      <p>
        My hope is simple: that A Classic Match helps you find a book you love as much as I loved my
        first one, and then the next one, and the one after that.
      </p>
      <div className="h-px w-24 bg-gilt" />
      <p>Happy reading,</p>
      <p className="font-serif text-3xl italic text-foreground">Alex</p>
      <Link
        to="/"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90"
      >
        Take the quiz <ArrowRight className="size-4" />
      </Link>
    </InfoPage>
  );
}
