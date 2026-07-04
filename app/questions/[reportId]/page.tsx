"use client";

/**
 * Screen 3 — Question
 *
 * UI SHELL — one question at a time.
 * Shows: code snippet (from user's own repo) + generated question + text area.
 *
 * Flow:
 *   - Loads questions from /api/report/:id
 *   - Presents them one by one
 *   - POSTs each answer to /api/answer
 *   - After last question → navigate to /report/:id
 */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { GeneratedQuestion, AnswerScoreResult, ReportResponse } from "@/types";

export default function QuestionsPage() {
  const router    = useRouter();
  const { reportId } = useParams<{ reportId: string }>();

  const [questions,    setQuestions]    = useState<GeneratedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer,       setAnswer]       = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [lastScore,    setLastScore]    = useState<AnswerScoreResult | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  // Load report + questions
  useEffect(() => {
    if (!reportId) return;
    async function loadReport() {
      try {
        const res  = await fetch(`/api/report/${reportId}`);
        const data = (await res.json()) as ReportResponse;
        if (!res.ok || !data.report) throw new Error("Could not load report.");
        setQuestions(data.report.questions);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load questions.");
        setLoading(false);
      }
    }
    loadReport();
  }, [reportId]);

  async function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    const currentQuestion = questions[currentIndex];

    try {
      const res  = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id:   reportId,
          question_id: currentQuestion.question_id,
          answer_text: answer,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(data.error ?? "Failed to submit answer.");
      }

      setLastScore(data.score as AnswerScoreResult);

      // Brief score feedback pause, then move on
      setTimeout(() => {
        setLastScore(null);
        setAnswer("");
        setSubmitting(false);

        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          // All done → report
          router.push(`/report/${reportId}`);
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error submitting answer.");
      setSubmitting(false);
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main id="questions-page">
        <div id="loading-state">Loading your questions…</div>
      </main>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <main id="questions-page">
        <div id="error-state" role="alert">
          <p>{error}</p>
          <button id="back-home-button" onClick={() => router.push("/")}>
            Back to home
          </button>
        </div>
      </main>
    );
  }

  // ── No questions ───────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <main id="questions-page">
        <div id="no-questions-state">
          <p>No questions could be generated for this repo.</p>
          <button id="back-home-button" onClick={() => router.push("/")}>
            Try another repo
          </button>
        </div>
      </main>
    );
  }

  const current = questions[currentIndex];

  return (
    <main id="questions-page">
      {/* ── Progress indicator ──────────────────────────────────────────────── */}
      <header id="questions-header">
        <span id="progress-indicator">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div id="progress-bar-track">
          <div
            id="progress-bar-fill"
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* ── Code snippet ────────────────────────────────────────────────────── */}
      <section id="code-section">
        <div id="code-file-path">{current.file}</div>
        <pre id="code-snippet">
          <code>{current.code_snippet}</code>
        </pre>
      </section>

      {/* ── Question ────────────────────────────────────────────────────────── */}
      <section id="question-section">
        <h1 id="question-text">{current.question}</h1>
        <p id="question-hint">
          Reference your own code above. We're testing understanding, not memory.
        </p>
      </section>

      {/* ── Answer form ─────────────────────────────────────────────────────── */}
      <section id="answer-section">
        <form id="answer-form" onSubmit={handleSubmitAnswer}>
          <label htmlFor="answer-textarea">Your answer</label>
          <textarea
            id="answer-textarea"
            placeholder="Explain in your own words…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitting}
            rows={6}
            required
          />

          {/* Inline score feedback */}
          {lastScore && (
            <div id="score-feedback" role="status">
              Answer scored: {Math.round(lastScore.final_question_score)}/100
              {lastScore.ai_generated_flag && (
                <span id="ai-flag-warning"> ⚠ Possible AI-assisted answer detected</span>
              )}
            </div>
          )}

          <button
            id="submit-answer-button"
            type="submit"
            disabled={submitting || !answer.trim()}
          >
            {submitting
              ? "Scoring…"
              : currentIndex < questions.length - 1
              ? "Submit & Next →"
              : "Submit & See Results →"}
          </button>
        </form>
      </section>
    </main>
  );
}
