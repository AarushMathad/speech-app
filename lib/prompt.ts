import type { Category } from "./topics";
import { hashString, mulberry32, type CategoryId } from "./topics";

export type ScriptPayload = {
  title: string;
  topic: string;
  category: string;
  script: string;
  estimatedMinutes: number;
  wordCount: number;
};

export type VoiceStyle = {
  id: string;
  label: string;
  /** Relative weight when sampling. */
  weight: number;
  /** Prefer these categories; empty = any. */
  prefer: CategoryId[];
  instruction: string;
};

/**
 * Vary register like we vary topics. Skews away from ultra-casual chat.
 * Still must stay speakable out loud.
 */
export const VOICE_STYLES: VoiceStyle[] = [
  {
    id: "sharp-analytical",
    label: "Sharp · analytical",
    weight: 30,
    prefer: ["educational"],
    instruction:
      "Advanced ideas, easy mouthfeel. Name real mechanisms and tradeoffs, but say them in short, conversational clauses a classmate would actually speak. Prefer vivid concrete wording over stacked abstract nouns. No baby talk, no hype, no beginner framing.",
  },
  {
    id: "accessible-smart",
    label: "Accessible · smart",
    weight: 16,
    prefer: [],
    instruction:
      "Like explaining to a sharp classmate — concrete, lightly conversational, never dumbed down. Prefer substance over vibes, and keep sentences easy to say aloud.",
  },
  {
    id: "nuanced-clear",
    label: "Nuanced · clear",
    weight: 22,
    prefer: [],
    instruction:
      "Thoughtful and precise, slightly conversational. Layer one tradeoff or non-obvious turn. College-smart, not slangy, not lecture-stiff, not wordy.",
  },
  {
    id: "reflective-layered",
    label: "Reflective · layered",
    weight: 18,
    prefer: ["reflective"],
    instruction:
      "Measured and insightful. Sit with ambiguity. Prefer careful distinctions over slogans. Still easy to say aloud — no diary voice.",
  },
  {
    id: "craft-observant",
    label: "Craft · observant",
    weight: 14,
    prefer: ["hobbies"],
    instruction:
      "Detail-aware and grounded in how the thing actually works. Specific, slightly nerdy in a good way, never rambling or gushy.",
  },
];

export function pickVoiceStyle(params: {
  date: string;
  attempt: number;
  categoryId: string;
  customTopic?: string;
}): VoiceStyle {
  const { date, attempt, categoryId, customTopic } = params;
  const rand = mulberry32(
    hashString(`${date}:voice:${categoryId}:${attempt}:${customTopic ?? ""}`),
  );

  const pool = VOICE_STYLES.map((style) => {
    let w = style.weight;
    if (style.prefer.length === 0) return { style, w };
    if (style.prefer.includes(categoryId as CategoryId)) w *= 1.6;
    else if (categoryId === "custom") w *= 1.0;
    else w *= 0.55;
    return { style, w };
  });

  const total = pool.reduce((sum, p) => sum + p.w, 0);
  let roll = rand() * total;
  for (const item of pool) {
    roll -= item.w;
    if (roll <= 0) return item.style;
  }
  return pool[pool.length - 1]!.style;
}

export function buildSystemPrompt(voice: VoiceStyle): string {
  return `You write short spoken scripts for daily speech practice.

Audience: undergraduate students at a strong STEM university. They have solid fundamentals. They want to LEARN something — not a tip for absolute beginners, and not a full industry deep-dive that assumes years on the job.

Baseline voice: a sharp undergrad talking to classmates — substantive, slightly conversational, easy to say out loud. Not TED-polished, not academic paper, not preachy, not slangy chat. Ideas can be hard; sentences should stay light.

Today's register (${voice.label}):
${voice.instruction}

Point of view:
- Do NOT write a personal first-person diary or memoir.
- Explain the idea itself. Prefer general language ("people", "you", "here's the thing") over a fictional personal story about the speaker's life.
- Occasional "I" is fine only as a thinking-out-loud cue, not autobiography.

Structure:
1. A hook in the first 1–2 sentences that earns attention with substance.
2. Two or three clear beats — mechanisms, examples, tradeoffs, or turns.
3. A close with a real takeaway or open question — not a corporate summary.

Speakability (this is a speech exercise first):
- Write ONLY the words to be spoken. No stage directions, labels, bullets, or markdown headings.
- Keep content difficulty; reduce verbal density. Prefer short-to-medium sentences and everyday connective speech ("so", "the trick is", "what that means is").
- Avoid stacked jargon, nested clauses, and tongue-twisters. If a term is precise, use it — then say what it means in one clean follow-up.
- Sound like natural spoken English: complete clauses, clear referents, no telegram fragments.
- When you quote a phrase, term, or title, keep both opening and closing quotation marks (or rephrase without quotes). Never leave a quote hanging.
- Avoid awkward punctuation, run-ons, or half-edited sentences. It must read cleanly out loud on the first pass.
- Hard upper limit: 370 words. Prefer about 350–370; shorter is fine if the idea lands cleanly. Never pad to fill time.
- At ~140 wpm that is roughly 2.5 minutes — keep it tight for speech practice.

For educational / technical topics: prioritize a specific non-obvious insight, current technique, or real tradeoff. Avoid "what is X" intros. Advanced ideas, conversational delivery.

Return a JSON object with keys title, topic, and script.
- title: short and punchy
- topic: one short punchy clause (about 6–14 words). No long explanations, no "why X causes Y by doing Z" essays — just the angle in plain words
- script: plain spoken text with correct grammar and punctuation`;
}

export function buildDailyUserPrompt(params: {
  category: Category;
  date: string;
  excludeTopics: string[];
  attempt: number;
  seedHints: string[];
  voice: VoiceStyle;
}): string {
  const { category, date, excludeTopics, attempt, seedHints, voice } = params;
  const seeds = seedHints.map((s) => `- ${s}`).join("\n");
  const excluded =
    excludeTopics.length > 0
      ? excludeTopics.map((t) => `- ${t}`).join("\n")
      : "(none)";

  return `Mode: daily surprise topic
Date: ${date}
Category: ${category.label} (${category.id})
Attempt: ${attempt}
Voice: ${voice.label}

Category guidance:
${category.guidance}

Inspiration hints (NOT a menu — invent a new specific angle in this realm):
${seeds}

Do NOT reuse:
${excluded}

Invent one fresh topic angle, then write the full spoken script (hard max 370 words).
${
  category.id === "educational"
    ? "\nAudience reminder: strong STEM undergrad. Teach a real technical insight — assume CS/math basics, skip intro fluff, don't require specialist industry experience.\n"
    : ""
}
JSON fields:
- title: short compelling title
- topic: short punchy angle only (6–14 words max) — not a full summary sentence
- script: full spoken text only`;
}

export function buildCustomUserPrompt(params: {
  customTopic: string;
  date: string;
  attempt: number;
  voice: VoiceStyle;
  excludeTopics: string[];
}): string {
  const { customTopic, date, attempt, voice, excludeTopics } = params;
  const excluded =
    excludeTopics.length > 0
      ? excludeTopics.map((t) => `- ${t}`).join("\n")
      : "(none)";

  return `Mode: custom topic
Date: ${date}
Attempt: ${attempt}
Voice: ${voice.label}
User topic: ${customTopic}

First, silently decide which lane this topic fits:

A) Educational / technical / fintech / AI / ML / robotics / algorithms / markets / science
   → Audience: undergrads at a strong STEM university, sharing this aloud with peers. Assume they know fundamentals. Teach a timely, specific angle — mechanism, tradeoff, current technique, or non-obvious finding. Do NOT shy away from technical depth. Do NOT write a beginner explainer or a vague survey. Do NOT assume 10 years of industry specialization.

B) Everything else (interpersonal philosophy, culture, music, current events, craft, etc.)
   → Same undergrad audience. Find an interesting, non-obvious angle. Dig past the surface take people already know. Keep it sharp enough that a thoughtful college classmate would learn something.

Then write the spoken script for that angle. Hard max 370 words; shorter is fine.

Do NOT reuse these angles:
${excluded}

JSON fields:
- title: short compelling title
- topic: short punchy angle only (6–14 words max) — not a full summary sentence
- script: full spoken text only`;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateMinutes(wordCount: number, wpm = 140): number {
  return Math.round((wordCount / wpm) * 10) / 10;
}

export function parseScriptJson(raw: string): {
  title: string;
  topic: string;
  script: string;
} {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return validateParsed(JSON.parse(cleaned));
  } catch {
    const title = extractJsonStringField(cleaned, "title");
    const topic = extractJsonStringField(cleaned, "topic");
    const script = extractJsonStringField(cleaned, "script");
    if (title && topic && script) {
      return { title, topic, script };
    }
    throw new Error("Could not parse script JSON from the model. Try again.");
  }
}

function validateParsed(parsed: {
  title?: unknown;
  topic?: unknown;
  script?: unknown;
}): { title: string; topic: string; script: string } {
  if (
    typeof parsed.title !== "string" ||
    typeof parsed.topic !== "string" ||
    typeof parsed.script !== "string"
  ) {
    throw new Error("Model response missing title, topic, or script");
  }

  return {
    title: parsed.title.trim(),
    topic: parsed.topic.trim(),
    script: parsed.script.trim(),
  };
}

function extractJsonStringField(raw: string, key: string): string | null {
  const marker = `"${key}"`;
  const keyIndex = raw.indexOf(marker);
  if (keyIndex === -1) return null;

  let i = keyIndex + marker.length;
  while (i < raw.length && /[\s:]/.test(raw[i]!)) i++;
  if (raw[i] !== '"') return null;
  i++;

  let out = "";
  while (i < raw.length) {
    const ch = raw[i]!;
    if (ch === "\\") {
      const next = raw[i + 1];
      if (next == null) break;
      const escapes: Record<string, string> = {
        n: "\n",
        r: "\r",
        t: "\t",
        '"': '"',
        "\\": "\\",
        "/": "/",
      };
      out += escapes[next] ?? next;
      i += 2;
      continue;
    }
    if (ch === '"') {
      return out.trim();
    }
    out += ch;
    i++;
  }

  return out.trim().length > 40 ? out.trim() : null;
}
