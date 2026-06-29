import { z } from 'zod';

export const DomainSchema = z.enum([
  'network', 'server', 'virtualization', 'app', 'db',
  'cloud', 'iot', 'security', 'flow', 'synthetic',
]);
export type Domain = z.infer<typeof DomainSchema>;

export const CatalogEntrySchema = z.object({
  key: z.string().min(1),
  domain: DomainSchema,
  title: z.string().min(1),
  unit: z.string(),
  source: z.object({
    kind: z.enum(['snmp', 'exporter', 'log']),
    oid: z.string().optional(),
    metric: z.string().optional(),
  }),
  agg: z.enum(['avg', 'sum', 'max', 'min', 'rate', 'last']),
  kpi: z.object({
    expr: z.string(),
    warn: z.number().optional(),
    crit: z.number().optional(),
  }).optional(),
  panel: z.enum(['line', 'gauge', 'stat', 'table', 'heatmap']),
});

export type CatalogEntry = z.infer<typeof CatalogEntrySchema>;
