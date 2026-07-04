"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AnalyzeResponse } from "@/types";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const PROGRESS_STEPS = [
  { id: "step-commits",   label: "Checking commit history"     },
  { id: "step-ast",       label: "Reading your code structure"      },
  { id: "step-questions", label: "Preparing questions"   },
];

const STEP_DELAY_MS = 2500;

export default function AnalyzingPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const repoUrl  = searchParams.get("repo")  ?? "";
  const skillArea = searchParams.get("skill") ?? "fullstack";

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (!repoUrl) {
      router.replace("/");
      return;
    }

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < PROGRESS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, STEP_DELAY_MS);

    async function runAnalysis() {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repo_url: repoUrl, skill_area: skillArea }),
        });

        const data = (await res.json()) as AnalyzeResponse;

        if (!res.ok || data.status === "error") {
          throw new Error(data.error ?? "Analysis failed. Please try again.");
        }

        clearInterval(stepInterval);
        router.replace(`/questions/${data.report_id}`);
      } catch (err) {
        clearInterval(stepInterval);
        setError(err instanceof Error ? err.message : "Unknown error occurred.");
      }
    }

    runAnalysis();
    return () => clearInterval(stepInterval);
  }, [repoUrl, skillArea, router]);

  if (error) {
    return (
      <main className="w-full max-w-[480px] mx-auto pt-[10vh]">
        <section className="bg-surface border border-subtle rounded-md p-8 text-center">
          <div className="w-12 h-12 bg-accent-red/15 text-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </div>
          <h1 className="font-display font-medium text-xl text-text-primary mb-2">Analysis failed</h1>
          <p className="font-body text-sm text-text-secondary mb-8">{error}</p>
          <Button onClick={() => router.push("/")} className="w-full">
            Try a different repo
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="w-full max-w-[480px] mx-auto pt-[10vh]">
      <section className="bg-surface border border-subtle rounded-md p-8">
        <div className="mb-8">
          <h1 className="font-display font-medium text-xl text-text-primary mb-1">Analyzing your repo…</h1>
          <p className="font-body text-xs text-text-tertiary truncate">{repoUrl}</p>
        </div>

        <ul className="flex flex-col gap-6 mb-8">
          {PROGRESS_STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            const isPending = i > currentStep;
            
            return (
              <li key={step.id} className="flex items-center gap-4">
                <div className="shrink-0 flex items-center justify-center w-6 h-6">
                  {isDone && <CheckCircle2 className="text-accent-green w-5 h-5" />}
                  {isActive && <Loader2 className="text-accent-purple w-5 h-5 animate-spin" />}
                  {isPending && <Circle className="text-border-subtle w-5 h-5" />}
                </div>
                <span className={`font-body text-sm transition-colors duration-300 ${isDone ? "text-text-primary" : isActive ? "text-text-primary font-medium" : "text-text-tertiary"}`}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>

      </section>
    </main>
  );
}
