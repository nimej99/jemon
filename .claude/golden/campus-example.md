# Golden Example — CampusScene (5-building cluster)

Reference implementation. Copy-paste ready. Verified with `pnpm --filter @jemon/ui build`.

---

## Usage

```tsx
// apps/web/src/pages/campus.tsx  (or any React 18 file in the consumer)
'use client';

import { CampusScene } from '@jemon/ui/scenes';
import type { BuildingData } from '@jemon/ui/scenes';

const BUILDINGS: BuildingData[] = [
  {
    id: 'dc-a',
    label: 'DC-A',
    position: [-5, -4],
    size: [3.5, 3, 2.5],
    metrics: { cpu: 72, mem: 58, traffic: 44, temp: 51 },
  },
  {
    id: 'dc-b',
    label: 'DC-B',
    position: [0, -4],
    size: [3.5, 4.5, 2.5],
    metrics: { cpu: 88, mem: 71, traffic: 62, temp: 67 },
  },
  {
    id: 'dc-c',
    label: 'DC-C',
    position: [5, -4],
    size: [3, 2, 2.5],
    metrics: { cpu: 34, mem: 42, traffic: 28, temp: 38 },
  },
  {
    id: 'net-core',
    label: 'NET-CORE',
    position: [-2.5, 2],
    size: [2, 1.5, 2],
    metrics: { cpu: 18, mem: 32, traffic: 85, temp: 33 },
  },
  {
    id: 'mgmt',
    label: 'MGMT',
    position: [2.5, 2],
    size: [2, 1, 2],
    metrics: { cpu: 9, mem: 22, traffic: 12, temp: 28 },
  },
];

export default function CampusPage() {
  return (
    <main style={{ padding: 32, background: '#060a12', minHeight: '100vh' }}>
      <h1
        style={{
          color: '#93c5fd',
          fontFamily: 'Inter, system-ui, sans-serif',
          marginBottom: 24,
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        Infrastructure Campus
      </h1>

      <CampusScene
        width={960}
        height={660}
        buildings={BUILDINGS}
        onReady={() => console.info('[campus] scene ready')}
      />
    </main>
  );
}
```

---

## What you see

| Building  | CPU     | Roof colour | Card indicator |
| --------- | ------- | ----------- | -------------- |
| DC-A      | 72 %    | amber       | warn level     |
| DC-B      | 88 %    | red         | pulsing roof   |
| DC-C      | 34 %    | green       | nominal        |
| NET-CORE  | 18 %    | green       | NET bar at 85 %|
| MGMT      | 9 %     | green       | all nominal    |

**DC-B** should visually stand out — its roof pulses via `useFrame` because `cpu > 80`.

---

## Layout intuition

The `position: [X, Z]` grid maps to three.js world space:

```
        Z axis (depth)
        ↑
  -Z ───┼──── +Z
        │
-X ─────┼───── +X
        │
        ↓

Camera at [12, 12, 12] → you see a 45° plan view.
+X = screen-right / +Z = screen-down in isometric projection.
```

Arrange buildings on a 1-unit grid. Allow ~1 unit of clearance between buildings so metric cards don't overlap.

---

## Live data integration

Replace the static array with a live hook, e.g.:

```tsx
import { useMetrics } from '@jemon/metric-sdk';

const { data: metrics } = useMetrics({ domain: 'campus' });

const buildings: BuildingData[] = metrics?.map((m) => ({
  id: m.nodeId,
  label: m.nodeId.toUpperCase(),
  position: m.position,
  size: m.size,
  metrics: {
    cpu:     m.cpu_utilisation_pct ?? 0,
    mem:     m.memory_utilisation_pct ?? 0,
    traffic: m.network_utilisation_pct ?? 0,
    temp:    m.temperature_celsius ?? 20,
  },
})) ?? [];
```

Call `invalidate()` from `useThree` whenever metric data refreshes to trigger an on-demand re-render.
