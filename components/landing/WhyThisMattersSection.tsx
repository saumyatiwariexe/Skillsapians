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
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#1B1B1E", padding: "96px 0" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="stagger-1 font-display font-semibold text-text-primary text-center"
          style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.3, maxWidth: "800px", margin: "0 auto 48px" }}>
          Why This Matters
        </h2>

        <div className="space-y-10">
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
