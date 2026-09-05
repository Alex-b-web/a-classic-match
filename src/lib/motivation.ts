/** Encouragement drawn from a reader's progress. */

export function streakLine(streak: number, pagesToday: number): string {
  if (streak === 0 && pagesToday === 0)
    return "A single page today begins the habit. Open a book and log it.";
  if (pagesToday > 0 && streak <= 1) return "Day one is the hardest — and it is already done.";
  if (streak < 4) return `${streak} days running. Keep the thread unbroken.`;
  if (streak < 8) return `${streak} days in a row — reading has become part of your week.`;
  if (streak < 21) return `${streak} straight days. This is no longer an effort, it is a habit.`;
  return `${streak} days without a break. You read like someone who finishes books.`;
}

export function bookLine(read: number, pages: number): string {
  const pct = pages > 0 ? Math.min(100, Math.round((read / pages) * 100)) : 0;
  const left = Math.max(0, pages - read);
  if (read === 0) return "Not started. The first ten pages are all it takes.";
  if (pct >= 100) return "Finished. Take a moment with it before the next one.";
  if (pct >= 90) return `${left} pages from the end — you can finish this today.`;
  if (pct >= 50) return `Past halfway, ${left} pages to go. The hard part is behind you.`;
  if (pct >= 20) return `${pct}% read. You are properly into it now.`;
  return `${pct}% read — keep going, the book is opening up.`;
}

export function paceLine(pagesThisWeek: number, dailyGoal: number): string {
  const goal = dailyGoal * 7;
  if (pagesThisWeek === 0) return `Aim for ${dailyGoal} pages today to get started.`;
  if (pagesThisWeek >= goal)
    return `${pagesThisWeek} pages this week — ahead of your ${dailyGoal}-a-day pace.`;
  const short = goal - pagesThisWeek;
  return `${pagesThisWeek} pages this week, ${short} short of your ${dailyGoal}-a-day pace. Easily caught up.`;
}
