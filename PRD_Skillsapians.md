# PRD: Skillsapians
### Verified skill certification from real, existing work — not another test

**Track:** EDU-01 — "Degrees Tell You What Someone Studied, Not What They Can Do"
**Event:** NYC CodeQuest 2026
**Doc version:** 1.0
**Status:** Ready to build

---

## 1. Problem Statement

Credentials (degrees, certificates, completed courses) tell employers what someone was *exposed to*. They don't tell you what someone can *actually do*, or whether they understand the work they claim as their own. The current wave of "skills-based hiring" tools (LinkedIn Skill Verification, HackerRank, TestGorilla, Degreed) solves this by giving people a **new, isolated test** — puzzles, MCQs, timed coding challenges. This has two structural weaknesses:

1. It measures performance on a *synthetic* task, not on real work the person has done.
2. It's trivially gameable by AI. Anyone can paste a LeetCode-style question into an LLM and get through it.

**Our thesis:** the highest-signal way to verify a skill is to make someone explain the work they already produced, in enough depth that an AI-generated or copy-pasted answer would fail — and to back that explanation up with forensic evidence from *how* the work was actually built, not just what the final artifact looks like.

---

## 2. Product Summary

Skillsapians takes a GitHub repo URL and produces a **Verified Skill Report**: a score, per skill area, that combines three independent signals:

| Signal | What it answers | How it's computed |
|---|---|---|
| **A. Git Forensics Score** | "Did this person actually build this over time, or did they dump/copy it?" | Deterministic analysis of commit history — no LLM |
| **B. Structural Understanding Score** | "Do they understand the actual architecture and logic of their own code?" | AST parsing generates targeted questions about real code structures; LLM used only for phrasing |
| **C. Semantic Alignment Score** | "Does their explanation actually match what the code does?" | Embedding similarity between code semantics and the user's answer — not an LLM "grading" another LLM |

The three scores combine into one **Verified Skill Score (0–100)** per skill area (e.g., "Backend Architecture: 87/100 — Verified"), with a shareable profile page and evidence trail a recruiter (or judge) can inspect.

**Why this beats "wrapper" projects:** two of the three signals (A and C) involve no subjective LLM judgment at all — they're deterministic or geometric (vector math), which means they can't be dismissed as "just prompting GPT to grade something," and they can't be gamed by a better LLM on the user's side, because they're measuring structural/behavioral evidence, not just text quality.

---

## 3. Goals / Non-Goals

**Goals for the hackathon build:**
- Support one language deeply (recommend **JavaScript/TypeScript**, or **Python** — pick based on team's strongest parser experience) rather than many languages shallowly.
- Produce a working, demoable end-to-end flow: paste repo → forensic scan → generated questions → user answers → scored report.
- Make the "gotcha" moment demoable live: a vague/fake answer scores low, a real answer scores high, in front of judges.

**Non-goals (cut ruthlessly for time):**
- Multi-language support (stretch goal only, mention in pitch, don't build).
- Payment, teams, enterprise dashboards.
- Perfect plagiarism/AI-detection accuracy — you need a *directionally convincing* signal, not a legally defensible one.
- Handling massive repos (cap analysis to N files / a size limit, document it as a known constraint).

> **Scope change (v1.1):** User accounts/auth are now **in scope**. Reports are still shareable by link, but signed-in users (GitHub or Google via Supabase Auth) can claim reports into a persistent **Profile / Report Card** that aggregates scores, points, and earned badges. See §17.

---

## 4. System Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌───────────────────┐
│   Frontend   │────▶│   API Backend     │────▶│   GitHub API        │
│  (Next.js)   │      │  (Node/Express)   │      │  (repo + commits)   │
└─────────────┘      └──────┬───────────┘      └───────────────────┘
                              │
              ┌───────────────┼────────────────────┐
              ▼               ▼                     ▼
      ┌───────────────┐ ┌─────────────┐   ┌─────────────────────┐
      │ A. Git         │ │ B. AST      │   │ C. Embedding         │
      │ Forensics      │ │ Question    │   │ Scoring Engine        │
      │ Engine         │ │ Generator   │   │                       │
      │ (deterministic)│ │ (tree-sitter│   │ (Voyage/OpenAI        │
      │                │ │ + LLM       │   │ code embeddings +     │
      │                │ │ phrasing)   │   │ cosine similarity)    │
      └───────┬────────┘ └──────┬──────┘   └──────────┬────────────┘
              │                 │                      │
              └─────────────────┴──────────┬───────────┘
                                             ▼
                                  ┌────────────────────┐
                                  │  Score Aggregator    │
                                  │  → Verified Skill     │
                                  │    Report              │
                                  └──────────┬───────────┘
                                             ▼
                                  ┌────────────────────┐
                                  │  Postgres/Supabase   │
                                  │  (store report,       │
                                  │   generate share link)│
                                  └────────────────────┘
```

**Data flow, step by step:**
1. User submits a public GitHub repo URL (+ optionally which skill area to verify, e.g. "backend").
2. Backend clones/fetches repo metadata via GitHub REST API (commits, file tree) — no need to `git clone` locally if time is short; the API gives you commit history, diffs, and file contents directly.
3. Git Forensics Engine runs immediately (fast, no LLM) → produces Score A + a list of flags (e.g., "single-commit dump detected").
4. AST engine parses the top N most substantive files → extracts functions, call graph, complexity → picks 5–8 "interesting" nodes → sends each to an LLM **only to phrase a natural-language question**, never to invent the content of the question.
5. Frontend presents questions one at a time to the user; they answer in free text (or voice-to-text, stretch goal).
6. Each answer + its corresponding code snippet go to the Embedding Scoring Engine → Score C per question.
7. Aggregator combines A + B(implicit in question difficulty) + C into the final Verified Skill Score, and compiles a report with evidence (which flags fired, which answers were strong/weak, and why).
8. Report is saved with a UUID and rendered at `/report/[id]`, shareable as a link/badge.

---

## 5. Module A: Git Forensics Engine (Deterministic — no LLM)

### 5.1 Why this matters
This is the module that makes the product defensible. Anyone can wrap an LLM around code. Almost nobody analyzes *how* a codebase came into existence. This module answers: "is this a real, human, iterative build — or a dump?"

### 5.2 Data source
GitHub REST API endpoints you'll need:
- `GET /repos/{owner}/{repo}/commits` — full commit list (paginate; cap at ~300 commits for hackathon time budget)
- `GET /repos/{owner}/{repo}/commits/{sha}` — per-commit diff stats (additions, deletions, files changed)
- `GET /repos/{owner}/{repo}` — repo metadata (created_at, fork status, size)

Use a GitHub personal access token to avoid rate limits (60 req/hr unauthenticated vs 5,000/hr authenticated).

### 5.3 Signals to compute (all deterministic math, no ML needed)

| # | Signal | How to compute | What it indicates |
|---|---|---|---|
| 1 | **Commit count** | `len(commits)` | Very low (1–3) commits on a "finished" project is suspicious |
| 2 | **Initial commit size ratio** | `(lines added in commit[0]) / (total lines added across all commits)` | If the *first* commit contains >85% of the final codebase, it's very likely a dump/import, not organic building |
| 3 | **Time span** | `commits[-1].date - commits[0].date` | A "learned this over weeks" claim paired with a 10-minute time span is a red flag |
| 4 | **Commit message quality** | Heuristic: ratio of commits with message length < 4 chars or generic strings ("update", "fix", "wip", "asdf") vs descriptive ones | Doesn't prove skill directly, but low-effort messages + huge diffs together are a strong dump signal |
| 5 | **Commit interval distribution** | Compute time deltas between consecutive commits; look at variance/std-dev | Organic work has irregular, "bursty" human patterns (long gaps, late-night sessions, weekend spikes). A suspiciously uniform interval (e.g., commits every exactly 10 minutes) suggests scripted/automated commits made to *simulate* history |
| 6 | **Diff size distribution** | Histogram of `additions+deletions` per commit | Real iterative work has a mix of small (bugfix) and medium (feature) commits. All-or-nothing distributions (either tiny or enormous) suggest either padding or dumping |
| 7 | **File churn pattern** | For each file, count how many distinct commits touched it | Files touched only once (created and never revisited) across an entire "complex" project suggest low iteration/debugging — real building involves revisiting files |
| 8 | **Fork/import detection** | Check `repo.fork` flag; also diff the repo's file list against common bootstrap templates (e.g., `create-react-app` default file signatures) | Distinguish "built from scratch" from "started from a template and lightly modified" — not disqualifying, but should be reflected in scoring context |

### 5.4 Authenticity Score formula (0–100)

```
raw_score = 100
if initial_commit_ratio > 0.85: raw_score -= 35
if commit_count < 5: raw_score -= 20
if time_span_hours < 1 and commit_count > 1: raw_score -= 15   # rapid-fire commits, likely scripted
if commit_message_quality_ratio < 0.3: raw_score -= 10
if commit_interval_stddev < 30 seconds AND commit_count > 5: raw_score -= 15  # too uniform = scripted
if file_churn_avg < 1.2: raw_score -= 10   # files touched once = little iteration

authenticity_score = clamp(raw_score, 0, 100)
```

(Tune these thresholds during testing against a few known-good repos and a few known-dumped repos — grab 2–3 real student projects and 1–2 repos you deliberately create by dumping AI-generated code in a single commit, to calibrate.)

### 5.5 Output shape

```json
{
  "authenticity_score": 78,
  "flags": [
    { "signal": "initial_commit_ratio", "value": 0.42, "severity": "none" },
    { "signal": "commit_interval_stddev", "value": 12.4, "unit": "seconds", "severity": "high", "note": "Commits are suspiciously uniform in timing." }
  ],
  "commit_count": 47,
  "time_span_days": 18
}
```

### 5.6 Edge cases to handle (mention these explicitly to judges — shows engineering maturity)
- **Squashed commits / rebased history**: legitimate projects sometimes squash before merging to main. Mitigate by also checking PR history via `GET /repos/{owner}/{repo}/pulls?state=all` if available — PRs often preserve more granular commit history even after squash-merge to main.
- **Private repos**: require the user to grant OAuth access (stretch goal); for MVP, only support public repos and say so.
- **Legitimate fast projects** (e.g., genuine 3-hour hackathon builds): don't treat a short time span as automatically disqualifying — combine with other signals, and consider letting the user self-declare "this was a timed hackathon project" as context.

---

## 6. Module B: AST-Based Question Generator

### 6.1 Why this matters
This is what makes your questions *specific to the actual code*, instead of generic ("what is a closure?"). Generic questions can be answered by anyone who's memorized concepts, without ever having built anything. Structurally-derived questions can only be answered by someone who understands *this* codebase.

### 6.2 Tooling choice
- **Recommended: `tree-sitter`** — has parsers for JS/TS, Python, and most languages, works fast, gives you a real syntax tree you can query. Node bindings: `tree-sitter` + `tree-sitter-javascript` / `tree-sitter-python`.
- **Alternative for JS-only teams:** Babel's `@babel/parser` + `@babel/traverse` — more JS-specific tooling, easier to query if your whole team already knows JS AST APIs.
- **Alternative for Python-only teams:** Python's built-in `ast` module — zero extra dependencies, very fast to prototype in a hackathon.

**Recommendation for a hackathon: pick whichever the team already has experience with.** Do not spend hackathon hours learning a new AST library — that's the single biggest time-risk in this whole project.

### 6.3 What to extract from the AST

For each file (cap to the ~10 most substantive files by line count, excluding config/boilerplate files like `package.json`, auto-generated files, and `node_modules`):

1. **Function/method declarations** — name, parameters, line range, body.
2. **Call graph edges** — which functions call which other functions (including across files, if you can resolve imports).
3. **Control flow complexity** — count of `if`/`else`/`for`/`while`/`try-catch` nodes per function (a simple proxy for cyclomatic complexity).
4. **Cross-file dependencies** — which files import from which other files (parse `import`/`require` statements).
5. **External API/library calls** — calls to things like `fetch`, `axios`, `useEffect`, DB queries — these often represent the most "decision-heavy" parts of code (why did you call this here, in this order, with this data).

### 6.4 Selecting "interesting" nodes to question
Not all code is worth asking about. Rank functions/blocks by an **"interest score"**:

```
interest_score = (cyclomatic_complexity * 2)
               + (cross_file_call_count * 3)
               + (is_async_or_side_effecting ? 2 : 0)
               + (touches_external_api ? 3 : 0)
               - (is_trivial_getter_setter ? 5 : 0)
```

Pick the **top 5–8 highest-scoring nodes** across the codebase as your question targets. This guarantees questions land on architecturally meaningful decisions (data flow, ordering, error handling) instead of boilerplate.

### 6.5 Question generation pipeline

**Step 1 (deterministic):** For each selected node, extract:
- The function/block's source code snippet.
- Its callers and callees (from the call graph).
- Its file location and surrounding imports.

**Step 2 (LLM — narrow, constrained use only):** Send the extracted snippet + structural metadata to an LLM with a tightly scoped prompt. The LLM's *only* job is to phrase a natural question about a fact you already extracted — it must not invent new facts about the code.

Example prompt template:
```
You are generating a code-comprehension question. You are given:
- A code snippet
- The names of functions that call this function: {callers}
- The names of functions this function calls: {callees}
- This function is called from {N} different files.

Do not invent any information not present below. Ask a specific
question about a DECISION made in this code (why an order of
operations, why an error is handled a certain way, why this
function depends on that one) — not a generic definition question.

Code:
{code_snippet}

Return only the question text, nothing else.
```

**Step 3:** Present question + code snippet to the user in the UI (show them their own code alongside the question, so they can reference it — you're testing understanding, not memory).

### 6.6 Output shape

```json
{
  "question_id": "q_03",
  "file": "src/api/checkout.js",
  "code_snippet": "async function checkout(cart) {\n  const valid = await validateCart(cart);\n  if (!valid) throw new Error('invalid cart');\n  return chargeCard(cart);\n}",
  "question": "Why does this function validate the cart before calling chargeCard, and what would happen if that order were reversed?",
  "interest_score": 14,
  "metadata": { "callers": ["handleCheckoutRoute"], "callees": ["validateCart", "chargeCard"] }
}
```

---

## 7. Module C: Embedding-Based Semantic Scoring

### 7.1 Why this matters
This is the module that replaces "ask an LLM to grade another LLM's output" (circular, gameable, and exactly what a judge will call "just a wrapper") with something closer to objective measurement.

### 7.2 Core idea
Don't ask an LLM "is this answer good?" Instead:
1. Generate embeddings for **what the code actually does** (a structural description, not free-form LLM prose).
2. Generate an embedding for **the user's answer**.
3. Compute cosine similarity between the two. High similarity = the answer's semantic content aligns with the code's actual behavior. Low similarity = the answer is vague, generic, or wrong.

This is much harder to game than LLM-grades-LLM, because the score comes from vector geometry against ground-truth code facts, not from a persuadable model's opinion of the prose.

### 7.3 What to embed on the "code" side (the ground truth)
Do **not** embed the raw code text directly — code and natural language live in different embedding distributions and won't compare well. Instead, build a **structural fact string** deterministically from the AST data (no LLM needed here either):

```
fact_string = f"""
Function: {function_name}
Calls: {', '.join(callees)}
Called by: {', '.join(callers)}
Contains error handling: {has_try_catch}
Control flow branches: {branch_count}
Order of operations: {ordered_list_of_calls_inside_function}
"""
```

Embed this `fact_string` using a code/text embedding model (e.g., OpenAI `text-embedding-3-small`, or Voyage AI's code-specific embeddings if available). This becomes your **reference vector** — deterministic, not influenced by any LLM's writing style.

### 7.4 What to embed on the "answer" side
Embed the user's raw free-text answer using the *same* embedding model.

### 7.5 Scoring formula

```
semantic_similarity = cosine_similarity(fact_embedding, answer_embedding)

# Entity coverage: did they mention the actual function/variable names involved?
entity_overlap = (# of callee/caller names mentioned in answer) / (total relevant entities)

# Specificity heuristic: penalize very short or very generic answers
specificity_score = min(1.0, len(answer.split()) / 25)  # scales up to 25 words, caps at 1.0

final_question_score = (
    0.5 * semantic_similarity +
    0.3 * entity_overlap +
    0.2 * specificity_score
) * 100
```

Weight these however testing shows makes sense — the key architectural point for your pitch is: **semantic similarity and entity overlap are computed against deterministic ground truth extracted from the AST, not against another LLM's opinion.**

### 7.6 Bonus signal: AI-generated-answer detection (stretch, high pitch value)
If time allows, add a lightweight heuristic to flag answers that look AI-generated themselves (defeats the purpose if someone pastes the question into ChatGPT to answer it):
- **Burstiness/perplexity heuristic**: AI text tends to have lower sentence-length variance than human text. Compute std-dev of sentence lengths in the answer; flag unusually low variance.
- **Latency signal**: if you have timestamps, an answer submitted within 2–3 seconds of a complex question appearing is suspicious (round-tripping to another LLM takes time, but so little that speed alone won't catch much — treat this as a soft signal only).
- This doesn't need to be accurate — even a "confidence: possible AI-assisted answer" flag on the report is a strong demo beat and shows you thought about the adversarial case, which ties directly back to the "prove what you can actually do" theme.

### 7.7 Output shape

```json
{
  "question_id": "q_03",
  "semantic_similarity": 0.81,
  "entity_overlap": 0.67,
  "specificity_score": 0.92,
  "final_question_score": 79,
  "ai_generated_flag": false
}
```

---

## 8. Aggregation: Final Verified Skill Score

```
verified_skill_score = (
    0.35 * authenticity_score        # Module A
  + 0.65 * average(final_question_score across all questions)   # Module C, informed by B
)
```

Rationale for weighting: understanding (C) is the primary signal for "can they actually do this," while authenticity (A) acts more as a trust modifier / fraud filter. If authenticity_score is very low (e.g., <30), consider capping the overall report at a "Flagged for Review" state rather than a high score, regardless of how well they answer questions — a dumped repo with well-rehearsed answers is still suspicious.

**Output: Verified Skill Report**
```json
{
  "repo": "github.com/user/project",
  "skill_area": "Backend Architecture",
  "verified_skill_score": 84,
  "authenticity_score": 91,
  "flags": [],
  "questions": [ /* array of Module B + C outputs */ ],
  "report_id": "a1b2c3d4",
  "share_url": "https://proofofskill.app/report/a1b2c3d4"
}
```

---

## 9. Data Model (Postgres / Supabase)

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_url TEXT NOT NULL,
  skill_area TEXT,
  authenticity_score INT,
  verified_skill_score INT,
  flags JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id),
  file_path TEXT,
  code_snippet TEXT,
  question_text TEXT,
  user_answer TEXT,
  semantic_similarity FLOAT,
  entity_overlap FLOAT,
  specificity_score FLOAT,
  final_question_score FLOAT,
  ai_generated_flag BOOLEAN
);
```

> **v1.1 schema additions** (full DDL in `supabase_schema.sql`): a `profiles` table keyed to `auth.users`; `reports.user_id` (nullable, claimed after sign-in), `point_score`, and `badge` (JSONB); on `questions`, `time_taken_seconds`, `tab_out_count`, `time_score`, and `integrity_penalty` for anti-cheat scoring.

---

## 10. API Design

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/analyze` | POST `{ repo_url, skill_area }` | Kicks off Module A (forensics) + Module B (question generation). Returns `report_id` + list of questions. |
| `/api/answer` | POST `{ report_id, question_id, answer_text }` | Runs Module C scoring for one answer, updates DB, returns score for that question. |
| `/api/report/:id` | GET | Returns full aggregated report once all questions answered. |

---

## 11. Frontend Flow (Screens)

1. **Landing / Input screen** — paste GitHub URL, enter a free-text **Skill Area** (e.g. "AI, ML, React, Overall") so questions are directed at that domain, "Analyze" button.
2. **Analyzing screen** — parallel load: `/api/repo-metadata` instantly reveals repo stats (owner, languages, size) via a vertical step-by-step reveal line, while `/api/analyze` (Modules A + B) runs in the background.
3. **Question screen (proctored)** — explicit **"Start Verification"** button requests Fullscreen; a per-question `setInterval` timer tracks time, and a `visibilitychange` listener detects tab-outs (increments a warning counter + shows a harsh alert modal). One question at a time, code snippet shown alongside, free-text answer, progress indicator (Q3 of 10).
4. **Report screen** — big score, breakdown by module (authenticity vs understanding), assigned **badge** (e.g. "AI Expert", "Fast Implementer") + **point score**, per-question detail (expandable), flags called out visually, share/copy-link button, and a **Sign-In (GitHub/Google) CTA** to save the report to a Profile.
5. **Profile / Report Card** — signed-in dashboard aggregating all claimed reports: average score, total points, earned badges, per-report cards.

---

## 12. Tech Stack Recommendation

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js + Tailwind | Fast to scaffold, good for a polished demo |
| Backend | Node/Express (or Next.js API routes to avoid a separate server) | Same language as frontend, less context-switching under time pressure |
| AST parsing | `tree-sitter` (or `@babel/parser` if JS-only) | Best balance of power vs setup time |
| Embeddings | OpenAI `text-embedding-3-small` or Voyage AI code embeddings | Cheap, fast, good enough similarity quality |
| LLM (question phrasing only) | Claude Haiku or GPT-4o-mini | Cheap/fast is fine — this call is narrow and low-stakes by design |
| DB | Supabase (Postgres + instant REST API) | Zero backend boilerplate, fast to set up |
| Hosting | Vercel | One-command deploy, good for live demo reliability |

---

## 13. Hour-by-Hour Build Plan (assume ~30 hour hackathon window)

| Hours | Task |
|---|---|
| 0–2 | Repo scaffolding, GitHub API auth working, fetch commits + file tree for a test repo |
| 2–6 | Module A: implement all forensic signals + scoring formula, test against 2–3 real repos |
| 6–8 | Module A: build the flags/output JSON, wire to `/api/analyze` |
| 8–14 | Module B: AST parsing pipeline, interest-score ranking, extract top 5–8 nodes |
| 14–17 | Module B: LLM question-phrasing integration, test on real functions |
| 17–19 | Module C: fact-string generation, embedding calls, cosine similarity scoring |
| 19–21 | Module C: entity overlap + specificity scoring, aggregate formula |
| 21–24 | Frontend: input screen, question screen, wire to backend |
| 24–27 | Frontend: report screen, scoring visualization, share link |
| 27–29 | End-to-end testing with 2–3 real repos, calibrate thresholds |
| 29–30 | Prepare demo script, rehearse the "vague answer fails, real answer passes" moment live |

**If you're behind schedule, cut in this order:** AI-generated-answer detection (7.6) → multi-file cross-file call graph (keep it single-file) → specificity scoring nuance (just use similarity + entity overlap) → polished UI animations. Never cut Module A's core signals or the live demo moment — those are your differentiation.

---

## 14. Demo Script (2–3 minutes)

1. **Hook (15s):** "Degrees and even most 'skill verification' tools today just give you a new test to pass. We flip that — we verify skill from the work you've *already* built."
2. **Live forensics (30s):** Paste a real repo. Show the authenticity score and flags appearing — "Notice: 94% of this code arrived in one commit. That's a red flag."
3. **Live question (45s):** Show a generated question tied to an actual function, visible on screen.
4. **The gotcha (45s):** Answer once vaguely/generic → low score, "flagged as surface-level." Answer again with real specificity → high score. This side-by-side is your best 30 seconds — rehearse it.
5. **The report (15s):** Show the final score, assigned badge + points, and the Sign-In CTA that saves it to a shareable Report Card profile.
6. **Close (15s):** "This is what 'skills over degrees' actually looks like when you can't fake it."

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| GitHub API rate limits mid-demo | Use an authenticated token in advance; cache results for your demo repo so live analysis doesn't depend on the network at demo time |
| AST parsing breaks on unusual code | Cap to well-known repo structures for the demo; have a pre-tested fallback repo ready |
| Embedding similarity scores feel arbitrary to judges | Show the fact_string explicitly in the report UI ("Here's what we compared your answer against") — makes the scoring feel transparent, not like a black box |
| Time runs out before Module C is polished | Module A + B alone still tell a coherent, differentiated story; C can be simplified to just cosine similarity with no entity overlap if needed |

---

## 16. Why This Wins on the Stated Criteria

- **Problem relevance:** Directly addresses EDU-01 ("degrees don't show what you can do") with a mechanism, not just a mission statement.
- **Technical depth:** Three genuinely distinct engineering components (deterministic forensics, AST analysis, embedding geometry) — defensible against "it's just a wrapper" scrutiny.
- **Demoability:** The vague-vs-real-answer moment is a strong, visual, judge-legible payoff.
- **Differentiation:** Existing skills-verification products (LinkedIn, HackerRank, TestGorilla) all test in isolation from real work; this verifies real work directly, and adds fraud detection nobody else in that space centers as the headline feature.

---

## 17. Auth, Profiles & the "Report Card" (v1.1)

### 17.1 Why accounts
A shareable link proves one report. A **signed-in profile** turns many reports into a portable, recruiter-facing **Report Card** — the aggregate of a person's verified skills across repos. This is the natural end state of the "prove what you can do" thesis and makes the output sticky beyond a single link.

### 17.2 Sign-in
- **Providers:** GitHub and Google, via **Supabase Auth** (`signInWithOAuth`). (User review approved GitHub + Google over GitHub-only.)
- **Session:** browser Supabase client; a `AuthProvider` context exposes `user` app-wide.
- **Profile row:** created automatically on first login via a `handle_new_user` DB trigger (copies `username`, `full_name`, `avatar_url` from OAuth metadata). RLS: profiles readable/updatable only by the owner; a public read policy lets anyone view a shared Report Card.

### 17.3 Claiming & aggregating
- A completed report is claimed with `POST /api/report/[id]/claim` (sets `reports.user_id`). Unclaimed reports remain public by link.
- `GET /api/profile` returns the signed-in user's reports + totals (`report_count`, `average_score`, `total_points`, `badge_count`).
- The `/profile` page renders the Report Card: header with avatar/name/company, four aggregate stat tiles, and a card list of verified reports (score, repo, skill area, badge) linking back to each report.

### 17.4 Badges & points
- On completion, `lib/badges.ts` assigns one `ReportBadge` (e.g. "AI Expert", "Fast Implementer", "Verified Builder") and a `point_score` (weights verified score, question score, authenticity, speed bonus, minus tab-out penalty). Scoring logic lives in `lib/embeddings/scorer.ts` (`time_score`, `integrity_penalty`).

### 17.5 Anti-cheat surface
- The proctored question screen (§11.3) records `time_taken_seconds` per question and a `tab_out_count` (via `visibilitychange`). Both feed `computeTimeScore` + `computeIntegrityPenalty`, and `tab_out_count >= 3` forces a "Review Needed" badge and caps the verified score at 40. This is surfaced honestly on the report ("Integrity Warning" history) rather than hidden.
