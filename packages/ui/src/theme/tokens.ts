/**
 * jemon design tokens — the single source of truth for every color, shadow,
 * and accent in generated dashboards.
 *
 * Rule: dashboard code MUST NOT contain hex literals. Everything routes
 * through these tokens (as CSS variables via <ThemeStyles/> or the Tailwind
 * preset, or as direct imports inside chart/scene configs).
 *
 * Mirrors `.claude/design/design-tokens.md`. Change both together.
 */

export const tokens = {
  color: {
    /* surfaces */
    bgPage: "#0A1220",
    bgNavrail: "#070D18",
    bgCard: "rgba(15, 27, 48, 0.92)",
    bgCardSolid: "#0F1B30",
    bgElevated: "#16233C",
    bgTrack: "rgba(255, 255, 255, 0.08)",
    bgHover: "rgba(255, 255, 255, 0.06)",

    /* borders */
    borderSubtle: "rgba(148, 163, 184, 0.12)",
    borderStrong: "rgba(148, 163, 184, 0.24)",

    /* text */
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",

    /* semantic status — meaning is fixed, never reassign */
    statusOk: "#22C55E",
    statusWarn: "#F59E0B",
    statusCrit: "#EF4444",
    statusInfo: "#38BDF8",

    /* metric accents — fixed per metric */
    accentPrimary: "#3B82F6" /* CPU, active nav, network lines */,
    accentGreen: "#22C55E" /* MEM */,
    accentTeal: "#2DD4BF" /* TRAFFIC */,
    accentAmber: "#F59E0B" /* TEMP */,
    accentPurple: "#A855F7" /* secondary series */,
    accentPink: "#EC4899",
    accentCyan: "#06B6D4",
    accentViolet: "#8B5CF6",
    accentEmerald: "#10B981",

    /* 3-D scene */
    sceneAmbient: "#0B1830",
    sceneWindow: "#FFD98A" /* emissive windows */,
    sceneGlow: "#38BDF8" /* network line / node bloom */,
  },

  shadow: {
    card: "0 8px 24px rgba(0, 0, 0, 0.35)",
  },
} as const;

/**
 * Device-identity palette — cycled across overlay-card icon chips.
 * Adjacent cards on the same screen must not share a color.
 */
export const devicePalette: readonly string[] = [
  tokens.color.accentGreen,
  tokens.color.accentPrimary,
  tokens.color.accentPurple,
  tokens.color.accentAmber,
  tokens.color.accentCyan,
  tokens.color.accentPink,
  tokens.color.accentViolet,
  tokens.color.accentEmerald,
];

/** Fixed metric→accent mapping (do not improvise). */
export const metricAccent = {
  cpu: tokens.color.accentPrimary,
  mem: tokens.color.accentGreen,
  traffic: tokens.color.accentTeal,
  temp: tokens.color.accentAmber,
} as const;

const kebab: Record<string, string> = {
  bgPage: "--bg-page",
  bgNavrail: "--bg-navrail",
  bgCard: "--bg-card",
  bgCardSolid: "--bg-card-solid",
  bgElevated: "--bg-elevated",
  bgTrack: "--bg-track",
  bgHover: "--bg-hover",
  borderSubtle: "--border-subtle",
  borderStrong: "--border-strong",
  textPrimary: "--text-primary",
  textSecondary: "--text-secondary",
  textMuted: "--text-muted",
  statusOk: "--status-ok",
  statusWarn: "--status-warn",
  statusCrit: "--status-crit",
  statusInfo: "--status-info",
  accentPrimary: "--accent-primary",
  accentGreen: "--accent-green",
  accentTeal: "--accent-teal",
  accentAmber: "--accent-amber",
  accentPurple: "--accent-purple",
  accentPink: "--accent-pink",
  accentCyan: "--accent-cyan",
  accentViolet: "--accent-violet",
  accentEmerald: "--accent-emerald",
  sceneAmbient: "--scene-ambient",
  sceneWindow: "--scene-window",
  sceneGlow: "--scene-glow",
};

/** `:root { --bg-page: … }` block generated from the token object. */
export const tokensCss: string = `:root {\n${Object.entries(tokens.color)
  .map(([k, v]) => `  ${kebab[k]}: ${v};`)
  .join("\n")}\n  --shadow-card: ${tokens.shadow.card};\n}`;
