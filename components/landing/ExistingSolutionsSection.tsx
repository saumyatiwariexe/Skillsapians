"use client";

import { useScrollReveal } from "./useScrollReveal";
import { Check } from "lucide-react";

interface Row {
  name: string;
  points: string[];
  isUs?: boolean;
}

const rows: Row[] = [
  {
    name: "LinkedIn Skill Verification",
    points: [
      "Verifies tool familiarity",
      "Doesn't inspect real projects",
    ],
  },
  {
    name: "HackerRank",
    points: [
      "Measures performance on synthetic coding tasks",
      "Easily solved using AI assistance",
    ],
  },
  {
    name: "TestGorilla",
    points: [
      "Standardized assessments",
      "Detached from actual work history",
    ],
  },
  {
    name: "Skillsapians",
    points: [
      "Verifies understanding of existing work",
      "Uses repository evidence",
      "Generates project-specific questions",
      "Produces inspectable verification reports",
    ],
    isUs: true,
  },
];

export default function ExistingSolutionsSection() {
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
          Current solutions ask candidates to take another test.
        </h2>

        <div className="stagger-2 space-y-4">
          {rows.map((row) => (
            <div
              key={row.name}
              className="p-8 md:p-10 rounded-2xl border border-subtle card-hover"
              style={{
                backgroundColor: row.isUs ? "rgba(59, 130, 246, 0.04)" : "#111111",
                borderColor: row.isUs ? "rgba(59, 130, 246, 0.2)" : "#222222",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-start">
                <h3
                  className="font-display font-bold"
                  style={{
                    fontSize: "18px",
                    color: row.isUs ? "#3B82F6" : "#FFFFFF",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {row.name}
                </h3>
                <ul className="space-y-3">
                  {row.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <Check
                        size={18}
                        className="mt-0.5 shrink-0"
                        style={{ color: row.isUs ? "#3B82F6" : "#525252" }}
                      />
                      <span className="font-body text-text-secondary" style={{ fontSize: "15px", lineHeight: 1.6 }}>
                        {point}
                      </span>
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
