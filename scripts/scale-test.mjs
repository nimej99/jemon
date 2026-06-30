#!/usr/bin/env node
// jemon scale validation: synthetic N-device load against VictoriaMetrics.
// Usage: VM_URL=http://localhost:8428 DEVICE_COUNT=2000 node scripts/scale-test.mjs
const VM = process.env.VM_URL || 'http://localhost:8428';
const N = parseInt(process.env.DEVICE_COUNT || '2000', 10);
const IFACES = 4;

function buildBatch(now) {
  const lines = [];
  for (let d = 0; d < N; d++) {
    const inst = 'dev-' + d;
    lines.push('hrProcessorLoad{instance="' + inst + '",hrDeviceIndex="1"} ' + ((Math.random()*100)|0) + ' ' + now);
    lines.push('hrMemorySize{instance="' + inst + '"} ' + (4000000 + ((Math.random()*4000000)|0)) + ' ' + now);
    for (let i = 0; i < IFACES; i++) {
      lines.push('ifHCInOctets{instance="' + inst + '",ifIndex="' + i + '"} ' + ((Math.random()*1e9)|0) + ' ' + now);
      lines.push('ifHCOutOctets{instance="' + inst + '",ifIndex="' + i + '"} ' + ((Math.random()*1e9)|0) + ' ' + now);
    }
  }
  return lines.join('\n') + '\n';
}

async function importBatch(body) {
  const r = await fetch(VM + '/api/v1/import/prometheus', { method: 'POST', body });
  if (!r.ok) throw new Error('import failed ' + r.status + ' ' + (await r.text()));
}

async function q(query) {
  const t0 = performance.now();
  const r = await fetch(VM + '/api/v1/query?query=' + encodeURIComponent(query));
  const j = await r.json();
  return { ms: performance.now() - t0, result: j.data && j.data.result ? j.data.result : [] };
}

(async () => {
  const seriesPerDevice = 2 + IFACES * 2;
  const total = N * seriesPerDevice;
  console.log('[scale] VM=' + VM + ' devices=' + N + ' series~=' + total);
  const SCRAPES = 3;
  const t0 = performance.now();
  for (let s = 0; s < SCRAPES; s++) {
    const now = Date.now() - (SCRAPES - s) * 60000;
    await importBatch(buildBatch(now));
  }
  console.log('[scale] ingested ' + SCRAPES + ' scrapes of ' + total + ' series in ' + (performance.now()-t0).toFixed(0) + 'ms');
  await new Promise(r => setTimeout(r, 2500));
  const qCount = await q('count(ifHCInOctets)');
  const qAgg = await q('sum(rate(ifHCInOctets[5m]))');
  const qTop = await q('topk(10, hrProcessorLoad)');
  console.log('[scale] count(ifHCInOctets) = ' + (qCount.result[0] && qCount.result[0].value ? qCount.result[0].value[1] : '?') + ' in ' + qCount.ms.toFixed(0) + 'ms');
  console.log('[scale] sum(rate(ifHCInOctets[5m])) in ' + qAgg.ms.toFixed(0) + 'ms');
  console.log('[scale] topk(10,hrProcessorLoad) -> ' + qTop.result.length + ' rows in ' + qTop.ms.toFixed(0) + 'ms');
  const slowest = Math.max(qCount.ms, qAgg.ms, qTop.ms);
  const THRESH = parseInt(process.env.QUERY_MS_THRESHOLD || '2000', 10);
  const pass = slowest < THRESH;
  console.log('[scale] slowest query ' + slowest.toFixed(0) + 'ms (threshold ' + THRESH + 'ms) => ' + (pass ? 'PASS' : 'FAIL'));
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('[scale] ERROR', e.message); process.exit(2); });
