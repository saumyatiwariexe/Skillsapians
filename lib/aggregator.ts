/**
 * Score Aggregator
 *
 * Combines Module A (Git Forensics) + Module C (Embedding Scores)
 * into the final Verified Skill Score per PRD §8.
 *
 * Weight: 35% authenticity (Module A) + 65% understanding (Module C)
 * Special rule: if authenticity_score < 30, flag the report regardless
 * of how well the user answered questions.
 */

import type { AnswerScoreResult, GitForensicsResult, VerifiedSkillReport, GeneratedQuestion, SkillArea } from "@/types";

export function computeVerifiedSkillScore(
  forensics: GitForensicsResult,
  questionScores: AnswerScoreResult[]
): {
  verified_skill_score: number;
  average_question_score: number;
  flagged_for_review: boolean;
} {
  const authenticityScore    = forensics.authenticity_score;
  const avgQuestionScore     =
    questionScores.length > 0
      ? questionScores.reduce((sum, q) => sum + q.final_question_score, 0) /
        questionScores.length
      : 0;

  // PRD §8 formula
  const raw = 0.35 * authenticityScore + 0.65 * avgQuestionScore;
  const verified_skill_score = Math.round(Math.max(0, Math.min(100, raw)));

  // Cap flagged repos: strong answers can't fully save a suspected dump
  const flagged_for_review = authenticityScore < 30;

  return {
    verified_skill_score: flagged_for_review
      ? Math.min(verified_skill_score, 40)  // Cap at 40 if flagged
      : verified_skill_score,
    average_question_score: parseFloat(avgQuestionScore.toFixed(2)),
    flagged_for_review,
  };
}

export function buildReport(params: {
  reportId: string;
  repoUrl: string;
  skillArea: SkillArea;
  forensics: GitForensicsResult;
  questions: GeneratedQuestion[];
  questionScores: AnswerScoreResult[];
  appUrl: string;
}): VerifiedSkillReport {
  const { reportId, repoUrl, skillArea, forensics, questions, questionScores, appUrl } = params;

  const { verified_skill_score, average_question_score, flagged_for_review } =
    computeVerifiedSkillScore(forensics, questionScores);

  // Merge scores into questions
  const qWithScores = questions.map((q) => ({
    ...q,
    score: questionScores.find((s) => s.question_id === q.question_id),
  }));

  return {
    report_id:              reportId,
    repo:                   repoUrl,
    skill_area:             skillArea,
    verified_skill_score,
    authenticity_score:     forensics.authenticity_score,
    average_question_score,
    point_score:            0,
    badge:                  null,
    flagged_for_review,
    flags:                  forensics.flags,
    questions:              qWithScores,
    share_url:              `${appUrl}/report/${reportId}`,
    created_at:             new Date().toISOString(),
  };
}
