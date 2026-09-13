import { supabase } from "@/integrations/supabase/client";

/** localStorage keys that make up a reader's account data. */
export const SHELF_KEY = "canon-shelf-v1";
export const LOG_KEY = "acm-reading-log-v1";
export const ANSWERS_KEY_SYNC = "acm-answers-v1";
export const PLAN_KEY = "acm-plan-v1";

export type ReaderState = {
  shelf?: string[];
  log?: Record<string, Record<string, number>>;
  answers?: Record<string, number>;
  plan?: { picked: string[]; pace: number };
};

function readJson<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore storage failures */
  }
}

export function localState(): ReaderState {
  const state: ReaderState = {};
  const shelf = readJson<string[]>(SHELF_KEY);
  const log = readJson<ReaderState["log"]>(LOG_KEY);
  const answers = readJson<Record<string, number>>(ANSWERS_KEY_SYNC);
  const plan = readJson<ReaderState["plan"]>(PLAN_KEY);
  if (shelf) state.shelf = shelf;
  if (log) state.log = log;
  if (answers) state.answers = answers;
  if (plan) state.plan = plan;
  return state;
}

/** Union of saved books, highest page count per book per day, newest answers/plan win. */
export function merge(remote: ReaderState, local: ReaderState): ReaderState {
  const shelf = Array.from(new Set([...(remote.shelf ?? []), ...(local.shelf ?? [])]));

  const log: NonNullable<ReaderState["log"]> = {};
  for (const source of [remote.log ?? {}, local.log ?? {}]) {
    for (const [bookId, days] of Object.entries(source)) {
      const target = (log[bookId] ??= {});
      for (const [date, pages] of Object.entries(days)) {
        target[date] = Math.max(target[date] ?? 0, pages);
      }
    }
  }

  const merged: ReaderState = { shelf, log };
  const answers = local.answers ?? remote.answers;
  const plan = local.plan ?? remote.plan;
  if (answers) merged.answers = answers;
  if (plan) merged.plan = plan;
  return merged;
}

function applyLocally(state: ReaderState) {
  writeJson(SHELF_KEY, state.shelf ?? []);
  writeJson(LOG_KEY, state.log ?? {});
  if (state.answers) writeJson(ANSWERS_KEY_SYNC, state.answers);
  if (state.plan) writeJson(PLAN_KEY, state.plan);
  window.dispatchEvent(new Event("canon-shelf-change"));
  window.dispatchEvent(new Event("acm-reading-log-change"));
  window.dispatchEvent(new Event("acm-plan-change"));
}

async function push(userId: string, state: ReaderState) {
  await supabase.from("reader_state").upsert(
    { user_id: userId, data: state as never, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
}

/**
 * Pulls the account's saved data, merges anything already in this browser,
 * then keeps pushing local changes while the reader stays signed in.
 * Returns a cleanup function.
 */
export async function startSync(userId: string): Promise<() => void> {
  const { data } = await supabase
    .from("reader_state")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  const remote = (data?.data ?? {}) as ReaderState;
  const merged = merge(remote, localState());
  applyLocally(merged);
  await push(userId, merged);

  let last = JSON.stringify(merged);
  const timer = window.setInterval(() => {
    const snapshot = JSON.stringify(localState());
    if (snapshot === last) return;
    last = snapshot;
    void push(userId, localState());
  }, 2000);

  return () => window.clearInterval(timer);
}
