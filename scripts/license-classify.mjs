// jemon license classifier (pure, testable)
export const ALLOW = new Set([
  'MIT','MIT*','ISC','0BSD','BSD','BSD-2-Clause','BSD-3-Clause','Apache-2.0','Apache 2.0',
  'MPL-2.0','CC0-1.0','CC-BY-4.0','Unlicense','BlueOak-1.0.0','Python-2.0','WTFPL','Zlib',
]);
export const DENY = [/AGPL/i,/\bSSPL\b/i,/Elastic-2/i,/Elastic License/i,/Business Source/i,/\bBUSL\b/i,/Commons Clause/i,/\bRSAL\b/i,/\bGPL-2/i,/\bGPL-3/i,/^GPL\b/i];
export function classify(lic){
  const L = String(lic||'').trim();
  if(!L || /^unknown$/i.test(L) || L==='UNLICENSED') return 'unknown';
  if(DENY.some(r=>r.test(L))) return 'denied';
  const orParts = L.split(/\s+OR\s+/i).map(s=>s.replace(/[()]/g,'').trim());
  for(const part of orParts){
    const ands = part.split(/\s+AND\s+/i).map(s=>s.trim());
    if(ands.length && ands.every(a=>ALLOW.has(a))) return 'allowed';
  }
  return ALLOW.has(L) ? 'allowed' : 'unknown';
}
