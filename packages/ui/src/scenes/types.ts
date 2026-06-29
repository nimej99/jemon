/** Per-building live metrics shown in the 3-D overlay card. */
export interface BuildingMetrics {
  /** CPU utilisation 0–100 % */
  cpu: number;
  /** Memory utilisation 0–100 % */
  mem: number;
  /** Network traffic utilisation 0–100 % */
  traffic: number;
  /** Temperature in °C */
  temp: number;
}

/** A single building in the campus scene. */
export interface BuildingData {
  id: string;
  /** Human-readable label rendered on the metric card. */
  label: string;
  /**
   * World-space [X, Z] centre of the building footprint.
   * Y (height) is derived from `size[1]`.
   */
  position: [number, number];
  /**
   * [width, height, depth] in world units.
   * Suggested scale: 1 unit ≈ 1 rack or server row.
   */
  size: [number, number, number];
  metrics: BuildingMetrics;
}

/** Props for the top-level CampusScene component. */
export interface CampusSceneProps {
  buildings: BuildingData[];
  /** Canvas width in CSS pixels (default 800). */
  width?: number;
  /** Canvas height in CSS pixels (default 600). */
  height?: number;
  /** Called when the canvas is fully mounted. */
  onReady?: () => void;
}
