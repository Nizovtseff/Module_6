import { test as setup } from '@playwright/test';
import path from 'path';
import { AdminLoginPage } from '../pages/AdminLoginPage';

export const LEGACY_AUTH_FILE = path.join(__dirname, '../playwright/.auth/legacy-admin.json');

setup('authenticate via legacy admin form', async ({ page }) => {
  const username = process.env.LEGACY_ADMIN_USERNAME ?? process.env.TEST_USERNAME;
  const password = process.env.LEGACY_ADMIN_PASSWORD ?? process.env.TEST_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Set LEGACY_ADMIN_USERNAME and LEGACY_ADMIN_PASSWORD (or TEST_USERNAME / TEST_PASSWORD) before running legacy-admin tests.'
    );
  }

  const loginPage = new AdminLoginPage(page);
  await loginPage.login(username, password);

  await page.context().storageState({ path: LEGACY_AUTH_FILE });
});
