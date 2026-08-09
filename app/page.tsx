"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadRecentHistory,
  saveDayCache,
  type DayCache,
  type RecentScript,
} from "@/lib/cache";
import type { ScriptPayload } from "@/lib/prompt";
import { todayDateString } from "@/lib/topics";

const CATEGORY_LABEL: Record<string, string> = {
  educational: "fintech · ai · ml",
  reflective: "mind · relationships",
  hobbies: "hobbies · culture",
  custom: "custom topic",
};

async function fetchScript(params: {
  date: string;
  excludeTopics: string[];
  attempt: number;
  customTopic?: string;
}): Promise<ScriptPayload> {
  const res = await fetch("/api/script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: params.date,
      excludeTopics: params.excludeTopics,
      forceNew: params.attempt > 0,
      attempt: params.attempt,
      customTopic: params.customTopic,
    }),
  });

  const data = (await res.json()) as ScriptPayload & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || "failed to generate script");
  }
  return data;
}

export default function Home() {
  const [date, setDate] = useState("");
  const [script, setScript] = useState<ScriptPayload | null>(null);
  const [history, setHistory] = useState<ScriptPayload[]>([]);
  const [recent, setRecent] = useState<RecentScript[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [customTopic, setCustomTopic] = useState("");
  const [mode, setMode] = useState<"daily" | "custom" | null>(null);
  const [viewingRecent, setViewingRecent] = useState(false);

  const persist = useCallback(
    (day: string, current: ScriptPayload, hist: ScriptPayload[]) => {
      const cache: DayCache = { date: day, current, history: hist };
      saveDayCache(cache);
      setRecent(loadRecentHistory());
    },
    [],
  );

  useEffect(() => {
    const d = todayDateString();
    setDate(d);
    setRecent(loadRecentHistory());
  }, []);

  async function generateDaily(nextAttempt = 0, exclude: string[] = []) {
    if (!date || loading) return;
    try {
      setLoading(true);
      setError(null);
      setMode("daily");
      setViewingRecent(false);
      const generated = await fetchScript({
        date,
        excludeTopics: exclude,
        attempt: nextAttempt,
      });
      const nextHistory =
        nextAttempt === 0 ? [generated] : [...history, generated];
      setScript(generated);
      setHistory(nextHistory);
      setAttempt(nextAttempt);
      persist(date, generated, nextHistory);
    } catch (e) {
      setError(e instanceof Error ? e.message.toLowerCase() : "something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function generateCustom() {
    if (!date || loading) return;
    const topic = customTopic.trim();
    if (topic.length < 2) {
      setError("enter a topic first.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setMode("custom");
      setViewingRecent(false);
      const generated = await fetchScript({
        date,
        excludeTopics: history
          .filter((h) => h.category === "custom")
          .map((h) => h.topic),
        attempt: 0,
        customTopic: topic,
      });
      const nextHistory = [...history, generated];
      setScript(generated);
      setHistory(nextHistory);
      setAttempt(0);
      persist(date, generated, nextHistory);
    } catch (e) {
      setError(e instanceof Error ? e.message.toLowerCase() : "something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function onAnotherTopic() {
    if (mode === "custom") {
      await generateCustom();
      return;
    }
    const exclude = history.map((h) => h.topic).filter(Boolean);
    await generateDaily(attempt + 1, exclude);
  }

  async function onCopy() {
    if (!script) return;
    await navigator.clipboard.writeText(script.script);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function goHome() {
    setScript(null);
    setError(null);
    setMode(null);
    setViewingRecent(false);
    setCopied(false);
    setRecent(loadRecentHistory());
  }

  function openRecent(item: RecentScript) {
    setScript(item);
    setViewingRecent(true);
    setMode(item.category === "custom" ? "custom" : "daily");
    setError(null);
    setCopied(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const showChooser = !script && !loading;
  const showRecentList = recent.length > 0 && !script && !loading;

  return (
    <>
      <div className="atmosphere" aria-hidden />
      <main className="relative z-10 mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-10 sm:px-8 sm:py-12">
        <header className="fade-rise mb-8 text-left">
          <h1 className="text-4xl font-medium tracking-tight text-[var(--text)] lowercase sm:text-5xl">
            speech practice
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--text-muted)] lowercase sm:text-lg">
            a daily 2–3 minute script on live-generated topics — built for
            speaking out loud.
          </p>
          {date ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">{date}</p>
          ) : null}
        </header>

        <section className="glass-panel fade-rise rounded-2xl p-6 sm:p-9">
          {showChooser ? (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="mb-4 text-base text-[var(--text-muted)] lowercase">
                  today&apos;s script
                </h2>
                <button
                  type="button"
                  className="ui-btn rounded-xl px-5 py-3 text-base lowercase"
                  onClick={() => generateDaily(0, [])}
                  disabled={loading}
                >
                  generate today&apos;s script
                </button>
              </div>

              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] lowercase">
                <span className="h-px flex-1 bg-[var(--border)]" />
                or
                <span className="h-px flex-1 bg-[var(--border)]" />
              </div>

              <div>
                <h2 className="mb-2 text-base text-[var(--text-muted)] lowercase">
                  custom topic
                </h2>
                <p className="mb-4 text-base text-[var(--text-muted)] lowercase">
                  educational topics lean into current findings; everything else
                  gets an interesting angle.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void generateCustom();
                    }}
                    placeholder="e.g. ai agents in trading ops"
                    className="ui-input min-w-0 flex-1 rounded-xl px-4 py-3 text-base lowercase"
                    maxLength={240}
                  />
                  <button
                    type="button"
                    className="ui-btn-ghost shrink-0 rounded-xl px-5 py-3 text-base lowercase"
                    onClick={() => void generateCustom()}
                    disabled={loading}
                  >
                    generate
                  </button>
                </div>
              </div>

              {error ? (
                <p className="text-base lowercase text-[var(--purple-soft)]">
                  {error}
                </p>
              ) : null}
            </div>
          ) : null}

          {loading && !script ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--purple-soft)]" />
              <p className="text-base lowercase text-[var(--text-muted)]">
                writing script…
              </p>
            </div>
          ) : null}

          {script ? (
            <>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="ui-chip rounded-full px-3 py-1 text-sm">
                  {CATEGORY_LABEL[script.category] ?? script.category}
                </span>
                <span className="text-sm lowercase text-[var(--text-muted)]">
                  ~{script.estimatedMinutes} min · {script.wordCount} words
                </span>
              </div>

              <h2 className="mb-3 text-3xl font-medium tracking-tight text-[var(--text)] sm:text-4xl">
                {script.title}
              </h2>
              <p className="mb-7 text-base text-[var(--purple-soft)] sm:text-lg">
                {script.topic}
              </p>

              <div className="script-body">{script.script}</div>

              {error ? (
                <p className="mt-6 text-base lowercase text-[var(--purple-soft)]">
                  {error}
                </p>
              ) : null}

              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="ui-btn rounded-xl px-5 py-2.5 text-base lowercase"
                  onClick={onCopy}
                  disabled={loading}
                >
                  {copied ? "copied" : "copy script"}
                </button>
                {!viewingRecent ? (
                  <button
                    type="button"
                    className="ui-btn-ghost rounded-xl px-5 py-2.5 text-base lowercase"
                    onClick={() => void onAnotherTopic()}
                    disabled={loading}
                  >
                    {loading
                      ? "generating…"
                      : mode === "custom"
                        ? "regenerate angle"
                        : "try another topic"}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="ui-btn-ghost rounded-xl px-5 py-2.5 text-base lowercase"
                  onClick={goHome}
                  disabled={loading}
                >
                  home
                </button>
              </div>
            </>
          ) : null}
        </section>

        {showRecentList ? (
          <section className="fade-rise mt-10">
            <h3 className="mb-3 text-sm lowercase tracking-wide text-[var(--text-muted)]">
              recent
            </h3>
            <ul className="space-y-2">
              {recent.map((item) => (
                <li key={`${item.date}-${item.topic}`}>
                  <button
                    type="button"
                    onClick={() => openRecent(item)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[rgba(20,8,36,0.55)] px-5 py-4 text-left transition hover:border-[var(--border-purple)]"
                  >
                    <p className="text-base text-[var(--text)]">{item.title}</p>
                    <p className="mt-1 text-sm lowercase text-[var(--text-muted)]">
                      {item.date} ·{" "}
                      {CATEGORY_LABEL[item.category] ?? item.category}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}
