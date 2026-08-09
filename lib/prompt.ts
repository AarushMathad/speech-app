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
    id: "nuanced-clear",
    label: "Nuanced · clear",
    weight: 28,
    prefer: [],
    instruction:
      "Thoughtful and precise. Layer the idea a bit — tradeoffs, tension, or a non-obvious turn — without sounding academic or stiff. Natural spoken rhythm, not slangy.",
  },
  {
    id: "sharp-analytical",
    label: "Sharp · analytical",
    weight: 22,
    prefer: ["educational"],
    instruction:
      "A bit denser and more exact. Name mechanisms cleanly, then unpack them in plain speech. Fine to use a few precise terms if you gloss them once. Avoid hype and filler.",
  },
  {
    id: "accessible-smart",
    label: "Accessible · smart",
    weight: 18,
    prefer: [],
    instruction:
      "Friendly but not chatty. Explain like a sharp peer — concrete examples, light wit if it fits, no baby talk and no TED polish.",
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

Baseline voice: nuanced and speakable — like a sharp person explaining something interesting out loud. Not TED-polished, not academic paper, not preachy, not slangy chat.

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

Speakability:
- Write ONLY the words to be spoken. No stage directions, labels, bullets, or markdown headings.
- Prefer short-to-medium sentences. Complexity can live in the ideas, not in tangled grammar.
- If you use a technical term, gloss it once in plain language.
- Target 350–450 words (about 2.5–3 minutes).

Return a JSON object with keys title, topic, and script. The script value must be plain spoken text.`;
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

Invent one fresh topic angle, then write the full spoken script.

JSON fields:
- title: short compelling title
- topic: one-line description of the invented angle
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

A) Educational / technical / fintech / AI / ML / markets / science-of-X
   → Find a timely, specific angle: new findings, current debates, mechanisms that matter now, or a non-obvious recent development. Teach one concrete idea — same energy as a sharp fintech/AI explain piece. Not a vague survey.

B) Everything else (relationships, philosophy, hobbies, culture, sports, craft, etc.)
   → Find an interesting, non-obvious angle inside the topic. Dig past the surface take people already know.

Then write the spoken script for that angle.

Do NOT reuse these angles:
${excluded}

JSON fields:
- title: short compelling title
- topic: one-line description of the specific angle you chose
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
