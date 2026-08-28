import { BOOKS, type Book } from "./books";

export type Option = { label: string; hint?: string; tags: string[] };
export type Question = { id: string; prompt: string; options: Option[] };

export const QUESTIONS: Question[] = [
  {
    id: "lens",
    prompt: "Which subject draws you in most?",
    options: [
      { label: "Philosophy and questions of right and wrong", tags: ["philosophy", "dense"] },
      { label: "Society, power and politics", tags: ["satire", "dystopia", "war"] },
      { label: "The inner life of characters", tags: ["dark", "russian", "coming-of-age"] },
      { label: "History and how people once lived", tags: ["war", "epic", "19c"] },
    ],
  },
  {
    id: "period",
    prompt: "Which era would you like to visit?",
    options: [
      { label: "The ancient world — Greece and Rome", tags: ["ancient", "epic"] },
      { label: "A few centuries back", tags: ["early-modern", "gothic"] },
      { label: "The nineteenth century", tags: ["19c"] },
      { label: "The early twentieth century", tags: ["20c"] },
    ],
  },
  {
    id: "tradition",
    prompt: "Which literary tradition appeals to you?",
    options: [
      { label: "Britain and Ireland", tags: ["british", "irish"] },
      { label: "Russia and Germany", tags: ["russian", "german"] },
      { label: "America", tags: ["american"] },
      { label: "Somewhere further afield", tags: ["japanese", "latin", "african", "french"] },
    ],
  },

  {
    id: "demand",
    prompt: "How demanding should the reading be?",
    options: [
      { label: "Clear and easy to follow", tags: ["brisk", "hopeful"] },
      { label: "Thoughtful, with a little complexity", tags: ["medium", "quiet"] },
      { label: "Genuinely difficult", tags: ["dense", "philosophy"] },
      { label: "Strange and experimental", tags: ["dense", "20c"] },
    ],
  },
  {
    id: "style",
    prompt: "Which style of writing suits you?",
    options: [
      { label: "Plain and to the point", tags: ["brisk", "short"] },
      { label: "Lyrical and atmospheric", tags: ["gothic", "quiet", "french"] },
      { label: "Witty and sharp", tags: ["satire", "british"] },
      { label: "Grand and sweeping", tags: ["epic", "long"] },
    ],
  },
  {
    id: "question",
    prompt: "Which question interests you most?",
    options: [
      { label: "How should a person live?", tags: ["philosophy", "tragedy"] },
      { label: "Who really holds the power?", tags: ["dystopia", "war", "satire"] },
      { label: "How do we become who we are?", tags: ["coming-of-age", "women"] },
      { label: "What gives life meaning?", tags: ["philosophy", "quiet", "hopeful"] },
    ],
  },
  {
    id: "commitment",
    prompt: "How much of a commitment do you want?",
    options: [
      { label: "Short — read in a sitting or two", tags: ["short", "brisk"] },
      { label: "Mid-length — a normal novel", tags: ["medium"] },
      { label: "Long — a proper doorstop", tags: ["long"] },
      { label: "Vast — a book to live in", tags: ["long", "epic", "dense"] },
    ],
  },
  {
    id: "mood",
    prompt: "What mood are you after?",
    options: [
      { label: "Dark and tragic", tags: ["dark", "tragedy"] },
      { label: "Calm and reflective", tags: ["quiet", "women"] },
      { label: "Funny and biting", tags: ["satire", "brisk"] },
      { label: "Warm and hopeful", tags: ["hopeful", "romance"] },
    ],
  },
  {
    id: "form",
    prompt: "Which form appeals to you?",
    options: [
      { label: "A full-length novel", tags: ["epic", "long"] },
      { label: "A play or poetry", tags: ["tragedy", "ancient", "brisk"] },
      { label: "Short stories", tags: ["short", "quiet"] },
      { label: "A mystery or adventure", tags: ["mystery", "adventure"] },
    ],
  },
];



/**
 * The free quiz is its own six broad questions; the pro quiz (above) asks nine
 * finer-grained ones. They are separate sets, not one sliced from the other.
 */
export const FREE_QUESTIONS: Question[] = [
  {
    id: "lens",
    prompt: "What pulls you into a book?",
    options: [
      { label: "Big ideas about how to live", tags: ["philosophy", "dense"] },
      { label: "Society, power and politics", tags: ["satire", "dystopia", "war"] },
      { label: "Characters and their inner lives", tags: ["dark", "russian", "coming-of-age"] },
      { label: "History and unfamiliar worlds", tags: ["war", "epic", "19c"] },
    ],
  },
  {
    id: "period",
    prompt: "How far back would you like to go?",
    options: [
      { label: "The ancient world", tags: ["ancient", "epic"] },
      { label: "A few centuries back", tags: ["early-modern", "gothic"] },
      { label: "The nineteenth century", tags: ["19c"] },
      { label: "Closer to modern times", tags: ["20c"] },
    ],
  },
  {
    id: "mood",
    prompt: "What mood are you after?",
    options: [
      { label: "Dark and tragic", tags: ["dark", "tragedy"] },
      { label: "Calm and reflective", tags: ["quiet", "women"] },
      { label: "Funny and biting", tags: ["satire", "brisk"] },
      { label: "Warm and hopeful", tags: ["hopeful", "romance"] },
    ],
  },
  {
    id: "demand",
    prompt: "How demanding should the reading be?",
    options: [
      { label: "Clear and easy to follow", tags: ["brisk", "hopeful"] },
      { label: "Thoughtful, with a little complexity", tags: ["medium", "quiet"] },
      { label: "Genuinely difficult", tags: ["dense", "philosophy"] },
      { label: "Strange and experimental", tags: ["dense", "20c"] },
    ],
  },
  {
    id: "commitment",
    prompt: "How much of a commitment do you want?",
    options: [
      { label: "Short — read in a sitting or two", tags: ["short", "brisk"] },
      { label: "Mid-length — a normal novel", tags: ["medium"] },
      { label: "Long — a proper doorstop", tags: ["long"] },
      { label: "Vast — a book to live in", tags: ["long", "epic", "dense"] },
    ],
  },
  {
    id: "form",
    prompt: "Which form appeals to you?",
    options: [
      { label: "A full-length novel", tags: ["epic", "long"] },
      { label: "A play or poetry", tags: ["tragedy", "ancient", "brisk"] },
      { label: "Short stories", tags: ["short", "quiet"] },
      { label: "A mystery or adventure", tags: ["mystery", "adventure"] },
    ],
  },
];

export const FREE_QUESTION_COUNT = FREE_QUESTIONS.length;
export const FREE_LIBRARY_SIZE = 70;

export function questionsFor(isPro: boolean): Question[] {
  return isPro ? QUESTIONS : FREE_QUESTIONS;
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


