# Jemon Design System

Agent reference for generating consistent, dark-theme infrastructure dashboards.

---

## Colour Palette

### Background layer

| Token                | Hex / RGBA                     | Usage                             |
| -------------------- | ------------------------------ | --------------------------------- |
| `surface-deepest`    | `#0a0e1a`                      | Canvas background, 3-D ground     |
| `surface-base`       | `#060a12`                      | Ground plane mesh                 |
| `surface-elevated`   | `#0f172a`                      | Card backgrounds, panel headers   |
| `surface-overlay`    | `rgba(10,14,26,0.93)`          | Metric card backdrop              |
| `border-subtle`      | `#1e293b`                      | Progress-bar track, inner divider |
| `border-grid-cell`   | `#1e3a5f`                      | 3-D grid cell lines               |
| `border-grid-sec`    | `#1d4ed8`                      | 3-D grid section lines            |
| `border-card`        | `#1e3a5f`                      | Overlay card border               |

### Status / signal

| Token           | Hex       | Threshold                                   |
| --------------- | --------- | ------------------------------------------- |
| `status-ok`     | `#22c55e` | CPU/MEM/NET < 50 %, TEMP < 45 °C            |
| `status-warn`   | `#f59e0b` | CPU/MEM/NET 50–80 %, TEMP 45–70 °C          |
| `status-crit`   | `#ef4444` | CPU/MEM/NET > 80 %, TEMP > 70 °C            |

### Accent / brand

| Token             | Hex / RGBA                  | Usage                                 |
| ----------------- | --------------------------- | ------------------------------------- |
| `accent-primary`  | `#3b82f6`                   | Ledge strip emissive, glow tint       |
| `accent-bright`   | `#93c5fd`                   | Card label text                       |
| `accent-dim`      | `#1d4ed8`                   | Grid section lines                    |
| `glow-card`       | `rgba(59,130,246,0.18)`     | Box-shadow on metric cards            |

### Text

| Token            | Hex       | Usage                        |
| ---------------- | --------- | ---------------------------- |
| `text-primary`   | `#e2e8f0` | Body, values inside cards    |
| `text-secondary` | `#94a3b8` | Metric value suffix, labels  |
| `text-muted`     | `#64748b` | Metric key (CPU / MEM / NET) |

---

## Typography

| Role           | Stack                                         | Size  | Weight |
| -------------- | --------------------------------------------- | ----- | ------ |
| Metric key     | `ui-monospace, "Cascadia Code", monospace`    | 9 px  | 600    |
| Metric value   | same monospace stack                          | 9 px  | 400    |
| Card label     | same monospace stack                          | 9 px  | 700    |
| Panel heading  | `Inter, system-ui, sans-serif`                | 13 px | 600    |
| Body           | `Inter, system-ui, sans-serif`                | 12 px | 400    |

---

## Spacing Scale

```
4 · 6 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48
```

Applied as `padding`, `gap`, or `margin` values in CSS pixels.

---

## Component Geometry

### Metric overlay card
- `min-width`: 118 px
- `padding`: 6 px 8 px
- `border-radius`: 6 px
- `border`: 1 px solid `border-card`
- `backdrop-filter`: blur(6px)
- Progress bar height: 4 px, radius: 2 px

### 3-D building block
- Body material: `color: #1e293b`, metalness 0.35, roughness 0.65
- Ledge strips: 3 horizontal lines at 25 / 50 / 75 % of height
- Roof accent: 0.05-unit slab, `emissive` = status colour, pulsing when CPU > 80 %

---

## 3-D Camera & Lighting

| Parameter           | Value                          |
| ------------------- | ------------------------------ |
| Camera type         | OrthographicCamera             |
| Position            | `[12, 12, 12]`                 |
| Zoom                | 52                             |
| Ambient colour      | `#1e3a8a`, intensity 0.35      |
| Directional light   | `[8, 18, 8]`, intensity 1.6, colour `#dbeafe` |
| Hemisphere sky      | `#1e3a8a` / `#0a0e1a`, intensity 0.4 |
| Render mode         | `frameloop="demand"` (on-demand) |

---

## Status Thresholds (canonical)

```ts
// CPU / MEM / NET traffic (0–100 %)
function utilColor(v: number): '#22c55e' | '#f59e0b' | '#ef4444' {
  if (v < 50) return '#22c55e';
  if (v < 80) return '#f59e0b';
  return '#ef4444';
}

// Temperature (°C)
function tempColor(v: number): '#22c55e' | '#f59e0b' | '#ef4444' {
  if (v < 45) return '#22c55e';
  if (v < 70) return '#f59e0b';
  return '#ef4444';
}

// Temperature % for progress bar
function tempPct(v: number): number {
  return Math.min(100, Math.max(0, ((v - 20) / 65) * 100));
}
```

---

## Iconography

Use **Lucide React** icons only. No custom SVGs. Icon size default: 16 px.
