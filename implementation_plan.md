# Expanding Skillsapians

We are going to heavily expand the functionality of the Skillsapians application. This update focuses on creating a "Report Card" style profile for users, increasing the depth and security of the verification process, and making the UI much more engaging.

## Status: IMPLEMENTED ✅

> **Decision (user review):** Sign-in uses **GitHub + Google** OAuth via Supabase Auth (GitHub-only was offered; user chose both providers). Fullscreen lock + tab-out detection use standard browser APIs.

This plan is complete. The items below were a proposal; each is now built and reflected in the PRD (§17), README, and `supabase_schema.sql`.

## Proposed Changes

---
### Database & Auth
- **Setup Supabase Auth** for Github Sign-In.
- Update **`supabase_schema.sql`**:
  - `[NEW] profiles` table to store `userId`, `username`, `company`, etc.
  - Add `user_id` to `reports` (nullable, mapped after sign-in).
  - Add `time_taken_seconds` and `tab_out_count` to `questions` table for anti-cheat tracking.
  - Add `badge` element to `reports` to store the allocated badge.

---
### Landing & Loading Experience
#### [MODIFY] `app/page.tsx`
- Change "Skill Area" from a dropdown to a flexible input (e.g., "AI, ML, React, Overall"), allowing the AI to ask smartly directed questions.

#### [NEW] `app/api/repo-metadata/route.ts`
- Fast API endpoint to fetch GitHub information (languages, owner, size) instantly, bypassing the long analysis time.

#### [MODIFY] `app/analyzing/page.tsx`
- Implement parallel data loading: fetch `repo-metadata` instantly to show stats, while `/api/analyze` runs in the background.
- Build the **"Vertical downward line"** animation that reveals repo stats step-by-step.

---
### Core Analysis (AI)
#### [MODIFY] `lib/ast/parser.ts`
- Increase question count limit to **10**.
- Update the prompt to aggressively focus the questions on the specific domain/language the user requested.

---
### Verification Environment (Anti-Cheat & Timer)
#### [MODIFY] `app/questions/[reportId]/page.tsx`
- Add an explicit **"Start Verification"** button that requests **Fullscreen Mode**.
- Add a background timer (`setInterval`) tracking time spent per question.
- Add `visibilitychange` event listener (tab-out detection): if the page is hidden, increment a warning counter and display a harsh alert modal.

#### [MODIFY] `app/api/answer/route.ts` & `lib/embeddings/scorer.ts`
- Evaluate the answer based on semantics AND time taken.

---
### Badges & Profiles
#### [MODIFY] `app/report/[id]/page.tsx`
- Display assigned badges (e.g., "AI Expert", "Fast Implementer") and a point score.
- Add a Sign-In (GitHub) CTA to save the report to their newly created profile.

#### [NEW] `app/profile/page.tsx`
- A Dashboard viewing the aggregate of their reports.
- Acts as their ultimate "Report Card" they can share with companies.

## Verification Plan

### Manual Verification
1. User supplies a repo and a domain (e.g. Python backend). 
2. User sees the loading animation populating immediately.
3. User goes into Fullscreen, tries to tab out (should trigger warning).
4. User completes 10 questions.
5. User is assigned a badge on the Report page and can save it to a Profile dashboard using GitHub/Google OAuth.

---

## What was built (mapping to the plan)

| Plan item | Delivered |
|---|---|
| Supabase Auth (GitHub + Google) | `lib/supabase/auth.ts`, `app/api/auth/callback/route.ts`, `components/AuthProvider.tsx`, `components/UserMenu.tsx` |
| Schema: profiles, user_id, time/tab-out, badge | `supabase_schema.sql` (+ `profiles` INSERT/UPDATE RLS, `reports_update_own`, `handle_new_user` trigger) |
| Skill area → free-text input | `app/page.tsx` (text input + suggestion chips + datalist) |
| `/api/repo-metadata` instant stats | already present; consumed in parallel by `app/analyzing/page.tsx` |
| Parallel loading + vertical reveal | `app/analyzing/page.tsx` (fetches metadata immediately, runs `/api/analyze` in background, animates a step-by-step stat line) |
| 10 questions + domain focus | `lib/ast/parser.ts` (`QUESTIONS_COUNT.max = 10`, `skillFocus` prompt bias) |
| Start Verification + fullscreen + timer + tab-out | `app/questions/[reportId]/page.tsx` (Start button → `requestFullscreen`, per-question `setInterval`, `visibilitychange` warning modal) |
| Score by semantics + time | `lib/embeddings/scorer.ts` (`computeTimeScore`, `computeIntegrityPenalty`); `/api/answer` passes `time_taken_seconds`/`tab_out_count` |
| Badge + points + Save CTA | `lib/badges.ts`; `app/report/[id]/page.tsx` (badge, points, GitHub/Google save CTA → `POST /api/report/[id]/claim`) |
| Profile Report Card | `app/profile/page.tsx` + `app/api/profile/route.ts` (aggregate totals, per-report cards) |

**Build note:** `npm run build` passes. Two pre-existing baseline type errors (in `lib/aggregator.ts` and `lib/ast/parser.ts`) were fixed so the production build compiles.
