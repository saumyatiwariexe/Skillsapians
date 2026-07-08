"use client";

import { useScrollReveal } from "./useScrollReveal";
import { ArrowRight } from "lucide-react";

export default function ProductivitySection() {
  const ref = useScrollReveal();

  return (
    <section
      id="productivity"
      ref={ref}
      className="section-enter"
      style={{ backgroundColor: "#121212", padding: "96px 0" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[55%_45%] gap-8 md:gap-16 items-center">
        <div>
          <span className="stagger-1 inline-block font-body font-medium text-xs uppercase tracking-[2px] text-purple mb-4">
            Productivity
          </span>
          <h2 className="stagger-2 font-display font-semibold text-txt-primary leading-tight" style={{ fontSize: "clamp(22px, 2.5vw, 28px)", lineHeight: 1.3 }}>
            Accelerate high-quality skill verification. Our platform drives innovation with tools that boost developer credibility.
          </h2>
          <p className="stagger-3 font-body text-txt-secondary mt-4 leading-relaxed" style={{ fontSize: "16px", lineHeight: 1.6 }}>
            Submit any public GitHub repository. Our AI engine parses your code structure, analyzes commit history, and generates targeted questions to verify you actually understand what you built.
          </p>
          <a
            href="#stats"
            className="stagger-4 inline-flex items-center gap-2 font-body font-medium text-sm text-purple hover:underline mt-6 transition-all"
            style={{ textUnderlineOffset: "4px" }}
          >
            Learn more about verification
            <ArrowRight size={14} />
          </a>
        </div>

        <div className="stagger-3 p-8 rounded-xl border border-border-subtle card-hover" style={{ backgroundColor: "#1B1B1E" }}>
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center">
              <div
                className="px-6 py-3 rounded-full border font-mono text-xs"
                style={{ backgroundColor: "#202024", borderColor: "#2A2A2E", color: "#A0A0A8" }}
              >
                Git Forensics
              </div>
              <div className="w-px h-6 border-l border-dashed" style={{ borderColor: "rgba(124, 108, 246, 0.4)" }} />
            </div>

            <div className="flex flex-col items-center">
              <div
                className="px-6 py-3 rounded-full border font-mono text-xs"
                style={{ backgroundColor: "#202024", borderColor: "#2A2A2E", color: "#A0A0A8" }}
              >
                AST Parser
              </div>
              <div className="w-px h-6 border-l border-dashed" style={{ borderColor: "rgba(124, 108, 246, 0.4)" }} />
            </div>

            <div
              className="px-6 py-3 rounded-full border font-mono text-xs"
              style={{ backgroundColor: "#202024", borderColor: "#2A2A2E", color: "#A0A0A8" }}
            >
              Embedding Scorer
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
