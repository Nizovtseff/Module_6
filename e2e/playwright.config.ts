import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');
export const LEGACY_STORAGE_STATE = path.join(__dirname, 'playwright/.auth/legacy-admin.json');

const LEGACY_BASE_URL = process.env.LEGACY_BASE_URL ?? 'https://dev-web-us.vctrials.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://qa-us-admin.vct2.work',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    headless: true,
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    // ── Angular admin app ────────────────────────────────────────────────
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testIgnore: /sponsor-alert-report/,
    },

    // ── Legacy ASP.NET admin app ─────────────────────────────────────────
    {
      name: 'legacy-admin-setup',
      testMatch: /legacy-admin-auth\.setup\.ts/,
      use: {
        baseURL: LEGACY_BASE_URL,
        actionTimeout: 20000,
        navigationTimeout: 45000,
      },
    },
    {
      name: 'legacy-admin-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: LEGACY_BASE_URL,
        storageState: LEGACY_STORAGE_STATE,
        actionTimeout: 20000,
        navigationTimeout: 45000,
      },
      dependencies: ['legacy-admin-setup'],
      testMatch: /sponsor-alert-report/,
    },
  ],
});
