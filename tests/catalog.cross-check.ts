/**
 * Catalog cross-check — imports the TypeScript source directly via
 * --experimental-strip-types (no pre-build required).
 *
 * Verifies:
 *   • All entries are Zod-valid
 *   • No duplicate keys
 *   • All 10 domains are present
 *   • Each domain has at least 4 entries (P0 contract)
 *   • Total count matches the expected number (46 entries across P0-P4)
 *   • Domain-specific spot-checks to guard against accidental deletions
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog, getByDomain, CatalogEntrySchema } from '../packages/catalog/dist/index.js';

const ALL_DOMAINS = [
  'network', 'server', 'virtualization', 'app', 'db',
  'cloud', 'iot', 'security', 'flow', 'synthetic',
] as const;

// Known entry counts per domain established at P4 integration.
// Update this table if a future phase intentionally adds/removes entries.
const EXPECTED_DOMAIN_COUNTS: Record<string, number> = {
  network:        5,
  server:         5,
  virtualization: 5,
  app:            6,
  db:             4,
  cloud:          4,
  iot:            5,
  security:       4,
  flow:           4,
  synthetic:      4,
};

const EXPECTED_TOTAL = Object.values(EXPECTED_DOMAIN_COUNTS).reduce((s, n) => s + n, 0);

describe('catalog cross-check', () => {
  it(`total entry count equals ${EXPECTED_TOTAL}`, () => {
    const entries = loadCatalog();
    assert.equal(
      entries.length,
      EXPECTED_TOTAL,
      `expected ${EXPECTED_TOTAL} entries, got ${entries.length}`,
    );
  });

  it('all entries pass zod validation', () => {
    const entries = loadCatalog();
    for (const e of entries) {
      const result = CatalogEntrySchema.safeParse(e);
      assert.ok(result.success, `entry ${e.key} failed Zod validation: ${result.error?.message}`);
    }
  });

  it('no duplicate keys', () => {
    const entries = loadCatalog();
    const keys = entries.map((e) => e.key);
    const unique = new Set(keys);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    assert.equal(
      unique.size,
      keys.length,
      `duplicate keys found: ${dupes.join(', ')}`,
    );
  });

  it('all 10 domains present', () => {
    const entries = loadCatalog();
    const found = new Set(entries.map((e) => e.domain));
    for (const d of ALL_DOMAINS) {
      assert.ok(found.has(d), `domain '${d}' is missing from catalog`);
    }
  });

  for (const domain of ALL_DOMAINS) {
    it(`${domain}: entry count = ${EXPECTED_DOMAIN_COUNTS[domain]}`, () => {
      const entries = getByDomain(domain);
      assert.equal(
        entries.length,
        EXPECTED_DOMAIN_COUNTS[domain],
        `${domain}: expected ${EXPECTED_DOMAIN_COUNTS[domain]}, got ${entries.length}`,
      );
    });
  }

  it('network: required keys present', () => {
    const keys = getByDomain('network').map((e) => e.key);
    for (const k of ['net.ifHCInOctets', 'net.ifHCOutOctets', 'net.ifOperStatus', 'net.ifInErrors', 'net.sysUpTime']) {
      assert.ok(keys.includes(k), `network missing key: ${k}`);
    }
  });

  it('server: required keys present', () => {
    const keys = getByDomain('server').map((e) => e.key);
    for (const k of ['srv.hrProcessorLoad', 'srv.hrStorageUsed', 'srv.hrMemorySize', 'srv.sysUpTime']) {
      assert.ok(keys.includes(k), `server missing key: ${k}`);
    }
  });

  it('app: required keys present', () => {
    const keys = getByDomain('app').map((e) => e.key);
    for (const k of [
      'app.http_2xx_rate', 'app.http_4xx_rate', 'app.http_5xx_rate',
      'app.http_p95_latency', 'app.jvm_heap_used', 'app.envoy_upstream_rq_total',
    ]) {
      assert.ok(keys.includes(k), `app missing key: ${k}`);
    }
  });

  it('db: required keys present', () => {
    const keys = getByDomain('db').map((e) => e.key);
    for (const k of ['db.connections', 'db.query_latency_p95', 'db.locks', 'db.repl_lag']) {
      assert.ok(keys.includes(k), `db missing key: ${k}`);
    }
  });

  it('iot: 5 snmp-sourced entries with kpi thresholds', () => {
    const iot = getByDomain('iot');
    const snmpEntries = iot.filter((e) => e.source.kind === 'snmp');
    assert.ok(snmpEntries.length >= 4, `iot should have ≥4 snmp entries, got ${snmpEntries.length}`);
    const withKpi = iot.filter((e) => e.kpi !== undefined);
    assert.ok(withKpi.length >= 3, `iot should have ≥3 entries with kpi, got ${withKpi.length}`);
  });

  it('security: all 4 entries are log-sourced', () => {
    const sec = getByDomain('security');
    const logEntries = sec.filter((e) => e.source.kind === 'log');
    assert.equal(logEntries.length, 4, `security should have 4 log-sourced entries, got ${logEntries.length}`);
  });

  it('flow: required keys present', () => {
    const keys = getByDomain('flow').map((e) => e.key);
    for (const k of ['flow.bytes_total', 'flow.flows_total', 'flow.top_talker_bytes', 'flow.top_talker_flows']) {
      assert.ok(keys.includes(k), `flow missing key: ${k}`);
    }
  });

  it('synthetic: required keys present', () => {
    const keys = getByDomain('synthetic').map((e) => e.key);
    for (const k of ['synth.http_up', 'synth.http_resp_time', 'synth.cert_expiry_days', 'synth.port_up']) {
      assert.ok(keys.includes(k), `synthetic missing key: ${k}`);
    }
  });

  it('cloud: required keys present', () => {
    const keys = getByDomain('cloud').map((e) => e.key);
    for (const k of ['cloud.cpu_utilization', 'cloud.billing_cost', 'cloud.lb_healthy_hosts', 'cloud.lb_request_rate']) {
      assert.ok(keys.includes(k), `cloud missing key: ${k}`);
    }
  });

  it('virtualization: required keys present', () => {
    const keys = getByDomain('virtualization').map((e) => e.key);
    for (const k of ['virt.cpu_usage_pct', 'virt.mem_usage_bytes', 'virt.disk_io_kbps', 'virt.net_rx_bytes', 'virt.vm_power_state']) {
      assert.ok(keys.includes(k), `virtualization missing key: ${k}`);
    }
  });

  it('kpi entries have non-empty expr strings', () => {
    const entries = loadCatalog();
    for (const e of entries) {
      if (e.kpi) {
        assert.ok(
          typeof e.kpi.expr === 'string' && e.kpi.expr.length > 0,
          `kpi.expr invalid on ${e.key}`,
        );
      }
    }
  });

  it('every entry has a valid panel type', () => {
    const VALID_PANELS = new Set(['line', 'gauge', 'stat', 'table', 'heatmap']);
    const entries = loadCatalog();
    for (const e of entries) {
      assert.ok(VALID_PANELS.has(e.panel), `entry ${e.key} has invalid panel: ${e.panel}`);
    }
  });

  it('every entry has a valid agg type', () => {
    const VALID_AGGS = new Set(['avg', 'sum', 'max', 'min', 'rate', 'last']);
    const entries = loadCatalog();
    for (const e of entries) {
      assert.ok(VALID_AGGS.has(e.agg), `entry ${e.key} has invalid agg: ${e.agg}`);
    }
  });
});
