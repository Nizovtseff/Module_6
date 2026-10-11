import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async login(username: string, password: string): Promise<void> {
    await this.page.goto('/');

    // Wait for redirect to Microsoft B2C login page
    await this.page.waitForURL(
      (url) =>
        url.hostname.includes('microsoftonline.com') ||
        url.hostname.includes('b2clogin.com') ||
        url.hostname.includes('login.'),
      { timeout: 20000 }
    );

    // Enter email/username
    const emailInput = this.page.locator('input[type="email"], input[name="loginfmt"]');
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.fill(username);

    // Click Next / Continue
    await this.page.locator('input[type="submit"], button[type="submit"]').first().click();

    // Enter password (may appear on same or next page)
    const passwordInput = this.page.locator('input[type="password"], input[name="passwd"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 15000 });
    await passwordInput.fill(password);

    // Click Sign in
    await this.page.locator('input[type="submit"], button[type="submit"]').first().click();

    // Handle optional "Stay signed in?" prompt
    try {
      const staySignedIn = this.page.locator('input[value="Yes"], button:has-text("Yes")');
      await staySignedIn.waitFor({ state: 'visible', timeout: 5000 });
      await staySignedIn.click();
    } catch {
      // Prompt didn't appear — that's fine
    }

    // Wait until redirected back to the application (any VCT domain)
    await this.page.waitForURL(
      (url) =>
        url.hostname.includes('vct2.work') ||
        url.hostname.includes('vctrials.com') ||
        url.hostname.includes('vctrials.eu') ||
        url.hostname.includes('vctrials.asia') ||
        url.hostname.includes('vctrialssamerica.com'),
      { timeout: 30000 }
    );
  }
}
