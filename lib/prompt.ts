import type { Category } from "./topics";

export type ScriptPayload = {
  title: string;
  topic: string;
  category: string;
  script: string;
  estimatedMinutes: number;
  wordCount: number;
};

export function buildSystemPrompt(): string {
  return `You write short spoken scripts for daily speech practice.

Voice: casual and plain — easy to say out loud. Not academic, not TED-polished, not preachy, not overly complex. Short words and clear explanations beat clever writing.

Point of view:
- Do NOT write a personal first-person diary or memoir ("I woke up and realized…", "my partner and I…", "when I was a kid…").
- Explain the idea itself. Prefer general language ("people", "you", "here's the thing") over a fictional personal story about the speaker's life.
- Occasional "I" is fine only as a thinking-out-loud cue ("I think the interesting part is…"), not as autobiography.

Structure:
1. A hook in the first 1–2 sentences that makes the topic interesting.
2. Two or three clear beats (ideas, examples, or turns).
3. A simple close — a question, tension, or takeaway — without a corporate summary.

Speakability rules:
- Write ONLY the words to be spoken. No stage directions, labels, bullet points, or markdown headings.
- Prefer short-to-medium sentences. Avoid tongue-twisters and dense jargon; if you use a technical term, gloss it in plain language once.
- Target 350–450 words (about 2.5–3 minutes at a natural pace).

For educational topics: teach something current and specific — what is popping now — not a vague survey. One idea, clearly spoken.

Return valid JSON only, no markdown fences, matching:
{"title":"string","topic":"string","script":"string"}`;
}

export function buildUserPrompt(params: {
  category: Category;
  date: string;
  excludeTopics: string[];
  attempt: number;
}): string {
  const { category, date, excludeTopics, attempt } = params;
  const seeds = category.seeds.map((s) => `- ${s}`).join("\n");
  const excluded =
    excludeTopics.length > 0
      ? excludeTopics.map((t) => `- ${t}`).join("\n")
      : "(none)";

  return `Date: ${date}
Category: ${category.label} (${category.id})
Attempt: ${attempt} (use this to vary the angle if regenerating)

Category guidance:
${category.guidance}

Interest seeds (compass only — branch into adjacent or more timely angles; do NOT just pick a seed verbatim as the whole topic):
${seeds}

Do NOT reuse any of these topics/angles:
${excluded}

Propose one fresh, specific angle for this category, then write the full spoken script for it.

JSON fields:
- title: short, compelling title for the practice
- topic: one-line description of the specific angle (used for exclusion later)
- script: the full spoken text only`;
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

  const parsed = JSON.parse(cleaned) as {
    title?: unknown;
    topic?: unknown;
    script?: unknown;
  };

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
