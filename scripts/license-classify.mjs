// jemon license classifier (pure, testable).
// Policy: allowlist-only. A license passes ONLY if it is allowlisted (or an SPDX
// expression that conservatively resolves to allowed). Denylisted licenses are
// rejected outright; everything else is "unknown" and also fails the gate.
// Keep ALLOW/DENY in sync with docs/licenses.md.
export const ALLOW = new Set([
  'MIT', 'MIT*', 'ISC', '0BSD',
  'BSD', 'BSD-2-Clause', 'BSD-3-Clause',
  'Apache-2.0', 'Apache 2.0',
  'MPL-2.0',
  'CC0-1.0', 'Unlicense', 'BlueOak-1.0.0', 'Python-2.0', 'Zlib',
]);

// Copyleft-runtime / source-available / commercial licenses we refuse to ship.
export const DENY = [
  /AGPL/i,
  /SSPL/i,
  /Elastic-2/i,
  /Elastic License/i,
  /Business Source/i,
  /BUSL/i,
  /Commons Clause/i,
  /RSAL/i,
  /GPL-1/i,
  /GPL-2/i,
  /GPL-3/i,
];

/**
 * Classify a license string into 'allowed' | 'denied' | 'unknown'.
 * Conservative SPDX handling:
 *  - any denylist match anywhere => 'denied'
 *  - simple OR expression (no AND, no parens) => allowed if ANY operand allowed
 *  - any AND / grouped expression => allowed only if EVERY identifier allowed
 */
export function classify(lic) {
  const L = String(lic ?? '').trim();
  if (!L || /^unknown$/i.test(L) || L === 'UNLICENSED') return 'unknown';
  if (DENY.some((r) => r.test(L))) return 'denied';

  const tokens = L.split(/\s+(?:AND|OR)\s+/i)
    .map((s) => s.replace(/[()]/g, '').trim())
    .filter(Boolean);
  if (tokens.length === 0) return 'unknown';

  const isSimpleOr = !/\bAND\b/i.test(L) && !L.includes('(');
  if (isSimpleOr) {
    return tokens.some((t) => ALLOW.has(t)) ? 'allowed' : 'unknown';
  }
  return tokens.every((t) => ALLOW.has(t)) ? 'allowed' : 'unknown';
}
