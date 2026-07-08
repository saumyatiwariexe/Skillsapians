"use client";

import { useScrollReveal } from "./useScrollReveal";
import { GitFork, Code2, ScanSearch } from "lucide-react";

const steps = [
  {
    icon: GitFork,
    title: "Git Forensics Analysis",
    description:
      "We inspect commit history, contribution patterns, iteration cycles, and repository evolution.",
    examples: [
      "Commit frequency",
      "Development timeline",
      "File churn",
      "Large code dumps detection",
    ],
  },
  {
    icon: Code2,
    title: "Code Understanding Verification",
    description:
      "We generate questions directly from your codebase architecture rather than using generic interview questions.",
    examples: [
      "Why a function was implemented a certain way",
      "Why dependencies exist",
      "Why an operation order matters",
    ],
  },
  {
    icon: ScanSearch,
    title: "Semantic Validation",
    description:
      "We compare explanations against the actual structure and behavior of the code.",
    result: [
      "Verified Skill Score",
      "Authenticity Score",
      "Understanding Score",
      "Shareable Verification Report",
    ],
  },
];

export default function HowItWorksSection() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#121212", padding: "96px 0" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="stagger-1 font-display font-semibold text-text-primary text-center"
          style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.3, maxWidth: "800px", margin: "0 auto 64px" }}>
          How Skillsapians Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`stagger-${idx + 1} p-8 rounded-2xl border border-border-subtle card-hover flex flex-col`}
              style={{ backgroundColor: "#1B1B1E" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="p-2.5 rounded-xl"
                  style={{ backgroundColor: "rgba(124, 108, 246, 0.12)" }}
                >
                  <step.icon size={24} style={{ color: "#7C6CF6" }} />
                </div>
                <span
                  className="font-mono text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "#202024", color: "#A0A0A8" }}
                >
                  Step {idx + 1}
                </span>
              </div>

              <h3
                className="font-display font-semibold text-text-primary mb-3"
                style={{ fontSize: "18px" }}
              >
                {step.title}
              </h3>
              <p
                className="font-body text-text-secondary mb-6"
                style={{ fontSize: "15px", lineHeight: 1.6 }}
              >
                {step.description}
              </p>

              <div className="mt-auto">
                <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-3">
                  Examples
                </p>
                <ul className="space-y-2">
                  {(step.examples || step.result || []).map((ex) => (
                    <li
                      key={ex}
                      className="font-body text-sm text-text-secondary flex items-center gap-2"
                    >
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: "#7C6CF6" }}
                      />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
