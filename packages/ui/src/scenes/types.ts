import type { Thresholds } from "../lib/severity.js";

/* ────────────────────────────────────────────────────────────────────────────
 * Scene contracts (v1) — consumed by IsoCampusScene and the agent scaffolding.
 * `.claude/design/component-map.md` documents when to use what.
 * ──────────────────────────────────────────────────────────────────────────── */

export type SceneSeverity = "ok" | "warn" | "crit";

/** Live metrics shown in a device overlay card. */
export interface DeviceMetrics {
  /** CPU utilisation 0–100 % */
  cpu: number;
  /** Memory utilisation 0–100 % */
  mem: number;
  /** Interface traffic in Mbps (formatted via fmtBps) */
  trafficMbps: number;
  /** Temperature °C */
  temp: number;
}

/** Building silhouette variants — picks the low-poly primitive combination. */
export type BuildingKind =
  | "lecture" /* rectangular slab, row windows */
  | "lab" /* L-shaped block */
  | "library" /* wide block + arched roof */
  | "gym" /* barrel/curved roof hall */
  | "dorm" /* tall tower */
  | "admin" /* small block + flat roof */
  | "itcenter" /* block + rooftop equipment */
  | "hall" /* glass atrium block */
  | "office"
  | "factory" /* sawtooth roof */
  | "warehouse"
  | "apartment" /* repeated tower slabs */
  | "house"
  | "datacenter";

/** One monitored building/asset group in the campus scene. */
export interface CampusBuilding {
  id: string;
  /** Device code, e.g. "NOVA-01" — bold line of the overlay card. */
  code: string;
  /** Location label, e.g. "강의동 A". */
  label: string;
  kind: BuildingKind;
  /** World-space [X, Z] centre of the footprint. +X → right, +Z → viewer. */
  position: [number, number];
  /** Footprint [width, depth] in world units (default derived from kind). */
  footprint?: [number, number];
  /** Number of floors (drives height; default derived from kind). */
  floors?: number;
  /** Y-axis rotation in radians. */
  rotationY?: number;
  metrics: DeviceMetrics;
  /** Active connected users/sessions. */
  users: number;
  /** Device-identity accent (defaults to devicePalette[index % len]). */
  accent?: string;
  /** Overall device severity — drives card border / chip / node color. */
  severity?: SceneSeverity;
  /**
   * Which side of the building the overlay card floats on.
   * Cards are pushed outward to the scene edges to avoid overlap.
   */
  cardAnchor?: "left" | "right" | "top" | "bottom";
}

/** Logical link rendered as a glowing flow line between two buildings. */
export interface TopologyLink {
  from: string;
  to: string;
  status?: "up" | "down";
}

export interface SceneThresholds {
  cpu?: Thresholds;
  mem?: Thresholds;
  temp?: Thresholds;
  /** traffic utilisation % thresholds against trafficCapacityMbps */
  traffic?: Thresholds;
}

export interface IsoCampusSceneProps {
  buildings: CampusBuilding[];
  links?: TopologyLink[];
  /** Currently hovered building (controlled) — highlights scene + card. */
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  /** Metric severity thresholds (catalog defaults if omitted). */
  thresholds?: SceneThresholds;
  /** Reference capacity for traffic bar fill (default 1000 Mbps). */
  trafficCapacityMbps?: number;
  /** Render device overlay cards (default true). */
  showCards?: boolean;
  /** Extra classes on the container (sizing is the parent's job). */
  className?: string;
}

/* ── legacy v0 contracts (CampusScene/BuildingBlock) — to be removed ── */

/** @deprecated use DeviceMetrics */
export interface BuildingMetrics {
  cpu: number;
  mem: number;
  traffic: number;
  temp: number;
}

/** @deprecated use CampusBuilding */
export interface BuildingData {
  id: string;
  label: string;
  position: [number, number];
  size: [number, number, number];
  metrics: BuildingMetrics;
}

/** @deprecated use IsoCampusSceneProps */
export interface CampusSceneProps {
  buildings: BuildingData[];
  width?: number;
  height?: number;
  onReady?: () => void;
}
