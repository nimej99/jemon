/**
 * jemon Tailwind CSS preset — dark-first, routed through the token CSS
 * variables injected by <ThemeStyles/>. Values live in ./tokens.ts only.
 *
 * Usage in tailwind.config.ts:
 *   import { jemonPreset } from "@jemon/ui/preset"
 *   export default { presets: [jemonPreset], ... }
 */
export const jemonPreset = {
  darkMode: "class" as const,
  theme: {
    extend: {
      colors: {
        /* surfaces */
        page: "var(--bg-page)",
        navrail: "var(--bg-navrail)",
        card: {
          DEFAULT: "var(--bg-card)",
          solid: "var(--bg-card-solid)",
        },
        elevated: "var(--bg-elevated)",
        track: "var(--bg-track)",

        /* text */
        "on-surface": "var(--text-primary)",
        "on-muted": "var(--text-secondary)",
        muted: "var(--text-muted)",

        /* semantic status */
        ok: "var(--status-ok)",
        warn: "var(--status-warn)",
        crit: "var(--status-crit)",
        info: "var(--status-info)",
        success: "var(--status-ok)",
        warning: "var(--status-warn)",
        danger: "var(--status-crit)",

        /* accents */
        primary: {
          DEFAULT: "var(--accent-primary)",
          hover: "#2563EB",
          muted: "#1D4ED8",
        },
        accent: {
          blue: "var(--accent-primary)",
          green: "var(--accent-green)",
          teal: "var(--accent-teal)",
          amber: "var(--accent-amber)",
          purple: "var(--accent-purple)",
          pink: "var(--accent-pink)",
          cyan: "var(--accent-cyan)",
          violet: "var(--accent-violet)",
          emerald: "var(--accent-emerald)",
        },

        /* legacy aliases (pre-token pages) */
        surface: {
          DEFAULT: "var(--bg-page)",
          card: "var(--bg-card-solid)",
          border: "var(--border-strong)",
        },
      },
      borderColor: {
        DEFAULT: "var(--border-subtle)",
        subtle: "var(--border-subtle)",
        strong: "var(--border-strong)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      borderRadius: {
        card: "0.75rem" /* cards 12px */,
        hero: "1.5rem" /* hero scene container 24px */,
      },
      letterSpacing: {
        micro: "0.06em",
      },
    },
  },
} as const;
