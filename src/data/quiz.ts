import { BOOKS, type Book } from "./books";

export type Option = { label: string; hint?: string; tags: string[] };
export type Question = { id: string; prompt: string; options: Option[] };

export const QUESTIONS: Question[] = [
  {
    id: "lens",
    prompt: "Which academic lens interests you most?",
    options: [
      { label: "Philosophy & ethics", tags: ["philosophy", "dense"] },
      { label: "Society & politics", tags: ["satire", "dystopia", "war"] },
      { label: "Psychology & character", tags: ["dark", "russian", "coming-of-age"] },
      { label: "History & culture", tags: ["war", "epic", "19c"] },
    ],
  },
  {
    id: "period",
    prompt: "Which literary period draws you in?",
    options: [
      { label: "Ancient & classical", tags: ["ancient", "epic"] },
      { label: "Early modern", tags: ["early-modern", "gothic"] },
      { label: "19th century", tags: ["19c"] },
      { label: "Early 20th century", tags: ["20c"] },
    ],
  },
  {
    id: "tradition",
    prompt: "Which literary tradition appeals to you?",
    options: [
      { label: "British & Irish", tags: ["british", "irish"] },
      { label: "Russian & German", tags: ["russian", "german"] },
      { label: "American", tags: ["american"] },
      { label: "World literature", tags: ["japanese", "latin", "african", "french"] },
    ],
  },

  {
    id: "demand",
    prompt: "How demanding should the reading be?",
    options: [
      { label: "Clear and approachable", tags: ["brisk", "hopeful"] },
      { label: "Thoughtful, with some complexity", tags: ["medium", "quiet"] },
      { label: "Dense and intellectually rigorous", tags: ["dense", "philosophy"] },
      { label: "Formally challenging", tags: ["dense", "20c"] },
    ],
  },
  {
    id: "style",
    prompt: "Which writing style do you prefer?",
    options: [
      { label: "Direct and economical", tags: ["brisk", "short"] },
      { label: "Lyrical and atmospheric", tags: ["gothic", "quiet", "french"] },
      { label: "Witty and satirical", tags: ["satire", "british"] },
      { label: "Expansive and epic", tags: ["epic", "long"] },
    ],
  },
  {
    id: "question",
    prompt: "Which central question feels most compelling?",
    options: [
      { label: "What makes a life moral?", tags: ["philosophy", "tragedy"] },
      { label: "How does power shape society?", tags: ["dystopia", "war", "satire"] },
      { label: "How do we form an identity?", tags: ["coming-of-age", "women"] },
      { label: "How do we create meaning?", tags: ["philosophy", "quiet", "hopeful"] },
    ],
  },
  {
    id: "commitment",
    prompt: "What kind of reading commitment suits you?",
    options: [
      { label: "A focused, shorter work", tags: ["short", "brisk"] },
      { label: "A steady mid-length book", tags: ["medium"] },
      { label: "A substantial long-form read", tags: ["long"] },
      { label: "A deep, immersive project", tags: ["long", "epic", "dense"] },
    ],
  },
  {
    id: "mood",
    prompt: "What emotional register do you want?",
    options: [
      { label: "Bleak and unflinching", tags: ["dark", "tragedy"] },
      { label: "Quiet and introspective", tags: ["quiet", "women"] },
      { label: "Sharp and comic", tags: ["satire", "brisk"] },
      { label: "Warm and redemptive", tags: ["hopeful", "romance"] },
    ],
  },
  {
    id: "form",
    prompt: "Which form would you rather read?",
    options: [
      { label: "A sweeping novel", tags: ["epic", "long"] },
      { label: "Drama or poetry", tags: ["tragedy", "ancient", "brisk"] },
      { label: "Stories or short fiction", tags: ["short", "quiet"] },
      { label: "Mystery or adventure", tags: ["mystery", "adventure"] },
    ],
  },
];


/** Free tier: the first six questions and a smaller slice of the library. */
export const FREE_QUESTION_COUNT = 6;
export const FREE_LIBRARY_SIZE = 40;

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


