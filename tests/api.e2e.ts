/**
 * API e2e — uses Fastify inject (no real port) so no external service is needed.
 *
 * Covers:
 *   GET /healthz
 *   GET /catalog                  (all entries)
 *   GET /catalog?domain=<domain>  (each of the 10 domains)
 *   GET /devices                  (empty initial state)
 *   POST /devices                 (create v2c and v3 devices)
 *   POST /devices (bad payload)   (400)
 *   GET /devices after POST       (masks credentials)
 */

import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---- env setup BEFORE any module from the API is imported ------------------
// The store derives _KEY from CRED_KEY at module load time; must be set first.
process.env['CRED_KEY'] = 'test-cred-key-for-unit-tests-0000';
process.env['ADMIN_USER'] = 'admin';
process.env['ADMIN_PASSWORD'] = 'admin-test-pw';

// ---- clear data/devices.json so no stale encrypted-with-other-key entries ---
const _here = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(_here, '..', 'services', 'api', 'data', 'devices.json');
const _originalDevices = existsSync(DATA_FILE) ? readFileSync(DATA_FILE, 'utf8') : '[]';
writeFileSync(DATA_FILE, '[]', 'utf8');
const USERS_FILE = join(_here, '..', 'services', 'api', 'data', 'users.json');
const _originalUsers = existsSync(USERS_FILE) ? readFileSync(USERS_FILE, 'utf8') : null;
if (existsSync(USERS_FILE)) writeFileSync(USERS_FILE, '[]', 'utf8');

// ---- dynamic import AFTER env is set ----------------------------------------
const { buildApp } = (await import('../services/api/dist/index.js')) as {
  buildApp: () => Promise<import('fastify').FastifyInstance>;
};

// Restore devices.json after the full test file finishes.
process.on('exit', () => {
  try { writeFileSync(DATA_FILE, _originalDevices, 'utf8'); } catch { /* ignore */ }
  try { if (_originalUsers !== null) writeFileSync(USERS_FILE, _originalUsers, 'utf8'); } catch { /* ignore */ }
});

let AUTHZ = '';

const DOMAINS = [
  'network', 'server', 'virtualization', 'app', 'db',
  'cloud', 'iot', 'security', 'flow', 'synthetic',
] as const;

// ---------------------------------------------------------------------------

describe('API e2e — /healthz', () => {
  let app: import('fastify').FastifyInstance;
  before(async () => { app = await buildApp(); });
  after(async () => { await app.close(); });

  it('GET /healthz → 200 { status: "ok" }', async () => {
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.json(), { status: 'ok' });
  });
});

// ---------------------------------------------------------------------------

describe('API e2e — /catalog', () => {
  let app: import('fastify').FastifyInstance;
  before(async () => { app = await buildApp(); });
  after(async () => { await app.close(); });

  it('GET /catalog returns a non-empty array', async () => {
    const res = await app.inject({ method: 'GET', url: '/catalog' });
    assert.equal(res.statusCode, 200);
    const body = res.json() as unknown[];
    assert.ok(Array.isArray(body), 'body must be an array');
    assert.ok(body.length > 0, 'catalog must not be empty');
  });

  it('GET /catalog returns ≥37 entries (cross-check minimum)', async () => {
    const res = await app.inject({ method: 'GET', url: '/catalog' });
    const body = res.json() as unknown[];
    assert.ok(
      body.length >= 37,
      `expected ≥37 entries, got ${body.length}`,
    );
  });

  it('every catalog entry has required fields', async () => {
    const res = await app.inject({ method: 'GET', url: '/catalog' });
    const entries = res.json() as Array<Record<string, unknown>>;
    for (const e of entries) {
      assert.ok(typeof e['key'] === 'string' && (e['key'] as string).length > 0, `entry missing key: ${JSON.stringify(e)}`);
      assert.ok(typeof e['domain'] === 'string', `entry ${e['key']} missing domain`);
      assert.ok(typeof e['title'] === 'string', `entry ${e['key']} missing title`);
      assert.ok(typeof e['agg'] === 'string', `entry ${e['key']} missing agg`);
      assert.ok(typeof e['panel'] === 'string', `entry ${e['key']} missing panel`);
      assert.ok(e['source'] !== null && typeof e['source'] === 'object', `entry ${e['key']} missing source`);
    }
  });

  for (const domain of DOMAINS) {
    it(`GET /catalog?domain=${domain} returns non-empty array`, async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/catalog?domain=${domain}`,
      });
      assert.equal(res.statusCode, 200, `domain ${domain} returned ${res.statusCode}`);
      const body = res.json() as unknown[];
      assert.ok(Array.isArray(body), `domain ${domain}: body must be array`);
      assert.ok(body.length > 0, `domain ${domain}: must have entries`);
    });
  }

  it('GET /catalog?domain=invalid → 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/catalog?domain=invalid',
    });
    assert.equal(res.statusCode, 400);
  });

  it('all 10 domains are represented in the full catalog', async () => {
    const res = await app.inject({ method: 'GET', url: '/catalog' });
    const entries = res.json() as Array<{ domain: string }>;
    const presentDomains = new Set(entries.map((e) => e.domain));
    for (const d of DOMAINS) {
      assert.ok(presentDomains.has(d), `domain '${d}' missing from catalog`);
    }
  });
});

// ---------------------------------------------------------------------------

describe('API e2e — /devices CRUD', () => {
  let app: import('fastify').FastifyInstance;
  before(async () => {
    // Reset the store file to empty before this suite so we get deterministic state.
    writeFileSync(DATA_FILE, '[]', 'utf8');
    app = await buildApp();
    const login = await app.inject({ method: 'POST', url: '/auth/login', payload: JSON.stringify({ username: 'admin', password: 'admin-test-pw' }), headers: { 'content-type': 'application/json' } });
    AUTHZ = 'Bearer ' + (login.json() as { token: string }).token;
  });
  after(async () => { await app.close(); });

  const device = {
    id: 'e2e-device-001',
    name: 'Core Switch',
    siteId: 'site-hq',
    ip: '10.0.0.1',
    snmp: { version: 'v2c' as const, community: 'public' },
  };

  it('GET /devices returns an empty array initially', async () => {
    const res = await app.inject({ method: 'GET', url: '/devices' });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.ok(Array.isArray(body), 'must be an array');
    assert.equal(body.length, 0, 'store should be empty at test start');
  });

  it('POST /devices with valid v2c payload → 201', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/devices',
      headers: { 'content-type': 'application/json', authorization: AUTHZ },
      payload: JSON.stringify(device),
    });
    assert.equal(res.statusCode, 201);
    assert.deepEqual(res.json(), { id: device.id });
  });

  it('POST /devices with valid v3 payload → 201', async () => {
    const v3Device = {
      id: 'e2e-device-v3-001',
      name: 'Edge Router',
      siteId: 'site-dr',
      ip: '10.0.1.1',
      snmp: {
        version: 'v3' as const,
        v3: {
          user: 'snmpv3user',
          authProto: 'SHA',
          authKey: 'authpassword123',
          privProto: 'AES',
          privKey: 'privpassword123',
        },
      },
    };
    const res = await app.inject({
      method: 'POST',
      url: '/devices',
      headers: { 'content-type': 'application/json', authorization: AUTHZ },
      payload: JSON.stringify(v3Device),
    });
    assert.equal(res.statusCode, 201);
    assert.deepEqual(res.json(), { id: v3Device.id });
  });

  it('GET /devices after POST includes the new device', async () => {
    const res = await app.inject({ method: 'GET', url: '/devices' });
    assert.equal(res.statusCode, 200);
    const devices = res.json() as Array<{ id: string }>;
    assert.ok(
      devices.some((d) => d.id === device.id),
      `device ${device.id} not found in list`,
    );
  });

  it('GET /devices masks SNMP community string', async () => {
    const res = await app.inject({ method: 'GET', url: '/devices' });
    assert.equal(res.statusCode, 200);
    const devices = res.json() as Array<{ id: string; snmp?: { community?: string } }>;
    const target = devices.find((d) => d.id === device.id);
    assert.ok(target !== undefined, 'device must be present');
    // Masked value must not equal the plaintext "public"
    assert.notEqual(
      target.snmp?.community,
      'public',
      'community should be masked, got "public"',
    );
    assert.equal(
      target.snmp?.community,
      '***',
      'community should be masked as "***"',
    );
  });

  it('GET /devices masks SNMPv3 authKey', async () => {
    const res = await app.inject({ method: 'GET', url: '/devices' });
    assert.equal(res.statusCode, 200);
    const devices = res.json() as Array<{ id: string; snmp?: { v3?: { authKey?: string } } }>;
    const target = devices.find((d) => d.id === 'e2e-device-v3-001');
    assert.ok(target !== undefined, 'v3 device must be present');
    assert.notEqual(
      target.snmp?.v3?.authKey,
      'authpassword123',
      'authKey should be masked',
    );
    assert.equal(target.snmp?.v3?.authKey, '***', 'authKey should be masked as "***"');
  });

  it('POST /devices with missing id → 400', async () => {
    const bad = { name: 'Bad Device', siteId: 's1', ip: '1.2.3.4', snmp: { version: 'v2c' } };
    const res = await app.inject({
      method: 'POST',
      url: '/devices',
      headers: { 'content-type': 'application/json', authorization: AUTHZ },
      payload: JSON.stringify(bad),
    });
    assert.equal(res.statusCode, 400);
  });

  it('POST /devices with empty id string → 400', async () => {
    const bad = { id: '', name: 'Bad', siteId: 's1', ip: '1.2.3.4', snmp: { version: 'v2c' } };
    const res = await app.inject({
      method: 'POST',
      url: '/devices',
      headers: { 'content-type': 'application/json', authorization: AUTHZ },
      payload: JSON.stringify(bad),
    });
    assert.equal(res.statusCode, 400);
  });

  it('POST /devices with invalid snmp version → 400', async () => {
    const bad = { id: 'x1', name: 'Bad', siteId: 's1', ip: '1.2.3.4', snmp: { version: 'v1' } };
    const res = await app.inject({
      method: 'POST',
      url: '/devices',
      headers: { 'content-type': 'application/json', authorization: AUTHZ },
      payload: JSON.stringify(bad),
    });
    assert.equal(res.statusCode, 400);
  });
});
