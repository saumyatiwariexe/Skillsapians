"use client";

import { useScrollReveal } from "./useScrollReveal";
import { Shield, CheckCircle2 } from "lucide-react";

const securityChecks = [
  "Commit history verified",
  "No single-commit dumps detected",
  "File churn patterns normal",
  "Author attribution consistent",
];

export default function SecuritySection() {
  const ref = useScrollReveal();

  return (
    <section
      id="security"
      ref={ref}
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#1B1B1E", padding: "96px 0" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[55%_45%] gap-8 md:gap-16 items-center">
        <div>
          <span className="stagger-1 inline-block font-body font-medium text-xs uppercase tracking-[2px] mb-4" style={{ color: "#34C77B" }}>
            Security
          </span>
          <h2 className="stagger-2 font-display font-semibold text-txt-primary" style={{ fontSize: "clamp(22px, 2.5vw, 28px)", lineHeight: 1.3 }}>
            Embed security into the developer workflow. With Skillsapiens, developers can verify their skills in minutes and organizations can automatically comply with hiring standards.
          </h2>
          <div className="stagger-3 mt-6">
            <span
              className="font-display font-bold block"
              style={{ fontSize: "clamp(32px, 4vw, 48px)", color: "#34C77B" }}
            >
              56 million projects
            </span>
            <p className="font-body text-txt-secondary mt-2" style={{ fontSize: "18px" }}>
              analyzed for authenticity patterns
            </p>
          </div>
        </div>

        <div
          className="stagger-2 p-6 md:p-8 rounded-xl border border-border-subtle card-hover"
          style={{ backgroundColor: "#121212" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <Shield size={32} style={{ color: "#34C77B" }} />
            <span className="font-body font-semibold text-base text-txt-primary">
              Repository Security
            </span>
          </div>

          <div className="space-y-3">
            {securityChecks.map((check) => (
              <div key={check} className="flex items-center gap-3">
                <CheckCircle2 size={16} style={{ color: "#34C77B" }} />
                <span className="font-body text-sm text-txt-secondary">
                  {check}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
