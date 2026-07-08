"use client";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#121212" }}
    >
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-[900px]">
        <h1
          className="font-display font-bold text-txt-primary tracking-tight"
          style={{
            fontSize: "clamp(36px, 5vw, 64px)",
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
          }}
        >
          Verify skills from real work.
        </h1>

        <p
          className="font-body font-normal text-txt-secondary mt-6 max-w-[640px]"
          style={{ fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.6 }}
        >
          Skillsapiens analyzes your GitHub repositories to generate verified
          skill reports — proof you built what you claim.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <a
            href="/verify"
            className="font-body font-medium text-white px-7 py-4 rounded-xl transition-all duration-150 hover:brightness-110 hover:-translate-y-px"
            style={{ backgroundColor: "#7C6CF6", fontSize: "16px" }}
          >
            Verify Your Repo
          </a>
          <a
            href="#stats"
            className="font-body font-medium text-txt-primary px-7 py-4 rounded-xl border border-border-subtle transition-all duration-150 hover:border-purple hover:text-purple"
            style={{ fontSize: "16px" }}
          >
            View Demo
          </a>
        </div>

        <div
          className="mt-8 px-5 py-3.5 rounded-xl border border-border-subtle font-mono text-sm text-txt-tertiary select-none pointer-events-none"
          style={{ backgroundColor: "#1B1B1E", width: "min(480px, 90vw)" }}
        >
          github.com/username/repository
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-px h-10 bg-txt-tertiary animate-pulse-line" />
      </div>
    </section>
  );
}
