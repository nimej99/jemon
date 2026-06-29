import type { CatalogEntry } from '../schema.js';

export const networkEntries: CatalogEntry[] = [
  {
    key: 'net.ifHCInOctets',
    domain: 'network',
    title: 'Interface Inbound Bandwidth',
    unit: 'bps',
    source: { kind: 'snmp', oid: '1.3.6.1.2.1.31.1.1.1.6' },
    agg: 'rate',
    panel: 'line',
  },
  {
    key: 'net.ifHCOutOctets',
    domain: 'network',
    title: 'Interface Outbound Bandwidth',
    unit: 'bps',
    source: { kind: 'snmp', oid: '1.3.6.1.2.1.31.1.1.1.10' },
    agg: 'rate',
    panel: 'line',
  },
  {
    key: 'net.ifOperStatus',
    domain: 'network',
    title: 'Interface Operational Status',
    unit: '',
    source: { kind: 'snmp', oid: '1.3.6.1.2.1.2.2.1.8' },
    agg: 'last',
    panel: 'stat',
  },
  {
    key: 'net.ifInErrors',
    domain: 'network',
    title: 'Interface Inbound Errors',
    unit: 'errors/s',
    source: { kind: 'snmp', oid: '1.3.6.1.2.1.2.2.1.14' },
    agg: 'rate',
    panel: 'line',
  },
  {
    key: 'net.sysUpTime',
    domain: 'network',
    title: 'System Uptime',
    unit: 'timeticks',
    source: { kind: 'snmp', oid: '1.3.6.1.2.1.1.3.0' },
    agg: 'last',
    panel: 'stat',
  },
];
