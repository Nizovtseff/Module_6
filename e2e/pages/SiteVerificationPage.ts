import { Page, expect } from '@playwright/test';

export interface VerificationInput {
  site: string;
  protocol: string;
  location: string;
  cohort: string;
  subjectNumber: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  dateOfBirth: { day: string; month: string; year: string };
  gender: string;
  idLastFive: string;
  idType: string;
  termsAccepted: boolean;
}

export class SiteVerificationPage {
  constructor(private readonly page: Page) {}

  private field(name: string) {
    return this.page.locator(`#ctl00_ContentPlaceHolder1_${name}`);
  }

  async open(): Promise<void> {
    await this.page.getByRole('link', { name: 'Verify Subject', exact: true }).click();
    await expect(this.field('ddlProtocols')).toBeVisible();
  }

  async fill(input: VerificationInput): Promise<void> {
    await this.field('ddlProtocols').selectOption({ label: input.protocol });
    await this.field('ddlLocations').selectOption({ label: input.location });
    await this.field('ddlCohorts').selectOption({ label: input.cohort });

    const textFields = {
      txtSubjectNumber: input.subjectNumber,
      txtFirstName: input.firstName,
      txtMiddleName: input.middleInitial,
      txtLastName: input.lastName,
      txtIDNo: input.idLastFive,
    };
    for (const [name, value] of Object.entries(textFields)) {
      await this.field(name).fill(value);
      await expect(this.field(name)).toHaveValue(value);
    }

    const selectFields = {
      ddlYear1_ddlDay: input.dateOfBirth.day,
      ddlYear1_ddlMonth: input.dateOfBirth.month,
      ddlYear1_ddlYear: input.dateOfBirth.year,
      ddlGender: input.gender,
      ddlID: input.idType,
    };
    for (const [name, value] of Object.entries(selectFields)) {
      await this.field(name).selectOption(value);
      await expect(this.field(name)).toHaveValue(value);
    }
    await this.field('chkTerms').setChecked(input.termsAccepted);
    await expect(this.field('chkTerms')).toBeChecked();
    await expect(this.field('ddlProtocols').locator('option:checked')).toHaveText(input.protocol);
    await expect(this.field('ddlLocations').locator('option:checked')).toHaveText(input.location);
    await expect(this.field('ddlCohorts').locator('option:checked')).toHaveText(input.cohort);
  }

  async submitAndExpectSuccess(input: VerificationInput): Promise<void> {
    await this.field('btnSave').click();
    await expect(this.page.getByText(
      `${input.firstName} ${input.middleInitial} ${input.lastName} has been Successfully Verified.`,
      { exact: true },
    )).toBeVisible({ timeout: 45000 });
    await expect(this.page.getByRole('link', {
      name: 'Download Subject Verification Certificate', exact: true,
    })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'New Verification', exact: true })).toBeVisible();
  }
}
