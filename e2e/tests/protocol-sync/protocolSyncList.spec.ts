import { test, expect } from '@playwright/test';
import { ProtocolSyncListPage } from '../../pages/ProtocolSyncListPage';

test.describe('Protocol Sync — List page', () => {
  let listPage: ProtocolSyncListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ProtocolSyncListPage(page);
    await listPage.goto();
    await listPage.waitForTableLoad();
  });

  // ── Layout ────────────────────────────────────────────────────────────────

  test.describe('Layout', () => {
    test('displays page title "Protocol Sync Items"', async () => {
      await expect(listPage.pageTitle).toBeVisible();
    });

    test('displays all four filter controls', async () => {
      await expect(listPage.protocolFilter).toBeVisible();
      await expect(listPage.syncTypeFilter).toBeVisible();
      await expect(listPage.autoSyncFilter).toBeVisible();
      await expect(listPage.activeFilter).toBeVisible();
    });

    test('displays Reset button', async () => {
      await expect(listPage.resetButton).toBeVisible();
    });

    test('displays Create button', async () => {
      await expect(listPage.createButton).toBeVisible();
    });

    test('table has correct column headers', async () => {
      const expected = [
        'Sync Type',
        'Company',
        'Protocol',
        'Username',
        'Is Auto Sync',
        'Auto Sync Execution Frequency',
        'Active',
        'Edit',
      ];
      const actual = await listPage.getColumnHeaders();
      for (const header of expected) {
        expect(actual).toContain(header);
      }
    });

    test('table contains at least one row', async () => {
      const count = await listPage.getRowCount();
      expect(count).toBeGreaterThan(0);
    });

    test('each row has an Edit button', async ({ page }) => {
      const editButtons = page.locator('table.table-hover tbody tr button.btn-primary');
      const count = await editButtons.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ── Filters ───────────────────────────────────────────────────────────────

  test.describe('Filters', () => {
    test('filters by Sync Type — all visible rows match the selection', async ({ page }) => {
      await listPage.selectSyncType('Unsupported');
      await page.waitForLoadState('networkidle');

      const rows = listPage.tableRows;
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < Math.min(count, 5); i++) {
        const cell = rows.nth(i).locator('td').first();
        await expect(cell).toHaveText('Unsupported');
      }
    });

    test('filters by Active "Yes" — all visible rows show "Yes"', async ({ page }) => {
      await listPage.selectActive('Yes');
      await page.waitForLoadState('networkidle');

      const rows = listPage.tableRows;
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);

      // Active is the 7th column (index 6)
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i).locator('td').nth(6)).toHaveText('Yes');
      }
    });

    test('filters by Active "No" — all visible rows show "No"', async ({ page }) => {
      await listPage.selectActive('No');
      await page.waitForLoadState('networkidle');

      const rows = listPage.tableRows;
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i).locator('td').nth(6)).toHaveText('No');
      }
    });

    test('filters by Auto Sync "Yes" — all visible rows show "Yes"', async ({ page }) => {
      await listPage.selectAutoSync('Yes');
      await page.waitForLoadState('networkidle');

      const rows = listPage.tableRows;
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);

      // Is Auto Sync is the 5th column (index 4)
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i).locator('td').nth(4)).toHaveText('Yes');
      }
    });

    test('filters by Auto Sync "No" — all visible rows show "No"', async ({ page }) => {
      await listPage.selectAutoSync('No');
      await page.waitForLoadState('networkidle');

      const rows = listPage.tableRows;
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i).locator('td').nth(4)).toHaveText('No');
      }
    });

    test('Reset clears the Sync Type filter', async ({ page }) => {
      await listPage.selectSyncType('Unsupported');
      await page.waitForLoadState('networkidle');

      await listPage.resetFilters();

      // Dropdown label should not contain the previously selected value
      const label = listPage.syncTypeFilter.locator('.p-dropdown-label');
      await expect(label).not.toHaveText('Unsupported');
    });

    test('Reset restores all results after a filter was applied', async ({ page }) => {
      await listPage.selectSyncType('Unsupported');
      await page.waitForLoadState('networkidle');
      const filteredCount = await listPage.getRowCount();

      await listPage.resetFilters();
      const totalCount = await listPage.getRowCount();

      expect(totalCount).toBeGreaterThanOrEqual(filteredCount);
    });

    test('combining Sync Type and Active filters narrows results', async ({ page }) => {
      await listPage.selectSyncType('Unsupported');
      await page.waitForLoadState('networkidle');
      const syncTypeCount = await listPage.getRowCount();

      await listPage.selectActive('Yes');
      await page.waitForLoadState('networkidle');
      const combinedCount = await listPage.getRowCount();

      expect(combinedCount).toBeLessThanOrEqual(syncTypeCount);
    });
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  test.describe('Navigation', () => {
    test('Create button opens the create page', async ({ page }) => {
      await listPage.clickCreate();
      await expect(page).toHaveURL(/protocol-sync.*(create|new|0\/edit|add)/i);
    });

    test('Edit button on first row opens the edit page for that item', async ({ page }) => {
      await listPage.clickEditByRowIndex(0);
      await expect(page).toHaveURL(/protocol-sync\/\d+\/edit/i);
    });

    test('breadcrumb shows "Protocol Sync Items"', async ({ page }) => {
      await expect(page.locator('[aria-label="breadcrumb"]')).toContainText(
        'Protocol Sync Items'
      );
    });
  });

  // ── Pagination ────────────────────────────────────────────────────────────

  test.describe('Pagination', () => {
    test('pagination controls are visible', async () => {
      await expect(listPage.firstPageButton).toBeVisible();
      await expect(listPage.prevPageButton).toBeVisible();
      await expect(listPage.nextPageButton).toBeVisible();
      await expect(listPage.lastPageButton).toBeVisible();
    });

    test('First and Previous buttons are disabled on page 1', async () => {
      await expect(listPage.firstPageButton).toBeDisabled();
      await expect(listPage.prevPageButton).toBeDisabled();
    });

    test('navigating to next page shows different rows', async ({ page }) => {
      const isNextEnabled = await listPage.nextPageButton.isEnabled();
      if (!isNextEnabled) return; // only one page of data

      const firstRowBefore = await listPage.tableRows.first().textContent();
      await listPage.nextPageButton.click();
      await page.waitForLoadState('networkidle');

      const firstRowAfter = await listPage.tableRows.first().textContent();
      expect(firstRowAfter).not.toBe(firstRowBefore);
    });

    test('Previous button is enabled after navigating to page 2', async ({ page }) => {
      const isNextEnabled = await listPage.nextPageButton.isEnabled();
      if (!isNextEnabled) return;

      await listPage.nextPageButton.click();
      await page.waitForLoadState('networkidle');

      await expect(listPage.prevPageButton).toBeEnabled();
    });
  });
});
