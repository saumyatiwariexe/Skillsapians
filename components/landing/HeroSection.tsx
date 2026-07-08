"use client";

import { ArrowRight, GitBranch } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#121212" }}
    >
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto pt-20">
        <h1
          className="font-display font-bold text-text-primary tracking-tight"
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
          }}
        >
          Degrees show what you studied.{" "}
          <span className="text-gradient-purple-blue">Skillsapians</span> proves
          what you can actually build.
        </h1>

        <p
          className="font-body font-normal text-text-secondary mt-6 max-w-2xl"
          style={{ fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.6 }}
        >
          Verify software skills using real GitHub projects instead of coding
          tests and multiple choice assessments.
        </p>

        <p
          className="font-body text-text-tertiary mt-4 max-w-xl"
          style={{ fontSize: "16px", lineHeight: 1.6 }}
        >
          Skillsapians analyzes repository history, code structure, and developer
          explanations to generate evidence-backed skill verification reports.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link
            href="/verify"
            className="font-body font-medium text-white px-7 py-4 rounded-xl transition-all duration-150 hover:brightness-110 hover:-translate-y-px"
            style={{ backgroundColor: "#7C6CF6", fontSize: "16px", boxShadow: "0 8px 24px rgba(124, 108, 246, 0.25)" }}
          >
            Analyze GitHub Repository
          </Link>
          <Link
            href="#example-report"
            className="font-body font-medium text-text-primary px-7 py-4 rounded-xl border border-subtle transition-all duration-150 hover:border-text-tertiary"
            style={{ fontSize: "16px" }}
          >
            View Sample Verification Report
          </Link>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3 text-text-tertiary font-mono text-xs md:text-sm">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-subtle bg-surface">
            <GitBranch size={14} />
            GitHub Repository
          </span>
          <ArrowRight size={16} className="opacity-40" />
          <span className="px-3 py-1.5 rounded-full border border-subtle bg-surface">
            Git Forensics
          </span>
          <ArrowRight size={16} className="opacity-40" />
          <span className="px-3 py-1.5 rounded-full border border-subtle bg-surface">
            Code Understanding Questions
          </span>
          <ArrowRight size={16} className="opacity-40" />
          <span className="px-3 py-1.5 rounded-full border border-subtle bg-surface">
            Skill Verification
          </span>
          <ArrowRight size={16} className="opacity-40" />
          <span className="px-3 py-1.5 rounded-full border border-subtle bg-surface">
            Shareable Report
          </span>
        </div>
      </div>
    </section>
  );
}
