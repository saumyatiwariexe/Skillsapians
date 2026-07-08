/**
 * GET /api/report/[id]
 *
 * Returns the full aggregated Verified Skill Report.
 * Used by the report page to render scores, flags, and per-question detail.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/client";
import type { ReportResponse, VerifiedSkillReport } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ReportResponse>> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { report: null, status: "not_found", answered_count: 0, total_questions: 0 },
      { status: 404 }
    );
  }

  const db = createAdminClient();

  // Fetch report row
  const { data: reportRow, error: reportError } = await db
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (reportError || !reportRow) {
    return NextResponse.json(
      { report: null, status: "not_found", answered_count: 0, total_questions: 0 },
      { status: 404 }
    );
  }

  // Fetch all questions for this report
  const { data: questionRows } = await db
    .from("questions")
    .select("*")
    .eq("report_id", id)
    .order("question_id", { ascending: true });

  const questions = questionRows ?? [];
  const answeredCount = questions.filter((q) => q.answered_at !== null).length;
  const totalQuestions = questions.length;

  // Build the report shape
  const report: VerifiedSkillReport = {
    report_id:              reportRow.id,
    user_id:                reportRow.user_id ?? null,
    repo:                   reportRow.repo_url,
    skill_area:             reportRow.skill_area ?? "overall",
    verified_skill_score:   reportRow.verified_skill_score ?? 0,
    authenticity_score:     reportRow.authenticity_score ?? 0,
    average_question_score: 0,
    point_score:            reportRow.point_score ?? 0,
    badge:                  reportRow.badge ?? null,
    flagged_for_review:     reportRow.flagged_for_review ?? false,
    flags:                  reportRow.flags ?? [],
    questions: questions.map((q) => ({
      question_id:   q.question_id,
      file:          q.file_path,
      code_snippet:  q.code_snippet,
      question:      q.question_text,
      interest_score: q.interest_score ?? 0,
      metadata: {
        callers: q.callers ?? [],
        callees: q.callees ?? [],
        function_name: q.function_name ?? "",
        skill_focus: q.skill_focus ?? reportRow.skill_area ?? "overall",
      },
      score: q.answered_at
        ? {
            question_id:          q.question_id,
            user_answer:          q.user_answer ?? "",
            semantic_similarity:  q.semantic_similarity ?? 0,
            entity_overlap:       q.entity_overlap ?? 0,
            specificity_score:    q.specificity_score ?? 0,
            time_score:           q.time_score ?? 0,
            time_taken_seconds:   q.time_taken_seconds ?? 0,
            tab_out_count:        q.tab_out_count ?? 0,
            integrity_penalty:    q.integrity_penalty ?? 0,
            final_question_score: q.final_question_score ?? 0,
            ai_generated_flag:    q.ai_generated_flag ?? false,
          }
        : undefined,
    })),
    share_url:   `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/report/${id}`,
    created_at:  reportRow.created_at,
  };

  // Compute average question score for display
  const answeredScores = questions
    .filter((q) => q.final_question_score !== null)
    .map((q) => q.final_question_score as number);
  report.average_question_score =
    answeredScores.length > 0
      ? parseFloat(
          (answeredScores.reduce((a, b) => a + b, 0) / answeredScores.length).toFixed(2)
        )
      : 0;

  const status =
    reportRow.status === "complete"
      ? "complete"
      : "in_progress";

  return NextResponse.json({ report, status, answered_count: answeredCount, total_questions: totalQuestions });
}
