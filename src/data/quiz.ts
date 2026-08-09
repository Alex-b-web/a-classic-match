import { BOOKS, type Book } from "./books";

export type Option = { label: string; hint?: string; tags: string[] };
export type Question = { id: string; prompt: string; options: Option[] };

export const QUESTIONS: Question[] = [
  {
    id: "mood",
    prompt: "What should the book do to you?",
    options: [
      { label: "Break my heart", tags: ["tragedy", "dark", "romance"] },
      { label: "Sweep me somewhere else", tags: ["adventure", "epic"] },
      { label: "Make me think for weeks", tags: ["philosophy", "dense"] },
      { label: "Keep me warm", tags: ["hopeful", "quiet", "coming-of-age"] },
    ],
  },
  {
    id: "era",
    prompt: "Which century do you want to wander into?",
    options: [
      { label: "Antiquity & the Golden Age", tags: ["ancient"] },
      { label: "The 1800s", tags: ["19c"] },
      { label: "The early 1900s", tags: ["20c"] },
      { label: "Surprise me", tags: [] },
    ],
  },
  {
    id: "length",
    prompt: "How long is your patience?",
    options: [
      { label: "Under 300 pages", tags: ["short", "brisk"] },
      { label: "A comfortable few hundred", tags: ["medium"] },
      { label: "Give me a doorstop", tags: ["long", "epic"] },
      { label: "Length is irrelevant", tags: [] },
    ],
  },
  {
    id: "place",
    prompt: "Where would you like to be reading from?",
    options: [
      { label: "A draughty English house", tags: ["british", "gothic"] },
      { label: "A Russian winter", tags: ["russian"] },
      { label: "A Paris garret", tags: ["french"] },
      { label: "An American road", tags: ["american"] },
    ],
  },
  {
    id: "engine",
    prompt: "What keeps you turning pages?",
    options: [
      { label: "A secret to uncover", tags: ["mystery"] },
      { label: "A love that shouldn't work", tags: ["romance"] },
      { label: "Society getting skewered", tags: ["satire"] },
      { label: "History pressing down", tags: ["war", "dystopia"] },
    ],
  },
  {
    id: "voice",
    prompt: "Pick a narrator you'd trust.",
    options: [
      { label: "A young person becoming someone", tags: ["coming-of-age"] },
      { label: "A woman writing against her age", tags: ["women"] },
      { label: "A restless soul chasing something", tags: ["adventure", "dark"] },
      { label: "A quiet observer of ordinary days", tags: ["quiet", "hopeful"] },
    ],
  },
];

export function recommend(answers: Record<string, number>): Book[] {
  const chosen: string[] = [];
  for (const q of QUESTIONS) {
    const i = answers[q.id];
    if (i !== undefined) chosen.push(...q.options[i].tags);
  }
  const weight = new Map<string, number>();
  chosen.forEach((t, i) => weight.set(t, (weight.get(t) ?? 0) + (i < 3 ? 3 : 2)));

  return [...BOOKS]
    .map((b, idx) => {
      let score = 0;
      for (const t of b.tags) score += weight.get(t) ?? 0;
      return { b, score: score + (BOOKS.length - idx) * 0.01 };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, 10)
    .map((x) => x.b);
}
