import { useCallback, useEffect, useState } from "react";

const KEY = "acm-reading-log-v1";
const EVT = "acm-reading-log-change";

/** pages read per book per day: { bookId: { "2026-09-05": 42 } } */
export type ReadingLog = Record<string, Record<string, number>>;

export function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function dayKey(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function read(): ReadingLog {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ReadingLog) : {};
  } catch {
    return {};
  }
}

function write(log: ReadingLog) {
  try {
    localStorage.setItem(KEY, JSON.stringify(log));
  } catch {
    /* ignore storage failures */
  }
  window.dispatchEvent(new Event(EVT));
}

export function useReadingLog() {
  const [log, setLog] = useState<ReadingLog>({});

  useEffect(() => {
    setLog(read());
    const sync = () => setLog(read());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  /** add pages to a book for a given day (defaults to today) */
  const addPages = useCallback((bookId: string, pages: number, date = today()) => {
    if (!Number.isFinite(pages) || pages === 0) return;
    const next = read();
    const forBook = { ...(next[bookId] ?? {}) };
    forBook[date] = Math.max(0, (forBook[date] ?? 0) + pages);
    next[bookId] = forBook;
    write(next);
  }, []);

  const setPages = useCallback((bookId: string, pages: number, date = today()) => {
    const next = read();
    const forBook = { ...(next[bookId] ?? {}) };
    if (pages <= 0) delete forBook[date];
    else forBook[date] = pages;
    next[bookId] = forBook;
    write(next);
  }, []);

  const clearBook = useCallback((bookId: string) => {
    const next = read();
    delete next[bookId];
    write(next);
  }, []);

  const totalFor = (bookId: string) =>
    Object.values(log[bookId] ?? {}).reduce((n, p) => n + p, 0);

  const pagesOn = (bookId: string, date: string) => log[bookId]?.[date] ?? 0;

  const pagesOnDay = (date: string) =>
    Object.values(log).reduce((n, days) => n + (days[date] ?? 0), 0);

  const totalPages = Object.values(log).reduce(
    (n, days) => n + Object.values(days).reduce((m, p) => m + p, 0),
    0,
  );

  /** consecutive days with pages logged, counting back from today (or yesterday) */
  const streak = (() => {
    let start = 0;
    if (pagesOnDay(dayKey(0)) === 0) {
      if (pagesOnDay(dayKey(1)) === 0) return 0;
      start = 1;
    }
    let count = 0;
    for (let i = start; i < 400; i++) {
      if (pagesOnDay(dayKey(i)) > 0) count++;
      else break;
    }
    return count;
  })();

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = dayKey(6 - i);
    return { date, pages: pagesOnDay(date) };
  });

  return {
    log,
    addPages,
    setPages,
    clearBook,
    totalFor,
    pagesOn,
    pagesOnDay,
    totalPages,
    streak,
    last7,
  };
}
