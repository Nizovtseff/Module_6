import { test as setup } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { VctLoginPage } from '../pages/VctLoginPage';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

const QA_PORTALS = ['qa-us-admin.vct2.work', 'qa-eu-admin.vct2.work', 'qa-asia-admin.vct2.work'];

setup('authenticate', async ({ page, baseURL }) => {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;

  if (!username || !password) {
    throw new Error('Environment variables TEST_USERNAME and TEST_PASSWORD must be set before running tests.');
  }

  const isQaPortal = QA_PORTALS.some(h => baseURL?.includes(h));

  if (isQaPortal) {
    const loginPage = new LoginPage(page);
    await loginPage.login(username, password);
  } else {
    // VCT portal (EU, ASIA, US prod) — uses VCT Staff Login form with separate credentials
    const vctUsername = process.env.VCT_USERNAME ?? username;
    const vctPassword = process.env.VCT_PASSWORD ?? password;
    const loginPage = new VctLoginPage(page);
    await loginPage.login(vctUsername, vctPassword);
  }

  await page.context().storageState({ path: authFile });
});
