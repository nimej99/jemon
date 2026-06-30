import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { generateScrapeTargets } from '../dist/configgen.js';

// Must be set before the app module is loaded so config.ts picks it up.
process.env['CRED_KEY'] = 'test-cred-key-for-unit-tests-0000';

// Dynamic import after env is configured.
const { buildApp } = (await import('../dist/index.js')) as {
  buildApp: () => Promise<import('fastify').FastifyInstance>;
};

let app: import('fastify').FastifyInstance;

before(async () => {
  app = await buildApp();
  await app.ready();
});

after(async () => {
  await app.close();
});

test('GET /healthz returns 200', async () => {
  const res = await app.inject({ method: 'GET', url: '/healthz' });
  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(res.json(), { status: 'ok' });
});

test('GET /catalog?domain=network returns an array', async () => {
  const res = await app.inject({ method: 'GET', url: '/catalog?domain=network' });
  assert.strictEqual(res.statusCode, 200);
  const body: unknown = res.json();
  assert.ok(Array.isArray(body), 'expected array response from /catalog');
});

test('POST /devices then GET /devices masks credentials', async () => {
  const device = {
    id: 'test-device-masking',
    name: 'Test Router',
    siteId: 'site-1',
    ip: '192.168.1.100',
    snmp: { version: 'v2c', community: 'public' },
  };

  const post = await app.inject({
    method: 'POST',
    url: '/devices',
    payload: device,
    headers: { 'content-type': 'application/json' },
  });
  assert.strictEqual(post.statusCode, 201);
  assert.deepStrictEqual(post.json(), { id: 'test-device-masking' });

  const get = await app.inject({ method: 'GET', url: '/devices' });
  assert.strictEqual(get.statusCode, 200);
  const devices = get.json() as Array<{
    id: string;
    snmp: { community?: string };
  }>;
  const found = devices.find(d => d.id === 'test-device-masking');
  assert.ok(found, 'device should appear in GET /devices');
  assert.strictEqual(found.snmp.community, '***', 'community must be masked');
});

test('configgen generates vmagent scrape targets', () => {
  const devices = [
    {
      id: 'd1',
      name: 'switch-1',
      siteId: 'dc-east',
      ip: '10.0.0.1',
      snmp: { version: 'v2c' as const, community: 'private' },
    },
    {
      id: 'd2',
      name: 'router-1',
      siteId: 'dc-east',
      ip: '10.0.0.2',
      snmp: { version: 'v3' as const, v3: { user: 'admin', authProto: 'SHA', authKey: 'k', privProto: 'AES', privKey: 'p' } },
    },
  ];
  const targets = generateScrapeTargets(devices);
  assert.strictEqual(targets.length, 2);
  assert.deepStrictEqual(targets[0]!.targets, ['10.0.0.1:161']);
  assert.deepStrictEqual(targets[1]!.targets, ['10.0.0.2:161']);
  assert.strictEqual(targets[0]!.labels['snmp_version'], 'v2c');
  assert.strictEqual(targets[1]!.labels['snmp_version'], 'v3');
});

test('GET /metrics/query returns 502 when VM is unreachable', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/metrics/query?query=up',
  });
  assert.strictEqual(res.statusCode, 502);
  const body = res.json() as { error: string };
  assert.ok(body.error, 'expected error field in 502 response');
});

test('GET /metrics/query_range returns 400 on missing params', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/metrics/query_range',
  });
  assert.strictEqual(res.statusCode, 400);
  const body = res.json() as { error: string };
  assert.ok(body.error, 'expected error field in 400 response');
});

test('GET /metrics/query_range returns 400 on invalid step', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/metrics/query_range?query=up&start=0&end=3600&step=-1',
  });
  assert.strictEqual(res.statusCode, 400);
  const body = res.json() as { error: string };
  assert.ok(body.error, 'expected error field for non-positive step');
});

test('GET /metrics/query_range returns 502 when VM is unreachable', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/metrics/query_range?query=up&start=0&end=3600&step=60',
  });
  assert.strictEqual(res.statusCode, 502);
  const body = res.json() as { error: string };
  assert.ok(body.error, 'expected error field in 502 response');
});

test('GET /alerts returns graceful empty response when vmalert is unreachable', async () => {
  const res = await app.inject({ method: 'GET', url: '/alerts' });
  // Graceful fallback: always 200 with empty alerts array
  assert.strictEqual(res.statusCode, 200);
  const body = res.json() as { data: { alerts: unknown[] } };
  assert.ok(Array.isArray(body.data.alerts), 'expected data.alerts to be an array');
  assert.strictEqual(body.data.alerts.length, 0, 'expected empty alerts on vmalert failure');
});
