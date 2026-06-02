import { Page, Locator } from '@playwright/test';

export class SponsorAlertReportPage {
  readonly url = '/control/admin/verification_alerts_report.aspx';

  // Filters
  readonly timePeriodSelect: Locator;
  readonly sponsorSelect: Locator;
  readonly protocolList: Locator;

  // Checkboxes (lower section — not used in current test scope)
  readonly segregateByStudyCheckbox: Locator;
  readonly hideInitialsDobCheckbox: Locator;
  readonly emailHiddenAlertsCheckbox: Locator;
  readonly displayAgeGenderCheckbox: Locator;
  readonly reportAllViolationsCheckbox: Locator;
  readonly displaySubjectVerifCheckbox: Locator;

  // Submit
  readonly viewButton: Locator;

  constructor(private readonly page: Page) {
    this.timePeriodSelect  = page.locator('select[id*="TimePeriod"]');
    this.sponsorSelect     = page.locator('select[id*="Sponsor"]:not([id*="Protocol"])');
    this.protocolList      = page.locator('select[id*="Protocol"]');

    this.segregateByStudyCheckbox    = page.locator('input[id*="Segregate"], input[id*="segregate"]');
    this.hideInitialsDobCheckbox     = page.locator('input[id*="HideInitials"], input[id*="hideInitials"]');
    this.emailHiddenAlertsCheckbox   = page.locator('input[id*="EmailHidden"], input[id*="emailHidden"]');
    this.displayAgeGenderCheckbox    = page.locator('input[id*="AgeGender"], input[id*="ageGender"]');
    this.reportAllViolationsCheckbox = page.locator('input[id*="Violations"], input[id*="violations"]');
    this.displaySubjectVerifCheckbox = page.locator('input[id*="SubjectVerif"], input[id*="subjectVerif"]');

    this.viewButton = page.locator('input[value="View"], input[id*="btnView"]');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  async selectTimePeriod(value: string): Promise<void> {
    await this.timePeriodSelect.selectOption({ label: value });
  }

  async selectSponsor(sponsorName: string): Promise<void> {
    await this.sponsorSelect.selectOption({ label: sponsorName });
    // Wait for protocol list to be filtered after sponsor change
    await this.page.waitForLoadState('networkidle');
  }

  async selectProtocols(protocolNames: string[]): Promise<void> {
    await this.protocolList.selectOption(protocolNames.map((label) => ({ label })));
  }

  async selectAllProtocols(): Promise<void> {
    const options = await this.protocolList.locator('option').all();
    const values = await Promise.all(options.map((o) => o.getAttribute('value')));
    const defined = values.filter((v): v is string => v !== null);
    await this.protocolList.selectOption(defined);
  }

  async clickView(): Promise<void> {
    await this.viewButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
