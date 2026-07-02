/**
 * Seeded mock data utilities — deterministic "live-looking" series for
 * demos, design verification, and screenshot regression.
 *
 * Components never import this directly; pages/hooks feed the same props
 * shape they would get from the real query API, so swapping mock → real is
 * a data-layer change only.
 */

/** mulberry32 — tiny deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic string → 32-bit seed. */
export function seedOf(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface WalkOptions {
  min: number;
  max: number;
  /** Max step per tick as a fraction of the range (default 0.04). */
  volatility?: number;
  /** Starting point 0–1 within the range (default seeded). */
  start?: number;
}

/**
 * Bounded random walk — returns `n` values in [min, max].
 * Same key ⇒ same series, always.
 */
export function randomWalk(key: string, n: number, opts: WalkOptions): number[] {
  const rnd = mulberry32(seedOf(key));
  const { min, max, volatility = 0.04 } = opts;
  const range = max - min;
  let v = min + range * (opts.start ?? 0.3 + rnd() * 0.4);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    v += (rnd() * 2 - 1) * range * volatility;
    v = Math.min(max, Math.max(min, v));
    out.push(v);
  }
  return out;
}

/**
 * Stateful walker for live ticks — call `next()` each interval to extend
 * the walk deterministically.
 */
export function walker(key: string, opts: WalkOptions): () => number {
  const rnd = mulberry32(seedOf(key));
  const { min, max, volatility = 0.04 } = opts;
  const range = max - min;
  let v = min + range * (opts.start ?? 0.3 + rnd() * 0.4);
  return () => {
    v += (rnd() * 2 - 1) * range * volatility;
    v = Math.min(max, Math.max(min, v));
    return v;
  };
}
