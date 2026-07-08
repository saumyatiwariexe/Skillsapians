/**
 * POST /api/answer
 *
 * Body: { report_id: string, question_id: string, answer_text: string }
 *
 * 1. Fetch the question row from Supabase
 * 2. Run Module C — Embedding Scorer
 * 3. Update the question row with scores
 * 4. Check if all questions answered → update report status
 * 5. Return the score for this answer
 */

import { NextRequest, NextResponse } from "next/server";
import { scoreAnswer, buildFactString } from "@/lib/embeddings/scorer";
import { assignBadge, computePointScore } from "@/lib/badges";
import { createAdminClient } from "@/lib/supabase/client";
import type { AnswerRequest, AnswerResponse, GeneratedQuestion } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<AnswerResponse>> {
  try {
    const body = (await req.json()) as AnswerRequest;
    const { report_id, question_id, answer_text } = body;
    const timeTakenSeconds = Math.max(0, Math.round(body.time_taken_seconds ?? 0));
    const tabOutCount = Math.max(0, Math.round(body.tab_out_count ?? 0));

    if (!report_id || !question_id || !answer_text?.trim()) {
      return NextResponse.json(
        { question_id: question_id ?? "", score: {} as never, status: "error", error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = createAdminClient();

    // ── Fetch the question ──────────────────────────────────────────────────
    const { data: qRow, error: qError } = await db
      .from("questions")
      .select("*")
      .eq("report_id", report_id)
      .eq("question_id", question_id)
      .single();

    if (qError || !qRow) {
      return NextResponse.json(
        { question_id, score: {} as never, status: "error", error: "Question not found" },
        { status: 404 }
      );
    }

    // Reconstruct GeneratedQuestion shape for the scorer
    const question: GeneratedQuestion = {
      question_id: qRow.question_id,
      file: qRow.file_path,
      code_snippet: qRow.code_snippet,
      question: qRow.question_text,
      interest_score: qRow.interest_score ?? 0,
      metadata: {
        callers: qRow.callers ?? [],
        callees: qRow.callees ?? [],
        function_name: qRow.function_name ?? "",
        skill_focus: qRow.skill_focus ?? "",
      },
    };

    // Fetch all previous answered questions for duplicate detection
    const { data: prevQuestions } = await db
      .from("questions")
      .select("question_id, user_answer")
      .eq("report_id", report_id)
      .not("user_answer", "is", null);

    const previousAnswers = (prevQuestions ?? [])
      .filter((q) => q.question_id !== question_id)
      .map((q) => (q as Record<string, string>).user_answer ?? "")
      .filter(Boolean);

    // ── Module C — Score the answer ─────────────────────────────────────────
    const scoreResult = await scoreAnswer(question, answer_text, {
      timeTakenSeconds,
      tabOutCount,
      previousAnswers,
    });
    const factString  = buildFactString(question);

    // ── Update question row ─────────────────────────────────────────────────
    const { error: updateError } = await db
      .from("questions")
      .update({
        user_answer:          answer_text,
        fact_string:          factString,
        semantic_similarity:  scoreResult.semantic_similarity,
        entity_overlap:       scoreResult.entity_overlap,
        specificity_score:    scoreResult.specificity_score,
        time_score:           scoreResult.time_score,
        time_taken_seconds:   scoreResult.time_taken_seconds,
        tab_out_count:        scoreResult.tab_out_count,
        integrity_penalty:    scoreResult.integrity_penalty,
        final_question_score: scoreResult.final_question_score,
        ai_generated_flag:    scoreResult.ai_generated_flag,
        answered_at:          new Date().toISOString(),
      })
      .eq("report_id", report_id)
      .eq("question_id", question_id);

    if (updateError) {
      console.error("Error updating question score:", updateError.message);
    }

    // ── Check if all questions are answered → finalize report ───────────────
    const { data: allQuestions } = await db
      .from("questions")
      .select("question_id, final_question_score, time_taken_seconds, tab_out_count, answered_at")
      .eq("report_id", report_id);

    const allAnswered = allQuestions?.every((q) => q.answered_at !== null) ?? false;

    if (allAnswered && allQuestions) {
      const avgScore =
        allQuestions.reduce((sum, q) => sum + (q.final_question_score ?? 0), 0) /
        allQuestions.length;
      const averageTimeSeconds =
        allQuestions.reduce((sum, q) => sum + (q.time_taken_seconds ?? 0), 0) /
        allQuestions.length;
      const totalTabOuts = allQuestions.reduce((sum, q) => sum + (q.tab_out_count ?? 0), 0);

      // Fetch authenticity score to compute final verified score
      const { data: reportRow } = await db
        .from("reports")
        .select("authenticity_score, skill_area")
        .eq("id", report_id)
        .single();

      if (reportRow) {
        const authenticityScore = reportRow.authenticity_score ?? 0;
        const verifiedScore = Math.round(
          Math.max(0, Math.min(100, 0.35 * authenticityScore + 0.65 * avgScore))
        );
        const flaggedForReview = authenticityScore < 30 || totalTabOuts >= 3;
        const finalVerifiedScore = flaggedForReview ? Math.min(verifiedScore, 40) : verifiedScore;
        const badge = assignBadge({
          verifiedScore: finalVerifiedScore,
          averageQuestionScore: avgScore,
          authenticityScore,
          skillArea: reportRow.skill_area ?? "overall",
          averageTimeSeconds,
          totalTabOuts,
        });
        const pointScore = computePointScore({
          verifiedScore: finalVerifiedScore,
          averageQuestionScore: avgScore,
          authenticityScore,
          skillArea: reportRow.skill_area ?? "overall",
          averageTimeSeconds,
          totalTabOuts,
        });

        await db
          .from("reports")
          .update({
            verified_skill_score: finalVerifiedScore,
            badge,
            point_score: pointScore,
            flagged_for_review: flaggedForReview,
            status: "complete",
            completed_at: new Date().toISOString(),
          })
          .eq("id", report_id);
      }
    }

    return NextResponse.json({ question_id, score: scoreResult, status: "scored" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/answer] Error:", message);
    return NextResponse.json(
      { question_id: "", score: {} as never, status: "error", error: message },
      { status: 500 }
    );
  }
}
