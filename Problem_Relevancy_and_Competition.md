# Problem Relevancy, Competitive Landscape & Differentiation
### ProofOfSkill — NYC CodeQuest 2026 (EDU-01)

---

## 1. Why This Problem Is Relevant Right Now

The "degrees vs. actual ability" gap isn't a hypothetical — it's actively being restructured across the hiring industry in 2026, which makes this a strong, timely problem statement to build for.

**Employers are formally dropping degree requirements.** Industry research published in 2026 puts the share of companies that have moved away from using a degree as a primary hiring filter at roughly 81%. That's not a niche trend — it's close to becoming the default.

**Skills-based hiring is stalling because verification hasn't caught up.** A 2026 workforce research piece framed this directly as a "verification crisis": organizations have committed to hiring on competencies, but lack reliable ways to confirm those competencies at scale. Traditional degree/credential verification wasn't built to handle the sheer volume and variety of ways people now learn skills — bootcamps, YouTube, open-source contributions, side projects, communities like Sheryians itself.

**Big players are racing to fill that gap.** LinkedIn launched an AI-driven skills verification system in January 2026, explicitly framed around the idea that employers now care about demonstrated ability over credentials, starting with AI-tool proficiency and expanding to partners like GitHub and Zapier. This confirms the market direction — but also means the "easy" version of this idea (a skill quiz/badge system) is already being built by a company with far more resources than a hackathon team has.

**The credentialing landscape is fragmented and noisy.** Research on U.S. credentials counts over 1.1 million distinct educational credentials in circulation, which makes it genuinely hard for anyone — including employers — to know what a given credential actually signals. This is precisely the confusion EDU-01 asks us to solve.

**Bottom line:** this isn't a stale, already-solved problem. It's an active, unresolved gap that a Fortune-tracked, VC-funded, and patent-filing-heavy market is actively trying to close in 2026 — which is exactly why judges are likely to recognize it as relevant, but also why a shallow solution won't impress anyone who's paying attention to the space.

---

## 2. Competitive Landscape

| Player | What they actually do | Core limitation |
|---|---|---|
| **LinkedIn Skill Verification** (launched Jan 2026) | Lets professionals display AI-verified proficiency badges for specific tools, based on partnerships with AI vendors and platforms like GitHub/Zapier | Verifies *tool familiarity*, not deep understanding of work the person built; relies on partner-issued certification, not an independent check of the person's own projects |
| **HackerRank** | Coding challenges and technical assessments across 50+ languages, widely used for technical hiring screens | Tests performance on a *synthetic* puzzle, disconnected from anything the candidate has actually built; easily gamed by pasting the problem into an LLM |
| **TestGorilla** | Library of 400+ pre-built skills tests with AI-assisted candidate ranking | Same structural issue as HackerRank — a standardized test, not a check of real, personal work |
| **Codility** | Real-world coding tasks with anti-cheat proctoring for technical hiring | Closer to "real" tasks than pure puzzles, but still a *newly assigned* task, not verification of a candidate's own prior work |
| **Degreed** | Skills-first learning ecosystem; tracks declared skills, learning activity, and peer/manager endorsements | Explicitly relies on *declared* and *endorsed* signals rather than direct performance validation — by their own positioning, it doesn't verify proficiency through testing or observation |
| **iMocha / Pluralsight / TalentGuard / Cornerstone (Galaxy)** | Enterprise skills-intelligence platforms: skill taxonomies, gap analysis, structured assessments | Built for large-org workforce management, not individual proof-of-work; expensive, enterprise-sales-driven, not accessible to an individual student or self-taught developer |
| **Blockchain micro-credentialing platforms** (multiple 2025–2026 patent filings, mostly India-based) | Tamper-proof, portable certificates issued after an assessment | Solves the *portability/trust* of a credential once issued, but still depends on some underlying assessment to decide what gets certified — doesn't solve verification itself |
| **AI interview tools** (HireVue, Rebecca AI, Mokka) | Structured/AI-scored video interviews, some with fraud/authenticity detection during the interview | Focused on hiring-stage interviews, not on verifying a body of pre-existing work; authenticity checks are about the interview itself, not the artifact being discussed |

### The pattern across almost every competitor
With the partial exception of AI interview tools' fraud detection, **every major player in this space verifies skill through a newly assigned task** — a quiz, a challenge, an interview question — rather than through the work a person has already produced. That means:

1. None of them catch someone who built very little of their own claimed project.
2. None of them connect *how* something was built (commit history, iteration, real debugging) to the skill claim.
3. Most still rely on an AI or human grading free-form answers subjectively, which is both gameable and hard to defend as objective in a judged setting.

---

## 3. What We're Doing Differently

**Core positioning statement:**
> Every competitor asks "can you pass a new test?" We ask "can you explain the thing you already built — and did you actually build it?"

### 3.1 We verify real, existing work — not a new synthetic task
Instead of assigning a fresh puzzle or quiz, ProofOfSkill analyzes a project the person has already shipped (their GitHub repo). This is a fundamentally different verification target: it can't be "prepped for" the way a known test format can.

### 3.2 We catch fabricated or copy-pasted ownership claims — nobody else in this space centers this
Our Git Forensics module analyzes commit history patterns (initial-commit size ratio, commit timing distribution, file churn) to flag likely "single-commit dumps" or scripted-looking histories. This is deterministic, not LLM-based — meaning it can't be argued away as "just an opinion from a model," and it directly targets a failure mode none of the listed competitors address: someone claiming credit for work they didn't meaningfully do.

### 3.3 Our questions come from the actual code structure, not a template bank
Rather than pulling from a pre-written question bank (like HackerRank/TestGorilla), we parse the actual AST of the submitted code, rank real functions/logic branches by structural "interest" (complexity, cross-file dependencies, external calls), and generate questions tied to specific decisions in that exact codebase. A generic quiz bank can be memorized; a question about *why your `checkout()` function calls `validateCart()` before `chargeCard()`* cannot be prepped for in advance.

### 3.4 We score understanding with geometry, not just another AI's opinion
Instead of having one LLM grade another LLM's output (the default, easily-copied approach most hackathon and even production tools take), we generate a deterministic "fact string" from the AST data describing what the code actually does, embed it, embed the user's answer, and measure semantic alignment via cosine similarity — plus explicit entity overlap (did they reference the real function/variable names involved). This is closer to objective measurement and much harder to replicate by simply calling a different LLM API.

### 3.5 We make the credential itself evidence-backed and inspectable
Where Degreed's own positioning acknowledges it relies on declared/endorsed signals rather than direct validation, and blockchain credential platforms focus on making a *certificate* portable rather than validating what earned it, ProofOfSkill's output report shows the actual evidence trail: the flags raised, the specific code snippet each question was about, and the score reasoning — so a viewer isn't just trusting a badge, they can see why it was earned.

---

## 4. Summary Positioning Table

| Dimension | Typical competitor | ProofOfSkill |
|---|---|---|
| What's assessed | A new, assigned task | Work the person already built |
| Ownership verification | Not addressed | Git forensics detect likely fabricated/copied ownership |
| Question source | Static bank or generic prompt | Generated from real AST structure of the submitted code |
| Scoring method | LLM/human subjective grading | Deterministic + embedding-based geometric scoring |
| Gameability | Vulnerable to LLM-assisted test-taking | Requires genuine understanding of one's own specific code; harder to fake generically |
| Output | Badge/certificate | Badge + inspectable evidence trail |

---

## 5. Sources Referenced
- Fortune, "LinkedIn knows your CV and degree are becoming irrelevant. It has a plan for that," January 2026.
- HR Oasis / SHRM-cited research on degree-requirement removal and AI hiring-prediction accuracy, compiled via industry analysis, 2026.
- The Workforce Lens (Substack), "Skills Verification Crisis: How to Validate Talent Without Traditional Degrees," January 2026.
- Credential Engine, "Counting Credentials" report (credential volume figures).
- 360Learning, "The 12 Best Skills-Based Learning Platforms," 2026 (Degreed positioning).
- WifiTalents, "Top 10 Best Skills Assessment Software of 2026" and "Top 10 AI Interview Tools for Skills-Based Candidate Evaluation," 2026.
- PatSnap, "Skill-based assessment platform patents 2026 landscape."
