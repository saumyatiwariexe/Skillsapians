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
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#1B1B1E", padding: "96px 0" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="stagger-1 font-display font-semibold text-text-primary text-center"
          style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.3, maxWidth: "800px", margin: "0 auto 48px" }}>
          Current Solutions Ask Candidates To Take Another Test
        </h2>

        <div className="stagger-2 space-y-4">
          {rows.map((row) => (
            <div
              key={row.name}
              className="p-8 rounded-2xl border border-border-subtle card-hover"
              style={{
                backgroundColor: row.isUs ? "rgba(124, 108, 246, 0.06)" : "#121212",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-start">
                <h3
                  className="font-display font-semibold"
                  style={{
                    fontSize: "18px",
                    color: row.isUs ? "#7C6CF6" : "#F5F5F7",
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
                        style={{ color: row.isUs ? "#7C6CF6" : "#A0A0A8" }}
                      />
                      <span className="font-body text-text-secondary" style={{ fontSize: "15px", lineHeight: 1.5 }}>
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
