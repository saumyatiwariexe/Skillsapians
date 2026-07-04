"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { GeneratedQuestion, AnswerScoreResult, ReportResponse } from "@/types";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

export default function QuestionsPage() {
  const router    = useRouter();
  const { reportId } = useParams<{ reportId: string }>();

  const [questions,    setQuestions]    = useState<GeneratedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer,       setAnswer]       = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

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
        body: JSON.stringify({ report_id: reportId, question_id: currentQuestion.question_id, answer_text: answer }),
      });
      const data = await res.json();

      if (!res.ok || data.status === "error") throw new Error(data.error ?? "Failed to submit.");

      setAnswer("");
      setSubmitting(false);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        router.push(`/report/${reportId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error submitting answer.");
      setSubmitting(false);
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
        <Button onClick={() => router.push("/")}>Try another repo</Button>
      </main>
    );
  }

  const current = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  return (
    <main className="w-full max-w-[720px] mx-auto pt-8 pb-20">
      
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
      
    </main>
  );
}
