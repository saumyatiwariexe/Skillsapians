"use client";

import { motion } from "framer-motion";
import { useScrollReveal } from "./useScrollReveal";

interface ScoreRingProps {
  label: string;
  value: number;
  max?: number;
  color: string;
  delay?: number;
}

function ScoreRing({ label, value, max = 100, color, delay = 0 }: ScoreRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = value / max;
  const offset = circumference - progress * circumference;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#222222"
            strokeWidth="6"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: delay + 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-text-primary" style={{ fontSize: "28px", lineHeight: 1 }}>
            {value}
          </span>
          <span className="font-mono text-[10px] text-text-tertiary">/100</span>
        </div>
      </div>
      <span className="font-body text-text-secondary mt-3 text-sm">{label}</span>
    </motion.div>
  );
}

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
    { label: "Verified Score", value: 84, color: "#22C55E" },
    { label: "Authenticity", value: 91, color: "#22C55E" },
    { label: "Understanding", value: 81, color: "#22C55E" },
    { label: "Integrity", value: 88, color: "#F59E0B" },
  ];

  return (
    <section
      id="example-report"
      ref={ref}
      className="section-enter border-t border-subtle"
      style={{ backgroundColor: "#050505", padding: "120px 0" }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="stagger-1 font-display font-extrabold text-text-primary text-center"
          style={{
            fontSize: "clamp(32px, 4vw, 56px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: "800px",
            margin: "0 auto 64px",
          }}>
          Example Verification Report
        </h2>

        <motion.div
          className="p-8 md:p-12 rounded-3xl border border-subtle"
          style={{ backgroundColor: "#111111" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-8 border-b border-subtle">
            <div>
              <p className="font-mono text-xs text-text-tertiary uppercase tracking-widest mb-2">
                Repository
              </p>
              <p className="font-display font-bold text-text-primary" style={{ fontSize: "22px" }}>
                Personal Finance Tracker
              </p>
            </div>
            <span
              className="font-mono text-xs px-4 py-2 rounded-full border border-subtle self-start md:self-auto"
              style={{ backgroundColor: "#050505", color: "#A3A3A3" }}
            >
              Example demonstration report
            </span>
          </div>

          <div className="mb-10">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-widest mb-5">
              Verified Skills
            </p>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="font-body text-sm px-4 py-2 rounded-full border border-subtle"
                  style={{ backgroundColor: "#161616", color: "#A3A3A3" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {scores.map((score, idx) => (
              <ScoreRing
                key={score.label}
                label={score.label}
                value={score.value}
                color={score.color}
                delay={idx * 0.1}
              />
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-subtle flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22C55E" }} />
                <span className="font-body text-sm text-text-secondary">Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#F59E0B" }} />
                <span className="font-body text-sm text-text-secondary">Review Needed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#EF4444" }} />
                <span className="font-body text-sm text-text-secondary">Suspicious</span>
              </div>
            </div>
            <span className="font-mono text-xs text-text-tertiary">
              Generated by Skillsapians verification engine
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
