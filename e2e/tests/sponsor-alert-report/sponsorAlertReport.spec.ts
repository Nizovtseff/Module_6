import { test, expect } from '@playwright/test';
import { SponsorAlertReportPage } from '../../pages/SponsorAlertReportPage';
import { ReportWaitingPage } from '../../pages/ReportWaitingPage';

/**
 * Parameters for the report submission.
 * Adjust these to change which sponsor / protocol(s) are used.
 *
 * - sponsor: 'All' selects the default "All sponsors" option.
 *   Pass a specific sponsor name to filter protocols first.
 * - protocols: list of protocol labels to select.
 *   Pass an empty array [] to select ALL protocols from the list.
 */
const REPORT_PARAMS = {
  timePeriod: 'All',     // 'All' = default; change to e.g. 'Last Month'
  sponsor: 'All',        // 'All' = no sponsor filter
  protocols: ['AutoTest RA'], // [] = select all; or ['AutoTest RA', 'Other Protocol']
};

test.describe('Sponsor Alert Report — E2E flow', () => {
  test('submits report, waits for completion, and opens result page', async ({ page }) => {
    const reportPage = new SponsorAlertReportPage(page);
    const waitingPage = new ReportWaitingPage(page);

    // ── Step 1: Open the Sponsor Alert Report form ────────────────────────
    await reportPage.goto();
    await expect(page).toHaveURL(/verification_alerts_report/);

    // ── Step 2: Configure report parameters ──────────────────────────────
    // Time Period (already defaults to All, but set explicitly for clarity)
    const timePeriodCount = await reportPage.timePeriodSelect.locator('option').count();
    if (timePeriodCount > 0 && REPORT_PARAMS.timePeriod !== 'All') {
      await reportPage.selectTimePeriod(REPORT_PARAMS.timePeriod);
    }

    // Sponsor (single select — leave as All unless overridden)
    if (REPORT_PARAMS.sponsor !== 'All') {
      await reportPage.selectSponsor(REPORT_PARAMS.sponsor);
      // Protocol list is filtered after sponsor selection
    }

    // Protocols
    if (REPORT_PARAMS.protocols.length === 0) {
      await reportPage.selectAllProtocols();
    } else {
      await reportPage.selectProtocols(REPORT_PARAMS.protocols);
    }

    // ── Step 3: Submit the form ───────────────────────────────────────────
    await reportPage.clickView();

    // Should land on the report waiting page
    await expect(page).toHaveURL(/adminreportwaitlist/);

    // ── Step 4: Record the row count before polling ───────────────────────
    const rowsBefore = await waitingPage.getRowCount();
    expect(rowsBefore).toBeGreaterThan(0);

    // ── Step 5: Poll until the last (freshest) report reaches Completed ───
    const completed = await waitingPage.pollUntilLastCompleted(
      /* maxAttempts */ 24,
      /* waitMs      */ 5000
    );

    expect(completed, 'Report did not reach Completed status within the timeout').toBe(true);

    // ── Step 6: Verify the last row is the one we just submitted ──────────
    const lastSponsor  = await waitingPage.getLastRowSponsor();
    const lastProtocol = await waitingPage.getLastRowProtocol();
    const lastStatus   = await waitingPage.getLastRowStatus();

    expect(lastStatus).toBe('Completed');

    // Log for visibility in the Playwright report
    console.log(
      `Report ready — Sponsor: "${lastSponsor}", Protocol: "${lastProtocol}", Status: "${lastStatus}"`
    );

    // ── Step 7: Click Get Report and show the result page ─────────────────
    await waitingPage.clickGetReportForLastRow();

    // The result page can be a report view or redirect back to the report form
    await expect(page).not.toHaveURL(/adminreportwaitlist/);
    await page.screenshot({ path: 'report-result.png', fullPage: true });
  });
});
