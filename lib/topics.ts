export type CategoryId = "educational" | "reflective" | "hobbies";

export type Category = {
  id: CategoryId;
  label: string;
  weight: number;
  seeds: string[];
  guidance: string;
};

/** Interest seeds are compass directions — the model should branch into adjacent, timely angles. */
export const CATEGORIES: Category[] = [
  {
    id: "educational",
    label: "Fintech · AI · ML",
    weight: 45,
    seeds: [
      "AI agents and tool use",
      "multi-agent workflows",
      "computer-use agents",
      "LLM evals and harnesses",
      "quant / systematic trading",
      "market microstructure",
      "alternative data",
      "risk regimes",
      "fintech payments rails",
      "stablecoins and on-chain settlement",
      "model risk in investing",
      "AI in trading ops",
      "RAG vs long-context",
      "fine-tuning vs prompting",
      "inference economics",
      "open vs closed models",
      "regulation of AI in finance",
    ],
    guidance:
      "Pick something popping in fintech/AI/ML right now — concrete, teachable in ~3 minutes. Prefer timely angles (agents, quant, evals, rails) over textbook intros. Teach one clear idea with a hook and 2–3 beats.",
  },
  {
    id: "reflective",
    label: "Mind · Philosophy · Relationships",
    weight: 30,
    seeds: [
      "attention and distraction",
      "friendship over years",
      "partnership and trust",
      "habit formation",
      "meaning and ambition",
      "identity and change",
      "conflict and repair",
      "loneliness vs solitude",
      "status and comparison",
      "presence in conversation",
    ],
    guidance:
      "Pick a reflective or philosophical angle about minds, meaning, or relationships (partners or friends). Discuss the idea in plain language — not a personal diary monologue. Not preachy. One insight someone can speak aloud.",
  },
  {
    id: "hobbies",
    label: "Hobbies · Culture",
    weight: 25,
    seeds: [
      "guitar and practice",
      "tennis / pickleball / volleyball",
      "NFL and basketball",
      "video editing craft",
      "the science behind everyday things",
      "current events and pop culture",
      "movies and storytelling",
      "gardening",
      "tech as hobby",
      "trading stocks as craft",
    ],
    guidance:
      "Branch from hobby and culture seeds into a fresh, specific angle — explain the craft, science, or idea. Not a personal 'why I love X' rant.",
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

export function pickCategory(
  date: string,
  attempt = 0,
): Category {
  const rand = mulberry32(hashString(`${date}:category:${attempt}`));
  const total = CATEGORIES.reduce((sum, c) => sum + c.weight, 0);
  let roll = rand() * total;
  for (const category of CATEGORIES) {
    roll -= category.weight;
    if (roll <= 0) return category;
  }
  return CATEGORIES[CATEGORIES.length - 1];
}

export function todayDateString(timeZone = "America/New_York"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
