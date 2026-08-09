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
  educational: "Fintech · AI · ML",
  reflective: "Mind · Relationships",
  hobbies: "Hobbies · Culture",
  custom: "Custom topic",
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
    throw new Error(data.error || "Failed to generate script");
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
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function generateCustom() {
    if (!date || loading) return;
    const topic = customTopic.trim();
    if (topic.length < 2) {
      setError("Enter a topic first.");
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
      setError(e instanceof Error ? e.message : "Something went wrong");
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
      <main className="relative z-10 mx-auto flex min-h-full w-full max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-14">
        <header className="fade-rise mb-10 text-center sm:mb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
            Speech practice
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--text-muted)] sm:text-base">
            A daily 2–3 minute script on live-generated topics — built for speaking
            out loud.
          </p>
          {date ? (
            <p className="mt-4 text-xs tracking-wide text-[var(--text-muted)]">
              {date}
            </p>
          ) : null}
        </header>

        <section className="glass-panel glow-pulse fade-rise rounded-3xl p-6 sm:p-9">
          {showChooser ? (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">
                  Today&apos;s script
                </h2>
                <button
                  type="button"
                  className="neo-btn rounded-2xl px-5 py-3 text-sm font-medium"
                  onClick={() => generateDaily(0, [])}
                  disabled={loading}
                >
                  Generate today&apos;s script
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs tracking-[0.2em] text-[var(--text-muted)] uppercase">
                <span className="h-px flex-1 bg-[var(--border)]" />
                or
                <span className="h-px flex-1 bg-[var(--border)]" />
              </div>

              <div>
                <h2 className="mb-2 text-lg font-semibold text-[var(--text)]">
                  Custom topic
                </h2>
                <p className="mb-4 text-sm text-[var(--text-muted)]">
                  Educational topics lean into current findings; everything else
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
                    placeholder="e.g. AI agents in trading ops"
                    className="neo-input min-w-0 flex-1 rounded-2xl px-4 py-3 text-sm"
                    maxLength={240}
                  />
                  <button
                    type="button"
                    className="neo-btn-ghost shrink-0 rounded-2xl px-5 py-3 text-sm font-medium"
                    onClick={() => void generateCustom()}
                    disabled={loading}
                  >
                    Generate
                  </button>
                </div>
              </div>

              {error ? (
                <p className="text-sm text-[var(--purple-soft)]">{error}</p>
              ) : null}
            </div>
          ) : null}

          {loading && !script ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="h-10 w-10 animate-pulse rounded-full bg-[rgba(124,58,237,0.35)] shadow-[0_0_30px_var(--purple-glow)]" />
              <p className="text-sm text-[var(--text-muted)]">
                Writing script…
              </p>
            </div>
          ) : null}

          {script ? (
            <>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="neo-chip rounded-full px-3 py-1 text-xs font-medium tracking-wide">
                  {CATEGORY_LABEL[script.category] ?? script.category}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  ~{script.estimatedMinutes} min · {script.wordCount} words
                </span>
              </div>

              <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
                {script.title}
              </h2>
              <p className="mb-7 text-sm text-[var(--purple-soft)]">
                {script.topic}
              </p>

              <div className="script-body">{script.script}</div>

              {error ? (
                <p className="mt-6 text-sm text-[var(--purple-soft)]">{error}</p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="neo-btn rounded-2xl px-5 py-2.5 text-sm font-medium"
                  onClick={onCopy}
                  disabled={loading}
                >
                  {copied ? "Copied" : "Copy script"}
                </button>
                {!viewingRecent ? (
                  <button
                    type="button"
                    className="neo-btn-ghost rounded-2xl px-5 py-2.5 text-sm font-medium"
                    onClick={() => void onAnotherTopic()}
                    disabled={loading}
                  >
                    {loading
                      ? "Generating…"
                      : mode === "custom"
                        ? "Regenerate angle"
                        : "Try another topic"}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="neo-btn-ghost rounded-2xl px-5 py-2.5 text-sm font-medium"
                  onClick={goHome}
                  disabled={loading}
                >
                  Home
                </button>
              </div>
            </>
          ) : null}
        </section>

        {showRecentList ? (
          <section className="fade-rise mt-10">
            <h3 className="mb-4 text-xs font-medium tracking-[0.2em] text-[var(--text-muted)] uppercase">
              Recent
            </h3>
            <ul className="space-y-2">
              {recent.map((item) => (
                <li key={`${item.date}-${item.topic}`}>
                  <button
                    type="button"
                    onClick={() => openRecent(item)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[rgba(12,10,18,0.45)] px-4 py-3 text-left backdrop-blur-md transition hover:border-[var(--border-purple)]"
                  >
                    <p className="text-sm font-medium text-[var(--text)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
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
