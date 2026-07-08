"use client";

import { useScrollReveal } from "./useScrollReveal";

const statements = [
  "Skills-based hiring continues to grow while traditional credentials become weaker signals of practical ability.",
  "AI-assisted development makes ownership verification increasingly important.",
  "Developers need portable proof of what they can actually build.",
];

export default function WhyThisMattersSection() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      className="section-enter border-t border-subtle"
      style={{ backgroundColor: "#050505", padding: "120px 0" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="stagger-1 font-display font-extrabold text-text-primary text-center"
          style={{
            fontSize: "clamp(32px, 4vw, 56px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: "800px",
            margin: "0 auto 64px",
          }}>
          Why This Matters
        </h2>

        <div className="space-y-12">
          {statements.map((text, idx) => (
            <p
              key={idx}
              className={`stagger-${idx + 1} font-body text-text-primary text-center`}
              style={{
                fontSize: "clamp(20px, 2.5vw, 28px)",
                lineHeight: 1.5,
                maxWidth: "800px",
                margin: "0 auto",
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              &ldquo;{text}&rdquo;
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
