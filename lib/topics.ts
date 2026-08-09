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
    label: "Tech · AI · Science · Markets",
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
      "autonomous research agents",
      // LLMs, training & algorithms
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
      "pretraining vs post-training",
      "RLHF / preference optimization",
      "tokenization and data curation",
      "gradient descent intuition",
      "overfitting vs generalization",
      "scaling laws (plain language)",
      "attention mechanisms intuition",
      "embeddings and similarity search",
      "diffusion models intuition",
      "reinforcement learning basics",
      "online learning vs batch training",
      "eval harness design",
      "dataset bias and leakage",
      // Robotics & physical AI
      "robotics foundation models",
      "robot learning from demonstration",
      "sim-to-real transfer",
      "computer vision in robots",
      "humanoid robots hype vs reality",
      "warehouse automation",
      "self-driving stacks (high level)",
      "sensors and fusion",
      "control loops vs learned policies",
      "robot safety and failure modes",
      // Systems, infra, software
      "distributed systems tradeoffs",
      "caching and consistency",
      "APIs and versioning",
      "observability and debugging",
      "edge vs cloud compute",
      "GPU scarcity and scheduling",
      "compilers and performance",
      "security threat models",
      "privacy-preserving ML",
      "open source economics",
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
      // AI × finance / science / society
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
      "AI in drug discovery (plain)",
      "climate + ML applications",
      "science of large experiments",
      "compute as a strategic resource",
    ],
    guidance:
      "Invent one fresh, specific angle in tech / AI / ML / robotics / algorithms / systems / science / fintech / markets — timely and worth learning. Audience: strong STEM undergrad at a competitive university — comfortable with CS/math fundamentals, not a beginner, not a 10-year industry specialist. Teach something real: a mechanism, tradeoff, failure mode, or current technique. Skip 101 definitions and hand-wavy surveys. Still speakable in ~3 minutes — dense ideas, clear speech. Do NOT just rename a seed.",
  },
  {
    id: "reflective",
    label: "Mind · Philosophy · People",
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
      "self-deception",
      "cognitive biases in daily life",
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
      "responsibility vs blame",
      "truth vs tact",
      "power and soft influence",
      "identity under change",
      // Interpersonal philosophy (general)
      "how trust forms between people",
      "signals vs words in relationships",
      "boundaries without coldness",
      "conflict as information",
      "repair after rupture",
      "reciprocity and scorekeeping",
      "status games in groups",
      "belonging vs independence",
      "jealousy and security (general)",
      "vulnerability as strategy vs honesty",
      "listening as a skill",
      "miscommunication patterns",
      "roles people fall into",
      "distance and closeness cycles",
      "expectations vs agreements",
      "respect vs liking",
      "persuasion without manipulation",
      "social comparison online",
      "privacy in relationships",
      "growing at different speeds",
      "partnership and trust (general)",
      "chosen obligations",
    ],
    guidance:
      "Invent a reflective or philosophical angle about minds, meaning, or interpersonal life in general — trust, conflict, status, communication, identity with others. Prefer general interpersonal philosophy over friendship-specific stories. Invent a specific take — not a seed title restated. Not preachy, not a personal diary monologue. One insight someone can speak aloud.",
  },
  {
    id: "hobbies",
    label: "Culture · Music · Events",
    weight: 25,
    seeds: [
      // Popular music (general)
      "how pop songs are structured",
      "hooks and earworms",
      "production trends in popular music",
      "streaming and what charts mean",
      "genre mashups and microgenres",
      "lyrics vs vibe culture",
      "live shows vs recorded music",
      "artist branding as storytelling",
      "sample culture and originality",
      "music discovery algorithms",
      "nostalgia cycles in music",
      "concert economics",
      // Current events (primary focus)
      "current events framing",
      "media incentives and headlines",
      "how narratives harden too fast",
      "policy vs vibes in public debate",
      "geopolitics for non-experts",
      "tech regulation in the news",
      "elections as information contests",
      "protest movements and attention",
      "labor stories in the news cycle",
      "climate news vs climate systems",
      "misinformation dynamics",
      "what 'breaking news' does to judgment",
      "platforms shaping public argument",
      "scandals and accountability theater",
      "economic indicators people misread",
      "culture war as content machine",
      // Pop culture & media
      "pop culture cycles",
      "meme economics",
      "celebrity narrative machines",
      "streaming culture",
      "fandom dynamics",
      "influencer credibility",
      "short-form video attention",
      // Movies / story
      "movies and storytelling structure",
      "character wants vs needs",
      "twist endings that work",
      "cinematography you can notice",
      "adaptations book-to-film",
      "genre conventions",
      "franchise fatigue",
      // Science-of-X & everyday curiosity
      "the science behind everyday things",
      "why muscles adapt",
      "sleep science lite",
      "nutrition claims vs evidence",
      "plants and photosynthesis intuition",
      "weather systems basics",
      "materials science in daily life",
      // Video editing / media craft
      "video editing pacing",
      "cuts and rhythm",
      "color vs storytelling",
      "sound design basics",
      "editing for attention without junk",
      // Gardening / quiet craft
      "gardening soil basics",
      "watering intuition",
      "seasonal planting",
      "compost and cycles",
      // Tech as hobby / markets as craft
      "side projects and scope",
      "home lab tinkering",
      "gadget minimalism",
      "open source as hobby",
      "learning a stack for fun",
      "trading stocks as craft",
      "journaling trades",
      "process over vibes",
      "news vs noise",
    ],
    guidance:
      "Invent a fresh angle focused on current events, popular music/culture, media craft, science-of-everyday, or quiet hobbies — NOT sports or guitar-specific practice. Prefer timely public events and cultural dynamics when possible. Explain a craft, system, or idea — not a personal 'why I love X' rant.",
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
