/**
 * jemon Tailwind CSS preset — dark-first design tokens.
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
        surface: {
          DEFAULT: "#0f172a",
          card: "#1e293b",
          border: "#334155",
        },
        primary: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          muted: "#1d4ed8",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: "#64748b",
        "on-surface": "#f1f5f9",
        "on-muted": "#94a3b8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      borderRadius: {
        card: "0.5rem",
      },
    },
  },
} as const;
