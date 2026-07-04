"use client";

/**
 * Screen 2 — Analyzing
 *
 * UI SHELL — shows progress states while /api/analyze runs.
 * Navigates to questions screen on success.
 *
 * Progress states (shown in sequence):
 *   1. "Connecting to GitHub..."
 *   2. "Scanning commit history..."
 *   3. "Running git forensics..."
 *   4. "Parsing code structure..."
 *   5. "Generating questions..."
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AnalyzeResponse } from "@/types";

const PROGRESS_STEPS = [
  { id: "step-github",    label: "Connecting to GitHub…"        },
  { id: "step-commits",   label: "Scanning commit history…"     },
  { id: "step-forensics", label: "Running git forensics…"       },
  { id: "step-ast",       label: "Parsing code structure…"      },
  { id: "step-questions", label: "Generating your questions…"   },
];

// Simulate progress for UX — real API is running in background
const STEP_DELAY_MS = 1800;

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

    // Advance the visible progress steps for UX
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < PROGRESS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, STEP_DELAY_MS);

    // Kick off the real API call
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
        // Navigate to question screen
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
      <main id="analyzing-page">
        <section id="error-state">
          <h1>Analysis failed</h1>
          <p id="error-detail">{error}</p>
          <button id="try-again-button" onClick={() => router.push("/")}>
            Try a different repo
          </button>
        </section>
      </main>
    );
  }

  return (
    <main id="analyzing-page">
      <section id="progress-section">
        <h1>Analyzing your repository</h1>
        <p id="repo-label">{repoUrl}</p>

        {/* Progress steps */}
        <ol id="progress-steps">
          {PROGRESS_STEPS.map((step, i) => (
            <li
              key={step.id}
              id={step.id}
              data-state={
                i < currentStep ? "done" : i === currentStep ? "active" : "pending"
              }
            >
              <span className="step-indicator" aria-hidden="true" />
              <span className="step-label">{step.label}</span>
            </li>
          ))}
        </ol>

        <p id="patience-message">This takes 15–30 seconds. Hang tight.</p>
      </section>
    </main>
  );
}
