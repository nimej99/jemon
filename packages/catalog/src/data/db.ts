import type { CatalogEntry } from '../schema.js';

export const dbEntries: CatalogEntry[] = [
  {
    key: 'db.connections',
    domain: 'db',
    title: 'DB Active Connections',
    unit: 'connections',
    source: { kind: 'exporter', metric: 'pg_stat_activity_count' },
    agg: 'avg',
    kpi: { expr: 'db.connections', warn: 80, crit: 100 },
    panel: 'gauge',
  },
  {
    key: 'db.query_latency_p95',
    domain: 'db',
    title: 'Query Latency p95',
    unit: 'ms',
    source: { kind: 'exporter', metric: 'pg_stat_statements_mean_exec_time' },
    agg: 'max',
    kpi: { expr: 'db.query_latency_p95', warn: 100, crit: 500 },
    panel: 'line',
  },
  {
    key: 'db.locks',
    domain: 'db',
    title: 'DB Lock Count',
    unit: 'locks',
    source: { kind: 'exporter', metric: 'pg_locks_count' },
    agg: 'sum',
    kpi: { expr: 'db.locks', warn: 20, crit: 50 },
    panel: 'line',
  },
  {
    key: 'db.repl_lag',
    domain: 'db',
    title: 'Replication Lag',
    unit: 's',
    source: { kind: 'exporter', metric: 'pg_replication_lag' },
    agg: 'max',
    kpi: { expr: 'db.repl_lag', warn: 30, crit: 120 },
    panel: 'gauge',
  },
];
