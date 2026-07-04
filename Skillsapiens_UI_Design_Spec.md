# Skillsapiens — UI Design Spec (Build-Ready)
### Standalone document. Self-contained — no external references needed to implement.

---

## 0. Read This First (Context for Implementation)

**Primary user:** an individual developer/student verifying their own skill by submitting a GitHub repo. This is **not** an internal admin/ops tool — it's a consumer-facing product where the person submitting the repo is the same person viewing the result.

**Primary screen / hero of the product:** the **Verification Report** (§7). Everything else exists to get the user there or let them revisit past reports. Build and polish this screen first.

**Core user flow (linear, 4 steps):**
```
Submit Repo → Analyzing → Answer Questions → Verification Report
```
A secondary flow lets a returning user browse their own history:
```
My Reports (list) → Verification Report (same screen as above, reopened)
```

---

## 1. Design Philosophy

1. **One accent, one meaning.** Color always encodes verification status (Verified / Flagged / In Review / Pending) — never decoration.
2. **The report is the product.** Every other screen is a funnel toward or a doorway back into a single, well-designed report view.
3. **No emoji, no illustrative icons, no gamified visual noise** (no medals, no confetti, no mascots) — this tool's entire value proposition is credibility; the UI should feel rigorous, not playful.
4. **Plain language throughout.** Copy describes what happened in the user's terms ("We checked your commit history," not "Forensic module executed") — see §11 for full copy rules.

---

## 2. Typography

| Role | Typeface | Weight | Size | Usage |
|---|---|---|---|---|
| Page titles | Google Sans | 500 | 24px | "Verification Report," "My Reports" |
| Section/card titles | Google Sans | 500 | 15px | "Score Breakdown," "Forensic Flags" |
| Hero score number | Google Sans | 700 | 56px | The main Verified Skill Score on the report screen |
| Secondary stat numbers | Google Sans | 700 | 32px | Sub-scores (Authenticity, Understanding, Alignment) |
| Body text | Poppins | 400 | 14px | Descriptions, question text, general UI copy |
| Data emphasis | Poppins | 600 | 14px | Table values, chip labels |
| Captions / meta | Poppins | 400 | 12px | Timestamps, helper text, field labels |
| Code snippets | JetBrains Mono (or Fira Code) | 400 | 13px | Code shown inside questions/report |

**Font stack (with safe fallbacks):**
```css
--font-display: 'Google Sans', 'Plus Jakarta Sans', 'Segoe UI', Roboto, sans-serif;
--font-body: 'Poppins', 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
```
> **Licensing note:** Google Sans is not freely embeddable outside Google's own products. If it can't be legitimately loaded via a licensed source, substitute **Plus Jakarta Sans** or **Inter** as the actual display face — same geometric, clean character, freely available on Google Fonts. Do not ship a scraped/unlicensed copy of Google Sans.

**Rules:**
- Google Sans (or its substitute) is used only for page titles, section titles, and large score numbers.
- Poppins carries everything else.
- Line height: 1.5 for body copy, 1.2 for headings and score numbers.

---

## 3. Color System

```css
:root {
  /* Base */
  --bg-canvas: #121212;
  --bg-surface: #1B1B1E;
  --bg-surface-alt: #202024;
  --border-subtle: #2A2A2E;
  --text-primary: #F5F5F7;
  --text-secondary: #A0A0A8;
  --text-tertiary: #6B6B72;

  /* Accents — flat, no gradients */
  --accent-purple: #7C6CF6;  /* primary actions, brand, in-progress */
  --accent-blue:   #4C8DFF;  /* in review / informational */
  --accent-green:  #34C77B;  /* verified / clean / good */
  --accent-orange: #F5A623;  /* pending / minor concern */
  --accent-red:    #F0554C;  /* flagged / major concern */
  --accent-yellow: #F5C842;  /* fair / mid-range score band */
}
```

**Status meaning (fixed everywhere in the product):**

| Meaning | Token |
|---|---|
| Verified / Clean / Excellent score | `--accent-green` |
| Good score band | `--accent-blue` |
| Fair score band | `--accent-yellow` |
| Flagged / Poor score / Major authenticity concern | `--accent-red` |
| Pending / analysis in progress | `--accent-orange` |
| Primary actions, links, active nav | `--accent-purple` |

**Contrast rules:**
- Body text minimum 4.5:1 against its background.
- `--accent-yellow` and `--accent-orange` are never used as small text color directly on `--bg-canvas` — only as chip backgrounds (at 15–18% opacity) with full-opacity text, or as icon/dot fills.

---

## 4. Spacing, Radius, Grid

```css
:root {
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px;
  --space-8: 32px; --space-10: 40px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-full: 999px;
}
```

- **Content max-width:** 840px for the report/question screens (single-column, focused reading), 1200px for the "My Reports" list screen.
- **Card padding:** 24px, consistent everywhere.
- **Card border:** 1px solid `--border-subtle`, 12px radius, **no drop shadows**.
- **Vertical rhythm:** 24px between major sections on a screen, 16px between related elements within a section.

---

## 5. Navigation

Simple top navigation — **no admin-style sidebar**, since this is an individual-user product, not an ops console.

```
[Skillsapiens logo]        My Reports    New Verification        [Avatar ▾]
```

- Logo left, two primary nav links center/left-aligned next to it, avatar + dropdown far right.
- Active link: `--text-primary` + 2px `--accent-purple` underline (4px offset below text). Inactive links: `--text-secondary`, no underline.
- No hamburger/collapse needed at this scale — keep it flat and always visible.
- On mobile: collapse nav links into a simple bottom tab bar (Home / New / Reports / Profile), not a hamburger drawer — a tab bar keeps core actions one tap away, appropriate for how often someone opens this app.

---

## 6. Screen 1 — Submit Repo (Entry Point)

**Layout:** centered single card, ~480px wide, vertically centered in the viewport.

**Contents top to bottom:**
1. Short headline (Google Sans, 24px): "Verify a skill from real work you've built."
2. One-line subtext (Poppins, 14px, `--text-secondary`): "Paste a public GitHub repo. We'll check what you actually built — not what you can memorize."
3. Input field: full-width, `--bg-surface` fill, 1px `--border-subtle`, 12px radius, placeholder "github.com/username/repo".
4. Dropdown (optional, secondary): "Skill area to verify" — Frontend / Backend / Full-Stack / Data — defaults to "Auto-detect."
5. Primary button, full-width: "Analyze Repo" (`--accent-purple` fill, white text).
6. Small helper link beneath, `--text-tertiary`, 12px: "What do we check?" — opens a lightweight tooltip/modal explaining the three checks in plain language (see §11 copy).

**Empty/error states:**
- Invalid URL: inline error text below the field in `--accent-red`, plain language: "That doesn't look like a public GitHub repo link."
- Private repo detected: "This repo is private. Only public repos are supported right now." — no dead-end; suggest making it public temporarily or picking another repo.

---

## 7. Screen 2 — Analyzing (Loading State)

**Layout:** same centered card position as Screen 1, content swapped for a progress sequence.

**Contents:**
- Static headline: "Analyzing your repo…"
- A vertical checklist of 3 steps, each with a status indicator (pending/spinner/check):
  1. Checking commit history
  2. Reading your code structure
  3. Preparing questions
- Each step's icon: neutral outline circle (pending) → small spinner (active) → filled check in `--accent-green` (done). No progress percentage number needed — the checklist itself communicates progress.
- No skeleton screens here; this is a short, sequential wait (real API/processing time), so a step list reads as more honest than a fake progress bar.

---

## 8. Screen 3 — Question Flow

**Layout:** centered, max-width 720px, one question fully visible at a time.

**Contents top to bottom:**
1. Progress indicator: "Question 3 of 6" (Poppins 12px `--text-tertiary`) + a thin horizontal progress bar (4px height, `--accent-purple` fill on `--border-subtle` track).
2. Code snippet block: `--bg-surface` background, `--font-mono`, 13px, syntax-neutral (don't attempt full syntax highlighting for the hackathon build unless time allows — a single monospace block with `--text-primary` is acceptable and keeps scope small).
3. Question text: Poppins 16px/500, `--text-primary`, directly beneath the code block — phrased as a real question, e.g., "Why does this function check `validateCart()` before calling `chargeCard()`?"
4. Answer textarea: full-width, `--bg-surface` fill, min-height ~120px, placeholder: "Explain your reasoning — the more specific, the better."
5. Primary button: "Submit Answer" — disabled state (40% opacity) until the field has meaningful content (e.g., >3 words), to gently discourage empty submissions without being punitive.
6. No "skip" option — every question contributes to the score; if a user truly can't answer, let them submit an empty/short answer rather than skip, since that itself is a meaningful signal, not a UI dead-end.

---

## 9. Screen 4 — Verification Report (PRIMARY SCREEN — build and polish this first)

**Layout:** centered, max-width 840px, generous vertical spacing (32px between sections) since this is a screen people will screenshot and share.

### 9.1 Header block
- Repo name + external link icon (opens the GitHub repo in a new tab), Poppins 14px `--text-secondary`.
- Submitted date, Poppins 12px `--text-tertiary`.
- **Hero score:** large number (Google Sans Bold, 56px) — the Verified Skill Score, e.g., "84".
- Status chip beside the hero score: "Verified" (green) / "Flagged for Review" (red) / "In Review" (blue) — chip style per §10.3.
- One-line plain-language summary beneath the score, Poppins 14px `--text-secondary`: e.g., "Strong understanding of backend logic. No authenticity concerns found."

### 9.2 Score breakdown row
Three equal-width mini stat cards, side by side (stack vertically on mobile):
- **Authenticity** — score /100, small icon (shield/check style), one-line explanation ("Based on your commit history").
- **Structural Understanding** — score /100, one-line explanation ("Based on how your answers matched your code's logic").
- **Semantic Alignment** — score /100, one-line explanation ("Based on how closely your answers matched what the code does").

Each mini card: Google Sans Bold 32px number, Poppins 12px label beneath, `--bg-surface` background, 1px `--border-subtle`, 12px radius — same visual family as the hero card but scaled down, no nested shadows.

### 9.3 Forensic flags section (only rendered if flags exist — otherwise show a single reassuring line, not an empty table)
- Section title: "What we checked in your commit history"
- If clean: a single row with a green check icon + "No red flags found in your commit history."
- If flagged: a simple list (not a data table) — each row: warning icon (`--accent-red` or `--accent-orange` depending on severity) + plain-language explanation, e.g., "Most of this code arrived in a single commit, which is unusual for a project this size." No raw signal names (`initial_commit_ratio`) shown to the end user — translate every technical signal into a plain sentence. Keep a `title` attribute or footnote-style detail toggle for anyone who wants the raw numbers, but the default view is human-readable.

### 9.4 Question-by-question breakdown
- Section title: "How you answered"
- Each question rendered as a collapsed row by default: question text (truncated to one line) + score chip, chevron to expand.
- Expanded state reveals: the original code snippet, the user's full answer, and one short line of feedback per question (e.g., "Your answer closely matched what this function actually does.") — never show the raw cosine-similarity number to the end user; translate it into one of three plain bands: "Strong match," "Partial match," "Limited match."

### 9.5 Actions (pinned at the bottom of the card content, in normal document flow — not floating/sticky)
- Primary button: "Copy Share Link"
- Secondary/outline button: "Download PDF" (stretch goal — for hackathon MVP, this can open a simple print-friendly view instead of a real PDF export if time is short)
- Ghost text link: "Analyze another repo" → returns to Screen 1

---

## 10. Component Library

### 10.1 Buttons
| Type | Style |
|---|---|
| Primary | `--accent-purple` fill, white text, 12px radius, Poppins 500, 12px vertical / 20px horizontal padding |
| Secondary/Outline | Transparent fill, 1px `--border-subtle`, `--text-primary` text |
| Ghost | No fill/border, `--text-secondary`, underline on hover |
| Destructive | `--accent-red` outline or fill — not needed in the core flow, reserved for account/data-deletion actions if built |

Disabled state: 40% opacity, no pointer events.

### 10.2 Inputs
- `--bg-surface` fill, 1px `--border-subtle`, 12px radius, 12px vertical / 16px horizontal padding.
- Focus state: border color shifts to `--accent-purple`, plus a 2px `--accent-purple` outline at 2px offset (keyboard-visible focus, per accessibility rules).
- Error state: border color `--accent-red`, helper text beneath in `--accent-red`, 12px.

### 10.3 Status Chips
- Shape: `--radius-full` (pill), 4px vertical / 12px horizontal padding, Poppins 12px/600.
- Background: status color at 15–18% opacity. Text: status color at full opacity.
- Never color-only — chip text always states the status in words ("Verified," not just a colored dot).

### 10.4 Score Bands (for chips/labels)
| Score range | Label | Color |
|---|---|---|
| 85–100 | Excellent | `--accent-green` |
| 65–84 | Good | `--accent-blue` |
| 40–64 | Fair | `--accent-yellow` |
| 0–39 | Needs Review | `--accent-red` |

### 10.5 Progress bar (question flow + segmented KPI bar if used on "My Reports")
- Track: `--border-subtle`, 4–8px height, `--radius-full`.
- Fill: `--accent-purple` (linear progress) or segmented status colors (for aggregate breakdowns).

---

## 11. Copy & Language Rules (apply everywhere)

- Speak from the user's side of the screen: "We checked your commit history," not "Forensic module executed successfully."
- Never show raw internal signal names, formulas, or variable names to the end user (`initial_commit_ratio`, `cosine_similarity`) — always translate to one plain sentence or a 3-band label (Strong/Partial/Limited, or Excellent/Good/Fair/Needs Review).
- Errors state what happened and what to do next, in plain terms — never technical stack traces in user-facing copy.
- Buttons name the action, not the mechanism: "Analyze Repo," not "Submit Request."
- A button's label stays consistent with what happens after — "Submit Answer" leads to a state that confirms the answer was recorded, not a generic "success" toast.

---

## 12. Secondary Screen — My Reports (History List)

**Purpose:** lets a returning user see their past verifications. This is intentionally simple — a list, not a dashboard.

**Layout:** max-width 1200px, simple table or card-list (recommend a card-list for an individual-user product — feels less like an ops tool):

Each row/card shows: repo name, date, hero score (smaller scale, 24px), status chip, "View Report" link → opens Screen 4 for that report.

Sort/filter: a simple dropdown ("Most recent," "Highest score") — no complex filter panel needed at this scale.

**Empty state** (no reports yet): centered message + the same "Analyze Repo" primary button as Screen 1 — treat emptiness as an invitation to act, not a dead page.

---

## 13. Iconography

- One icon family, line/regular weight, 1.5–1.75px stroke, sizes: 16px (inline), 20px (nav), 24px (empty states).
- No emoji, no illustrative/mascot graphics, no medal/trophy icons even on a future leaderboard feature — a rank number and a score are sufficient.
- Icons used: external-link (repo name), chevron (expand/collapse), check (clean/done), warning (flagged), spinner (loading), search (if search is added to My Reports later).

---

## 14. States & Motion

- **Focus:** 2px `--accent-purple` outline, 2px offset, on every interactive element — never removed without replacement.
- **Hover:** background shift only (`--bg-surface` → `--bg-surface-alt`); no scale/transform.
- **Loading:** step-list pattern on the analyzing screen (§7); simple spinner only for button-level waits (e.g., "Submit Answer" while scoring runs).
- **Transitions:** 150–200ms ease-out for tab/section changes; 120ms for dropdown/menu open. Respect `prefers-reduced-motion` — cap all motion to opacity fades under 100ms when set.
- No page-load choreography or scroll-triggered reveals — the product should feel immediate, not performative.

---

## 15. Accessibility Checklist

- [ ] All text meets WCAG AA contrast against its actual background.
- [ ] Every icon-only control has an `aria-label` (e.g., external-link icon → "Open repo on GitHub").
- [ ] Status is never color-only — every chip includes text.
- [ ] Focus order: nav → main content → primary action, top to bottom, left to right.
- [ ] Textarea/input labels are programmatically associated (`<label for>` or `aria-labelledby`), not placeholder-only.
- [ ] Reduced-motion preference respected.

---

## 16. Anti-Patterns (explicit — do not do these)

- No admin-style sidebar navigation — this is an individual-user product; use the top nav in §5.
- No raw technical signal names or formulas shown in end-user copy.
- No gradients, drop shadows, or decorative illustrations.
- No gamification visuals (medals, badges-with-icons, confetti) even if a leaderboard feature is added later.
- No emoji anywhere.
- No more than one saturated accent color in a single glance area, outside of legitimate multi-category legends (score-band donut, etc.).
- No skip option on verification questions (§8) — an unanswered question is signal, not something to hide from the score.

---

## 17. Build Notes (for implementation)

**Suggested screen/route structure:**
```
/                → Screen 1: Submit Repo
/analyzing/:id   → Screen 2: Analyzing
/questions/:id   → Screen 3: Question Flow (one question per view or single scrollable page — either works; single-question-per-view recommended for focus)
/report/:id      → Screen 4: Verification Report (PRIMARY — build first, polish most)
/reports         → Screen 12: My Reports (history list)
```

**Build priority order for a time-boxed hackathon:**
1. Screen 4 (Verification Report) — static version with mock data first, to lock the visual design.
2. Screen 1 (Submit Repo) — the entry point, simple.
3. Screen 3 (Question Flow) — functional, low-frills.
4. Screen 2 (Analyzing) — can be the simplest possible version (even a static 3-second delay with the checklist) if time is short.
5. Screen 12 (My Reports) — only if time remains; the live demo can work end-to-end without it.

**Component reuse:** build the stat-card (§9.2), chip (§10.3), and button (§10.1) as shared components first — every screen reuses them, so getting these three right early pays off across the whole build.
