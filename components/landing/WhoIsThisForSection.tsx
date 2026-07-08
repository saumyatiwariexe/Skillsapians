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
          Who Is This For
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {audiences.map((text, idx) => (
            <div
              key={idx}
              className={`stagger-${(idx % 4) + 1} p-6 rounded-2xl border border-subtle card-hover`}
              style={{ backgroundColor: "#111111" }}
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
