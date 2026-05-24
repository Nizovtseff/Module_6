import { Page, Locator } from '@playwright/test';

export class ProtocolSyncEditPage {
  // Page identifiers
  readonly pageHeading: Locator;
  readonly breadcrumb: Locator;

  // Form fields
  readonly syncTypeDropdown: Locator;
  readonly protocolAutocomplete: Locator;
  readonly loginUsernameInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly updatePasswordCheckbox: Locator;
  readonly reportUrlInput: Locator;
  readonly syncIsActiveCheckbox: Locator;
  readonly autoSyncIsOnCheckbox: Locator;
  readonly emailsInput: Locator;
  readonly dataProviderConfigTextarea: Locator;
  readonly aggregatorConfigTextarea: Locator;
  readonly csvConfigTextarea: Locator;

  // Buttons
  readonly checkButton: Locator;
  readonly updateButton: Locator;

  constructor(private readonly page: Page) {
    this.pageHeading = page.locator('text=Edit Sync Type').first();
    this.breadcrumb = page.locator('[aria-label="breadcrumb"]').getByText('Edit Protocol Sync Item');

    this.syncTypeDropdown = page.locator('p-dropdown[formcontrolname="syncType"]');
    this.protocolAutocomplete = page.locator('input#protocol');
    this.loginUsernameInput = page.locator('input#loginUsername');
    this.loginPasswordInput = page.locator('input#loginPassword');
    this.updatePasswordCheckbox = page.locator('input#updatePassword');
    this.reportUrlInput = page.locator('input#reportUrl');
    this.syncIsActiveCheckbox = page.locator('input#isActive');
    this.autoSyncIsOnCheckbox = page.locator('input#isAutoSync');
    this.emailsInput = page.locator('input#emailsToSendSyncResult');
    this.dataProviderConfigTextarea = page.locator('textarea#dataProviderConfig');
    this.aggregatorConfigTextarea = page.locator('textarea#aggregatorConfig');
    this.csvConfigTextarea = page.locator('textarea#csvConfig');

    this.checkButton = page.locator('button.button-secondary:has-text("Check")');
    this.updateButton = page.locator('button.button:not(.button-secondary):has-text("Update")');
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.loginUsernameInput.waitFor({ state: 'visible' });
  }

  async selectSyncType(syncType: string): Promise<void> {
    await this.syncTypeDropdown.click();
    await this.page
      .locator('.p-dropdown-panel .p-dropdown-item', { hasText: syncType })
      .click();
  }

  async getSyncTypeValue(): Promise<string> {
    const text = await this.syncTypeDropdown
      .locator('.p-dropdown-label')
      .textContent();
    return text?.trim() ?? '';
  }

  async searchProtocol(protocolName: string): Promise<void> {
    await this.protocolAutocomplete.fill(protocolName);
    await this.page.waitForTimeout(500);
    const suggestion = this.page.locator('.p-autocomplete-panel .p-autocomplete-item', {
      hasText: protocolName,
    });
    if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
      await suggestion.first().click();
    }
  }

  async fillLoginUsername(username: string): Promise<void> {
    await this.loginUsernameInput.clear();
    await this.loginUsernameInput.fill(username);
  }

  async fillLoginPassword(password: string): Promise<void> {
    await this.loginPasswordInput.fill(password);
  }

  async fillReportUrl(url: string): Promise<void> {
    await this.reportUrlInput.clear();
    await this.reportUrlInput.fill(url);
  }

  async fillEmails(emails: string): Promise<void> {
    await this.emailsInput.clear();
    await this.emailsInput.fill(emails);
  }

  async fillDataProviderConfig(config: string): Promise<void> {
    await this.dataProviderConfigTextarea.clear();
    await this.dataProviderConfigTextarea.fill(config);
  }

  async fillAggregatorConfig(config: string): Promise<void> {
    await this.aggregatorConfigTextarea.clear();
    await this.aggregatorConfigTextarea.fill(config);
  }

  async fillCsvConfig(config: string): Promise<void> {
    await this.csvConfigTextarea.clear();
    await this.csvConfigTextarea.fill(config);
  }

  async toggleUpdatePasswordCheckbox(): Promise<void> {
    await this.updatePasswordCheckbox.click();
  }

  async toggleSyncIsActive(): Promise<void> {
    await this.syncIsActiveCheckbox.click();
  }

  async toggleAutoSyncIsOn(): Promise<void> {
    await this.autoSyncIsOnCheckbox.click();
  }

  async clickCheck(): Promise<void> {
    await this.checkButton.click();
  }

  async clickUpdate(): Promise<void> {
    await this.updateButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isUpdateButtonEnabled(): Promise<boolean> {
    return this.updateButton.isEnabled();
  }

  async isSyncActive(): Promise<boolean> {
    return this.syncIsActiveCheckbox.isChecked();
  }

  async isAutoSyncOn(): Promise<boolean> {
    return this.autoSyncIsOnCheckbox.isChecked();
  }
}
