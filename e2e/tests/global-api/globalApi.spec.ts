import { test, expect } from '@playwright/test';

const SWAGGER_URL = 'https://api-v2.vct2.work/swagger/index.html';
const API_TOKEN = 'vct_sk_2026_38CTJHZNAeTKT5rQ0FqE0p0sEYDNUAnN69F6T9okgUlSSDomZXxc5flXf4_dsTG_';

const SUBJECT_PAYLOAD = JSON.stringify(
  {
    protocol_name: 'AutoTest RA',
    sites: [
      {
        site_number: '000',
        pi_name: 'Dr. Smith',
        region: 'eu',
        subjects: [
          {
            subject_id: 'Test-1804-0956',
            age: 20,
            dob: '2006-03',
            status: 'Randomized',
            status_date: '2025-04-10',
            visits: [
              {
                name: 'Visit 1',
                visit_date: '2025-04-18',
                status: 'In Screening',
              },
              {
                name: 'Visit 1',
                visit_date: '2025-04-10',
                status: 'Randomized',
              },
            ],
          },
        ],
      },
    ],
  },
  null,
  2
);

test.describe('Global API — Swagger UI', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('POST /api/subject/update returns Unauthorized for invalid token via Swagger UI', async ({ page }) => {
    // 1. Open Swagger UI
    await page.goto(SWAGGER_URL, { waitUntil: 'networkidle' });
    await expect(page.locator('.info .title')).toContainText('Global API', { timeout: 20000 });

    // 2. Click Authorize
    await page.locator('button.btn.authorize').click();

    // 3. Enter token in the authorization modal
    const authModal = page.locator('.dialog-ux .modal-ux');
    await expect(authModal).toBeVisible();

    const tokenInput = authModal.locator('input[type="text"]');
    await tokenInput.fill(API_TOKEN);

    // 4. Click Authorize inside the modal
    await authModal.locator('button.btn.authorize').click();

    // The button switches to "Logout" state after successful auth entry
    await expect(authModal.locator('button.btn.btn-done')).toBeVisible({ timeout: 5000 });

    // 5. Close the modal
    await authModal.locator('button.btn.btn-done').click();
    await expect(authModal).not.toBeVisible();

    // 6. Expand the /api/subject/update operation block if collapsed
    const opBlock = page.locator('#operations-Sync-post_api_subject_update');
    await opBlock.locator('.opblock-summary-control').click();
    await expect(opBlock.locator('.opblock-body')).toBeVisible();

    // 7. Click Try it out
    await opBlock.locator('button.try-out__btn').click();

    // 8. Fill in the request body
    const bodyEditor = opBlock.locator('.body-param__text');
    await bodyEditor.fill(SUBJECT_PAYLOAD);

    // 9. Click Execute
    await opBlock.locator('button.btn.execute').click();

    // 10. Wait for the response section to appear
    const responseSection = opBlock.locator('.responses-inner');
    await expect(responseSection).toBeVisible({ timeout: 15000 });

    // 11. Assert HTTP status is 401 Unauthorized
    const responseCode = responseSection.locator('.response-col_status').first();
    await expect(responseCode).toHaveText('401');

    // 12. Assert the response body contains "Unauthorized"
    const responseBody = responseSection.locator('.microlight, .response-col_description pre').first();
    await expect(responseBody).toContainText('Unauthorized');
  });
});
