import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

export const PORTALS = {
  US:    process.env.US_PORTAL    ?? 'https://vctrials.com',
  EU:    process.env.EU_PORTAL    ?? 'https://vctrials.eu/',
  ASIA:  process.env.ASIA_PORTAL  ?? 'https://vctrials.asia/',
  LATAM: process.env.LATAM_PORTAL ?? 'https://vctrialssamerica.com/',
} as const;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://qa-us-admin.vct2.work',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    headless: true,
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
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
    },
  ],
});
