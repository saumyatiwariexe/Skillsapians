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
      className="section-enter border-t border-subtle"
      style={{ backgroundColor: "#050505", padding: "120px 0" }}
    >
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="stagger-1 font-display font-extrabold text-text-primary text-center"
          style={{
            fontSize: "clamp(32px, 4vw, 56px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: "800px",
            margin: "0 auto 64px",
          }}>
          Frequently Asked Questions
        </h2>

        <div className="stagger-2 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-subtle overflow-hidden"
                style={{ backgroundColor: "#111111" }}
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
                      color: "#525252",
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
