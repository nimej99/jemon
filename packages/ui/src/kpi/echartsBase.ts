import { devicePalette, tokens } from "../theme/tokens.js";

/**
 * Shared dark base for every ECharts option in the KPI kit. Merging this
 * first strips every trace of the stock ECharts theme: light background,
 * default category palette, and the bright default tooltip.
 */
export const echartsBase = {
  backgroundColor: "transparent",
  color: [...devicePalette],
  textStyle: {
    color: tokens.color.textSecondary,
    fontFamily: "Pretendard Variable, Inter, system-ui, sans-serif",
  },
  tooltip: {
    backgroundColor: tokens.color.bgElevated,
    borderColor: tokens.color.borderStrong,
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: tokens.color.textPrimary, fontSize: 12 },
  },
} as const;

/**
 * Apply an alpha channel to a token color. Handles `#RGB` / `#RRGGBB` hex
 * and `rgb()` / `rgba()` strings; any other input is returned unchanged.
 */
export function withAlpha(color: string, alpha: number): string {
  const a = Math.min(1, Math.max(0, alpha));
  const c = color.trim();

  if (c.startsWith("#")) {
    const raw = c.slice(1);
    const full =
      raw.length === 3
        ? raw
            .split("")
            .map((ch) => ch + ch)
            .join("")
        : raw.slice(0, 6);
    const int = Number.parseInt(full, 16);
    if (full.length === 6 && !Number.isNaN(int)) {
      const r = (int >> 16) & 0xff;
      const g = (int >> 8) & 0xff;
      const b = int & 0xff;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return color;
  }

  const m = /^rgba?\(([^)]+)\)$/i.exec(c);
  if (m?.[1]) {
    const [r = "0", g = "0", b = "0"] = m[1]
      .split(",")
      .map((part) => part.trim());
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  return color;
}
