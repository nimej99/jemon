import type { Device } from './store.js';

export interface ScrapeTarget {
  targets: string[];
  labels: Record<string, string>;
}

/**
 * Converts a list of devices into vmagent `static_configs` format.
 * Caller should pass getRawDevices() so credentials are available.
 */
export function generateScrapeTargets(devices: Device[]): ScrapeTarget[] {
  return devices.map(device => ({
    targets: [`${device.ip}:161`],
    labels: {
      device_id: device.id,
      device_name: device.name,
      site_id: device.siteId,
      snmp_version: device.snmp.version,
    },
  }));
}
