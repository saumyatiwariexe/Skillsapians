"use client";

import { useScrollReveal } from "./useScrollReveal";
import { GitCommit, Braces, BarChart3, FileText } from "lucide-react";

const items = [
  {
    icon: GitCommit,
    title: "Git History Analysis",
    description: "Deterministic repository signals.",
    accent: "#3B82F6",
  },
  {
    icon: Braces,
    title: "AST Parsing",
    description: "Questions generated from actual code structure.",
    accent: "#FFFFFF",
  },
  {
    icon: BarChart3,
    title: "Embedding Similarity",
    description: "Understanding measured against repository facts.",
    accent: "#22C55E",
  },
  {
    icon: FileText,
    title: "Transparent Reports",
    description: "Every score includes supporting evidence.",
    accent: "#3B82F6",
  },
];

export default function TechnicalCredibilitySection() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      className="section-enter border-t border-subtle"
      style={{ backgroundColor: "#050505", padding: "120px 0" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="stagger-1 font-display font-extrabold text-text-primary text-center"
          style={{
            fontSize: "clamp(32px, 4vw, 56px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: "800px",
            margin: "0 auto 64px",
          }}>
          Evidence, Not Opinions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`stagger-${idx + 1} p-8 rounded-2xl border border-subtle card-hover text-center`}
              style={{ backgroundColor: "#111111" }}
            >
              <div
                className="inline-flex items-center justify-center p-3 rounded-xl mb-5"
                style={{ backgroundColor: `${item.accent}12` }}
              >
                <item.icon size={24} style={{ color: item.accent }} />
              </div>
              <h3
                className="font-display font-bold text-text-primary mb-2"
                style={{ fontSize: "16px", letterSpacing: "-0.01em" }}
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
