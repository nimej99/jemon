import { fileURLToPath } from 'node:url';
import type { Device } from './store.js';

export interface ScrapeTarget {
  targets: string[];
  labels: Record<string, string>;
}

/**
 * Converts a list of devices into vmagent `static_configs` format.
 * Caller should pass getRawDevices() so credentials are available.
 *
 * Targets are bare IP addresses (no port). The scrape job's relabel_configs
 * are responsible for setting __param_target and redirecting __address__ to
 * the snmp-exporter endpoint (snmp-exporter:9116).
 */
export function generateScrapeTargets(devices: Device[]): ScrapeTarget[] {
  return devices.map(device => ({
    targets: [device.ip],
    labels: {
      device_id: device.id,
      device_name: device.name,
      site_id: device.siteId,
      snmp_version: device.snmp.version,
    },
  }));
}

/**
 * Minimal YAML serialiser for the vmagent static_configs shape.
 * Avoids a runtime dependency on js-yaml.
 */
function toStaticConfigsYaml(targets: ScrapeTarget[]): string {
  if (targets.length === 0) {
    return '[]\n';
  }
  const lines: string[] = [];
  for (const sc of targets) {
    lines.push(`- targets:`);
    for (const t of sc.targets) {
      lines.push(`    - ${JSON.stringify(t)}`);
    }
    lines.push(`  labels:`);
    for (const [k, v] of Object.entries(sc.labels)) {
      lines.push(`    ${k}: ${JSON.stringify(v)}`);
    }
  }
  return lines.join('\n') + '\n';
}

// CLI entry point: node dist/configgen.js
// Loads the device store and emits vmagent static_configs YAML to stdout.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { loadStore, getRawDevices } = await import('./store.js');
  await loadStore();
  const devices = getRawDevices();
  const targets = generateScrapeTargets(devices);
  process.stdout.write(toStaticConfigsYaml(targets));
}
