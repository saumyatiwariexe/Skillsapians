# Skillsapians

> **Verified skill certification from real, existing work — not another test.**
>
> Built for NYC CodeQuest 2026 · Track EDU-01

---

## What it does

Skillsapians takes a public GitHub repository URL and produces a **Verified Skill Report** — a scored, shareable proof that someone understands the code they claim to have built.

Three independent signals:

| Module | Signal | Method |
|--------|--------|--------|
| **A — Git Forensics** | Did they actually build this over time? | Deterministic analysis of commit history (no LLM) |
| **B — AST Questions** | Do they understand the architecture of their own code? | Babel AST → structural interest scoring → Gemini question phrasing |
| **C — Embedding Scorer** | Does their explanation match what the code actually does? | Deterministic fact string → Gemini embeddings → cosine similarity |

---

## Tech Stack

- **Frontend + API**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **AST Parsing**: `@babel/parser` + `@babel/traverse` (JavaScript/TypeScript repos)
- **LLM / Embeddings**: Google Gemini API (`text-embedding-004`, `gemini-2.0-flash`)
- **Database**: Supabase (Postgres)
- **Hosting**: Vercel
- **GitHub API**: Octokit REST client (server-side token)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-org/skillsapians.git
cd skillsapians
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
# Fill in your keys in .env.local
```

Required keys:
- `GEMINI_API_KEY` — Get from [Google AI Studio](https://aistudio.google.com/)
- `GITHUB_TOKEN` — GitHub PAT with `repo:read` scope
- `NEXT_PUBLIC_SUPABASE_URL` + keys — From your [Supabase](https://supabase.com) project

### 3. Set up the database

Run the migration in Supabase's SQL editor:

```bash
# Copy contents of lib/supabase/schema.sql into Supabase SQL editor and run
```

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
skillsapians/
├── app/                    # Next.js App Router pages + API routes
│   ├── page.tsx            # Landing / input screen
│   ├── analyzing/          # Analyzing screen (loading state)
│   ├── questions/[id]/     # Question screen (one at a time)
│   ├── report/[id]/        # Final report + share link
│   └── api/
│       ├── analyze/        # POST: kicks off Module A + B
│       ├── answer/         # POST: runs Module C for one answer
│       └── report/[id]/    # GET: full aggregated report
├── lib/
│   ├── github/             # GitHub REST API client
│   ├── forensics/          # Module A: deterministic git analysis
│   ├── ast/                # Module B: Babel AST parsing + question gen
│   ├── embeddings/         # Module C: Gemini embeddings + cosine scoring
│   ├── aggregator.ts       # Weighted score formula
│   └── supabase/           # DB client + schema migrations
├── components/             # Shared UI components
└── types/                  # Shared TypeScript interfaces
```

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | `POST` | Submit repo URL → runs forensics + generates questions |
| `/api/answer` | `POST` | Submit one answer → returns embedding score |
| `/api/report/:id` | `GET` | Fetch full verified skill report |

---

## License

MIT
