import { Page, expect } from '@playwright/test';

export class AdminProtocolPage {
  readonly protocolName;
  readonly protocolNumber;
  readonly sponsor;

  constructor(private readonly page: Page) {
    this.protocolName = page.locator('#ctl00_ContentPlaceHolder1_pnlProtocol_txtProtocolName');
    this.protocolNumber = page.locator('#ctl00_ContentPlaceHolder1_pnlProtocol_txtProtocolNumber');
    this.sponsor = page.locator('select[id*="pnlProtocol"][id*="Sponsor"]');
  }

  async open(protocol: string, sponsor: string): Promise<void> {
    await this.page.goto('/control/admin/protocollist.aspx');
    await this.page.locator('#ctl00_ContentPlaceHolder1_txtSearch').fill(protocol);
    await this.page.locator('#ctl00_ContentPlaceHolder1_btnSubmit').click();

    const row = this.page.locator('#ctl00_ContentPlaceHolder1_grdProtocols > tbody > tr').filter({
      has: this.page.getByRole('link', { name: protocol, exact: true }),
    }).filter({
      has: this.page.getByRole('cell', { name: sponsor, exact: true }),
    });
    await expect(row, 'Expected one matching protocol for the specified sponsor').toHaveCount(1);
    await row.getByRole('link', { name: protocol, exact: true }).click();

    await expect(this.page).toHaveURL(/\/control\/admin\/lateprotocoladdedit\.aspx\?id=/);
    await expect(this.protocolName).toHaveValue(protocol);
    await expect(this.protocolNumber).toHaveValue(protocol);
    await expect(this.sponsor.locator('option:checked')).toHaveText(sponsor);
  }
}
