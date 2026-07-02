#!/usr/bin/env node
/**
 * design-shot — screenshot dashboard routes for design verification.
 *
 * Usage:
 *   NEXT_PUBLIC_DEMO=1 pnpm --filter @jemon/web dev   # in another shell
 *   node scripts/design-shot.mjs /campus [/racks ...]
 *
 * Env:
 *   DESIGN_SHOT_BASE  base URL (default http://localhost:3000)
 *   DESIGN_SHOT_WAIT  extra settle ms for 3-D scenes (default 4000)
 *
 * Output: artifacts/design-shots/<slug>-<w>x<h>.png
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.DESIGN_SHOT_BASE ?? "http://localhost:3000";
const SETTLE = Number(process.env.DESIGN_SHOT_WAIT ?? 4000);
const SIZES = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const routes = process.argv.slice(2);
if (routes.length === 0) {
  console.error("usage: node scripts/design-shot.mjs /campus [/route ...]");
  process.exit(1);
}

const outDir = path.resolve("artifacts/design-shots");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  for (const route of routes) {
    const slug = route.replaceAll("/", "-").replace(/^-/, "") || "root";
    for (const size of SIZES) {
      const page = await browser.newPage({
        viewport: size,
        deviceScaleFactor: 2,
      });
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(SETTLE); // let the 3-D scene light up
      const file = path.join(outDir, `${slug}-${size.width}x${size.height}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(file);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
