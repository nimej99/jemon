import Fastify from 'fastify';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import { VM_URL, VMALERT_URL, PORT } from './config.js';
import { addDevice, getDevices, loadStore } from './store.js';
import { getByDomain, loadCatalog } from '@jemon/catalog';

// Local domain enum for query-param validation (mirrors catalog contract).
const domainEnum = z.enum([
  'network',
  'server',
  'virtualization',
  'app',
  'db',
  'cloud',
  'iot',
  'security',
  'flow',
  'synthetic',
]);

type Domain = z.infer<typeof domainEnum>;

const DeviceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  siteId: z.string().min(1),
  ip: z.string().min(1),
  snmp: z.object({
    version: z.enum(['v2c', 'v3']),
    community: z.string().optional(),
    v3: z
      .object({
        user: z.string(),
        authProto: z.string(),
        authKey: z.string(),
        privProto: z.string(),
        privKey: z.string(),
      })
      .optional(),
  }),
});

const QueryRangeParamsSchema = z.object({
  query: z.string().min(1),
  start: z.coerce.number(),
  end: z.coerce.number(),
  step: z.coerce.number().positive(),
});

export async function buildApp() {
  const app = Fastify({ logger: false });

  await loadStore();

  app.get('/healthz', async () => ({ status: 'ok' }));

  app.get('/metrics/query', async (req, reply) => {
    const r = z.object({ query: z.string().min(1) }).safeParse(req.query);
    if (!r.success) {
      return reply.status(400).send({ error: r.error.message });
    }
    try {
      const upstream = await fetch(
        `${VM_URL}/api/v1/query?query=${encodeURIComponent(r.data.query)}`,
      );
      const body = (await upstream.json()) as unknown;
      return reply.status(upstream.status).send(body);
    } catch {
      return reply.status(502).send({ error: 'upstream unavailable' });
    }
  });

  app.get('/metrics/query_range', async (req, reply) => {
    const r = QueryRangeParamsSchema.safeParse(req.query);
    if (!r.success) {
      return reply.status(400).send({ error: r.error.message });
    }
    const { query, start, end, step } = r.data;
    try {
      const params = new URLSearchParams({
        query,
        start: String(start),
        end: String(end),
        step: String(step),
      });
      const upstream = await fetch(
        `${VM_URL}/api/v1/query_range?${params.toString()}`,
      );
      const body = (await upstream.json()) as unknown;
      return reply.status(upstream.status).send(body);
    } catch {
      return reply.status(502).send({ error: 'upstream unavailable' });
    }
  });

  app.get('/alerts', async (_req, reply) => {
    try {
      const upstream = await fetch(`${VMALERT_URL}/api/v1/alerts`);
      const body = (await upstream.json()) as unknown;
      return reply.status(upstream.status).send(body);
    } catch {
      // vmalert may not be running in all environments; degrade gracefully.
      return reply.send({ data: { alerts: [] } });
    }
  });

  app.get('/catalog', async (req, reply) => {
    const r = z.object({ domain: domainEnum.optional() }).safeParse(req.query);
    if (!r.success) {
      return reply.status(400).send({ error: r.error.message });
    }
    const { domain } = r.data;
    if (domain !== undefined) {
      return reply.send(getByDomain(domain as Domain));
    }
    return reply.send(loadCatalog());
  });

  app.get('/devices', async () => getDevices());

  app.post('/devices', async (req, reply) => {
    const r = DeviceSchema.safeParse(req.body);
    if (!r.success) {
      return reply.status(400).send({ error: r.error.message });
    }
    await addDevice(r.data);
    return reply.status(201).send({ id: r.data.id });
  });

  return app;
}

// Start the server only when executed as the entry point.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await buildApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`jemon-api listening on :${PORT}`);
}
