"use client";

import { useScrollReveal } from "./useScrollReveal";
import { ArrowRight, CheckCircle2, Clock, Loader2 } from "lucide-react";

const tasks = [
  { label: "Analyze commit history", status: "done" as const },
  { label: "Parse AST nodes", status: "in-progress" as const },
  { label: "Generate questions", status: "pending" as const },
];

const statusConfig = {
  done: { icon: CheckCircle2, color: "#34C77B", label: "Done" },
  "in-progress": { icon: Loader2, color: "#F5A623", label: "In Progress" },
  pending: { icon: Clock, color: "#4C8DFF", label: "Pending" },
};

export default function CollaborationSection() {
  const ref = useScrollReveal();

  return (
    <section
      id="collaboration"
      ref={ref}
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#121212", padding: "96px 0" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[45%_55%] gap-8 md:gap-16 items-center">
        <div
          className="stagger-1 p-6 md:p-8 rounded-xl border border-border-subtle card-hover order-2 md:order-1"
          style={{ backgroundColor: "#1B1B1E" }}
        >
          <h4 className="font-display font-semibold text-txt-primary text-base mb-4">
            Verification Pipeline
          </h4>
          <div className="space-y-3">
            {tasks.map((task) => {
              const cfg = statusConfig[task.status];
              const Icon = cfg.icon;
              return (
                <div
                  key={task.label}
                  className="flex items-center justify-between py-2.5 px-4 rounded-lg"
                  style={{ backgroundColor: "#202024" }}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} style={{ color: cfg.color }} />
                    <span className="font-body text-sm text-txt-secondary">
                      {task.label}
                    </span>
                  </div>
                  <span
                    className="font-body font-medium text-xs px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${cfg.color}18`,
                      color: cfg.color,
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="order-1 md:order-2">
          <span className="stagger-1 inline-block font-body font-medium text-xs uppercase tracking-[2px] text-purple mb-4">
            Collaboration
          </span>
          <h2 className="stagger-2 font-display font-semibold text-txt-primary" style={{ fontSize: "clamp(22px, 2.5vw, 28px)", lineHeight: 1.3 }}>
            Supercharge team hiring. We provide unlimited verification reports, best-in-class fraud detection, and the world's most powerful skill-matching community.
          </h2>
          <p className="stagger-3 font-body text-txt-secondary mt-4 leading-relaxed" style={{ fontSize: "16px", lineHeight: 1.6 }}>
            Share verified skill reports with recruiters and hiring managers. Your Proof of Skill profile becomes a living resume backed by real code, not just claims.
          </p>
          <a
            href="#cta"
            className="stagger-4 inline-flex items-center gap-2 font-body font-medium text-sm text-purple hover:underline mt-6 transition-all"
            style={{ textUnderlineOffset: "4px" }}
          >
            Explore the community
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
