"use client";

import { useScrollReveal } from "./useScrollReveal";

const subScores = [
  { label: "Authenticity", value: 91, color: "#34C77B" },
  { label: "Understanding", value: 84, color: "#34C77B" },
  { label: "Alignment", value: 86, color: "#34C77B" },
];

function Sparkline() {
  const points = [20, 35, 25, 45, 40, 55, 50, 65, 60, 75, 70, 80];
  const w = 80;
  const h = 30;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathD = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mt-2">
      <path
        d={pathD}
        fill="none"
        stroke="#34C77B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StatsSection() {
  const ref = useScrollReveal();

  return (
    <section
      id="stats"
      ref={ref}
      className="section-enter border-t border-border-subtle"
      style={{ backgroundColor: "#1B1B1E", padding: "96px 0" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className="stagger-1 p-8 md:p-10 rounded-xl border border-border-subtle card-hover flex flex-col justify-center"
          style={{ backgroundColor: "#121212" }}
        >
          <div className="flex items-baseline gap-3">
            <span
              className="font-display font-bold"
              style={{ fontSize: "56px", lineHeight: 1.2, color: "#34C77B" }}
            >
              87
            </span>
            <span className="font-body text-sm text-txt-secondary">
              Verified Skill Score
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {subScores.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-xs text-txt-secondary">{s.label}</span>
                  <span className="font-mono text-xs text-txt-secondary">{s.value}</span>
                </div>
                <div
                  className="h-2 rounded-full w-full"
                  style={{ backgroundColor: "#2A2A2E" }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${s.value}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stagger-2 grid grid-cols-3 gap-4 content-start">
          {subScores.map((s) => (
            <div
              key={s.label}
              className="p-4 md:p-6 rounded-xl border border-border-subtle card-hover"
              style={{ backgroundColor: "#121212" }}
            >
              <span
                className="font-display font-bold text-txt-primary block"
                style={{ fontSize: "clamp(24px, 3vw, 32px)" }}
              >
                {s.value}
              </span>
              <span className="font-body text-xs text-txt-secondary mt-1 block">
                {s.label}
              </span>
              <Sparkline />
            </div>
          ))}

          <div className="col-span-3 mt-6">
            <span className="font-display font-bold text-gradient-purple-blue" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>
              80% of developers
            </span>
            <p className="font-body text-txt-secondary mt-4" style={{ fontSize: "18px" }}>
              report increased interview callbacks after sharing their verified skill report
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
