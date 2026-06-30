import type { QueryInstantResponse, QueryRangeResponse } from "./types.js";

export interface QueryOptions {
  /** API base URL; defaults to NEXT_PUBLIC_API_URL or http://localhost:3001 */
  baseUrl?: string;
}

/** Alert shape returned by GET /alerts (proxied from vmalert). */
export interface VmAlert {
  id: string;
  name: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  state: string;
  activeAt: string;
  value: string;
  alertId: string;
  groupId: string;
}

/** Shape of the GET /alerts response envelope. */
export interface AlertsResponse {
  data: {
    alerts: VmAlert[];
  };
}

function defaultBase(): string {
  // Works in both Node (server) and browser (NEXT_PUBLIC_ inlined by Next.js)
  if (typeof process !== "undefined" && process.env["NEXT_PUBLIC_API_URL"]) {
    return process.env["NEXT_PUBLIC_API_URL"];
  }
  return "http://localhost:3001";
}

/**
 * Instant PromQL query — maps to GET /metrics/query?query=<expr>
 */
export async function queryInstant(
  query: string,
  opts: QueryOptions = {},
): Promise<QueryInstantResponse> {
  const base = opts.baseUrl ?? defaultBase();
  const url = `${base}/metrics/query?query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`queryInstant failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<QueryInstantResponse>;
}

/**
 * Range PromQL query — maps to GET /metrics/query_range
 */
export async function queryRange(
  query: string,
  start: number,
  end: number,
  step: number,
  opts: QueryOptions = {},
): Promise<QueryRangeResponse> {
  const base = opts.baseUrl ?? defaultBase();
  const params = new URLSearchParams({
    query,
    start: String(start),
    end: String(end),
    step: String(step),
  });
  const url = `${base}/metrics/query_range?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`queryRange failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<QueryRangeResponse>;
}

/**
 * Fetch active alerts from the API (proxied from vmalert).
 * Returns an empty array when the upstream is unreachable or returns no alerts.
 */
export async function getAlerts(opts: QueryOptions = {}): Promise<VmAlert[]> {
  const base = opts.baseUrl ?? defaultBase();
  try {
    const res = await fetch(`${base}/alerts`);
    if (!res.ok) {
      return [];
    }
    const body = (await res.json()) as AlertsResponse;
    return body.data?.alerts ?? [];
  } catch {
    return [];
  }
}
