import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/dashboard.smoke.ts'],
  timeout: 30_000,
  retries: 0,
  workers: 1,

  use: {
    baseURL: 'http://localhost:3100',
    headless: true,
    ...devices['Desktop Chrome'],
  },

  /* Start the pre-built Next.js production server before tests. */
  webServer: {
    command: 'pnpm --filter @jemon/web start --port 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  reporter: [['list'], ['json', { outputFile: 'tests/results/playwright.json' }]],
  outputDir: 'tests/results/playwright',
});
