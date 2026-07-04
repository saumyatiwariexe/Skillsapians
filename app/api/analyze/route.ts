/**
 * POST /api/analyze
 *
 * Body: { repo_url: string, skill_area: SkillArea }
 *
 * 1. Parse + validate GitHub URL
 * 2. Fetch repo metadata + commit history (GitHub API)
 * 3. Run Module A — Git Forensics (deterministic)
 * 4. Fetch top code files + run Module B — AST Questions (Gemini phrasing)
 * 5. Save report + questions to Supabase
 * 6. Return report_id + questions + forensic scores
 */

import { NextRequest, NextResponse } from "next/server";
import { parseRepoUrl, getRepoMetadata, getCommitHistory, getFileTree, getFileContent } from "@/lib/github/client";
import { runGitForensics } from "@/lib/forensics/engine";
import { generateQuestions, selectTopFiles } from "@/lib/ast/parser";
import { createAdminClient } from "@/lib/supabase/client";
import type { AnalyzeRequest, AnalyzeResponse, SkillArea } from "@/types";

const MAX_FILE_SIZE_BYTES = 100_000; // skip files >100KB (likely generated/minified)

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = (await req.json()) as AnalyzeRequest;
    const { repo_url, skill_area } = body;

    // ── Validate input ──────────────────────────────────────────────────────
    if (!repo_url) {
      return NextResponse.json(
        { report_id: "", authenticity_score: 0, flags: [], questions: [], status: "error", error: "repo_url is required" },
        { status: 400 }
      );
    }

    const { owner, repo } = parseRepoUrl(repo_url);

    // ── Step 1: Repo metadata ───────────────────────────────────────────────
    const metadata = await getRepoMetadata(owner, repo);

    // ── Step 2: Commit history ──────────────────────────────────────────────
    const commits = await getCommitHistory(owner, repo);

    // ── Step 3: Module A — Git Forensics ───────────────────────────────────
    const forensics = await runGitForensics(owner, repo, commits, metadata.isFork);

    // ── Step 4: Fetch code files for Module B ───────────────────────────────
    const fileTree = await getFileTree(owner, repo, metadata.defaultBranch);

    // Sort by size, take top 20 candidates (selectTopFiles will narrow to 10)
    const candidates = fileTree
      .filter((f) => f.size < MAX_FILE_SIZE_BYTES && f.size > 100)
      .sort((a, b) => b.size - a.size)
      .slice(0, 20);

    // Fetch file contents (parallel, with error tolerance)
    const filesWithContent = (
      await Promise.allSettled(
        candidates.map(async (f) => ({
          path: f.path,
          content: await getFileContent(owner, repo, f.path),
        }))
      )
    )
      .filter((r): r is PromiseFulfilledResult<{ path: string; content: string }> =>
        r.status === "fulfilled"
      )
      .map((r) => r.value);

    // ── Step 5: Module B — Generate Questions ───────────────────────────────
    const questions = await generateQuestions(filesWithContent);

    // ── Step 6: Persist to Supabase ─────────────────────────────────────────
    const db = createAdminClient();

    const { data: reportRow, error: reportError } = await db
      .from("reports")
      .insert({
        repo_url,
        repo_owner: owner,
        repo_name: repo,
        skill_area: skill_area ?? "fullstack",
        authenticity_score: forensics.authenticity_score,
        flags: forensics.flags,
        commit_count: forensics.commit_count,
        time_span_days: forensics.time_span_days,
        initial_commit_ratio: forensics.initial_commit_ratio,
        is_fork: forensics.is_fork,
        status: "questions_ready",
      })
      .select("id")
      .single();

    if (reportError || !reportRow) {
      throw new Error(`DB error saving report: ${reportError?.message}`);
    }

    const reportId = reportRow.id as string;

    // Insert questions
    if (questions.length > 0) {
      const questionRows = questions.map((q) => ({
        report_id: reportId,
        question_id: q.question_id,
        file_path: q.file,
        function_name: q.metadata.function_name,
        code_snippet: q.code_snippet,
        question_text: q.question,
        interest_score: q.interest_score,
        callers: q.metadata.callers,
        callees: q.metadata.callees,
      }));

      const { error: qError } = await db.from("questions").insert(questionRows);
      if (qError) {
        console.error("Error inserting questions:", qError.message);
        // Non-fatal — report is still usable
      }
    }

    // ── Step 7: Return response ─────────────────────────────────────────────
    return NextResponse.json({
      report_id: reportId,
      authenticity_score: forensics.authenticity_score,
      flags: forensics.flags,
      questions,
      status: "ready",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/analyze] Error:", message);
    return NextResponse.json(
      { report_id: "", authenticity_score: 0, flags: [], questions: [], status: "error", error: message },
      { status: 500 }
    );
  }
}
