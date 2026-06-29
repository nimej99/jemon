import { CatalogEntrySchema } from './schema.js';
import { networkEntries } from './data/network.js';
import { serverEntries } from './data/server.js';
import { virtualizationEntries } from './data/virtualization.js';
import { appEntries } from './data/app.js';
import { dbEntries } from './data/db.js';
import { cloudEntries } from './data/cloud.js';
import { iotEntries } from './data/iot.js';
import { securityEntries } from './data/security.js';
import { flowEntries } from './data/flow.js';
import { syntheticEntries } from './data/synthetic.js';

export type { CatalogEntry, Domain } from './schema.js';
export { CatalogEntrySchema, DomainSchema } from './schema.js';

const RAW = [
  ...networkEntries,
  ...serverEntries,
  ...virtualizationEntries,
  ...appEntries,
  ...dbEntries,
  ...cloudEntries,
  ...iotEntries,
  ...securityEntries,
  ...flowEntries,
  ...syntheticEntries,
];

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
