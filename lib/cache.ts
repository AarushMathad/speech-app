import type { ScriptPayload } from "./prompt";

const CACHE_PREFIX = "speech-day:";
const HISTORY_KEY = "speech-history";
const MAX_RECENT = 3;

export type DayCache = {
  date: string;
  current: ScriptPayload;
  history: ScriptPayload[];
};

export type RecentScript = ScriptPayload & { date: string };

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
    const list: RecentScript[] = raw ? (JSON.parse(raw) as RecentScript[]) : [];
    const next = [
      { ...script, date },
      ...list.filter((x) => x.date !== date || x.topic !== script.topic),
    ].slice(0, MAX_RECENT);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / parse errors
  }
}

export function loadRecentHistory(): RecentScript[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as RecentScript[];
    const trimmed = list.slice(0, MAX_RECENT);
    if (trimmed.length !== list.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    }
    return trimmed;
  } catch {
    return [];
  }
}
