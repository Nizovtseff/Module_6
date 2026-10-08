import { Page, Locator } from '@playwright/test';
import { VctLoginPage } from './VctLoginPage';

export class SyncStatusPage {
  readonly url = '/control/admin/syncstatus.aspx';

  // Protocol dropdown — jQuery "chosen" widget wrapping a native <select>.
  // The real <select> stays display:none; the widget renders a clickable
  // trigger + a search/results panel in its place.
  readonly protocolChosenContainer: Locator;
  readonly protocolChosenTrigger: Locator;
  readonly protocolChosenResults: Locator;

  // Actions
  readonly autoSyncButton: Locator;

  // Result sections rendered once a sync run completes
  readonly fileDateTimeText: Locator;
  readonly subjectsProcessedText: Locator;
  readonly requiredStatusUpdatesHeading: Locator;
  readonly gridIssues: Locator;
  readonly gridSubjectNotInVCT: Locator;

  constructor(private readonly page: Page) {
    this.protocolChosenContainer = page.locator('#ctl00_ContentPlaceHolder1_ddProtocol_chosen');
    this.protocolChosenTrigger = this.protocolChosenContainer.locator('.chosen-single');
    this.protocolChosenResults = this.protocolChosenContainer.locator('.chosen-results li');

    this.autoSyncButton = page.locator('#ctl00_ContentPlaceHolder1_btnAutoSync');

    // Scoped to the <b> tag itself — these labels sit inside a much larger
    // <td> whose full text also contains them, which would otherwise make a
    // plain getByText() match both the <b> and its ancestor <td>.
    this.fileDateTimeText = page.locator('b', { hasText: 'File Date/Time:' });
    this.requiredStatusUpdatesHeading = page.locator('b', { hasText: 'Required Status Updates:' });
    this.subjectsProcessedText = page.getByText(/subjects in the file will be processed/).first();
    this.gridIssues = page.locator('#ctl00_ContentPlaceHolder1_gridIssues');
    this.gridSubjectNotInVCT = page.locator('#ctl00_ContentPlaceHolder1_gridSubjectNotInVCT');
  }

  async goto(credentials?: { username: string; password: string }): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');

    // Session may have expired — server redirects to
    // index.aspx?status=expire&ReturnUrl=... (VCT Staff Login form).
    if (this.page.url().includes('index.aspx')) {
      const username = credentials?.username ?? process.env.VCT_USERNAME ?? process.env.TEST_USERNAME ?? '';
      const password = credentials?.password ?? process.env.VCT_PASSWORD ?? process.env.TEST_PASSWORD ?? '';
      await new VctLoginPage(this.page).login(username, password);
      await this.page.goto(this.url);
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Number of <option> entries in the underlying Protocol <select> (group
   * headers/spacers included). Some accounts/environments legitimately have
   * zero protocols assigned — check this before selecting one.
   */
  async getProtocolOptionCount(): Promise<number> {
    return this.page.locator('#ctl00_ContentPlaceHolder1_ddProtocol option').count();
  }

  /**
   * Opens the Protocol "chosen" dropdown and selects the first real protocol
   * option, skipping the blank spacer rows and the "____group header____"
   * separators the datasource injects between provider groups (e.g.
   * "____________Clinical Conductor_____________"). Returns the label of the
   * protocol that was selected.
   */
  async selectFirstAvailableProtocol(): Promise<string> {
    await this.protocolChosenTrigger.click();
    await this.protocolChosenResults.first().waitFor({ state: 'visible' });

    const options = await this.protocolChosenResults.all();
    for (const option of options) {
      const text = (await option.textContent())?.trim() ?? '';
      const isBlankOrHeaderSeparator = text.length === 0 || /^_+.*_+$/.test(text);
      const classAttr = (await option.getAttribute('class')) ?? '';
      const isDisabled = classAttr.includes('disabled') || classAttr.includes('no-results');

      if (!isBlankOrHeaderSeparator && !isDisabled) {
        await option.click();
        await this.page.waitForLoadState('networkidle');
        return text;
      }
    }

    throw new Error('No selectable protocol found in the Protocol dropdown');
  }

  /**
   * Opens the Protocol "chosen" dropdown and selects the option whose label
   * exactly matches `label`. Throws if no such option is present.
   */
  async selectProtocolByLabel(label: string): Promise<void> {
    await this.protocolChosenTrigger.click();
    await this.protocolChosenResults.first().waitFor({ state: 'visible' });

    const option = this.protocolChosenResults.filter({ hasText: label }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getSelectedProtocolLabel(): Promise<string> {
    const text = await this.protocolChosenTrigger.textContent();
    return text?.trim() ?? '';
  }

  async clickAutoSync(): Promise<void> {
    await this.autoSyncButton.click();
    // Auto-Sync triggers a real sync run against the data provider — allow
    // extra time for the resulting full-page postback to complete.
    await this.page.waitForLoadState('networkidle', { timeout: 120000 });
  }
}
