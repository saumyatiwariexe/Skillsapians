"use client";

/**
 * Screen 4 — Verified Skill Report
 *
 * UI SHELL — big score, breakdown by module, per-question
 * expandable detail, flags, and share/copy link.
 *
 * This is the moment judges see in the demo.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ReportResponse, VerifiedSkillReport, ForensicFlag } from "@/types";

function severityColor(severity: ForensicFlag["severity"]): string {
  const map: Record<ForensicFlag["severity"], string> = {
    high:   "flag-high",
    medium: "flag-medium",
    low:    "flag-low",
    none:   "flag-none",
  };
  return map[severity];
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();

  const [report,   setReport]   = useState<VerifiedSkillReport | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [copied,   setCopied]   = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadReport() {
      try {
        const res  = await fetch(`/api/report/${id}`);
        const data = (await res.json()) as ReportResponse;
        if (!res.ok || !data.report) throw new Error("Report not found.");
        setReport(data.report);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report.");
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  async function handleCopyLink() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report.share_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback — select the URL field
    }
  }

  if (loading) {
    return (
      <main id="report-page">
        <div id="loading-state">Loading your Verified Skill Report…</div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main id="report-page">
        <div id="error-state" role="alert">
          <p>{error ?? "Report not found."}</p>
        </div>
      </main>
    );
  }

  const activeFlags = report.flags.filter((f) => f.severity !== "none");

  return (
    <main id="report-page">
      {/* ── Report header ────────────────────────────────────────────────────── */}
      <header id="report-header">
        <h1>Verified Skill Report</h1>
        <p id="report-repo">{report.repo}</p>
        <span id="report-skill-area">{report.skill_area}</span>
      </header>

      {/* ── Flagged-for-review banner ─────────────────────────────────────────── */}
      {report.flagged_for_review && (
        <section id="flagged-banner" role="alert">
          <strong>⚠ Flagged for Review</strong>
          <p>
            The authenticity score for this repository is very low. This report
            has been capped — the commit history shows patterns inconsistent
            with organic development.
          </p>
        </section>
      )}

      {/* ── Score scorecard ──────────────────────────────────────────────────── */}
      <section id="scorecard">
        {/* Verified Skill Score — the big number */}
        <div id="verified-score-block">
          <span id="verified-score-label">Verified Skill Score</span>
          <span id="verified-score-value">
            {report.verified_skill_score}
            <span id="score-suffix">/100</span>
          </span>
          <span id="skill-area-label">{report.skill_area}</span>
        </div>

        {/* Module breakdown */}
        <div id="score-breakdown">
          <div id="authenticity-score-block" className="score-module">
            <span className="module-label">Git Authenticity</span>
            <span className="module-score">{report.authenticity_score}/100</span>
            <span className="module-weight">35% weight</span>
          </div>
          <div id="understanding-score-block" className="score-module">
            <span className="module-label">Code Understanding</span>
            <span className="module-score">{report.average_question_score.toFixed(0)}/100</span>
            <span className="module-weight">65% weight</span>
          </div>
        </div>
      </section>

      {/* ── Forensic flags ───────────────────────────────────────────────────── */}
      {activeFlags.length > 0 && (
        <section id="flags-section">
          <h2>Forensic Signals</h2>
          <ul id="flags-list">
            {activeFlags.map((flag) => (
              <li
                key={flag.signal}
                id={`flag-${flag.signal}`}
                className={`flag-item ${severityColor(flag.severity)}`}
              >
                <span className="flag-signal">{flag.signal.replace(/_/g, " ")}</span>
                <span className="flag-value">
                  {String(flag.value)}
                  {flag.unit ? ` ${flag.unit}` : ""}
                </span>
                {flag.note && <p className="flag-note">{flag.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Per-question breakdown ────────────────────────────────────────────── */}
      <section id="questions-section">
        <h2>Question Breakdown</h2>
        <ul id="questions-list">
          {report.questions.map((q, i) => (
            <li key={q.question_id} id={`question-item-${q.question_id}`}>
              <button
                id={`question-toggle-${q.question_id}`}
                onClick={() =>
                  setExpanded(expanded === q.question_id ? null : q.question_id)
                }
              >
                <span className="question-number">Q{i + 1}</span>
                <span className="question-preview">{q.question.slice(0, 80)}…</span>
                {q.score && (
                  <span className="question-score">
                    {Math.round(q.score.final_question_score)}/100
                  </span>
                )}
              </button>

              {expanded === q.question_id && (
                <div id={`question-detail-${q.question_id}`} className="question-detail">
                  <div className="question-file">{q.file}</div>
                  <pre className="question-code"><code>{q.code_snippet}</code></pre>
                  <p className="question-text">{q.question}</p>

                  {q.score && (
                    <div className="question-scores-detail">
                      <span>Semantic similarity: {(q.score.semantic_similarity * 100).toFixed(0)}%</span>
                      <span>Entity overlap: {(q.score.entity_overlap * 100).toFixed(0)}%</span>
                      <span>Answer specificity: {(q.score.specificity_score * 100).toFixed(0)}%</span>
                      {q.score.ai_generated_flag && (
                        <span id={`ai-flag-${q.question_id}`} className="ai-flag">
                          ⚠ Possible AI-assisted answer
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Share section ──────────────────────────────────────────────────────── */}
      <section id="share-section">
        <h2>Share this report</h2>
        <div id="share-url-field">
          <input
            id="share-url-input"
            type="text"
            value={report.share_url}
            readOnly
          />
          <button id="copy-link-button" onClick={handleCopyLink}>
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </section>

      {/* ── Verified badge ─────────────────────────────────────────────────────── */}
      <section id="badge-section">
        <div id="verified-badge">
          <span id="badge-label">Verified Skill Badge</span>
          <span id="badge-score">{report.verified_skill_score}/100</span>
          <span id="badge-skill">{report.skill_area}</span>
          <span id="badge-repo">{report.repo}</span>
        </div>
      </section>
    </main>
  );
}
