import type { CatalogEntry } from '../schema.js';

export const securityEntries: CatalogEntry[] = [
  {
    key: 'sec.syslog_rate',
    domain: 'security',
    title: 'Syslog Event Rate',
    unit: 'events/s',
    source: { kind: 'log', metric: 'syslog_messages_total' },
    agg: 'rate',
    panel: 'line',
  },
  {
    key: 'sec.failed_logins',
    domain: 'security',
    title: 'Failed Login Rate',
    unit: 'events/s',
    source: { kind: 'log', metric: 'auth_failed_logins_total' },
    agg: 'rate',
    kpi: { expr: 'sec.failed_logins', warn: 5, crit: 20 },
    panel: 'line',
  },
  {
    key: 'sec.fw_deny_rate',
    domain: 'security',
    title: 'Firewall Deny Rate',
    unit: 'packets/s',
    source: { kind: 'log', metric: 'firewall_denied_packets_total' },
    agg: 'rate',
    kpi: { expr: 'sec.fw_deny_rate', warn: 100, crit: 500 },
    panel: 'line',
  },
  {
    key: 'sec.ids_alerts',
    domain: 'security',
    title: 'IDS Alert Rate',
    unit: 'alerts/s',
    source: { kind: 'log', metric: 'ids_alerts_total' },
    agg: 'rate',
    kpi: { expr: 'sec.ids_alerts', warn: 1, crit: 10 },
    panel: 'line',
  },
];
