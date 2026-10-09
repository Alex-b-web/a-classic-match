import { useCallback, useEffect, useState } from "react";

export const RATINGS_KEY = "acm-ratings-v1";
export const GOAL_KEY = "acm-goal-v1";
const EVT = "acm-ratings-change";

export type Rating = { stars: number; review: string; date: string };
export type Ratings = Record<string, Rating>;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readRatings(): Ratings {
  return readJson<Ratings>(RATINGS_KEY, {});
}

export function useRatings() {
  const [ratings, setRatings] = useState<Ratings>({});
  const [goal, setGoalState] = useState(12);

  useEffect(() => {
    const sync = () => {
      setRatings(readRatings());
      setGoalState(readJson<number>(GOAL_KEY, 12));
    };
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const rate = useCallback((bookId: string, stars: number, review: string) => {
    const next = readRatings();
    next[bookId] = { stars, review, date: new Date().toISOString().slice(0, 10) };
    localStorage.setItem(RATINGS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  }, []);

  const setGoal = useCallback((n: number) => {
    localStorage.setItem(GOAL_KEY, JSON.stringify(Math.max(1, Math.round(n))));
    window.dispatchEvent(new Event(EVT));
  }, []);

  return { ratings, rate, goal, setGoal };
}
