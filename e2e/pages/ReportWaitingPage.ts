import { Page, Locator } from '@playwright/test';

export class ReportWaitingPage {
  readonly url = '/control/admin/adminreportwaitlist.aspx';
  readonly dashboardUrl = '/control/admin/admindashboard.aspx';

  readonly reportRows: Locator;

  constructor(private readonly page: Page) {
    this.reportRows = page.locator('table tr[align="center"]');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  async getRowCount(): Promise<number> {
    return this.reportRows.count();
  }

  async getLastRowStatus(): Promise<string> {
    const lastRow = this.reportRows.last();
    const text = await lastRow.locator('span[id*="_txtReportStatus"]').textContent();
    return text?.trim() ?? '';
  }

  async getLastRowNumber(): Promise<string> {
    const lastRow = this.reportRows.last();
    const text = await lastRow.locator('span[id*="_txtNum"]').textContent();
    return text?.trim() ?? '';
  }

  async getLastRowSponsor(): Promise<string> {
    const lastRow = this.reportRows.last();
    const text = await lastRow.locator('span[id*="_Label1"]').textContent();
    return text?.trim() ?? '';
  }

  async getLastRowProtocol(): Promise<string> {
    const lastRow = this.reportRows.last();
    const text = await lastRow.locator('span[id*="_Label2"]').textContent();
    return text?.trim() ?? '';
  }

  async getLastRowReportName(): Promise<string> {
    const lastRow = this.reportRows.last();
    const text = await lastRow.locator('span[id*="_txtrReportName"]').textContent();
    return text?.trim() ?? '';
  }

  /**
   * Navigates to the waiting page fresh each attempt (not a reload) until
   * the last row's status becomes "Completed".
   */
  async pollUntilLastCompleted(maxAttempts = 24, waitMs = 5000): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      await this.page.goto(this.url);
      await this.page.waitForLoadState('networkidle');

      const status = await this.getLastRowStatus();
      if (status === 'Completed') return true;

      if (i < maxAttempts - 1) {
        // Navigate away so the next visit is a true page open, not just a reload
        await this.page.goto(this.dashboardUrl);
        await this.page.waitForTimeout(waitMs);
      }
    }
    return false;
  }

  async clickGetReportForLastRow(): Promise<void> {
    const lastRow = this.reportRows.last();
    await lastRow.locator('input[value="Get Report"]').click();
    await this.page.waitForLoadState('networkidle');
  }
}
