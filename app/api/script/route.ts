import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";
import {
  buildCustomUserPrompt,
  buildDailyUserPrompt,
  buildSystemPrompt,
  countWords,
  estimateMinutes,
  parseScriptJson,
  pickVoiceStyle,
  type ScriptPayload,
} from "@/lib/prompt";
import { pickCategory, sampleSeedHints } from "@/lib/topics";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  date?: string;
  excludeTopics?: string[];
  forceNew?: boolean;
  attempt?: number;
  customTopic?: string;
};

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12;
const hits = new Map<string, number[]>();

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }

  const date =
    typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
      ? body.date
      : new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/New_York",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());

  const excludeTopics = Array.isArray(body.excludeTopics)
    ? body.excludeTopics.filter((t): t is string => typeof t === "string").slice(0, 20)
    : [];
  const attempt =
    typeof body.attempt === "number" && body.attempt >= 0
      ? Math.min(Math.floor(body.attempt), 50)
      : excludeTopics.length;

  const customTopic =
    typeof body.customTopic === "string" ? body.customTopic.trim().slice(0, 240) : "";
  const isCustom = customTopic.length > 0;

  if (isCustom && customTopic.length < 2) {
    return NextResponse.json({ error: "Topic is too short." }, { status: 400 });
  }

  const category = isCustom ? null : pickCategory(date, attempt);
  const categoryId = isCustom ? "custom" : category!.id;
  const seedHints = category ? sampleSeedHints(category, date, attempt) : [];
  const voice = pickVoiceStyle({
    date,
    attempt,
    categoryId,
    customTopic: isCustom ? customTopic : undefined,
  });

  const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: buildSystemPrompt(voice),
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          topic: { type: SchemaType.STRING },
          script: { type: SchemaType.STRING },
        },
        required: ["title", "topic", "script"],
      },
    },
  });

  const userPrompt = isCustom
    ? buildCustomUserPrompt({
        customTopic,
        date,
        attempt,
        voice,
        excludeTopics,
      })
    : buildDailyUserPrompt({
        category: category!,
        date,
        excludeTopics,
        attempt,
        seedHints,
        voice,
      });

  try {
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    if (!text?.trim()) {
      throw new Error("No text in Gemini response");
    }

    const parsed = parseScriptJson(text);
    const wordCount = countWords(parsed.script);
    const payload: ScriptPayload = {
      title: parsed.title,
      topic: parsed.topic,
      category: categoryId,
      script: parsed.script,
      estimatedMinutes: estimateMinutes(wordCount),
      wordCount,
    };

    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    console.error("[api/script]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
