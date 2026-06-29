/**
 * Dashboard smoke test — Playwright.
 *
 * Starts the pre-built Next.js production server (apps/web/.next must exist)
 * and verifies that /dashboard renders its key structural elements.
 *
 * Run: pnpm test:e2e   (which invokes `playwright test`)
 * The webServer block in playwright.config.ts handles server start/stop.
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard render smoke', () => {
  test('page title is present', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/.+/);
  });

  test('page body loads and is not blank', async ({ page }) => {
    await page.goto('/dashboard');
    // Wait for the page to be in a ready state
    await page.waitForLoadState('networkidle');

    // The body must have visible content
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('no critical JS error on load (no uncaught console.error "TypeError" or "ReferenceError")', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter(
      (e) => e.includes('TypeError') || e.includes('ReferenceError'),
    );
    expect(criticalErrors, `Critical JS errors: ${criticalErrors.join('; ')}`).toHaveLength(0);
  });

  test('/dashboard returns HTTP 200', async ({ request }) => {
    const res = await request.get('/dashboard');
    expect(res.status()).toBe(200);
  });

  test('dashboard renders a heading or nav element', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for any heading or navigation element to confirm the shell rendered
    const hasHeading = await page.locator('h1, h2, h3, nav, header').count();
    expect(hasHeading, 'should find at least one heading or nav element').toBeGreaterThan(0);
  });
});
