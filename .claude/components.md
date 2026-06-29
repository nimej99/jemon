# Jemon Component Catalog

Authoritative list of UI components in `@jemon/ui`. Use these when generating dashboard code.

---

## Package Structure

```
@jemon/ui           → packages/ui
  .                 import from '@jemon/ui'        (P0 scaffold, stable)
  ./scenes          import from '@jemon/ui/scenes'  (P4 3-D scenes)
```

---

## `@jemon/ui/scenes`

### `CampusScene`

3-D isometric overview of a campus / data-centre floor. On-demand render (`frameloop="demand"`). Dark theme baked in.

```tsx
import { CampusScene } from '@jemon/ui/scenes';

<CampusScene
  width={900}
  height={620}
  buildings={buildings}
  onReady={() => console.log('canvas mounted')}
/>
```

**Props**

| Prop        | Type                    | Default | Description                          |
| ----------- | ----------------------- | ------- | ------------------------------------ |
| `buildings` | `BuildingData[]`        | –       | Array of buildings with live metrics |
| `width`     | `number`                | 800     | Container CSS width (px)             |
| `height`    | `number`                | 600     | Container CSS height (px)            |
| `onReady`   | `() => void`            | –       | Fires once when canvas is mounted    |

---

### `BuildingBlock`

A single 3-D building mesh with attached metric overlay card. Intended for use **inside** an R3F `<Canvas>`. Exported for compositional overrides.

```tsx
import { Canvas } from '@react-three/fiber';
import { BuildingBlock } from '@jemon/ui/scenes';

<Canvas>
  <BuildingBlock
    data={{
      id: 'row-3',
      label: 'ROW-3',
      position: [2, -1],
      size: [2, 3, 1.5],
      metrics: { cpu: 88, mem: 70, traffic: 55, temp: 72 },
    }}
  />
</Canvas>
```

**Props**

| Prop   | Type            | Description                       |
| ------ | --------------- | --------------------------------- |
| `data` | `BuildingData`  | Full building descriptor + metrics |

---

## Shared Types

```ts
// from '@jemon/ui/scenes'

interface BuildingMetrics {
  cpu:     number;  // 0–100 %
  mem:     number;  // 0–100 %
  traffic: number;  // 0–100 %
  temp:    number;  // °C
}

interface BuildingData {
  id:       string;
  label:    string;
  position: [number, number];       // [X, Z] world coords
  size:     [number, number, number]; // [width, height, depth]
  metrics:  BuildingMetrics;
}

interface CampusSceneProps {
  buildings: BuildingData[];
  width?:    number;
  height?:   number;
  onReady?:  () => void;
}
```

---

## Peer Requirements

The `./scenes` subpath requires the consumer to provide:

| Package                | Minimum |
| ---------------------- | ------- |
| `react`                | ≥ 18    |
| `react-dom`            | ≥ 18    |
| `three`                | ≥ 0.160 |
| `@react-three/fiber`   | ≥ 8.0   |
| `@react-three/drei`    | ≥ 9.0   |

---

## Planned Components (P5+)

| Name              | Package        | Status   |
| ----------------- | -------------- | -------- |
| `RackScene`       | `./scenes`     | planned  |
| `MetricSparkline` | `.` (main)     | planned  |
| `StatusBadge`     | `.` (main)     | planned  |

Add planned components here as they are scoped.
