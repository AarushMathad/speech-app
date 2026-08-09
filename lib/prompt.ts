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
      "Technical and exact for a sharp undergrad peer. Name real mechanisms, tradeoffs, and failure modes. Use proper terms freely; only gloss the obscure ones. No baby talk, no hype, no 'for beginners' framing.",
  },
  {
    id: "accessible-smart",
    label: "Accessible · smart",
    weight: 12,
    prefer: [],
    instruction:
      "Like explaining to a sharp classmate — concrete, a bit witty if it fits, never dumbed down. Prefer substance over vibes.",
  },
  {
    id: "nuanced-clear",
    label: "Nuanced · clear",
    weight: 22,
    prefer: [],
    instruction:
      "Thoughtful and precise. Layer tradeoffs or a non-obvious turn. Natural spoken rhythm — college-smart, not slangy and not lecture-stiff.",
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

Baseline voice: nuanced and speakable — like a sharp undergrad explaining something meaty to classmates out loud. Not TED-polished, not academic paper, not preachy, not slangy chat.

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
- Prefer short-to-medium sentences. Complexity lives in the ideas, not tangled grammar.
- Sound like natural spoken English: complete clauses, clear referents, no telegram fragments.
- When you quote a phrase, term, or title, keep both opening and closing quotation marks in the spoken text (or rephrase without quotes). Never leave a quote hanging.
- Avoid awkward punctuation, run-ons, or half-edited sentences. The script must read cleanly out loud on the first pass.
- Use real technical terms when they help. Briefly gloss only jargon that a strong undergrad might not know yet — do not over-explain basics.
- Target 350–450 words (about 2.5–3 minutes).

For educational / technical topics: prioritize a specific non-obvious insight, current technique, or real tradeoff. Avoid "what is X" intros.

Return a JSON object with keys title, topic, and script. The script value must be plain spoken text with correct grammar and punctuation.`;
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
${
  category.id === "educational"
    ? "\nAudience reminder: strong STEM undergrad. Teach a real technical insight — assume CS/math basics, skip intro fluff, don't require specialist industry experience.\n"
    : ""
}
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

A) Educational / technical / fintech / AI / ML / robotics / algorithms / markets / science
   → Audience: undergrads at a strong STEM university, sharing this aloud with peers. Assume they know fundamentals. Teach a timely, specific angle — mechanism, tradeoff, current technique, or non-obvious finding. Do NOT shy away from technical depth. Do NOT write a beginner explainer or a vague survey. Do NOT assume 10 years of industry specialization.

B) Everything else (interpersonal philosophy, culture, music, current events, craft, etc.)
   → Same undergrad audience. Find an interesting, non-obvious angle. Dig past the surface take people already know. Keep it sharp enough that a thoughtful college classmate would learn something.

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
