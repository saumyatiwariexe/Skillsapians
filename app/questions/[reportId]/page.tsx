"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { GeneratedQuestion, AnswerScoreResult, ReportResponse, AnswerResponse } from "@/types";
import { fetchJson } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Loader2, AlertTriangle, Maximize2, ShieldAlert } from "lucide-react";

export default function QuestionsPage() {
  const router    = useRouter();
  const { reportId } = useParams<{ reportId: string }>();

  const [questions,    setQuestions]    = useState<GeneratedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer,       setAnswer]       = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  // Anti-cheat state
  const [started,     setStarted]     = useState(false);
  const [elapsed,     setElapsed]     = useState(0);
  const [tabOuts,     setTabOuts]     = useState(0);
  const [warnOpen,    setWarnOpen]    = useState(false);
  const questionStartRef = useRef<number>(0);

  useEffect(() => {
    if (!reportId) return;
    async function loadReport() {
      const { ok, data, error } = await fetchJson<ReportResponse>(`/api/report/${reportId}`);
      if (!ok || !data?.report) {
        setError(error ?? "Could not load report.");
        setLoading(false);
        return;
      }
      setQuestions(data.report.questions);
      setLoading(false);
    }
    loadReport();
  }, [reportId]);

  // ── Per-question timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (!started) return;
    questionStartRef.current = Date.now();
    setElapsed(0);
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - questionStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [started, currentIndex]);

  // ── Tab-out detection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!started) return;
    function onVisibility() {
      if (document.hidden) {
        setTabOuts((c) => c + 1);
        setWarnOpen(true);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [started]);

  function requestFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => { /* user may dismiss; proceed anyway */ });
    }
  }

  function handleStart() {
    setStarted(true);
    requestFullscreen();
  }

  async function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    const currentQuestion = questions[currentIndex];
    const timeTakenSeconds = Math.floor((Date.now() - questionStartRef.current) / 1000);

    const { ok, data, error } = await fetchJson<AnswerResponse>("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_id: reportId,
        question_id: currentQuestion.question_id,
        answer_text: answer,
        time_taken_seconds: timeTakenSeconds,
        tab_out_count: tabOuts,
      }),
    });

    if (!ok || !data || data.status === "error") {
      setError(error ?? "Failed to submit.");
      setSubmitting(false);
      return;
    }

    setAnswer("");
    setSubmitting(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      router.push(`/report/${reportId}`);
    }
  }

  if (loading) {
    return (
      <main className="w-full flex justify-center pt-24"><Loader2 className="w-8 h-8 animate-spin text-accent-purple" /></main>
    );
  }

  if (error || questions.length === 0) {
    return (
      <main className="w-full max-w-[720px] mx-auto pt-16 text-center">
        <p className="text-accent-red font-body font-medium mb-6">{error || "No questions could be generated."}</p>
        <Button onClick={() => router.push("/verify")}>Try another repo</Button>
      </main>
    );
  }

  const current = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  if (!started) {
    return (
      <main className="w-full max-w-[520px] mx-auto pt-[12vh]">
        <section className="bg-surface border border-subtle rounded-md p-8 text-center">
          <div className="w-14 h-14 bg-accent-purple/15 text-accent-purple rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="font-display font-medium text-xl text-text-primary mb-2">Ready to verify?</h1>
          <p className="font-body text-sm text-text-secondary mb-2">
            You'll enter <strong className="text-text-primary">fullscreen mode</strong> for a proctored verification of {questions.length} questions.
          </p>
          <p className="font-body text-xs text-text-tertiary mb-6">
            Leaving the tab or window is tracked as a warning and may lower your integrity score.
          </p>
          <Button onClick={handleStart} className="w-full">
            <Maximize2 className="w-4 h-4 mr-2" /> Start Verification
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="w-full max-w-[720px] mx-auto pt-8 pb-20">
      {/* Integrity status bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 font-body text-xs text-text-tertiary">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" /> Proctored
        </span>
        <div className="flex items-center gap-4 font-mono text-xs text-text-secondary">
          <span>⏱ {elapsed}s</span>
          <span className={tabOuts > 0 ? "text-accent-orange" : ""}>⚠ Tab-outs: {tabOuts}</span>
        </div>
      </div>

      {/* Header & Progress */}
      <header className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="font-body text-xs font-medium text-text-tertiary uppercase tracking-wider">
            Verification Question
          </span>
          <span className="font-body text-xs text-text-tertiary">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full h-1 bg-subtle rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-purple transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Code Snippet */}
      <section className="mb-8">
        <div className="bg-surface border border-subtle rounded-md overflow-hidden flex flex-col">
          <div className="bg-surface-alt px-4 py-2 border-b border-subtle font-mono text-[11px] text-text-secondary shrink-0">
            {current.file}
          </div>
          <pre className="p-4 overflow-x-auto">
            <code className="font-mono text-[13px] text-text-primary leading-[1.6]">
              {current.code_snippet}
            </code>
          </pre>
        </div>
      </section>

      {/* Question */}
      <section className="mb-8">
        <h1 className="font-body font-medium text-xl text-text-primary mb-2 leading-relaxed">
          {current.question}
        </h1>
        <p className="font-body text-sm text-text-secondary">
          Reference your code above. Be specific about your reasoning.
        </p>
      </section>

      {/* Answer Form */}
      <section>
        <form onSubmit={handleSubmitAnswer} className="flex flex-col gap-4">
          <textarea
            className="w-full bg-surface border border-subtle rounded-md p-4 font-body text-sm text-text-primary focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-canvas transition-all resize-y min-h-[140px] placeholder:text-text-tertiary"
            placeholder="Explain your reasoning — the more specific, the better."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitting}
            required
          />

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={submitting || answer.trim().split(/\s+/).length < 2} 
              className="min-w-[160px]"
            >
              {submitting ? (
                 <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Scoring…</span>
              ) : currentIndex < questions.length - 1 ? (
                "Submit Answer"
              ) : (
                "Submit & See Report"
              )}
            </Button>
          </div>
        </form>
      </section>

      {/* Harsh warning modal for tab-out */}
      {warnOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface border border-accent-red/40 rounded-md p-6 max-w-[400px] text-center">
            <div className="w-12 h-12 bg-accent-red/15 text-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="font-display font-medium text-lg text-text-primary mb-2">Integrity Warning</h2>
            <p className="font-body text-sm text-text-secondary mb-5">
              You left the verification window. This is recorded ({tabOuts} so far) and may reduce your integrity score.
            </p>
            <Button onClick={() => setWarnOpen(false)} className="w-full">I understand — return to verification</Button>
          </div>
        </div>
      )}
    </main>
  );
}
