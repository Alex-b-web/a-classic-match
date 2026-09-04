/** Plain-English names for the tags used to match books to answers. */
export const TAG_LABELS: Record<string, string> = {
  philosophy: "ideas and philosophy",
  satire: "satire and wit",
  dystopia: "power and dystopia",
  war: "war and history",
  dark: "dark and tragic",
  tragedy: "tragedy",
  russian: "Russian writing",
  german: "German writing",
  french: "French writing",
  british: "British writing",
  irish: "Irish writing",
  american: "American writing",
  japanese: "Japanese writing",
  latin: "Latin American writing",
  african: "African writing",
  "coming-of-age": "growing up",
  epic: "sweeping scope",
  ancient: "the ancient world",
  "early-modern": "the early modern age",
  gothic: "gothic atmosphere",
  "19c": "the nineteenth century",
  "20c": "the twentieth century",
  dense: "demanding prose",
  brisk: "an easy pace",
  medium: "a mid-length read",
  short: "a short read",
  long: "a long read",
  quiet: "a reflective mood",
  hopeful: "a warm, hopeful mood",
  romance: "romance",
  women: "women's lives",
  mystery: "mystery",
  adventure: "adventure",
};

export function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag.replace(/-/g, " ");
}

/** The reasons this book fits: the reader's chosen tags that the book shares. */
export function reasonsFor(bookTags: string[], chosen: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of chosen) {
    if (!bookTags.includes(t) || seen.has(t)) continue;
    seen.add(t);
    out.push(tagLabel(t));
    if (out.length === 3) break;
  }
  return out;
}
