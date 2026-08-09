import type { ScriptPayload } from "./prompt";

const CACHE_PREFIX = "speech-day:";
const HISTORY_KEY = "speech-history";

export type DayCache = {
  date: string;
  current: ScriptPayload;
  history: ScriptPayload[];
};

function keyForDate(date: string): string {
  return `${CACHE_PREFIX}${date}`;
}

export function loadDayCache(date: string): DayCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(keyForDate(date));
    if (!raw) return null;
    return JSON.parse(raw) as DayCache;
  } catch {
    return null;
  }
}

export function saveDayCache(cache: DayCache): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyForDate(cache.date), JSON.stringify(cache));
  pushHistory(cache.current, cache.date);
}

function pushHistory(script: ScriptPayload, date: string): void {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list: Array<ScriptPayload & { date: string }> = raw
      ? (JSON.parse(raw) as Array<ScriptPayload & { date: string }>)
      : [];
    const next = [{ ...script, date }, ...list.filter((x) => x.date !== date || x.topic !== script.topic)];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 14)));
  } catch {
    // ignore quota / parse errors
  }
}

export function loadRecentHistory(): Array<ScriptPayload & { date: string }> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Array<ScriptPayload & { date: string }>;
  } catch {
    return [];
  }
}
