import { Page, Locator } from '@playwright/test';

export class HealthTestPage {
  readonly url = '/admin/healthtest.aspx';

  readonly emailTestButton: Locator;
  readonly emailTestResult: Locator;

  readonly emailAttachmentButton: Locator;
  readonly emailAttachmentResult: Locator;

  readonly testDbContextButton: Locator;
  readonly testDbContextResult: Locator;

  readonly biometricStateButton: Locator;
  readonly biometricStateResult: Locator;

  constructor(private readonly page: Page) {
    this.emailTestButton = page.locator('input[value="Email test"]');
    this.emailTestResult = page.locator('#ctl00_ContentPlaceHolder1_Label1');

    this.emailAttachmentButton = page.locator('input[value="Email attachment test"]');
    this.emailAttachmentResult = page.locator('#ctl00_ContentPlaceHolder1_Label6');

    this.testDbContextButton = page.locator('input[value="Test db context"]');
    this.testDbContextResult = page.locator('#ctl00_ContentPlaceHolder1_Label2');

    this.biometricStateButton = page.locator('#ctl00_ContentPlaceHolder1_btnGetBiometricState');
    this.biometricStateResult = page.locator('#ctl00_ContentPlaceHolder1_lbBiometricStateResult');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  async clickAndWait(button: Locator): Promise<void> {
    await button.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getDbContextLines(): Promise<string[]> {
    const html = await this.testDbContextResult.innerHTML();
    return html
      .split(/<br\s*\/?>/i)
      .map((line) => line.replace(/<[^>]+>/g, '').trim())
      .filter((line) => line.length > 0);
  }
}
