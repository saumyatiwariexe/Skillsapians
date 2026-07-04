import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Color Palette ────────────────────────────────────────
      colors: {
        // Primary brand — will be updated by user's design spec
        brand: {
          50:  "hsl(220, 100%, 97%)",
          100: "hsl(220, 100%, 93%)",
          200: "hsl(220, 90%, 85%)",
          300: "hsl(220, 85%, 72%)",
          400: "hsl(220, 80%, 60%)",
          500: "hsl(220, 75%, 50%)",
          600: "hsl(220, 80%, 42%)",
          700: "hsl(220, 85%, 34%)",
          800: "hsl(220, 90%, 26%)",
          900: "hsl(220, 95%, 18%)",
        },
        // Surface / neutral
        surface: {
          DEFAULT: "hsl(220, 15%, 8%)",
          subtle: "hsl(220, 12%, 12%)",
          muted:  "hsl(220, 10%, 18%)",
          border: "hsl(220, 10%, 22%)",
        },
        // Semantic
        success: "hsl(142, 71%, 45%)",
        warning: "hsl(45,  93%, 47%)",
        danger:  "hsl(0,   84%, 60%)",
      },
      // ── Typography ───────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Menlo", "monospace"],
      },
      // ── Animation ────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to:   { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-in":    "fade-in 0.4s ease-out forwards",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer:      "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
