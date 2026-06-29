import { CatalogEntrySchema } from './schema.js';
import { networkEntries } from './data/network.js';
import { serverEntries } from './data/server.js';

export type { CatalogEntry, Domain } from './schema.js';
export { CatalogEntrySchema, DomainSchema } from './schema.js';

const RAW = [...networkEntries, ...serverEntries];

export function loadCatalog() {
  return RAW.map((entry, i) => {
    const result = CatalogEntrySchema.safeParse(entry);
    if (!result.success) {
      throw new Error(`Invalid catalog entry at index ${i} (key=${entry.key}): ${result.error.message}`);
    }
    return result.data;
  });
}

export function getByDomain(domain: string) {
  return loadCatalog().filter((e) => e.domain === domain);
}

export function getByKey(key: string) {
  return loadCatalog().find((e) => e.key === key);
}
