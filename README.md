# Daily Speak

Personal daily speech-practice site. Each day gets one conversational ~3-minute script via Gemini — weighted toward fintech/AI/ML, then philosophy/relationships, then hobbies.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
GEMINI_API_KEY=your-key-here
# optional
GEMINI_MODEL=gemini-3.5-flash
```

Get a key from [Google AI Studio](https://aistudio.google.com/apikey).

3. Run locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add env vars: `GEMINI_API_KEY` (required), `GEMINI_MODEL` (optional).
4. Deploy.

Scripts for the current day are cached in the browser (`localStorage`). “Try another topic” regenerates with a different angle and keeps today’s history locally.
