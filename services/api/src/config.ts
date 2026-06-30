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

// ── Auth ─────────────────────────────────────────────────────────────────────
/** JWT signing secret. Falls back to CRED_KEY if AUTH_SECRET is unset. */
const rawAuthSecret = process.env['AUTH_SECRET'] ?? process.env['CRED_KEY'];
const rawAdminPassword = process.env['ADMIN_PASSWORD'];

if (!rawAuthSecret || rawAuthSecret.length < 16) {
  if (DEV) {
    console.warn(
      '[config] AUTH_SECRET is unset or too short — using insecure dev default. ' +
        'Set AUTH_SECRET (≥16 chars) before deploying.',
    );
  } else {
    throw new Error(
      'AUTH_SECRET must be set to a string of at least 16 characters. ' +
        'Set the AUTH_SECRET environment variable before starting the server.',
    );
  }
}

if (!rawAdminPassword) {
  if (DEV) {
    console.warn(
      '[config] ADMIN_PASSWORD is unset — using dev default "admin1234". ' +
        'Set ADMIN_PASSWORD before deploying.',
    );
  } else {
    throw new Error(
      'ADMIN_PASSWORD must be set in non-development environments. ' +
        'Set the ADMIN_PASSWORD environment variable before starting the server.',
    );
  }
}

export const AUTH_SECRET: string =
  rawAuthSecret && rawAuthSecret.length >= 16
    ? rawAuthSecret
    : 'dev-insecure-jwt-secret-change!!';
export const ADMIN_USER: string = process.env['ADMIN_USER'] ?? 'admin';
export const ADMIN_PASSWORD: string = rawAdminPassword ?? 'admin1234';
