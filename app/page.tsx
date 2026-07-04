"use client";

/**
 * Screen 1 — Landing / Input
 *
 * UI SHELL — layout and state wiring only. No design applied yet.
 * User's design spec will fill in styles.
 *
 * State:
 *   repoUrl    — controlled input value
 *   skillArea  — selected skill area
 *   error      — validation/API error message
 *   loading    — analysis in progress
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SkillArea, AnalyzeResponse } from "@/types";

const SKILL_AREAS: { value: SkillArea; label: string }[] = [
  { value: "frontend",  label: "Frontend"   },
  { value: "backend",   label: "Backend"    },
  { value: "fullstack", label: "Full-Stack"  },
  { value: "data",      label: "Data / ML"  },
];

export default function LandingPage() {
  const router = useRouter();
  const [repoUrl,    setRepoUrl]    = useState("");
  const [skillArea,  setSkillArea]  = useState<SkillArea>("fullstack");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Navigate to analyzing screen first — then kick off the API call there
      router.push(
        `/analyzing?repo=${encodeURIComponent(repoUrl)}&skill=${skillArea}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main id="landing-page">
      {/* ── Hero copy ─────────────────────────────────────────────────────── */}
      <section id="hero-section">
        <h1>Prove what you actually built.</h1>
        <p>
          Skillsapians verifies your skills from the GitHub repo you already
          shipped — not a synthetic test. Paste a repo, answer a few questions
          about your own code, get a shareable Verified Skill badge.
        </p>
      </section>

      {/* ── Input form ────────────────────────────────────────────────────── */}
      <section id="input-section">
        <form id="analyze-form" onSubmit={handleAnalyze}>
          {/* Repo URL */}
          <div id="repo-url-field">
            <label htmlFor="repo-url-input">GitHub Repository URL</label>
            <input
              id="repo-url-input"
              type="url"
              placeholder="https://github.com/your-username/your-project"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Skill area selector */}
          <div id="skill-area-field">
            <label htmlFor="skill-area-select">Skill Area to Verify</label>
            <select
              id="skill-area-select"
              value={skillArea}
              onChange={(e) => setSkillArea(e.target.value as SkillArea)}
              disabled={loading}
            >
              {SKILL_AREAS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div id="error-message" role="alert">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="analyze-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Starting analysis…" : "Analyze My Repo →"}
          </button>
        </form>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how-it-works">
        <h2>How it works</h2>
        <ol>
          <li id="step-forensics">
            <strong>Git Forensics</strong>
            <span>We analyze your commit history to confirm you actually built this — not dumped generated code.</span>
          </li>
          <li id="step-questions">
            <strong>Code Questions</strong>
            <span>We parse your repo's AST and generate questions about specific decisions in your actual code — not generic trivia.</span>
          </li>
          <li id="step-score">
            <strong>Verified Score</strong>
            <span>Your answers are scored against what your code actually does using embedding similarity — not an AI's opinion.</span>
          </li>
        </ol>
      </section>
    </main>
  );
}
