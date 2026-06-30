export { queryInstant, queryRange, getAlerts } from "./client.js";
export type { QueryOptions, VmAlert, AlertsResponse } from "./client.js";

export { getCatalog } from "./catalog.js";
export type { GetCatalogOptions } from "./catalog.js";

export { useMetric, useKpi, useAlerts } from "./hooks.js";
export type { KpiResult } from "./hooks.js";

export type {
  InstantResult,
  RangeResult,
  QueryInstantResponse,
  QueryRangeResponse,
  MetricState,
  CatalogEntry,
} from "./types.js";
