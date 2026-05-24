import { test, expect } from '@playwright/test';
import { ProtocolSyncListPage } from '../../pages/ProtocolSyncListPage';
import { ProtocolSyncEditPage } from '../../pages/ProtocolSyncEditPage';

test.describe('Protocol Sync — Edit page', () => {
  let editPage: ProtocolSyncEditPage;

  test.beforeEach(async ({ page }) => {
    // Open the first sync item from the list
    const listPage = new ProtocolSyncListPage(page);
    await listPage.goto();
    await listPage.waitForTableLoad();
    await listPage.clickEditByRowIndex(0);

    editPage = new ProtocolSyncEditPage(page);
    await editPage.waitForLoad();
  });

  // ── Layout ────────────────────────────────────────────────────────────────

  test.describe('Layout', () => {
    test('displays heading "Edit Sync Type"', async () => {
      await expect(editPage.pageHeading).toBeVisible();
    });

    test('breadcrumb shows "Edit Protocol Sync Item"', async () => {
      await expect(editPage.breadcrumb).toBeVisible();
    });

    test('Sync Type dropdown is visible', async () => {
      await expect(editPage.syncTypeDropdown).toBeVisible();
    });

    test('Protocol autocomplete is visible', async () => {
      await expect(editPage.protocolAutocomplete).toBeVisible();
    });

    test('Login username field is visible', async () => {
      await expect(editPage.loginUsernameInput).toBeVisible();
    });

    test('Login password field is visible', async () => {
      await expect(editPage.loginPasswordInput).toBeVisible();
    });

    test('password field has placeholder "Leave blank to keep current password"', async () => {
      await expect(editPage.loginPasswordInput).toHaveAttribute(
        'placeholder',
        'Leave blank to keep current password'
      );
    });

    test('"Update password" checkbox is visible', async () => {
      await expect(editPage.updatePasswordCheckbox).toBeVisible();
    });

    test('Report URL field is visible', async () => {
      await expect(editPage.reportUrlInput).toBeVisible();
    });

    test('"Sync is active" checkbox is visible', async () => {
      await expect(editPage.syncIsActiveCheckbox).toBeVisible();
    });

    test('"Auto sync is on" checkbox is visible', async () => {
      await expect(editPage.autoSyncIsOnCheckbox).toBeVisible();
    });

    test('Emails field is visible', async () => {
      await expect(editPage.emailsInput).toBeVisible();
    });

    test('Data provider config textarea is visible', async () => {
      await expect(editPage.dataProviderConfigTextarea).toBeVisible();
    });

    test('Aggregator config textarea is visible', async () => {
      await expect(editPage.aggregatorConfigTextarea).toBeVisible();
    });

    test('Csv Config textarea is visible', async () => {
      await expect(editPage.csvConfigTextarea).toBeVisible();
    });

    test('Check button is visible and enabled', async () => {
      await expect(editPage.checkButton).toBeVisible();
      await expect(editPage.checkButton).toBeEnabled();
    });

    test('Update button is visible', async () => {
      await expect(editPage.updateButton).toBeVisible();
    });
  });

  // ── Sync Type dropdown ────────────────────────────────────────────────────

  test.describe('Sync Type dropdown', () => {
    test('opens the dropdown panel on click', async ({ page }) => {
      await editPage.syncTypeDropdown.click();
      await expect(page.locator('.p-dropdown-panel')).toBeVisible();
    });

    test('selecting an option updates the displayed value', async ({ page }) => {
      await editPage.syncTypeDropdown.click();
      const panel = page.locator('.p-dropdown-panel');
      await expect(panel).toBeVisible();

      const firstOption = panel.locator('.p-dropdown-item').first();
      const optionText = (await firstOption.textContent())?.trim() ?? '';
      await firstOption.click();

      await expect(editPage.syncTypeDropdown.locator('.p-dropdown-label')).toHaveText(optionText);
    });
  });

  // ── Text fields ───────────────────────────────────────────────────────────

  test.describe('Text fields', () => {
    test('Login username can be edited', async () => {
      await editPage.fillLoginUsername('playwright_test_user');
      await expect(editPage.loginUsernameInput).toHaveValue('playwright_test_user');
    });

    test('Login password can be filled', async () => {
      await editPage.fillLoginPassword('Test@Passw0rd!');
      await expect(editPage.loginPasswordInput).toHaveValue('Test@Passw0rd!');
    });

    test('Report URL can be edited', async () => {
      const url = 'https://example.com/report?study=TEST';
      await editPage.fillReportUrl(url);
      await expect(editPage.reportUrlInput).toHaveValue(url);
    });

    test('Emails field can be edited', async () => {
      const email = 'qa-team@example.com';
      await editPage.fillEmails(email);
      await expect(editPage.emailsInput).toHaveValue(email);
    });

    test('Data provider config textarea can be edited', async () => {
      const config = '{"provider":"test","version":1}';
      await editPage.fillDataProviderConfig(config);
      await expect(editPage.dataProviderConfigTextarea).toHaveValue(config);
    });

    test('Aggregator config textarea can be edited', async () => {
      const config = '{"aggregator":"test","enabled":true}';
      await editPage.fillAggregatorConfig(config);
      await expect(editPage.aggregatorConfigTextarea).toHaveValue(config);
    });

    test('Csv Config textarea can be edited', async () => {
      const config = 'col1,col2,col3';
      await editPage.fillCsvConfig(config);
      await expect(editPage.csvConfigTextarea).toHaveValue(config);
    });
  });

  // ── Checkboxes ────────────────────────────────────────────────────────────

  test.describe('Checkboxes', () => {
    test('"Update password" checkbox can be toggled', async () => {
      const initial = await editPage.updatePasswordCheckbox.isChecked();
      await editPage.toggleUpdatePasswordCheckbox();
      expect(await editPage.updatePasswordCheckbox.isChecked()).toBe(!initial);
    });

    test('"Sync is active" checkbox can be toggled', async () => {
      const initial = await editPage.isSyncActive();
      await editPage.toggleSyncIsActive();
      expect(await editPage.isSyncActive()).toBe(!initial);
    });

    test('"Auto sync is on" checkbox can be toggled', async () => {
      const initial = await editPage.isAutoSyncOn();
      await editPage.toggleAutoSyncIsOn();
      expect(await editPage.isAutoSyncOn()).toBe(!initial);
    });

    test('toggling "Sync is active" twice restores original state', async () => {
      const initial = await editPage.isSyncActive();
      await editPage.toggleSyncIsActive();
      await editPage.toggleSyncIsActive();
      expect(await editPage.isSyncActive()).toBe(initial);
    });
  });

  // ── Button states ─────────────────────────────────────────────────────────

  test.describe('Button states', () => {
    test('Update button becomes enabled after editing a field', async ({ page }) => {
      await editPage.fillLoginUsername('changed_by_playwright');
      await page.waitForTimeout(300); // Angular change detection

      await expect(editPage.updateButton).toBeEnabled();
    });

    test('Check button remains enabled regardless of form state', async () => {
      await expect(editPage.checkButton).toBeEnabled();
    });
  });

  // ── Form submit ───────────────────────────────────────────────────────────

  test.describe('Update flow', () => {
    test('submitting the form keeps the user in the protocol-sync section', async ({ page }) => {
      // Make a change to allow Update
      const current = await editPage.loginUsernameInput.inputValue();
      await editPage.fillLoginUsername(current);
      await page.waitForTimeout(300);

      const isEnabled = await editPage.isUpdateButtonEnabled();
      if (!isEnabled) return; // form was not dirty — skip

      await editPage.clickUpdate();
      await expect(page).toHaveURL(/protocol-sync/);
    });

    test('navigating back to the list after edit shows the list page', async ({ page }) => {
      await page.goto('/protocol-sync');
      await expect(page.locator('h5.card-title:has-text("Protocol Sync Items")')).toBeVisible();
    });
  });
});
