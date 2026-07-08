"use client";

import { useScrollReveal } from "./useScrollReveal";

const problems = [
  "Degrees measure education exposure, not practical capability.",
  "Online certificates prove completion, not understanding.",
  "Traditional coding assessments test synthetic problems rather than real work.",
  "Large language models make take-home assessments increasingly unreliable.",
];

export default function ProblemSection() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#121212", padding: "96px 0" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="stagger-1 font-display font-semibold text-text-primary text-center"
          style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.3, maxWidth: "800px", margin: "0 auto 48px" }}>
          The Hiring Industry Has a Verification Problem
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((text, idx) => (
            <div
              key={idx}
              className={`stagger-${idx + 1} p-8 rounded-2xl border border-border-subtle card-hover`}
              style={{ backgroundColor: "#1B1B1E" }}
            >
              <p className="font-body text-text-secondary" style={{ fontSize: "18px", lineHeight: 1.6 }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        <p className="stagger-5 font-body text-text-tertiary text-center mt-10 max-w-2xl mx-auto" style={{ fontSize: "16px", lineHeight: 1.6 }}>
          Companies want skills-based hiring but verification methods haven&apos;t evolved with AI-assisted development.
        </p>
      </div>
    </section>
  );
}
