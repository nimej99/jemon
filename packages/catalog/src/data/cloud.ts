import type { CatalogEntry } from '../schema.js';

export const cloudEntries: CatalogEntry[] = [
  {
    key: 'cloud.cpu_utilization',
    domain: 'cloud',
    title: 'Cloud Instance CPU Utilization',
    unit: '%',
    source: { kind: 'exporter', metric: 'aws_ec2_cpuutilization_average' },
    agg: 'avg',
    kpi: { expr: 'cloud.cpu_utilization', warn: 75, crit: 90 },
    panel: 'gauge',
  },
  {
    key: 'cloud.billing_cost',
    domain: 'cloud',
    title: 'Cloud Billing Cost',
    unit: 'USD',
    source: { kind: 'exporter', metric: 'aws_billing_estimated_charges' },
    agg: 'max',
    kpi: { expr: 'cloud.billing_cost', warn: 1000, crit: 5000 },
    panel: 'stat',
  },
  {
    key: 'cloud.lb_healthy_hosts',
    domain: 'cloud',
    title: 'LB Healthy Host Count',
    unit: 'hosts',
    source: { kind: 'exporter', metric: 'aws_alb_healthy_host_count_average' },
    agg: 'min',
    kpi: { expr: 'cloud.lb_healthy_hosts', warn: 2, crit: 1 },
    panel: 'stat',
  },
  {
    key: 'cloud.lb_request_rate',
    domain: 'cloud',
    title: 'LB Request Rate',
    unit: 'req/s',
    source: { kind: 'exporter', metric: 'aws_alb_request_count_sum' },
    agg: 'rate',
    panel: 'line',
  },
];
