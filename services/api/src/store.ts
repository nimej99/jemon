import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CRED_KEY } from './config.js';

const ALG = 'aes-256-gcm';
// Derived once at module load; key is never exposed.
const _KEY: Buffer = scryptSync(CRED_KEY, 'jemon-v1-salt', 32);

const _dir = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(_dir, '..', 'data', 'devices.json');

export interface SnmpV3 {
  user: string;
  authProto: string;
  authKey: string;
  privProto: string;
  privKey: string;
}

export interface SnmpConfig {
  version: 'v2c' | 'v3';
  community?: string;
  v3?: SnmpV3;
}

export interface Device {
  id: string;
  name: string;
  siteId: string;
  ip: string;
  snmp: SnmpConfig;
}

// Same shape as Device but sensitive fields are AES-256-GCM ciphertext.
type StoredDevice = Device;

let _store: StoredDevice[] = [];

function enc(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALG, _KEY, iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = (cipher as import('node:crypto').CipherGCM).getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${data.toString('hex')}`;
}

function dec(encrypted: string): string {
  const [ivHex, tagHex, dataHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex!, 'hex');
  const tag = Buffer.from(tagHex!, 'hex');
  const data = Buffer.from(dataHex!, 'hex');
  const d = createDecipheriv(ALG, _KEY, iv) as import('node:crypto').DecipherGCM;
  d.setAuthTag(tag);
  return d.update(data, undefined, 'utf8') + d.final('utf8');
}

function toStored(device: Device): StoredDevice {
  const s = device.snmp;
  return {
    ...device,
    snmp: {
      version: s.version,
      community: s.community !== undefined ? enc(s.community) : undefined,
      v3:
        s.v3 !== undefined
          ? {
              user: s.v3.user,
              authProto: s.v3.authProto,
              authKey: enc(s.v3.authKey),
              privProto: s.v3.privProto,
              privKey: enc(s.v3.privKey),
            }
          : undefined,
    },
  };
}

function fromStored(stored: StoredDevice): Device {
  const s = stored.snmp;
  return {
    ...stored,
    snmp: {
      version: s.version,
      community: s.community !== undefined ? dec(s.community) : undefined,
      v3:
        s.v3 !== undefined
          ? {
              user: s.v3.user,
              authProto: s.v3.authProto,
              authKey: dec(s.v3.authKey),
              privProto: s.v3.privProto,
              privKey: dec(s.v3.privKey),
            }
          : undefined,
    },
  };
}

function maskDevice(device: Device): Device {
  const s = device.snmp;
  return {
    ...device,
    snmp: {
      version: s.version,
      community: s.community !== undefined ? '***' : undefined,
      v3:
        s.v3 !== undefined
          ? {
              user: s.v3.user,
              authProto: s.v3.authProto,
              authKey: '***',
              privProto: s.v3.privProto,
              privKey: '***',
            }
          : undefined,
    },
  };
}

async function persist(): Promise<void> {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(_store, null, 2), 'utf8');
}

export async function loadStore(): Promise<void> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    _store = JSON.parse(raw) as StoredDevice[];
  } catch {
    _store = [];
    await persist();
  }
}

export async function addDevice(device: Device): Promise<void> {
  _store = _store.filter(d => d.id !== device.id);
  _store.push(toStored(device));
  await persist();
}

/** Returns devices with credentials masked — safe to send to API consumers. */
export function getDevices(): Device[] {
  return _store.map(d => maskDevice(fromStored(d)));
}

/** Returns devices with credentials decrypted — internal use only (e.g. configgen). */
export function getRawDevices(): Device[] {
  return _store.map(fromStored);
}
