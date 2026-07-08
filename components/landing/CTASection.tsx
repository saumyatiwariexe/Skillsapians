"use client";

import { useScrollReveal } from "./useScrollReveal";

export default function CTASection() {
  const ref = useScrollReveal();

  return (
    <section
      id="cta"
      ref={ref}
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#121212", padding: "120px 0" }}
    >
      <div className="max-w-[700px] mx-auto px-6 text-center">
        <h2
          className="stagger-1 font-display font-bold text-txt-primary"
          style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.2 }}
        >
          The place for anyone from anywhere to build anything
        </h2>
        <p className="stagger-2 font-body text-txt-secondary mt-6" style={{ fontSize: "18px" }}>
          Start verifying your skills today. It takes less than 5 minutes to get your first verified skill report.
        </p>
        <div className="stagger-3 flex flex-wrap items-center justify-center gap-4 mt-10">
          <a
            href="/verify"
            className="font-body font-medium text-white px-8 py-4 rounded-xl transition-all duration-150 hover:brightness-110 hover:-translate-y-px"
            style={{ backgroundColor: "#7C6CF6", fontSize: "16px" }}
          >
            Get Started for Free
          </a>
          <a
            href="#"
            className="font-body font-medium text-txt-primary px-8 py-4 rounded-xl border border-border-subtle transition-all duration-150 hover:border-purple hover:text-purple"
            style={{ fontSize: "16px" }}
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
}
