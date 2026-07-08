"use client";

import { useScrollReveal } from "./useScrollReveal";

const logos = ["STRIPE", "PINTEREST", "KPMG", "MERCEDES", "P&G", "TELUS"];

export default function TrustBar() {
  const ref = useScrollReveal(0.1);

  return (
    <section
      ref={ref}
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#121212", padding: "48px 0" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <p className="font-body text-sm text-txt-tertiary mb-6">
          Trusted by developers at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((name) => (
            <span
              key={name}
              className="font-display font-semibold text-base tracking-[2px] text-txt-tertiary opacity-60 hover:opacity-100 transition-opacity duration-200 cursor-default"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
