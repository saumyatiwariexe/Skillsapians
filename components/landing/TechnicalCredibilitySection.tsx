"use client";

import { useScrollReveal } from "./useScrollReveal";
import { GitCommit, Braces, BarChart3, FileText } from "lucide-react";

const items = [
  {
    icon: GitCommit,
    title: "Git History Analysis",
    description: "Deterministic repository signals.",
  },
  {
    icon: Braces,
    title: "AST Parsing",
    description: "Questions generated from actual code structure.",
  },
  {
    icon: BarChart3,
    title: "Embedding Similarity",
    description: "Understanding measured against repository facts.",
  },
  {
    icon: FileText,
    title: "Transparent Reports",
    description: "Every score includes supporting evidence.",
  },
];

export default function TechnicalCredibilitySection() {
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
          Evidence, Not Opinions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`stagger-${idx + 1} p-8 rounded-2xl border border-border-subtle card-hover text-center`}
              style={{ backgroundColor: "#1B1B1E" }}
            >
              <div
                className="inline-flex items-center justify-center p-3 rounded-xl mb-5"
                style={{ backgroundColor: "rgba(124, 108, 246, 0.12)" }}
              >
                <item.icon size={24} style={{ color: "#7C6CF6" }} />
              </div>
              <h3
                className="font-display font-semibold text-text-primary mb-2"
                style={{ fontSize: "16px" }}
              >
                {item.title}
              </h3>
              <p className="font-body text-text-tertiary" style={{ fontSize: "14px", lineHeight: 1.6 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
