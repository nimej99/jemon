import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog, getByDomain, getByKey, CatalogEntrySchema } from '../src/index.js';

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

  it('invalid entry fails zod validation', () => {
    const bad = { key: '', domain: 'invalid-domain', title: '', unit: '', source: { kind: 'snmp' }, agg: 'avg', panel: 'line' };
    const result = CatalogEntrySchema.safeParse(bad);
    assert.ok(!result.success, 'invalid entry should fail validation');
  });
});
