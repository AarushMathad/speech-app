export type CategoryId = "educational" | "reflective" | "hobbies";

export type Category = {
  id: CategoryId;
  label: string;
  weight: number;
  /** Broad inspiration domains — never treated as a closed menu. */
  seeds: string[];
  guidance: string;
};

/**
 * Seeds are compass directions only. The model invents a fresh specific angle
 * inside these realms — it should not merely pick a seed verbatim.
 */
export const CATEGORIES: Category[] = [
  {
    id: "educational",
    label: "Fintech · AI · ML",
    weight: 45,
    seeds: [
      // Agents & systems
      "AI agents and tool use",
      "multi-agent workflows",
      "computer-use / browser agents",
      "agent memory and planning loops",
      "tool calling reliability",
      "swarm vs single-agent designs",
      "agent evals and harnesses",
      "human-in-the-loop agent ops",
      "MCP / tool protocols",
      "coding agents in production",
      // LLMs & ML
      "LLM evals and benchmarks",
      "RAG vs long-context",
      "fine-tuning vs prompting",
      "inference economics and pricing",
      "open vs closed models",
      "mixture-of-experts intuition",
      "context windows and attention costs",
      "hallucinations and grounding",
      "distillation and small models",
      "multimodal models in products",
      "reasoning models vs fast models",
      "prompt caching and latency",
      "synthetic data for training",
      "model routing / cascades",
      // Quant & markets
      "quant / systematic trading",
      "market microstructure",
      "order books and liquidity",
      "alternative data",
      "factor investing basics",
      "risk regimes and volatility",
      "backtesting pitfalls",
      "execution algorithms",
      "stat arb intuition",
      "options greeks at a glance",
      "market making vs taking",
      "slippage and transaction costs",
      "crowded trades",
      "macro shocks and models",
      // Fintech rails
      "fintech payments rails",
      "card networks vs ACH vs RTP",
      "stablecoins and on-chain settlement",
      "embedded finance",
      "BNPL economics",
      "KYC / AML tradeoffs",
      "open banking APIs",
      "neobanks vs incumbents",
      "fraud detection with ML",
      "credit underwriting with models",
      "treasury and yield products",
      "cross-border remittances",
      // AI × finance / ops
      "model risk in investing",
      "AI in trading ops",
      "AI for research / earnings",
      "compliance automation",
      "regtech and model governance",
      "regulation of AI in finance",
      "data moats in fintech",
      "latency wars in trading infra",
      "feature stores for finance ML",
      "explainability for credit decisions",
    ],
    guidance:
      "Invent one fresh, specific angle inside fintech / AI / ML / quant — what is popping or newly useful right now. Do NOT just rename a seed. Teach one concrete idea in ~3 minutes with a hook and 2–3 beats. Prefer timely, speakable angles over textbook surveys.",
  },
  {
    id: "reflective",
    label: "Mind · Philosophy · Relationships",
    weight: 30,
    seeds: [
      // Mind & attention
      "attention and distraction",
      "deep work vs shallow work",
      "decision fatigue",
      "rumination loops",
      "memory and narrative self",
      "intuition vs deliberate thought",
      "willpower myths",
      "habit formation and identity",
      "procrastination as emotion",
      "overthinking vs clarity",
      // Philosophy / meaning
      "meaning and ambition",
      "stoicism in modern life",
      "uncertainty and control",
      "status and comparison",
      "authenticity vs performance",
      "time preference / future self",
      "freedom and commitment",
      "luck vs skill stories",
      "suffering and growth claims",
      "technology and human nature",
      // Friendship
      "friendship over years",
      "how friendships drift",
      "loyalty and honesty tradeoffs",
      "presence in conversation",
      "repairing a friendship",
      "chosen family",
      "loneliness vs solitude",
      "group dynamics",
      "envy between friends",
      "asynchronous friendship (distance)",
      // Partnership / close relationships
      "partnership and trust",
      "conflict and repair",
      "attachment patterns (plain language)",
      "communication mismatches",
      "boundaries without coldness",
      "shared goals vs independence",
      "appreciation vs scorekeeping",
      "jealousy and security",
      "long-distance strain",
      "growing at different speeds",
    ],
    guidance:
      "Invent a reflective or philosophical angle about minds, meaning, friendship, or partnership. Stay in that realm but invent a specific take — not a seed title restated. Plain language, not preachy, not a personal diary monologue. One insight someone can speak aloud.",
  },
  {
    id: "hobbies",
    label: "Hobbies · Culture",
    weight: 25,
    seeds: [
      // Music / guitar
      "guitar practice systems",
      "rhythm and timing",
      "improvisation vs theory",
      "tone and gear myths",
      "learning songs by ear",
      "stage nerves and performance",
      "songwriting craft",
      // Racket / ball sports
      "tennis footwork and anticipation",
      "pickleball strategy",
      "volleyball reads and timing",
      "serving under pressure",
      "doubles chemistry",
      "injury prevention for recreational athletes",
      "practice vs scrimmage",
      // NFL / basketball
      "NFL scheme trends",
      "quarterback decision trees",
      "basketball spacing and gravity",
      "analytics changing sports talk",
      "clutch narrative myths",
      "draft vs development",
      "coaching culture",
      // Video editing
      "video editing pacing",
      "cuts and rhythm",
      "color vs storytelling",
      "sound design basics",
      "thumbnails and hooks (craft, not hustle)",
      "B-roll that actually helps",
      "editing for attention without junk",
      // Science-of-X
      "the science behind everyday things",
      "why muscles adapt",
      "sleep science lite",
      "nutrition claims vs evidence",
      "plants and photosynthesis intuition",
      "weather systems basics",
      "materials science in daily life",
      // Current events / pop culture
      "current events framing",
      "pop culture cycles",
      "meme economics",
      "celebrity narrative machines",
      "streaming culture",
      "fandom dynamics",
      // Movies / story
      "movies and storytelling structure",
      "character wants vs needs",
      "twist endings that work",
      "cinematography you can notice",
      "adaptations book-to-film",
      "genre conventions",
      // Gardening
      "gardening soil basics",
      "watering intuition",
      "seasonal planting",
      "pests without panic",
      "compost and cycles",
      "indoor plants that fail (and why)",
      // Tech as hobby
      "side projects and scope",
      "home lab tinkering",
      "gadget minimalism",
      "open source as hobby",
      "learning a stack for fun",
      // Trading as craft (hobby lane)
      "trading stocks as craft",
      "journaling trades",
      "process over vibes",
      "position sizing intuition",
      "news vs noise",
      "hobbyist pitfalls vs pros",
    ],
    guidance:
      "Invent a fresh angle inside hobbies / sports / media / science-of-everyday / gardening / tech tinkering / markets-as-craft. Explain a craft, science, or idea — not a personal 'why I love X' rant. Branch beyond the seed list while staying in these worlds.",
  },
];

/** Mulberry32 — deterministic PRNG from a numeric seed. */
export function mulberry32(seed: number): () => number {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickCategory(date: string, attempt = 0): Category {
  const rand = mulberry32(hashString(`${date}:category:${attempt}`));
  const total = CATEGORIES.reduce((sum, c) => sum + c.weight, 0);
  let roll = rand() * total;
  for (const category of CATEGORIES) {
    roll -= category.weight;
    if (roll <= 0) return category;
  }
  return CATEGORIES[CATEGORIES.length - 1];
}

/** Sample a rotating subset of seeds so inspiration stays varied without locking the topic. */
export function sampleSeedHints(
  category: Category,
  date: string,
  attempt: number,
  count = 12,
): string[] {
  const rand = mulberry32(hashString(`${date}:seeds:${category.id}:${attempt}`));
  const pool = [...category.seeds];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export function todayDateString(timeZone = "America/New_York"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
