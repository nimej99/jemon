import { useState, useEffect, useCallback } from "react";
import { queryInstant, getAlerts } from "./client.js";
import type { MetricState, InstantResult } from "./types.js";
import type { VmAlert, QueryOptions } from "./client.js";

/**
 * React hook — polls a PromQL instant query on a fixed interval.
 *
 * @param query   PromQL expression
 * @param intervalMs  refresh interval (default 30 s)
 */
export function useMetric(
  query: string,
  intervalMs = 30_000,
): MetricState<InstantResult[]> {
  const [state, setState] = useState<MetricState<InstantResult[]>>({
    status: "idle",
  });

  const run = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await queryInstant(query);
      if (res.status === "success") {
        setState({ status: "success", data: res.data.result });
      } else {
        setState({ status: "error", error: res.error ?? "upstream error" });
      }
    } catch (err) {
      setState({ status: "error", error: String(err) });
    }
  }, [query]);

  useEffect(() => {
    void run();
    const id = setInterval(() => void run(), intervalMs);
    return () => clearInterval(id);
  }, [run, intervalMs]);

  return state;
}

export interface KpiResult {
  /** Parsed numeric value, or null when unavailable */
  value: number | null;
  warn: number | undefined;
  crit: number | undefined;
  /** Alarm level derived from warn/crit thresholds, or data-fetch lifecycle status */
  level: "ok" | "warn" | "crit" | "loading" | "error" | "idle";
}

/**
 * React hook — fetches a single PromQL metric and evaluates warn/crit thresholds.
 *
 * @param query  PromQL expression expected to return a single scalar
 * @param warn   percentage/value at which level becomes "warn"
 * @param crit   percentage/value at which level becomes "crit"
 */
export function useKpi(
  query: string,
  warn?: number,
  crit?: number,
): KpiResult {
  const state = useMetric(query);

  if (state.status !== "success") {
    return { value: null, warn, crit, level: state.status };
  }

  const raw = state.data[0]?.value[1];
  const value = raw !== undefined ? parseFloat(raw) : null;

  let level: "ok" | "warn" | "crit" = "ok";
  if (value !== null) {
    if (crit !== undefined && value >= crit) {
      level = "crit";
    } else if (warn !== undefined && value >= warn) {
      level = "warn";
    }
  }

  return { value, warn, crit, level };
}

/**
 * React hook — polls active alerts from the API on a fixed interval.
 * Degrades to an empty array when the upstream is unreachable.
 *
 * @param intervalMs  refresh interval (default 30 s)
 * @param opts        optional QueryOptions (baseUrl override)
 */
export function useAlerts(
  intervalMs = 30_000,
  opts?: QueryOptions,
): MetricState<VmAlert[]> {
  const [state, setState] = useState<MetricState<VmAlert[]>>({
    status: "idle",
  });

  const run = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const alerts = await getAlerts(opts);
      setState({ status: "success", data: alerts });
    } catch (err) {
      setState({ status: "error", error: String(err) });
    }
  }, [opts]);

  useEffect(() => {
    void run();
    const id = setInterval(() => void run(), intervalMs);
    return () => clearInterval(id);
  }, [run, intervalMs]);

  return state;
}
