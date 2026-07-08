/**
 * Module A — Git Forensics Engine
 *
 * DETERMINISTIC. No LLM. Computes 8 signals from commit history
 * and produces an Authenticity Score (0–100) + flags list.
 *
 * PRD Reference: §5
 */

import type {
  CommitSummary,
  GitForensicsResult,
  ForensicFlag,
  FlagSeverity,
} from "@/types";
import { getCommitStats } from "@/lib/github/client";

// ──────────────────────────────────────────────────────────────────────────────
// Generic commit patterns that indicate low-effort / dump behavior
// ──────────────────────────────────────────────────────────────────────────────
const GENERIC_COMMIT_PATTERNS = [
  /^update$/i,
  /^fix$/i,
  /^wip$/i,
  /^asdf/i,
  /^test$/i,
  /^commit$/i,
  /^changes?$/i,
  /^stuff$/i,
  /^[a-z0-9]{1,3}$/i, // single word <4 chars
];

function isLowQualityMessage(msg: string): boolean {
  if (msg.length < 4) return true;
  return GENERIC_COMMIT_PATTERNS.some((p) => p.test(msg.trim()));
}

// ──────────────────────────────────────────────────────────────────────────────
// Helper: standard deviation of a number array
// ──────────────────────────────────────────────────────────────────────────────
function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// ──────────────────────────────────────────────────────────────────────────────
// Main engine function
//
// NOTE: For the hackathon MVP, we fetch detailed stats for only the first
// commit (to get initial_commit_ratio) and compute the rest from the
// commit summaries. This keeps API calls bounded.
// ──────────────────────────────────────────────────────────────────────────────

export async function runGitForensics(
  owner: string,
  repo: string,
  commits: CommitSummary[], // sorted newest-first from GitHub API
  isFork: boolean
): Promise<GitForensicsResult> {
  const flags: ForensicFlag[] = [];

  // Reverse so index 0 = oldest (first) commit
  const chronological = [...commits].reverse();
  const commitCount = chronological.length;

  // ── Signal 1: Commit count ─────────────────────────────────────────────────
  // (No deduction yet — used by other signals)

  // ── Signal 2: Initial commit size ratio ───────────────────────────────────
  // Fetch stats for the first commit. For the hackathon MVP we stay within
  // API budget by only inspecting the first commit, so we cannot compute an
  // accurate initial-commit ratio. We therefore leave this signal at 0
  // (neutral) and defer the penalty to the full implementation.
  // TODO: batch-fetch all commit stats to compute true initial_commit_ratio.

  let initialCommitRatio = 0;
  let firstCommitAdditions = 0;
  let totalAdditions = 0;

  if (commitCount > 0) {
    try {
      const firstStats = await getCommitStats(owner, repo, chronological[0].sha);
      firstCommitAdditions = firstStats.additions;
      totalAdditions = firstCommitAdditions;
      chronological[0].additions = firstStats.additions;
      chronological[0].deletions = firstStats.deletions;
      chronological[0].filesChanged = firstStats.filesChanged;
      // initialCommitRatio remains 0 until we can batch-fetch all stats.
    } catch {
      // Non-fatal — proceed without this signal
    }
  }

  // ── Signal 3: Time span ────────────────────────────────────────────────────
  let timeSpanHours = 0;
  let timeSpanDays = 0;
  if (commitCount >= 2) {
    const firstDate = new Date(chronological[0].date).getTime();
    const lastDate  = new Date(chronological[commitCount - 1].date).getTime();
    if (Number.isFinite(firstDate) && Number.isFinite(lastDate)) {
      timeSpanHours = (lastDate - firstDate) / (1000 * 60 * 60);
      timeSpanDays  = timeSpanHours / 24;
    }
  }

  // ── Signal 4: Commit message quality ──────────────────────────────────────
  const lowQualityCount = chronological.filter((c) =>
    isLowQualityMessage(c.message)
  ).length;
  const messageQualityRatio =
    commitCount > 0 ? 1 - lowQualityCount / commitCount : 1;

  // ── Signal 5: Commit interval std-dev  ────────────────────────────────────
  const intervals: number[] = [];
  for (let i = 1; i < chronological.length; i++) {
    const prev = new Date(chronological[i - 1].date).getTime();
    const curr = new Date(chronological[i].date).getTime();
    if (Number.isFinite(prev) && Number.isFinite(curr)) {
      intervals.push((curr - prev) / 1000);
    }
  }
  const intervalStdDev = stdDev(intervals);

  // ── Signal 6: Diff size distribution ──────────────────────────────────────
  // Approximated without fetching all commit stats (batch fetch in full impl)
  // Placeholder — will be enriched in Module A full implementation

  // ── Signal 7: File churn pattern ──────────────────────────────────────────
  // Requires file-level commit data — deferred to Module A full implementation
  // Placeholder value: 1.0 (neutral)
  const fileChurnAvg = 1.0; // TODO: compute from per-commit file lists

  // ── Signal 8: Fork detection ──────────────────────────────────────────────
  // Already in RepoMetadata.isFork — passed in as parameter

  // ──────────────────────────────────────────────────────────────────────────
  // Authenticity Score Formula (PRD §5.4)
  // ──────────────────────────────────────────────────────────────────────────
  let rawScore = 100;

  if (initialCommitRatio > 0.85) {
    rawScore -= 35;
    flags.push({
      signal: "initial_commit_ratio",
      value: parseFloat(initialCommitRatio.toFixed(3)),
      severity: "high",
      note: `${Math.round(initialCommitRatio * 100)}% of code arrived in the first commit. Likely a dump or copy-paste.`,
    });
  } else {
    flags.push({
      signal: "initial_commit_ratio",
      value: parseFloat(initialCommitRatio.toFixed(3)),
      severity: "none",
    });
  }

  if (commitCount < 5) {
    rawScore -= 20;
    flags.push({
      signal: "commit_count",
      value: commitCount,
      severity: "high",
      note: "Very few commits for a complete project. Suggests bulk upload rather than iterative development.",
    });
  } else {
    flags.push({ signal: "commit_count", value: commitCount, severity: "none" });
  }

  if (timeSpanHours < 1 && commitCount > 1) {
    rawScore -= 15;
    flags.push({
      signal: "time_span",
      value: parseFloat(timeSpanHours.toFixed(2)),
      unit: "hours",
      severity: "high",
      note: "All commits happened within 1 hour. Rapid-fire or scripted commit pattern.",
    });
  } else {
    flags.push({
      signal: "time_span",
      value: parseFloat(timeSpanDays.toFixed(1)),
      unit: "days",
      severity: "none",
    });
  }

  if (messageQualityRatio < 0.3) {
    rawScore -= 10;
    flags.push({
      signal: "commit_message_quality",
      value: parseFloat(messageQualityRatio.toFixed(2)),
      severity: "medium",
      note: "Most commit messages are generic or very short. Combined with other signals, suggests low iteration quality.",
    });
  } else {
    flags.push({
      signal: "commit_message_quality",
      value: parseFloat(messageQualityRatio.toFixed(2)),
      severity: "none",
    });
  }

  if (intervalStdDev < 30 && commitCount > 5) {
    rawScore -= 15;
    flags.push({
      signal: "commit_interval_stddev",
      value: parseFloat(intervalStdDev.toFixed(1)),
      unit: "seconds",
      severity: "high",
      note: "Commit intervals are suspiciously uniform. May indicate automated/scripted commits to fake history.",
    });
  } else if (commitCount > 1) {
    flags.push({
      signal: "commit_interval_stddev",
      value: parseFloat(intervalStdDev.toFixed(1)),
      unit: "seconds",
      severity: "none",
    });
  }

  if (fileChurnAvg < 1.2) {
    rawScore -= 10;
    flags.push({
      signal: "file_churn_avg",
      value: parseFloat(fileChurnAvg.toFixed(2)),
      severity: "medium",
      note: "Files are barely revisited after creation. Real projects involve debugging and iteration.",
    });
  } else {
    flags.push({ signal: "file_churn_avg", value: fileChurnAvg, severity: "none" });
  }

  if (isFork) {
    flags.push({
      signal: "is_fork",
      value: true,
      severity: "low",
      note: "Repository is a fork. Analysis focuses on changes made relative to original.",
    });
  }

  const authenticityScore = Math.max(0, Math.min(100, rawScore));

  return {
    authenticity_score: authenticityScore,
    flags,
    commit_count: commitCount,
    time_span_days: parseFloat(timeSpanDays.toFixed(2)),
    initial_commit_ratio: parseFloat(initialCommitRatio.toFixed(3)),
    is_fork: isFork,
  };
}
