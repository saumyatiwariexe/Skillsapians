"use client";

import { motion } from "framer-motion";
import { useScrollReveal } from "./useScrollReveal";
import { GitCommit, Braces, ScanSearch } from "lucide-react";

const engines = [
  {
    icon: GitCommit,
    title: "Git Forensics Engine",
    description: "Deterministic analysis of commit history, contribution patterns, and repository evolution.",
    theme: { bg: "rgba(59, 130, 246, 0.06)", border: "rgba(59, 130, 246, 0.2)", accent: "#3B82F6" },
    signals: ["Commit frequency", "File churn", "Large code dumps", "Squashed history"],
  },
  {
    icon: Braces,
    title: "AST Analysis Engine",
    description: "Questions generated from actual code structure, not generic interview templates.",
    theme: { bg: "rgba(255, 255, 255, 0.03)", border: "rgba(255, 255, 255, 0.1)", accent: "#FFFFFF" },
    signals: ["Function declarations", "Call graph edges", "Control flow complexity", "Cross-file dependencies"],
  },
  {
    icon: ScanSearch,
    title: "Semantic Verification Engine",
    description: "Understanding measured against repository facts using embedding similarity.",
    theme: { bg: "rgba(34, 197, 94, 0.06)", border: "rgba(34, 197, 94, 0.2)", accent: "#22C55E" },
    signals: ["Semantic similarity", "Entity coverage", "Specificity score", "AI-assisted flag"],
  },
];

export default function HowItWorksSection() {
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
            margin: "0 auto 80px",
          }}>
          Three engines. One verdict.
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {engines.map((engine, idx) => (
            <motion.div
              key={engine.title}
              className="stagger-2 p-8 rounded-2xl border flex flex-col"
              style={{
                backgroundColor: engine.theme.bg,
                borderColor: engine.theme.border,
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="p-2.5 rounded-xl"
                  style={{ backgroundColor: `${engine.theme.accent}15` }}
                >
                  <engine.icon size={22} style={{ color: engine.theme.accent }} />
                </div>
                <span className="font-mono text-xs text-text-tertiary uppercase tracking-widest">
                  Engine {String(idx + 1).padStart(2, '0')}
                </span>
              </div>

              <h3
                className="font-display font-bold text-text-primary mb-3"
                style={{ fontSize: "22px", letterSpacing: "-0.01em" }}
              >
                {engine.title}
              </h3>
              <p
                className="font-body text-text-secondary mb-8"
                style={{ fontSize: "15px", lineHeight: 1.7 }}
              >
                {engine.description}
              </p>

              <div className="mt-auto">
                <p className="font-mono text-[11px] text-text-tertiary uppercase tracking-widest mb-4">
                  Signals
                </p>
                <div className="space-y-2.5">
                  {engine.signals.map((signal) => (
                    <div key={signal} className="flex items-center gap-3">
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: engine.theme.accent }}
                      />
                      <span className="font-body text-sm text-text-secondary">{signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
