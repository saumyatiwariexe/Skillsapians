"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ReportResponse, VerifiedSkillReport, ForensicFlag } from "@/types";
import { StatusChip, type StatusVariant } from "@/components/ui/StatusChip";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Check, ChevronDown, ChevronUp, ExternalLink, ShieldCheck, FileSearch, Code2, AlertTriangle } from "lucide-react";

function getStatusBadgeParams(report: VerifiedSkillReport): { variant: StatusVariant; label: string } {
  if (report.flagged_for_review) return { variant: "flagged", label: "Flagged for Review" };
  if (report.verified_skill_score >= 85) return { variant: "verified", label: "Verified • Excellent" };
  if (report.verified_skill_score >= 65) return { variant: "good", label: "Verified • Good" };
  if (report.verified_skill_score >= 40) return { variant: "fair", label: "Fair" };
  return { variant: "flagged", label: "Needs Review" };
}

function getScoreBandLabel(score: number): { label: string; class: string } {
  if (score >= 85) return { label: "Strong match", class: "text-accent-green" };
  if (score >= 65) return { label: "Partial match", class: "text-accent-blue" };
  return { label: "Limited match", class: "text-accent-yellow" };
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [report,   setReport]   = useState<VerifiedSkillReport | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [copied,   setCopied]   = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

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
    if (!report?.share_url) return;
    try {
      await navigator.clipboard.writeText(report.share_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  if (loading) return <main className="w-full h-[50vh] flex items-center justify-center text-text-tertiary">Loading report…</main>;
  if (error || !report) return <main className="w-full text-center text-accent-red mt-24">{error || "Not found"}</main>;

  const badgeProps = getStatusBadgeParams(report);
  const activeFlags = report.flags.filter((f) => f.severity !== "none");

  return (
    <main className="w-full max-w-[840px] mx-auto pb-24">
      
      {/* Header */}
      <header className="flex flex-col items-center text-center mb-12">
        <a 
          href={`https://${report.repo}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-body text-sm text-text-secondary hover:text-text-primary transition-colors mb-2 group"
        >
          {report.repo}
          <ExternalLink className="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-primary transition-colors" />
        </a>
        <h1 className="font-display font-medium text-2xl text-text-primary mb-8">
          Verification Report
        </h1>

        <div className="flex flex-col items-center">
          <span className="font-display font-bold text-[72px] leading-none text-text-primary tracking-tight mb-4">
            {report.verified_skill_score}
          </span>
          <StatusChip variant={badgeProps.variant} label={badgeProps.label} className="scale-110 mb-4" />
          <p className="font-body text-sm text-text-secondary mt-2">
            Skill Area: <strong className="text-text-primary ml-1 capitalize">{report.skill_area}</strong>
          </p>
        </div>
      </header>

      {/* Flagged Banner */}
      {report.flagged_for_review && (
        <section className="bg-accent-red/10 border border-accent-red/30 rounded-md p-5 mb-8 flex gap-4">
          <AlertTriangle className="w-5 h-5 text-accent-red shrink-0 translate-y-0.5" />
          <div>
            <h3 className="font-body font-semibold text-accent-red text-sm mb-1">Flagged for Review</h3>
            <p className="font-body text-sm text-text-primary/90 leading-relaxed">
              The authenticity score for this repository is very low. The verified score has been capped because the commit history shows patterns inconsistent with organic development.
            </p>
          </div>
        </section>
      )}

      {/* Sub-Scores Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <StatCard 
          title="Authencity" 
          value={`${report.authenticity_score}/100`} 
          description="Based on your commit history"
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <StatCard 
          title="Understanding" 
          value={`${report.average_question_score.toFixed(0)}/100`} 
          description="Average score of your explanations"
          icon={<FileSearch className="w-4 h-4" />}
        />
        <StatCard 
          title="Alignment" 
          value={`${report.verified_skill_score}/100`} 
          description="Overall semantic alignment"
          icon={<Code2 className="w-4 h-4" />}
        />
      </section>

      {/* Forensic Flags */}
      <section className="mb-12">
        <h2 className="font-display font-medium text-[15px] text-text-primary mb-4 pb-2 border-b border-subtle">
          What we checked in your commit history
        </h2>
        {activeFlags.length === 0 ? (
          <div className="flex items-center gap-3 text-text-secondary font-body text-sm bg-surface p-4 rounded-md border border-subtle">
            <Check className="w-4 h-4 text-accent-green" />
            No red flags found in your commit history.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {activeFlags.map((flag, idx) => (
              <li key={idx} className="flex gap-4 p-4 rounded-md bg-surface border border-subtle relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${flag.severity === 'high' ? 'bg-accent-red' : flag.severity === 'medium' ? 'bg-accent-orange' : 'bg-accent-yellow'}`} />
                <AlertTriangle className={`w-4 h-4 shrink-0 translate-y-0.5 ${flag.severity === 'high' ? 'text-accent-red' : flag.severity === 'medium' ? 'text-accent-orange' : 'text-accent-yellow'}`} />
                <div>
                  <p className="font-body text-sm text-text-primary leading-relaxed">{flag.note}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Question Breakdown */}
      <section className="mb-12">
        <h2 className="font-display font-medium text-[15px] text-text-primary mb-4 pb-2 border-b border-subtle">
          How you answered
        </h2>
        <ul className="flex flex-col gap-3">
          {report.questions.map((q, i) => {
            const isExpanded = expandedQ === q.question_id;
            const scoreNum = Math.round(q.score?.final_question_score ?? 0);
            const band = getScoreBandLabel(scoreNum);

            return (
              <li key={q.question_id} className="bg-surface border border-subtle rounded-md overflow-hidden transition-colors">
                <button 
                  onClick={() => setExpandedQ(isExpanded ? null : q.question_id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-alt transition-colors focus:outline-none focus-visible:bg-surface-alt"
                >
                  <span className="font-body text-xs font-semibold text-text-tertiary shrink-0 w-6">Q{i+1}</span>
                  <span className="font-body text-sm text-text-primary truncate flex-1 leading-normal">{q.question}</span>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-body text-xs font-medium text-text-secondary">{scoreNum}/100</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-text-tertiary" /> : <ChevronDown className="w-4 h-4 text-text-tertiary" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-subtle bg-surface/50">
                    <div className="mt-4 mb-4">
                      <div className="bg-surface-alt px-3 py-1.5 border border-subtle border-b-0 rounded-t-md font-mono text-[10px] text-text-tertiary inline-block">
                        {q.file}
                      </div>
                      <pre className="p-3 bg-canvas border border-subtle rounded-md rounded-tl-none overflow-x-auto">
                        <code className="font-mono text-[12px] text-text-secondary leading-relaxed">{q.code_snippet}</code>
                      </pre>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-body text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Your Answer</h4>
                      <div className="bg-canvas/50 border border-subtle/50 rounded-md p-3 font-body text-[13px] text-text-primary leading-relaxed whitespace-pre-wrap">
                        {q.score?.user_answer || "No answer provided"}
                      </div>
                    </div>

                    {q.score && (
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                        <span className="font-body text-xs text-text-secondary">
                          Match: <strong className={band.class}>{band.label}</strong>
                        </span>
                        {q.score.ai_generated_flag && (
                          <span className="font-body text-xs font-medium text-accent-red flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Possible AI-assisted answer
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Actions */}
      <section className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-8 border-t border-subtle">
        <Button onClick={handleCopyLink} className="w-full sm:w-auto">
          {copied ? "Copied to clipboard!" : "Copy Share Link"}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/")} className="w-full sm:w-auto">
          Analyze another repo
        </Button>
      </section>

    </main>
  );
}
