"use client";

import { useScrollReveal } from "./useScrollReveal";

export default function ExampleReportSection() {
  const ref = useScrollReveal();

  const skills = [
    "React Architecture",
    "API Design",
    "State Management",
    "Authentication",
    "Database Modeling",
  ];

  const scores = [
    { label: "Overall Verified Score", value: 84 },
    { label: "Authenticity Score", value: 91 },
    { label: "Understanding Score", value: 81 },
  ];

  return (
    <section
      id="example-report"
      ref={ref}
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#1B1B1E", padding: "96px 0" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="stagger-1 font-display font-semibold text-text-primary text-center"
          style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.3, maxWidth: "800px", margin: "0 auto 48px" }}>
          Example Verification Report
        </h2>

        <div className="stagger-2 max-w-4xl mx-auto p-8 md:p-10 rounded-2xl border border-border-subtle"
          style={{ backgroundColor: "#121212" }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-8 border-b border-subtle">
            <div>
              <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-2">
                Repository
              </p>
              <p className="font-display font-semibold text-text-primary" style={{ fontSize: "20px" }}>
                Personal Finance Tracker
              </p>
            </div>
            <span
              className="font-mono text-xs px-3 py-1.5 rounded-full self-start md:self-auto"
              style={{ backgroundColor: "rgba(124, 108, 246, 0.12)", color: "#7C6CF6" }}
            >
              Example demonstration report
            </span>
          </div>

          <div className="mb-8">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-4">
              Verified Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="font-body text-sm px-4 py-2 rounded-full border border-border-subtle"
                  style={{ backgroundColor: "#1B1B1E", color: "#A0A0A8" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-4">
              Verification Result
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {scores.map((score) => (
                <div
                  key={score.label}
                  className="p-6 rounded-xl border border-border-subtle flex flex-col items-center text-center"
                  style={{ backgroundColor: "#1B1B1E" }}
                >
                  <span
                    className="font-display font-bold"
                    style={{ fontSize: "40px", lineHeight: 1.2, color: "#34C77B" }}
                  >
                    {score.value}
                    <span style={{ fontSize: "20px", color: "#6B6B72" }}>/100</span>
                  </span>
                  <span className="font-body text-sm text-text-secondary mt-2">
                    {score.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
