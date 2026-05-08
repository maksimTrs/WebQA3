import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

const isCI = !!process.env.CI;
const baseUrl = process.env.BASE_URL ?? 'https://webqa.mercdev.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Reporters here serve local runs (`list` for terminal, `html` for the
  // browseable report, `junit` for IDE consumers) plus `github` annotations
  // when CI is detected. CI itself overrides this list via
  // `--reporter=blob` (see .github/workflows/playwright.yml) so each matrix
  // leg writes a blob report that the publish-report job merges into a single
  // HTML artifact via `playwright merge-reports`.
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ...(isCI ? ([['github']] as const) : []),
  ],
  use: {
    baseURL: baseUrl,
    // `on-first-retry` keeps trace overhead out of the happy path: a failing
    // test re-runs once with full tracing, so we get the diagnostic context
    // for flake investigation without paying the trace cost on every test.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    extraHTTPHeaders: {
      Accept: 'application/json, text/plain, */*',
    },
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
