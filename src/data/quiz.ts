import { BOOKS, type Book } from "./books";

export type Option = { label: string; hint?: string; tags: string[] };
export type Question = { id: string; prompt: string; options: Option[] };

export const QUESTIONS: Question[] = [
  {
    id: "lens",
    prompt: "What do you most like reading about?",
    options: [
      { label: "Big ideas and right vs. wrong", tags: ["philosophy", "dense"] },
      { label: "People, power and politics", tags: ["satire", "dystopia", "war"] },
      { label: "What goes on inside people's heads", tags: ["dark", "russian", "coming-of-age"] },
      { label: "The past and how people lived", tags: ["war", "epic", "19c"] },
    ],
  },
  {
    id: "period",
    prompt: "Which time period sounds most fun?",
    options: [
      { label: "Really old — Greeks and Romans", tags: ["ancient", "epic"] },
      { label: "A few hundred years ago", tags: ["early-modern", "gothic"] },
      { label: "The 1800s", tags: ["19c"] },
      { label: "The early 1900s", tags: ["20c"] },
    ],
  },
  {
    id: "tradition",
    prompt: "Where would you like the book to come from?",
    options: [
      { label: "Britain or Ireland", tags: ["british", "irish"] },
      { label: "Russia or Germany", tags: ["russian", "german"] },
      { label: "America", tags: ["american"] },
      { label: "Anywhere in the world", tags: ["japanese", "latin", "african", "french"] },
    ],
  },

  {
    id: "demand",
    prompt: "How hard do you want the reading to be?",
    options: [
      { label: "Easy to read", tags: ["brisk", "hopeful"] },
      { label: "A bit of a challenge", tags: ["medium", "quiet"] },
      { label: "Properly difficult", tags: ["dense", "philosophy"] },
      { label: "Strange and experimental", tags: ["dense", "20c"] },
    ],
  },
  {
    id: "style",
    prompt: "How do you like a book to be written?",
    options: [
      { label: "Short, plain sentences", tags: ["brisk", "short"] },
      { label: "Beautiful and moody", tags: ["gothic", "quiet", "french"] },
      { label: "Funny and clever", tags: ["satire", "british"] },
      { label: "Big and grand", tags: ["epic", "long"] },
    ],
  },
  {
    id: "question",
    prompt: "Which question interests you most?",
    options: [
      { label: "How should we live?", tags: ["philosophy", "tragedy"] },
      { label: "Who really holds the power?", tags: ["dystopia", "war", "satire"] },
      { label: "Who am I?", tags: ["coming-of-age", "women"] },
      { label: "What makes life worth it?", tags: ["philosophy", "quiet", "hopeful"] },
    ],
  },
  {
    id: "commitment",
    prompt: "How long a book do you want?",
    options: [
      { label: "Short — a quick read", tags: ["short", "brisk"] },
      { label: "Medium — a normal novel", tags: ["medium"] },
      { label: "Long — a proper doorstop", tags: ["long"] },
      { label: "Huge — something to live in", tags: ["long", "epic", "dense"] },
    ],
  },
  {
    id: "mood",
    prompt: "What mood are you after?",
    options: [
      { label: "Dark and sad", tags: ["dark", "tragedy"] },
      { label: "Calm and thoughtful", tags: ["quiet", "women"] },
      { label: "Funny and sharp", tags: ["satire", "brisk"] },
      { label: "Warm and hopeful", tags: ["hopeful", "romance"] },
    ],
  },
  {
    id: "form",
    prompt: "What kind of book do you fancy?",
    options: [
      { label: "A big novel", tags: ["epic", "long"] },
      { label: "A play or poetry", tags: ["tragedy", "ancient", "brisk"] },
      { label: "Short stories", tags: ["short", "quiet"] },
      { label: "A mystery or adventure", tags: ["mystery", "adventure"] },
    ],
  },
];



/** Free tier: the first six questions and a smaller slice of the library. */
export const FREE_QUESTION_COUNT = 6;
export const FREE_LIBRARY_SIZE = 70;

export function questionsFor(isPro: boolean): Question[] {
  return isPro ? QUESTIONS : QUESTIONS.slice(0, FREE_QUESTION_COUNT);
}

export function libraryFor(isPro: boolean): Book[] {
  return isPro ? BOOKS : BOOKS.slice(0, FREE_LIBRARY_SIZE);
}

export type Match = { book: Book; match: number };

export function recommend(answers: Record<string, number>, isPro = true): Match[] {
  const questions = questionsFor(isPro);
  const pool = libraryFor(isPro);
  const chosen: string[] = [];
  for (const q of questions) {
    const i = answers[q.id];
    const opt = i === undefined ? undefined : q.options[i];
    if (opt) chosen.push(...opt.tags);
  }
  const weight = new Map<string, number>();
  chosen.forEach((t, i) => weight.set(t, (weight.get(t) ?? 0) + (i < 3 ? 3 : 2)));

  const scored = [...pool]
    .map((b, idx) => {
      let score = 0;
      for (const t of b.tags) score += weight.get(t) ?? 0;
      score /= Math.sqrt(b.tags.length || 1);
      return { b, score, tie: score + (pool.length - idx) * 0.001 };
    })
    .sort((x, y) => y.tie - x.tie)
    .slice(0, 10);

  const top = scored[0]?.score ?? 0;
  return scored.map((x) => ({
    book: x.b,
    // Relative fit: the strongest match sits near the top of the scale,
    // the rest scale down proportionally but stay readable.
    match: top > 0 ? Math.round(58 + (x.score / top) * 40) : 60,
  }));
}


