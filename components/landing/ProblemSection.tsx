"use client";

import { useScrollReveal } from "./useScrollReveal";
import { FileText, Award, BadgeCheck, GitBranch, Code2, BarChart3 } from "lucide-react";

const leftItems = [
  { icon: FileText, label: "Resume" },
  { icon: Award, label: "Certificate" },
  { icon: BadgeCheck, label: "Badge" },
];

const rightItems = [
  { icon: GitBranch, label: "Git History" },
  { icon: Code2, label: "Code Architecture" },
  { icon: BarChart3, label: "Contribution Timeline" },
];

export default function ProblemSection() {
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
            maxWidth: "900px",
            margin: "0 auto 80px",
          }}>
          Resumes tell stories.
          <br />
          <span className="text-gradient-blue">Repositories tell the truth.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="stagger-2 space-y-6">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-widest mb-6">
              Traditional Signals
            </p>
            {leftItems.map((item) => (
              <div
                key={item.label}
                className="p-6 rounded-2xl border border-subtle card-hover flex items-center gap-5"
                style={{ backgroundColor: "#111111" }}
              >
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.08)" }}
                >
                  <item.icon size={22} style={{ color: "#EF4444" }} />
                </div>
                <div>
                  <p className="font-display font-semibold text-text-primary" style={{ fontSize: "18px" }}>
                    {item.label}
                  </p>
                  <p className="font-body text-text-tertiary mt-1" style={{ fontSize: "14px" }}>
                    Self-reported, unverified claims
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border border-dashed border-subtle animate-spin" style={{ animationDuration: "20s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-2xl font-bold text-text-primary">VS</span>
              </div>
            </div>
          </div>

          <div className="stagger-3 space-y-6">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-widest mb-6 md:text-right">
              Forensic Evidence
            </p>
            {rightItems.map((item) => (
              <div
                key={item.label}
                className="p-6 rounded-2xl border border-subtle card-hover flex items-center gap-5"
                style={{ backgroundColor: "#111111" }}
              >
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "rgba(59, 130, 246, 0.08)" }}
                >
                  <item.icon size={22} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <p className="font-display font-semibold text-text-primary" style={{ fontSize: "18px" }}>
                    {item.label}
                  </p>
                  <p className="font-body text-text-tertiary mt-1" style={{ fontSize: "14px" }}>
                    Measurable, inspectable signals
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
