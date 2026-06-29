# Jemon Design Set — Reference Reproduction Guides

Visual reference → dashboard code, step by step.

---

## Reference 1 — Campus Bird's-Eye (CampusScene)

See `.claude/golden/campus-example.md` for a complete implementation.

Quick-start:

```tsx
import { CampusScene } from '@jemon/ui/scenes';

<CampusScene width={960} height={660} buildings={myBuildings} />
```

---

## Reference 2 — Server Room Rack (seed guide)

### What the reference shows

A typical data-centre server room viewed from the front aisle:

- **Rack rows** arranged in alternating hot/cold aisles
- **Individual rack units (U)** within each rack — 1U/2U/4U servers, patch panels, PDUs
- **Status indicators** — front LEDs per unit (green = ok, amber = warn, red = fault)
- **Cable management** — colour-coded patch cables per VLAN/purpose
- **Environmental sensors** — top-of-rack temp/humidity display panels

### Spatial decomposition

| Level       | Jemon abstraction       | Description                              |
| ----------- | ----------------------- | ---------------------------------------- |
| Room        | `CampusScene`           | Full floor overview, racks as buildings  |
| Rack        | `BuildingData`          | Single cabinet, 42U tall                |
| Unit group  | `BuildingMetrics`       | Aggregated metrics for the whole rack    |

For future `RackScene` (P5+), a rack unit maps to a `SlotData` descriptor with `{ slot, label, height, metrics }`.

### Seed: 4-row, 3-rack-per-row floor

The following `BuildingData[]` seed reproduces a typical "8-rack compute pod" layout visible in server-room rack photographs, with a central network spine:

```ts
import type { BuildingData } from '@jemon/ui/scenes';

// Unit: 1 unit ≈ 1 standard 42U cabinet (600 mm wide × 2000 mm tall × 1000 mm deep)
// Scale: [width, height, depth] in scene units
// height = 4.2 represents 42U at 1 unit per 10U

const RACK_FLOOR: BuildingData[] = [
  // ── Row A — compute ──
  { id: 'A1', label: 'A1', position: [-6, -4], size: [1, 4.2, 1], metrics: { cpu: 76, mem: 68, traffic: 55, temp: 54 } },
  { id: 'A2', label: 'A2', position: [-4, -4], size: [1, 4.2, 1], metrics: { cpu: 82, mem: 74, traffic: 61, temp: 59 } },
  { id: 'A3', label: 'A3', position: [-2, -4], size: [1, 4.2, 1], metrics: { cpu: 91, mem: 85, traffic: 70, temp: 68 } },

  // ── Row B — compute ──
  { id: 'B1', label: 'B1', position: [2,  -4], size: [1, 4.2, 1], metrics: { cpu: 55, mem: 60, traffic: 42, temp: 47 } },
  { id: 'B2', label: 'B2', position: [4,  -4], size: [1, 4.2, 1], metrics: { cpu: 48, mem: 52, traffic: 38, temp: 43 } },
  { id: 'B3', label: 'B3', position: [6,  -4], size: [1, 4.2, 1], metrics: { cpu: 63, mem: 58, traffic: 46, temp: 50 } },

  // ── Row C — storage ──
  { id: 'C1', label: 'C1', position: [-6,  0], size: [1, 3, 1], metrics: { cpu: 22, mem: 88, traffic: 74, temp: 40 } },
  { id: 'C2', label: 'C2', position: [-4,  0], size: [1, 3, 1], metrics: { cpu: 18, mem: 91, traffic: 79, temp: 38 } },

  // ── Network spine ──
  { id: 'NET', label: 'NET', position: [0, 0], size: [1.5, 2, 1], metrics: { cpu: 12, mem: 28, traffic: 88, temp: 35 } },

  // ── OOB management ──
  { id: 'MGT', label: 'MGT', position: [4,  0], size: [1, 1.5, 1], metrics: { cpu: 8, mem: 20, traffic: 10, temp: 30 } },
];
```

### Reproduction steps

1. **Import** `CampusScene` from `@jemon/ui/scenes`.
2. **Paste** `RACK_FLOOR` above as the `buildings` prop.
3. **Adjust** `position` values so racks align with the physical row layout from the photograph.
4. **Set height scale** — `4.2` units for a standard 42U rack looks correct at zoom 52.
5. **Map live data** — replace seed `metrics` with real Prometheus/VictoriaMetrics values from `@jemon/metric-sdk`.

### Colour-reading conventions for rack photographs

When analysing a rack-room photo with the `image-to-dashboard` skill:

| What you see in the photo             | Map to                                    |
| ------------------------------------- | ----------------------------------------- |
| Green unit LEDs throughout a rack     | `cpu < 50`, `temp < 45`                   |
| Several amber LEDs in a rack          | `cpu` in 50–80 range                      |
| Any red LED                           | `cpu > 80` or `temp > 70`                 |
| Dense cable fill, brightly coloured   | `traffic > 70`                            |
| Sparse cables, mostly grey            | `traffic < 40`                            |
| Top-of-rack sensor reading > 28 °C    | `temp` = sensor value                     |
| Rear-door heat-exchanger installed    | `temp` floor = 38 (cooled)                |

### Hot-aisle / cold-aisle indicator

Racks facing **cold aisle** (front intake side visible): normal temperature ranges.
Racks facing **hot aisle** (exhaust side visible in photo): add 8–12 °C to seed values.

---

## Adding a New Reference Scene

1. Add a `BuildingData[]` seed in this file under a new `## Reference N` section.
2. Create a golden example in `.claude/golden/<scene-name>.md`.
3. Implement the scene in `packages/ui/src/scenes/` following the `CampusScene` pattern.
4. Export it from `packages/ui/src/scenes/index.ts`.
5. Document props in `.claude/components.md`.
6. Run `.claude/acceptance-checklist.md` before opening a PR.
