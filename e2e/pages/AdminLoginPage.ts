import { Page } from '@playwright/test';

export class AdminLoginPage {
  readonly url = '/control/admin/loginadmin.aspx';

  constructor(private readonly page: Page) {}

  async login(username: string, password: string): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');

    await this.page.fill('input[id*="txtUsername"], input[id*="Username"], input[name*="Username"]', username);
    await this.page.fill('input[type="password"]', password);
    await this.page.click(
      'input[type="submit"][value*="Login"], input[type="submit"][value*="Sign"], button[type="submit"]'
    );

    await this.page.waitForURL(/(admindashboard|verification_alerts|adminreportwaitlist)/, {
      timeout: 30000,
    });
  }
}
