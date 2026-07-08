"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AnalyzeResponse, RepoMetadataResponse } from "@/types";
import { fetchJson } from "@/lib/api";
import { Loader2, Check, GitBranch, Code2, Clock, Boxes, Languages } from "lucide-react";
import { Button } from "@/components/ui/Button";
import MinecraftTerrainCanvas from "@/components/processing/MinecraftTerrainCanvas";
import TipsPanel from "@/components/processing/TipsPanel";

interface RepoStat {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
}

function AnalyzingPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const repoUrl  = searchParams.get("repo")  ?? "";
  const skillArea = searchParams.get("skill") ?? "Overall";

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError]             = useState<string | null>(null);
  const [stats, setStats]             = useState<RepoStat[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [terrainProgress, setTerrainProgress] = useState(0);
  const isAnalyzingRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!repoUrl) {
      router.replace("/");
      return;
    }

    isAnalyzingRef.current = true;
    setTerrainProgress(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < PROGRESS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, STEP_DELAY_MS);

    progressIntervalRef.current = setInterval(() => {
      setTerrainProgress((prev) => {
        const next = prev + 0.01;
        if (next >= 0.95) return 0.95;
        return next;
      });
    }, 100);

    fetchJson<RepoMetadataResponse>(`/api/repo-metadata?repo=${encodeURIComponent(repoUrl)}`)
      .then(({ ok, data }) => {
        if (ok && data?.status === "ready" && data.metadata) {
          const m = data.metadata;
          const topLangs = m.languages.slice(0, 3).map((l) => l.name).join(", ");
          const built: RepoStat[] = [
            { id: "owner",   label: "Owner",      value: m.owner,                       icon: <GitBranch className="w-4 h-4" /> },
            { id: "repo",    label: "Repository", value: m.repo,                        icon: <Boxes className="w-4 h-4" /> },
            { id: "lang",    label: "Top languages", value: topLangs || m.language || "—", icon: <Languages className="w-4 h-4" /> },
            { id: "size",    label: "Size",       value: `${m.size.toLocaleString()} KB`, icon: <Code2 className="w-4 h-4" /> },
            { id: "fork",    label: "Fork",       value: m.isFork ? "Yes" : "No",        icon: <Code2 className="w-4 h-4" /> },
            { id: "created", label: "Created",    value: new Date(m.createdAt).toLocaleDateString(), icon: <Clock className="w-4 h-4" /> },
          ];
          setStats(built);
        }
      })
      .catch(() => { /* non-fatal — analysis continues */ });

    async function runAnalysis() {
      const { ok, data, error } = await fetchJson<AnalyzeResponse>("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl, skill_area: skillArea }),
      });

      if (!ok || !data || data.status === "error") {
        clearInterval(stepInterval);
        setTerrainProgress(0);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setError(error ?? "Analysis failed. Please try again.");
        return;
      }

      clearInterval(stepInterval);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setTerrainProgress(1);
      setTimeout(() => router.replace(`/questions/${data.report_id}`), 400);
    }

    runAnalysis();
    return () => {
      clearInterval(stepInterval);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      isAnalyzingRef.current = false;
    };
  }, [repoUrl, skillArea, router]);

  // Reveal stats one-by-one for the vertical downward line effect
  useEffect(() => {
    if (stats.length === 0) return;
    if (revealedCount >= stats.length) return;
    const t = setTimeout(() => setRevealedCount((c) => c + 1), 350);
    return () => clearTimeout(t);
  }, [stats, revealedCount]);

  if (error) {
    return (
      <main className="w-full max-w-[480px] mx-auto pt-[10vh]">
        <section className="bg-surface border border-subtle rounded-md p-8 text-center">
          <div className="w-12 h-12 bg-accent-red/15 text-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </div>
          <h1 className="font-display font-medium text-xl text-text-primary mb-2">Analysis failed</h1>
          <p className="font-body text-sm text-text-secondary mb-8">{error}</p>
          <Button onClick={() => router.push("/verify")} className="w-full">
            Try a different repo
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="w-full max-w-[980px] mx-auto pt-[6vh] px-4">
      <div className="flex flex-col md:flex-row gap-5">
        <TipsPanel />

        <div className="flex-1 min-w-0">
          <section className="bg-surface border border-subtle rounded-md overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h1 className="font-display font-medium text-xl text-text-primary mb-1">Analyzing your repo…</h1>
                <p className="font-body text-xs text-text-tertiary truncate">{repoUrl}</p>
              </div>

              {/* Vertical downward line: repo stats appear step-by-step */}
              {stats.length > 0 && (
                <div className="relative pl-6 mb-8">
                  <span className="absolute left-[7px] top-2 bottom-2 w-px bg-subtle" />
                  {stats.slice(0, revealedCount).map((s, i) => (
                    <div
                      key={s.id}
                      className="relative flex items-center gap-3 mb-3 animate-[fadeIn_0.3s_ease-out]"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span className="absolute -left-[23px] w-3.5 h-3.5 rounded-full bg-accent-blue border-2 border-surface" />
                      <span className="text-accent-blue">{s.icon}</span>
                      <span className="font-body text-xs text-text-tertiary w-28 shrink-0">{s.label}</span>
                      <span className="font-body text-sm text-text-primary truncate">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <ul className="flex flex-col gap-6">
                {PROGRESS_STEPS.map((step, i) => {
                  const isDone = i < currentStep;
                  const isActive = i === currentStep;
                  const isPending = i > currentStep;
                  
                  return (
                    <li key={step.id} className="flex items-center gap-4">
                      <div className="shrink-0 flex items-center justify-center w-6 h-6">
                        {isDone && <Check className="text-accent-green w-5 h-5" />}
                        {isActive && <Loader2 className="text-accent-blue w-5 h-5 animate-spin" />}
                        {isPending && <span className="w-2 h-2 rounded-full bg-border-subtle" />}
                      </div>
                      <span className={`font-body text-sm transition-colors duration-300 ${isDone ? "text-text-primary" : isActive ? "text-text-primary font-medium" : "text-text-tertiary"}`}>
                        {step.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-subtle">
              <MinecraftTerrainCanvas
                stage={currentStep === 1 ? "generating" : currentStep > 1 ? "complete" : "idle"}
                progress={terrainProgress}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const PROGRESS_STEPS = [
  { id: "step-ast",       label: "Reading your code structure"      },
  { id: "step-questions", label: "Preparing your verification questions" },
];

const STEP_DELAY_MS = 3000;

export default function AnalyzingPageDefault() {
  return (
    <Suspense fallback={null}>
      <AnalyzingPage />
    </Suspense>
  );
}
