export const VM_URL = process.env['VM_URL'] ?? 'http://victoriametrics:8428';
export const PORT = Number(process.env['PORT'] ?? 8080);
/** AES-256-GCM credential key. Must be set in production. */
export const CRED_KEY =
  process.env['CRED_KEY'] ?? 'dev-insecure-key-change-in-prod!!';
