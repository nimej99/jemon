export const VM_URL = process.env['VM_URL'] ?? 'http://victoriametrics:8428';
export const VMALERT_URL =
  process.env['VMALERT_URL'] ?? 'http://vmalert:8880';
export const PORT = Number(process.env['PORT'] ?? 8080);

/** AES-256-GCM credential key. Must be ≥ 16 chars and set via env in production. */
const rawKey = process.env['CRED_KEY'];
const DEV = process.env['NODE_ENV'] === 'development';

if (!rawKey || rawKey.length < 16) {
  if (DEV) {
    console.warn(
      '[config] CRED_KEY is unset or too short — using insecure dev default. ' +
        'Set CRED_KEY (≥16 chars) before deploying.',
    );
  } else {
    throw new Error(
      'CRED_KEY must be set to a string of at least 16 characters. ' +
        'Set the CRED_KEY environment variable before starting the server.',
    );
  }
}

export const CRED_KEY: string =
  rawKey && rawKey.length >= 16
    ? rawKey
    : 'dev-insecure-key-change-in-prod!!';
