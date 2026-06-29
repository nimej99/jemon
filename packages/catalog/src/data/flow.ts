import type { CatalogEntry } from '../schema.js';

export const flowEntries: CatalogEntry[] = [
  {
    key: 'flow.bytes_total',
    domain: 'flow',
    title: 'NetFlow Total Bytes',
    unit: 'bps',
    source: { kind: 'exporter', metric: 'flow_bytes_total' },
    agg: 'rate',
    panel: 'line',
  },
  {
    key: 'flow.flows_total',
    domain: 'flow',
    title: 'NetFlow Total Flows',
    unit: 'flows/s',
    source: { kind: 'exporter', metric: 'flow_records_total' },
    agg: 'rate',
    panel: 'line',
  },
  {
    key: 'flow.top_talker_bytes',
    domain: 'flow',
    title: 'Top Talker Bytes',
    unit: 'bps',
    source: { kind: 'exporter', metric: 'flow_top_talker_bytes_total' },
    agg: 'rate',
    kpi: { expr: 'flow.top_talker_bytes', warn: 100000000, crit: 500000000 },
    panel: 'heatmap',
  },
  {
    key: 'flow.top_talker_flows',
    domain: 'flow',
    title: 'Top Talker Flow Count',
    unit: 'flows/s',
    source: { kind: 'exporter', metric: 'flow_top_talker_records_total' },
    agg: 'rate',
    panel: 'table',
  },
];
