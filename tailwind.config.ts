import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (consumed via CSS vars — adapt to light/dark automatically)
        background: "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        card:        { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        border:      "hsl(var(--border))",
        ring:        "hsl(var(--ring))",
        primary:     { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },

        // Glass system
        surface: { base: "var(--bg-base)", elev1: "var(--bg-elev-1)", elev2: "var(--bg-elev-2)" },
        glass: {
          DEFAULT:       "var(--glass-bg)",
          strong:        "var(--glass-bg-strong)",
          soft:          "var(--glass-bg-soft)",
          border:        "var(--glass-border)",
          "border-strong": "var(--glass-border-strong)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          soft:    "var(--accent-soft)",
          glow:    "var(--accent-glow)",
        },
        // Legacy brutal tokens
        brutal: {
          black:  "var(--brutal-black)",
          white:  "var(--brutal-white)",
          green:  "var(--brutal-green)",
          pink:   "var(--brutal-pink)",
          yellow: "var(--brutal-yellow)",
        },
      },
      boxShadow: {
        glass:        "0 1px 0 var(--glass-highlight) inset, 0 8px 32px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.12)",
        "glass-soft": "0 1px 0 var(--glass-highlight) inset, 0 4px 18px rgba(0,0,0,0.10)",
        "glass-glow": "0 1px 0 var(--glass-highlight) inset, 0 0 0 1px var(--accent-glow), 0 0 32px var(--accent-glow)",
        brutal:       "0 1px 0 var(--glass-highlight) inset, 0 8px 32px rgba(0,0,0,0.18)",
        "brutal-lg":  "0 1px 0 var(--glass-highlight) inset, 0 12px 40px rgba(0,0,0,0.22)",
      },
      borderRadius: {
        glass:    "1.25rem",
        "glass-sm": "0.75rem",
        "glass-lg": "1.5rem",
      },
      fontFamily: {
        sans:   ["-apple-system", "BlinkMacSystemFont", "Inter", "SF Pro Display", "system-ui", "sans-serif"],
        brutal: ["-apple-system", "BlinkMacSystemFont", "Inter", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        glass: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
