/** Prometheus-compatible instant query result item */
export interface InstantResult {
  metric: Record<string, string>;
  /** [unix_timestamp, value_string] */
  value: [number, string];
}

/** Prometheus-compatible range query result item */
export interface RangeResult {
  metric: Record<string, string>;
  /** [[unix_timestamp, value_string], ...] */
  values: [number, string][];
}

export interface QueryInstantResponse {
  status: "success" | "error";
  data: {
    resultType: "vector";
    result: InstantResult[];
  };
  errorType?: string;
  error?: string;
}

export interface QueryRangeResponse {
  status: "success" | "error";
  data: {
    resultType: "matrix";
    result: RangeResult[];
  };
  errorType?: string;
  error?: string;
}

export type MetricStatus = "idle" | "loading" | "error";

export type MetricState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

/** Mirrors @jemon/catalog CatalogEntry shape without the dependency */
export interface CatalogEntry {
  key: string;
  domain: string;
  title: string;
  unit: string;
  source: { kind: string; oid?: string; metric?: string };
  agg: string;
  kpi?: { expr: string; warn?: number; crit?: number };
  panel: string;
}
