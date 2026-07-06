"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { HelpCircle } from "lucide-react";

const SUGGESTED_FOCUS: string[] = ["AI", "ML", "React", "Backend", "Overall", "DevOps"];

export default function LandingPage() {
  const router = useRouter();
  const [repoUrl,    setRepoUrl]    = useState("");
  const [skillArea,  setSkillArea]  = useState("Overall");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }
    
    // Basic format check
    if (!repoUrl.includes("github.com/")) {
      setError("That doesn't look like a public GitHub repo link.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      router.push(`/analyzing?repo=${encodeURIComponent(repoUrl)}&skill=${skillArea}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main className="w-full max-w-[480px] mx-auto pt-[10vh]">
      
      <section className="text-center mb-10">
        <h1 className="font-display font-medium text-2xl text-text-primary mb-3">
          Verify a skill from real work you've built.
        </h1>
        <p className="font-body text-sm text-text-secondary leading-relaxed">
          Paste a public GitHub repo. We'll check what you actually built — not what you can memorize.
        </p>
      </section>

      <section className="bg-surface border border-subtle rounded-md p-6">
        <form onSubmit={handleAnalyze} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label htmlFor="repo-url-input" className="font-body text-xs text-text-secondary pl-1">
              GitHub Repository URL
            </label>
            <input
              id="repo-url-input"
              type="url"
              className="w-full bg-canvas border border-subtle rounded-md px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-surface transition-all placeholder:text-text-tertiary"
              placeholder="https://github.com/username/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={loading}
              required
            />
            {error && (
              <p className="text-accent-red font-body text-xs pl-1 mt-1 font-medium">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
             <label htmlFor="skill-area-input" className="font-body text-xs text-text-secondary pl-1">
              Skill Area to Verify
            </label>
            <input
              id="skill-area-input"
              type="text"
              list="skill-area-suggestions"
              className="w-full bg-canvas border border-subtle rounded-md px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-surface transition-all placeholder:text-text-tertiary disabled:opacity-50"
              placeholder="e.g. AI, ML, React, Overall"
              value={skillArea}
              onChange={(e) => setSkillArea(e.target.value)}
              disabled={loading}
            />
            <datalist id="skill-area-suggestions">
              {SUGGESTED_FOCUS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <div className="flex flex-wrap gap-2 pl-1 mt-1">
              {SUGGESTED_FOCUS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSkillArea(s)}
                  disabled={loading}
                  className={`px-2.5 py-1 rounded-full font-body text-[11px] border transition-colors disabled:opacity-50 ${
                    skillArea === s
                      ? "border-accent-purple text-text-primary bg-accent-purple/10"
                      : "border-subtle text-text-tertiary hover:text-text-secondary hover:border-text-tertiary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Starting analysis…" : "Analyze Repo"}
          </Button>

          <div className="flex justify-center mt-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-body text-text-tertiary hover:text-text-secondary transition-colors focus:outline-none focus-visible:underline"
              onClick={() => alert("1. Git Forensics checks your commits.\n2. We parse the code structure.\n3. We ask you questions about your logic.\n\nAll automated, no raw LLM grading.")}
            >
              <HelpCircle size={14} />
              <span>What do we check?</span>
            </button>
          </div>
        </form>
      </section>

    </main>
  );
}
