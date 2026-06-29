#!/usr/bin/env node
// jemon license gate: allowlist-only, denylist hard-fail, UNKNOWN=fail.
// Usage: node scripts/check-licenses.mjs [--input <fixture.json>]
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { classify } from './license-classify.mjs';

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
