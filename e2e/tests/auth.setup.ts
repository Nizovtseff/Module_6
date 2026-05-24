import { test as setup } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate via Microsoft B2C', async ({ page }) => {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Environment variables TEST_USERNAME and TEST_PASSWORD must be set before running tests.'
    );
  }

  const loginPage = new LoginPage(page);
  await loginPage.login(username, password);

  await page.context().storageState({ path: authFile });
});
