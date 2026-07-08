"use client";

import { useScrollReveal } from "./useScrollReveal";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Can this detect AI-generated code?",
    answer:
      "No system can perfectly detect AI usage. Skillsapians focuses on verifying understanding and ownership rather than detecting tools.",
  },
  {
    question: "Does this work for private repositories?",
    answer:
      "Private repository support is planned for future releases.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "Current support focuses on JavaScript and TypeScript repositories.",
  },
  {
    question: "Can recruiters verify reports?",
    answer:
      "Reports are shareable and include supporting evidence for every score.",
  },
];

export default function FAQSection() {
  const ref = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#121212", padding: "96px 0" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="stagger-1 font-display font-semibold text-text-primary text-center"
          style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.3, maxWidth: "800px", margin: "0 auto 48px" }}>
          Frequently Asked Questions
        </h2>

        <div className="stagger-2 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border-subtle overflow-hidden"
                style={{ backgroundColor: "#1B1B1E" }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-display font-semibold text-text-primary pr-4" style={{ fontSize: "16px" }}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className="shrink-0 transition-transform duration-200"
                    style={{
                      color: "#6B6B72",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6">
                    <p className="font-body text-text-secondary" style={{ fontSize: "15px", lineHeight: 1.7 }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
