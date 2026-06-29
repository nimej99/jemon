import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog, getByDomain, getByKey, CatalogEntrySchema } from '../src/index.js';

const ALL_DOMAINS = [
  'network', 'server', 'virtualization', 'app', 'db',
  'cloud', 'iot', 'security', 'flow', 'synthetic',
] as const;

describe('catalog', () => {
  it('all entries pass zod validation', () => {
    const entries = loadCatalog();
    assert.ok(entries.length > 0, 'catalog must not be empty');
    for (const e of entries) {
      const result = CatalogEntrySchema.safeParse(e);
      assert.ok(result.success, `entry ${e.key} failed validation`);
    }
  });

  it('no duplicate keys', () => {
    const entries = loadCatalog();
    const keys = entries.map((e) => e.key);
    const unique = new Set(keys);
    assert.equal(unique.size, keys.length, 'duplicate keys found');
  });

  it('all 10 domains are present in catalog', () => {
    const entries = loadCatalog();
    const domains = new Set(entries.map((e) => e.domain));
    for (const d of ALL_DOMAINS) {
      assert.ok(domains.has(d), `domain '${d}' is missing from catalog`);
    }
  });

  it('each domain has at least 4 entries', () => {
    for (const d of ALL_DOMAINS) {
      const entries = getByDomain(d);
      assert.ok(
        entries.length >= 4,
        `domain '${d}' has only ${entries.length} entries (min 4 required)`,
      );
    }
  });

  it('getByDomain returns non-empty array for network and server', () => {
    assert.ok(getByDomain('network').length > 0, 'network domain is empty');
    assert.ok(getByDomain('server').length > 0, 'server domain is empty');
  });

  it('getByKey returns correct entry', () => {
    const entry = getByKey('net.ifHCInOctets');
    assert.ok(entry !== undefined, 'entry not found');
    assert.equal(entry.domain, 'network');
    assert.equal(entry.agg, 'rate');
  });

  it('app domain contains 2xx/4xx/5xx/p95/jvm/envoy entries', () => {
    const app = getByDomain('app');
    const keys = app.map((e) => e.key);
    assert.ok(keys.includes('app.http_2xx_rate'), 'missing http_2xx_rate');
    assert.ok(keys.includes('app.http_4xx_rate'), 'missing http_4xx_rate');
    assert.ok(keys.includes('app.http_5xx_rate'), 'missing http_5xx_rate');
    assert.ok(keys.includes('app.http_p95_latency'), 'missing http_p95_latency');
    assert.ok(keys.includes('app.jvm_heap_used'), 'missing jvm_heap_used');
    assert.ok(keys.includes('app.envoy_upstream_rq_total'), 'missing envoy_upstream_rq_total');
  });

  it('db domain contains connections/latency/locks/repl-lag', () => {
    const db = getByDomain('db');
    const keys = db.map((e) => e.key);
    assert.ok(keys.includes('db.connections'), 'missing db.connections');
    assert.ok(keys.includes('db.query_latency_p95'), 'missing db.query_latency_p95');
    assert.ok(keys.includes('db.locks'), 'missing db.locks');
    assert.ok(keys.includes('db.repl_lag'), 'missing db.repl_lag');
  });

  it('iot domain has snmp-sourced entries with kpi thresholds', () => {
    const iot = getByDomain('iot');
    const snmpEntries = iot.filter((e) => e.source.kind === 'snmp');
    assert.ok(snmpEntries.length >= 4, 'iot should have at least 4 snmp entries');
    const withKpi = iot.filter((e) => e.kpi !== undefined);
    assert.ok(withKpi.length >= 3, 'iot should have at least 3 entries with kpi');
  });

  it('security domain uses log source kind', () => {
    const sec = getByDomain('security');
    const logEntries = sec.filter((e) => e.source.kind === 'log');
    assert.ok(logEntries.length >= 4, 'security should have at least 4 log-sourced entries');
  });

  it('synthetic domain contains http-up/resp-time/cert-expiry/port-up', () => {
    const synth = getByDomain('synthetic');
    const keys = synth.map((e) => e.key);
    assert.ok(keys.includes('synth.http_up'), 'missing synth.http_up');
    assert.ok(keys.includes('synth.http_resp_time'), 'missing synth.http_resp_time');
    assert.ok(keys.includes('synth.cert_expiry_days'), 'missing synth.cert_expiry_days');
    assert.ok(keys.includes('synth.port_up'), 'missing synth.port_up');
  });

  it('flow domain contains netflow bytes/flows and top talkers', () => {
    const flow = getByDomain('flow');
    const keys = flow.map((e) => e.key);
    assert.ok(keys.includes('flow.bytes_total'), 'missing flow.bytes_total');
    assert.ok(keys.includes('flow.flows_total'), 'missing flow.flows_total');
    assert.ok(keys.includes('flow.top_talker_bytes'), 'missing flow.top_talker_bytes');
    assert.ok(keys.includes('flow.top_talker_flows'), 'missing flow.top_talker_flows');
  });

  it('kpi entries have valid expr strings', () => {
    const entries = loadCatalog();
    for (const e of entries) {
      if (e.kpi) {
        assert.ok(typeof e.kpi.expr === 'string' && e.kpi.expr.length > 0, `kpi.expr invalid on ${e.key}`);
      }
    }
  });

  it('invalid entry fails zod validation', () => {
    const bad = { key: '', domain: 'invalid-domain', title: '', unit: '', source: { kind: 'snmp' }, agg: 'avg', panel: 'line' };
    const result = CatalogEntrySchema.safeParse(bad);
    assert.ok(!result.success, 'invalid entry should fail validation');
  });
});
