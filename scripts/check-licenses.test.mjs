import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify } from './license-classify.mjs';

test('allowlisted licenses pass', () => {
  for(const l of ['MIT','Apache-2.0','BSD-3-Clause','ISC','MPL-2.0','0BSD']) assert.equal(classify(l),'allowed', l);
});
test('denylisted copyleft/commercial are denied', () => {
  for(const l of ['AGPL-3.0','AGPL-3.0-only','SSPL-1.0','BUSL-1.1','Elastic-2.0','GPL-3.0','GPL-2.0','Commons Clause','RSAL']) assert.equal(classify(l),'denied', l);
});
test('unknown / missing / UNLICENSED -> unknown (gate fails)', () => {
  for(const l of ['', undefined, null, 'UNLICENSED', 'SomeRandomLicense', 'unknown']) assert.equal(classify(l),'unknown', String(l));
});
test('SPDX OR: allowed if any branch fully allowed', () => {
  assert.equal(classify('(MIT OR Apache-2.0)'),'allowed');
  assert.equal(classify('MIT OR LicenseRef-Weird'),'allowed');
});
test('SPDX AND: denied/unknown if any operand not allowed', () => {
  assert.equal(classify('MIT AND GPL-3.0'),'denied');
  assert.equal(classify('MIT AND MysteryLic'),'unknown');
});
test('AGPL anywhere is denied (conservative)', () => {
  assert.equal(classify('AGPL-3.0'),'denied');
  assert.equal(classify('AGPL-3.0 OR MIT'),'denied');
});
