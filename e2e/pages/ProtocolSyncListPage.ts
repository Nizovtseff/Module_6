import { Page, Locator, expect } from '@playwright/test';

export class ProtocolSyncListPage {
  readonly url = '/protocol-sync';

  // Filters
  readonly protocolFilter: Locator;
  readonly syncTypeFilter: Locator;
  readonly autoSyncFilter: Locator;
  readonly activeFilter: Locator;
  readonly resetButton: Locator;

  // Header
  readonly createButton: Locator;
  readonly pageTitle: Locator;

  // Table
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly tableHeaders: Locator;

  // Pagination
  readonly nextPageButton: Locator;
  readonly prevPageButton: Locator;
  readonly firstPageButton: Locator;
  readonly lastPageButton: Locator;

  constructor(private readonly page: Page) {
    this.protocolFilter = page.locator('input#protocol');
    this.syncTypeFilter = page.locator('p-dropdown[formcontrolname="syncType"]');
    this.autoSyncFilter = page.locator('p-dropdown[formcontrolname="isAutoSync"]');
    this.activeFilter = page.locator('p-dropdown[formcontrolname="isActive"]');
    this.resetButton = page.locator('button:has(span.p-button-label:text("Reset"))');

    this.createButton = page.locator('button:has(span.p-button-label:text("Create"))');
    this.pageTitle = page.locator('h5.card-title:has-text("Protocol Sync Items")');

    this.table = page.locator('table.table-hover.table-striped');
    this.tableRows = page.locator('table.table-hover tbody tr');
    this.tableHeaders = page.locator('table.table-hover thead th');

    this.nextPageButton = page.locator('button.p-paginator-next');
    this.prevPageButton = page.locator('button.p-paginator-prev');
    this.firstPageButton = page.locator('button.p-paginator-first');
    this.lastPageButton = page.locator('button.p-paginator-last');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForTableLoad(): Promise<void> {
    await this.table.waitFor({ state: 'visible' });
    await this.tableRows.first().waitFor({ state: 'visible' });
  }

  async selectSyncType(syncType: string): Promise<void> {
    await this.syncTypeFilter.click();
    await this.page.locator('.p-dropdown-panel .p-dropdown-item', { hasText: syncType }).click();
  }

  async selectAutoSync(value: string): Promise<void> {
    await this.autoSyncFilter.click();
    await this.page.locator('.p-dropdown-panel .p-dropdown-item', { hasText: value }).click();
  }

  async selectActive(value: string): Promise<void> {
    await this.activeFilter.click();
    await this.page.locator('.p-dropdown-panel .p-dropdown-item', { hasText: value }).click();
  }

  async searchProtocol(protocolName: string): Promise<void> {
    await this.protocolFilter.fill(protocolName);
    await this.page.waitForTimeout(500);
    const suggestion = this.page.locator('.p-autocomplete-panel .p-autocomplete-item', {
      hasText: protocolName,
    });
    if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
      await suggestion.first().click();
    }
  }

  async resetFilters(): Promise<void> {
    await this.resetButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickEditByRowIndex(index: number): Promise<void> {
    await this.tableRows
      .nth(index)
      .locator('button.btn-primary:has-text("Edit")')
      .click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickEditByProtocol(protocol: string): Promise<void> {
    await this.tableRows
      .filter({ hasText: protocol })
      .first()
      .locator('button.btn-primary:has-text("Edit")')
      .click();
    await this.page.waitForLoadState('networkidle');
  }

  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async getColumnHeaders(): Promise<string[]> {
    const headers = await this.tableHeaders.allTextContents();
    return headers.map((h) => h.trim());
  }

  async getCellText(rowIndex: number, columnIndex: number): Promise<string> {
    const text = await this.tableRows.nth(rowIndex).locator('td').nth(columnIndex).textContent();
    return text?.trim() ?? '';
  }
}
