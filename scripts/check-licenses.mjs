#!/usr/bin/env node
// jemon license gate: allowlist-only, denylist hard-fail, UNKNOWN=fail.
// Usage: node scripts/check-licenses.mjs [--input <fixture.json>]
// Fixture/pnpm shape: { "<LICENSE>": [{ name, version }], ... }
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ALLOW = new Set([
  'MIT','MIT*','ISC','0BSD','BSD','BSD-2-Clause','BSD-3-Clause','Apache-2.0','Apache 2.0',
  'MPL-2.0','CC0-1.0','CC-BY-4.0','Unlicense','BlueOak-1.0.0','Python-2.0','WTFPL','Zlib',
]);
const DENY = [/AGPL/i,/\bSSPL\b/i,/Elastic-2/i,/Elastic License/i,/Business Source/i,/\bBUSL\b/i,/Commons Clause/i,/\bRSAL\b/i,/\bGPL-2/i,/\bGPL-3/i,/^GPL\b/i];

function normalize(lic){ return String(lic||'').trim(); }
function classify(lic){
  const L = normalize(lic);
  if(!L || /^unknown$/i.test(L) || L==='UNLICENSED') return 'unknown';
  if(DENY.some(r=>r.test(L))) return 'denied';
  // SPDX expressions: split on OR/AND, allow if any OR-branch fully allowed
  const orParts = L.split(/\s+OR\s+/i).map(s=>s.replace(/[()]/g,'').trim());
  for(const part of orParts){
    const ands = part.split(/\s+AND\s+/i).map(s=>s.trim());
    if(ands.every(a=>ALLOW.has(a))) return 'allowed';
  }
  if(ALLOW.has(L)) return 'allowed';
  return 'unknown';
}

function load(){
  const i = process.argv.indexOf('--input');
  if(i>=0 && process.argv[i+1]) return JSON.parse(readFileSync(process.argv[i+1],'utf8'));
  const out = execSync('pnpm licenses list --json', {encoding:'utf8', stdio:['ignore','pipe','ignore']});
  return JSON.parse(out);
}

let data; try { data = load(); } catch(e){ console.error('license scan failed:', e.message); process.exit(2); }
const violations=[];
for(const [lic, pkgs] of Object.entries(data)){
  const verdict = classify(lic);
  if(verdict!=='allowed'){
    const names=(Array.isArray(pkgs)?pkgs:[]).map(p=>p.name+'@'+(p.version||'?')).slice(0,20);
    violations.push({license:lic, verdict, packages:names});
  }
}
if(violations.length){
  console.error('LICENSE GATE FAILED:');
  for(const v of violations) console.error('  ['+v.verdict.toUpperCase()+'] '+v.license+' -> '+v.packages.join(', '));
  process.exit(1);
}
console.log('license gate OK (all dependency licenses allowlisted).');
