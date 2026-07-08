"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, GitBranch, FileSearch, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const subtitleOptions = [
  "Built it.",
  "Understand it.",
  "Verify it.",
];

const pipelineStages = [
  { icon: GitBranch, label: "Repository" },
  { icon: FileSearch, label: "Commit Forensics" },
  { icon: ShieldCheck, label: "AST Analysis" },
  { icon: FileText, label: "Verification Questions" },
  { icon: ShieldCheck, label: "Verified Skill Report" },
];

export default function HeroSection() {
  const [subtitleIdx, setSubtitleIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSubtitleIdx((prev) => (prev + 1) % subtitleOptions.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#050505" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #22C55E 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto pt-24 pb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-extrabold text-white tracking-tight"
          style={{
            fontSize: "clamp(48px, 7vw, 80px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          Degrees prove attendance.
          <br />
          <span className="text-gradient-blue">Skillsapians</span> proves ability.
        </motion.h1>

        <div className="h-16 mt-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={subtitleIdx}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-text-secondary"
              style={{ fontSize: "clamp(18px, 2vw, 24px)" }}
            >
              {subtitleOptions[subtitleIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="font-body text-text-tertiary mt-4 max-w-xl"
          style={{ fontSize: "16px", lineHeight: 1.7 }}
        >
          Verify software skills using real GitHub projects instead of coding tests and multiple choice assessments.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-10"
        >
          <Link
            href="/verify"
            className="font-body font-semibold text-white px-8 py-4 rounded-xl transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
            style={{
              backgroundColor: "#3B82F6",
              fontSize: "16px",
              boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.3), 0 8px 32px rgba(59, 130, 246, 0.2)",
            }}
          >
            Analyze GitHub Repository
          </Link>
          <Link
            href="#example-report"
            className="font-body font-medium text-text-secondary px-8 py-4 rounded-xl border border-subtle transition-all duration-200 hover:border-text-tertiary hover:text-text-primary"
            style={{ fontSize: "16px" }}
          >
            View Sample Verification Report
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 w-full max-w-4xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {[0, 1, 2, 3].map((i) => (
                <motion.line
                  key={i}
                  x1={`${(i + 0.5) * (100 / 5)}%`}
                  y1="50%"
                  x2={`${(i + 1.5) * (100 / 5)}%`}
                  y2="50%"
                  stroke="#222222"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 1 + i * 0.2, ease: "easeInOut" }}
                />
              ))}
            </svg>

            {pipelineStages.map((stage, idx) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-3 relative z-10"
                style={{ animation: `float ${3 + idx * 0.5}s ease-in-out infinite`, animationDelay: `${idx * 0.3}s` }}
              >
                <div
                  className="p-4 rounded-2xl border border-subtle flex flex-col items-center gap-2 glow-blue"
                  style={{ backgroundColor: "#111111", minWidth: "140px" }}
                >
                  <stage.icon size={22} style={{ color: "#3B82F6" }} />
                  <span className="font-mono text-xs text-text-secondary whitespace-nowrap">
                    {stage.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
