import type { CatalogEntry } from '../schema.js';

export const syntheticEntries: CatalogEntry[] = [
  {
    key: 'synth.http_up',
    domain: 'synthetic',
    title: 'HTTP Endpoint Up',
    unit: '',
    source: { kind: 'exporter', metric: 'probe_success{module="http"}' },
    agg: 'last',
    kpi: { expr: 'synth.http_up', crit: 0 },
    panel: 'stat',
  },
  {
    key: 'synth.http_resp_time',
    domain: 'synthetic',
    title: 'HTTP Response Time',
    unit: 'ms',
    source: { kind: 'exporter', metric: 'probe_duration_seconds{module="http"}' },
    agg: 'avg',
    kpi: { expr: 'synth.http_resp_time', warn: 500, crit: 2000 },
    panel: 'line',
  },
  {
    key: 'synth.cert_expiry_days',
    domain: 'synthetic',
    title: 'TLS Certificate Expiry',
    unit: 'days',
    source: { kind: 'exporter', metric: 'probe_ssl_earliest_cert_expiry' },
    agg: 'min',
    kpi: { expr: 'synth.cert_expiry_days', warn: 30, crit: 7 },
    panel: 'gauge',
  },
  {
    key: 'synth.port_up',
    domain: 'synthetic',
    title: 'TCP Port Up',
    unit: '',
    source: { kind: 'exporter', metric: 'probe_success{module="tcp"}' },
    agg: 'last',
    kpi: { expr: 'synth.port_up', crit: 0 },
    panel: 'stat',
  },
];
