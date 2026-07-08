"use client";

import { useScrollReveal } from "./useScrollReveal";

const audiences = [
  "Students building portfolios",
  "Self-taught developers without traditional credentials",
  "Open-source contributors",
  "Bootcamp graduates",
  "Recruiters looking beyond resumes",
  "Hackathon participants wanting verifiable proof of contribution",
];

export default function WhoIsThisForSection() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#121212", padding: "96px 0" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="stagger-1 font-display font-semibold text-text-primary text-center"
          style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.3, maxWidth: "800px", margin: "0 auto 48px" }}>
          Who Is This For
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((text, idx) => (
            <div
              key={idx}
              className={`stagger-${(idx % 4) + 1} p-6 rounded-2xl border border-border-subtle card-hover`}
              style={{ backgroundColor: "#1B1B1E" }}
            >
              <p className="font-body text-text-secondary" style={{ fontSize: "16px", lineHeight: 1.6 }}>
                {text}.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
