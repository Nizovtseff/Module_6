# Module 6 — VCTrials E2E Test Project

## Production Portals

| Region | ENV Variable     | URL                              |
|--------|-----------------|----------------------------------|
| US     | `US_PORTAL`     | https://vctrials.com             |
| EU     | `EU_PORTAL`     | https://vctrials.eu/             |
| ASIA   | `ASIA_PORTAL`   | https://vctrials.asia/           |
| LATAM  | `LATAM_PORTAL`  | https://vctrialssamerica.com/    |

## Project Structure

- `e2e/` — Playwright end-to-end tests
  - `tests/` — test specs
  - `pages/` — Page Object Model classes
  - `playwright.config.ts` — Playwright configuration (default baseURL: QA US environment)
- `Module_6.csproj` / `Program.cs` — C# project files

## Running Tests

```bash
cd e2e
npx playwright test                          # run all tests (QA US by default)
BASE_URL=https://vctrials.com npx playwright test   # run against US PROD portal
BASE_URL=https://vctrials.eu/ npx playwright test   # run against EU PROD portal
```

## Environment Variables

| Variable       | Description                        |
|----------------|------------------------------------|
| `BASE_URL`     | Override the default baseURL       |
| `US_PORTAL`    | US production portal               |
| `EU_PORTAL`    | EU production portal               |
| `ASIA_PORTAL`  | Asia production portal             |
| `LATAM_PORTAL` | LATAM production portal            |
