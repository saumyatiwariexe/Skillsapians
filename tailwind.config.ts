import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        "surface-alt": "var(--bg-surface-alt)",
        subtle: "var(--border-subtle)",
        
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        
        "accent-blue": "var(--accent-blue)",
        "accent-green": "var(--accent-green)",
        "accent-amber": "var(--accent-amber)",
        "accent-red": "var(--accent-red)",

        "txt-primary": "var(--text-primary)",
        "txt-secondary": "var(--text-secondary)",
        "txt-tertiary": "var(--text-tertiary)",
        "border-subtle": "var(--border-subtle)",

        blue: "var(--accent-blue)",
        green: "var(--accent-green)",
        amber: "var(--accent-amber)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "flow-line": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out forwards",
        "pulse": "pulse 2s ease-in-out infinite",
        "flow-line": "flow-line 1.5s linear infinite",
        "float": "float 4s ease-in-out infinite",
      },
      maxWidth: {
        content: "840px",
        wide: "1200px",
      }
    },
  },
  plugins: [],
};

export default config;
