import { test, expect } from '@playwright/test';

const SWAGGER_URL = 'https://api-v2.vct2.work/swagger/index.html';
const API_URL = 'https://api-v2.vct2.work/api/subject/update';
const INVALID_TOKEN = 'invalid_test_token_for_401_check';
const VALID_TOKEN = process.env.GLOBAL_API_TOKEN ?? '';

const VALID_PAYLOAD = {
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
          visits: [{ name: 'Visit 1', visit_date: '2025-04-10', status: 'Randomized' }],
        },
      ],
    },
  ],
};

function withSubjectOverride(override: Record<string, unknown>) {
  return {
    ...VALID_PAYLOAD,
    sites: [
      {
        ...VALID_PAYLOAD.sites[0],
        subjects: [{ ...VALID_PAYLOAD.sites[0].subjects[0], ...override }],
      },
    ],
  };
}

function authHeaders() {
  return { Authorization: `Bearer ${VALID_TOKEN}` };
}

// ── Swagger UI ────────────────────────────────────────────────────────────────

test.describe('Global API — Swagger UI', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('POST /api/subject/update returns Unauthorized for invalid token via Swagger UI', async ({ page }) => {
    await page.goto(SWAGGER_URL, { waitUntil: 'networkidle' });
    await expect(page.locator('.info .title')).toContainText('Global API', { timeout: 20000 });

    await page.locator('button.btn.authorize').click();

    const authModal = page.locator('.dialog-ux .modal-ux');
    await expect(authModal).toBeVisible();
    await authModal.locator('input[type="text"]').fill(INVALID_TOKEN);
    await authModal.locator('button.btn.authorize').click();
    await expect(authModal.locator('button.btn.btn-done')).toBeVisible({ timeout: 5000 });
    await authModal.locator('button.btn.btn-done').click();
    await expect(authModal).not.toBeVisible();

    const opBlock = page.locator('#operations-Sync-post_api_subject_update');
    await opBlock.locator('.opblock-summary-control').click();
    await expect(opBlock.locator('.opblock-body')).toBeVisible();
    await opBlock.locator('button.try-out__btn').click();
    await opBlock.locator('.body-param__text').fill(JSON.stringify(VALID_PAYLOAD, null, 2));

    const [response] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('/api/subject/update') && res.request().method() === 'POST',
        { timeout: 20000 }
      ),
      opBlock.locator('button.btn.execute').click(),
    ]);

    expect(response.status()).toBe(401);
  });
});

// ── Authentication ────────────────────────────────────────────────────────────

test.describe('Global API — Authentication', () => {
  test('No Authorization header → 401', async ({ request }) => {
    const r = await request.post(API_URL, { data: {} });
    expect(r.status()).toBe(401);
  });
});

// ── Model validation ──────────────────────────────────────────────────────────

test.describe('Global API — Model Validation', () => {
  test('Empty body {} → 403', async ({ request }) => {
    const r = await request.post(API_URL, { headers: authHeaders(), data: {} });
    expect(r.status()).toBe(403);
  });

  test('Empty sites array → 400 with validation message', async ({ request }) => {
    const r = await request.post(API_URL, {
      headers: authHeaders(),
      data: { protocol_name: 'AutoTest RA', sites: [] },
    });
    expect(r.status()).toBe(400);
    expect(await r.text()).toContain('Sites collection cannot be empty');
  });

  test('Empty subjects array → 400 with validation message', async ({ request }) => {
    const r = await request.post(API_URL, {
      headers: authHeaders(),
      data: {
        protocol_name: 'AutoTest RA',
        sites: [{ site_number: '000', pi_name: 'Dr. Smith', region: 'eu', subjects: [] }],
      },
    });
    expect(r.status()).toBe(400);
    expect(await r.text()).toContain('Subjects collection cannot be empty');
  });

  test('Empty required subject fields → 400 with multiple messages', async ({ request }) => {
    const r = await request.post(API_URL, {
      headers: authHeaders(),
      data: withSubjectOverride({ subject_id: '', status: '', status_date: '' }),
    });
    expect(r.status()).toBe(400);
    const body = await r.text();
    expect(body).toContain('subject_id is required and cannot be empty');
    expect(body).toContain('status is required and cannot be empty');
    expect(body).toContain('status_date is required and cannot be empty');
  });

  test('Invalid status enum value → 400 with allowed values list', async ({ request }) => {
    const r = await request.post(API_URL, {
      headers: authHeaders(),
      data: withSubjectOverride({ status: 'UNKNOWN', visits: [{ name: 'Visit 1', visit_date: '2025-04-10', status: 'Randomized' }] }),
    });
    expect(r.status()).toBe(400);
    expect(await r.text()).toContain('status must be one of the following values');
  });

  test('Invalid status_date format → 400 with ISO 8601 message', async ({ request }) => {
    const r = await request.post(API_URL, {
      headers: authHeaders(),
      data: withSubjectOverride({ status_date: 'not-a-date', visits: [{ name: 'Visit 1', visit_date: '2025-04-10', status: 'Randomized' }] }),
    });
    expect(r.status()).toBe(400);
    expect(await r.text()).toContain('status_date must be in ISO 8601 YYYY-MM-DD format');
  });

  test('Invalid dob format → 400 with YYYY-MM message', async ({ request }) => {
    const r = await request.post(API_URL, {
      headers: authHeaders(),
      data: withSubjectOverride({ dob: 'not-a-date' }),
    });
    expect(r.status()).toBe(400);
    expect(await r.text()).toContain('dob must be in YYYY-MM format');
  });

  test('Age as string → 400 with JSON parsing error', async ({ request }) => {
    const r = await request.post(API_URL, {
      headers: authHeaders(),
      data: withSubjectOverride({ age: 'twenty' as unknown as number }),
    });
    expect(r.status()).toBe(400);
    const body = await r.json();
    expect(body.errors).toBeDefined();
  });
});

// ── Business logic ────────────────────────────────────────────────────────────

test.describe('Global API — Business Logic', () => {
  test('Nonexistent protocol_name → 403', async ({ request }) => {
    const r = await request.post(API_URL, {
      headers: authHeaders(),
      data: { ...VALID_PAYLOAD, protocol_name: 'NONEXISTENT_PROTOCOL_XYZ' },
    });
    expect(r.status()).toBe(403);
  });

  test('Invalid region → 400 with region not supported error', async ({ request }) => {
    const payload = {
      ...VALID_PAYLOAD,
      sites: [{ ...VALID_PAYLOAD.sites[0], region: 'mars' }],
    };
    const r = await request.post(API_URL, { headers: authHeaders(), data: payload });
    expect(r.status()).toBe(400);
    const body = await r.json();
    expect(body.status).toBe('fail');
    expect(body.results[0].error).toContain('not supported');
  });

  test('Negative age → passes model validation, fails with subject not found', async ({ request }) => {
    const r = await request.post(API_URL, {
      headers: authHeaders(),
      data: withSubjectOverride({ subject_id: 'NONEXISTENT-0000', age: -5 }),
    });
    expect(r.status()).toBe(400);
    const body = await r.json();
    expect(body.status).toBe('fail');
    expect(body.results[0].error).toContain('Subject not found in VCT');
  });

  test('Duplicate subject_id in same site → both processed, both not found', async ({ request }) => {
    const subject = { ...VALID_PAYLOAD.sites[0].subjects[0], subject_id: 'NONEXISTENT-0000' };
    const payload = {
      ...VALID_PAYLOAD,
      sites: [{ ...VALID_PAYLOAD.sites[0], subjects: [subject, { ...subject, age: 25 }] }],
    };
    const r = await request.post(API_URL, { headers: authHeaders(), data: payload });
    expect(r.status()).toBe(400);
    const body = await r.json();
    expect(body.status).toBe('fail');
    expect(body.results.every((res: { error: string }) => res.error.includes('Subject not found in VCT'))).toBe(true);
  });

  test('Valid payload → 400 with status conflict (subject exists, statuses mismatch)', async ({ request }) => {
    const r = await request.post(API_URL, { headers: authHeaders(), data: VALID_PAYLOAD });
    expect(r.status()).toBe(400);
    const body = await r.json();
    expect(body.status).toBe('fail');
    expect(body.results[0].status).toBe(422);
    expect(body.results[0].error).toContain('Dependent statuses are not provided');
  });
});
