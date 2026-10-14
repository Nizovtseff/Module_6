# VCT Platform — Project Context for Claude AI

> Paste the contents of this file into **Project Instructions** on claude.ai to give Claude full context about the Verified Clinical Trials platform.

---

## What is VCT

**Verified Clinical Trials (VCT)** — SaaS platform for managing clinical trials.
Core purpose: **subject verification** — ensuring the same person is not simultaneously enrolled in multiple trials where that's prohibited.

### Four participant types
- **Sponsors** — pharma companies funding trials (own portal)
- **Sites** — clinics/medical facilities running trials (own portal)
- **Subjects** — trial participants (no portal; verified by sites)
- **Admins** — VCT internal staff overseeing all processes (admin portal)

### Portals & regions

| Portal | URL pattern |
|--------|------------|
| US | https://vctrials.com |
| EU | https://vctrials.eu/ |
| Asia | https://vctrials.asia/ |
| LATAM | https://vctrialssamerica.com/ |

Test credentials: `anizovtsev@verifiedclinicaltrials.com` / `CHINalUesmar2!`

### Deployment inventory

User-provided environment inventory (2026-10-14). Blank database names were not supplied.

| App | Region | App Service | Slot | Database | URL |
|-----|--------|-------------|------|----------|-----|
| PORTAL | ASIA | VCT4PRDWEB01 | vct4prdweb01 (MAIN) | | https://vct4prdweb01.azurewebsites.net |
| API | ASIA | VCT4PRDAPI01 | vct4prdapi01 (MAIN) | | https://vct4prdapi01.azurewebsites.net |
| V2 | ASIA | VCT4PRDWEB01 | vct4prdweb01 (MAIN) | | https://vct4prdweb01.azurewebsites.net/v2 |
| PORTAL | EU | VCT2PRDWEB01 | vct2prdweb01 (MAIN) | | https://vct2prdweb01.azurewebsites.net |
| API | EU | VCT2PRDAPI01 | vct2prdapi01 (MAIN) | | https://vct2prdapi01.azurewebsites.net |
| V2 | EU | VCT2PRDWEB01 | vct2prdweb01 (MAIN) | | https://vct2prdweb01.azurewebsites.net/v2 |
| PORTAL | US | VCT1PRDWEB01 | vct1prdweb01 (MAIN) | VCT1PRDDB | https://vctrials.com |
| API | US | VCT1PRDAPI01 | vct1prdapi01 (MAIN) | VCT1PRDDB | https://api.vctrials.com |
| V2 | US | VCT1PRDWEB01 | vct1prdweb01 (MAIN) | VCT1PRDDB | https://vctrials.com//v2 |
| PORTAL | LATAM | VCT1SAPRDWEB01 | vct1saprdweb01 (MAIN) | VCT1SAPRDDB | https://vctrialssamerica.com/ |
| API | LATAM | VCT1SAPRDAPI01 | vct1saprdapi01 (MAIN) | VCT1SAPRDDB | https://api.vctrialssamerica.com |
| V2 | LATAM | VCT1SAPRDWEB01 | vct1saprdweb01 (MAIN) | VCT1SAPRDDB | https://vctrialssamerica.com//v2 |
| TASK SCHEDULER | LATAM | VCT1SAPRDWEB01 | vct1saprdweb01-task-scheduler | VCT1SAPRDDB | https://vct1saprdweb01-task-scheduler.azurewebsites.net |

| US legacy UI environment | URL |
|--------------------------|-----|
| DEV | https://dev-web-us.vctrials.com/ |
| QA | https://qa-web-us.vctrials.com/ |
| UAT | https://uat-web-us.vctrials.com/ |

Site verification uses the legacy QA UI, **Research Site** login, and site **Adams Clinical**.
The existing Playwright default (`qa-us-admin.vct2.work`) is a different, admin application.

### Site verification happy path

From `e2e`, run `npm run test:verification:happy` with `TEST_USERNAME` and
`TEST_PASSWORD` set. The isolated `site-qa-chromium` project logs in as a research
site user, selects Adams Clinical, and submits a subject under AutoTest RA 2 at
08053, TEST Location 3 (NOT A DOSING/COHORT STUDY).

Each run creates a new synthetic subject on QA US.
Subject Number uses `Auto-DDMMYY-HHMMSS` (18 characters), with local date/time
on the test runner, e.g. `Auto-141026-103521`. The `Auto-` prefix identifies
automated verifications; manual testing uses `Admin-DDMM-HHMM`.
The timestamp has second precision and is not a uniqueness guarantee across
parallel runs.

Automatic retries are disabled
to avoid duplicate submissions. The test asserts the subject-specific
"Successfully Verified" message, certificate link, and New Verification link.
Unexpected dialogs fail this happy path; conditional popup scenarios are not
covered here. Input JSON, result JSON, and a result screenshot are attached to
the Playwright report under ignored test outputs. Stored-record comparison is
a separate, not-yet-implemented scenario.

### Admin protocol navigation

From `e2e`, run `npm run test:protocol:open`. Credentials are
`LEGACY_ADMIN_USERNAME` / `LEGACY_ADMIN_PASSWORD`, falling back to
`TEST_USERNAME` / `TEST_PASSWORD`.

The `admin-protocol-qa-chromium` project logs into QA US as VCT Staff, searches
Manage Protocols for AutoTest RA 2 under Test Sponsor, and opens Edit Rolling
Admission Protocol. It checks the protocol name, number, and sponsor and
attaches the opened protocol details and screenshot to the report. It does not
modify or save protocol settings.

Reuse `VctLoginPage.login()` and `AdminProtocolPage.open('AutoTest RA 2',
'Test Sponsor')` when adding protocol settings checks or explicitly requested
settings changes. Navigation resolves the current link from the search results
rather than hardcoding the encrypted protocol URL.

### Protocol editing approval and inspected baseline

User requirement: before editing a protocol, explain each current value -> new
value and its intended effect. Require explicit confirmation via `ask_user`
before saving or performing potentially persistent Add/Remove operations,
including changes made through APIs or automated tests. Approval applies only
to the described changes; changed values or scope require renewed confirmation.
Read-only inspection is allowed.

Read-only inspection of QA US / AutoTest RA 2 / Test Sponsor on 2026-10-14:

| Setting | Observed value |
|---------|----------------|
| Type | Rolling Admission |
| Age range | 1-99 |
| Minor-only / biometric / dosing cohort | No / No / No |
| Lockout from prior trial | 1 day, Last Blood Draw Date -> Check-in / Admission Date |
| Maximum screening window | 3 days |
| Phase / CRO / Pharma / IRT | Phase I / Test CRO / Test Pharma / Test IRT |
| Compounds | TestCompound 2: no exclusions, Radioactive isotope, half-life 2 hours; TestCompound: 12 months washout, Radioactive isotope, half-life 1 hour |
| Health condition | Test- (/Condition\\):;@#$%^&*?,. (Transient), N/A cohort |
| Prohibited health conditions | None listed |
| Study visits | 5; screening V1, admission V2, first dosing V3, last dosing V4, last blood draw and completion V5 |
| Visit day offsets / margins | -10, -5, 0, 5, 10 / all 0 |
| Verification Plus / consent | Verification Plus without Driver License / No Multi-Year Consent |
| Subject Number mandatory / format / regex | No / empty / unchecked |
| Sites | Adams Clinical: 08053, TEST Location 3, site #3; Denys: Correct Location, site #266 |

The page also exposes custom washout/compound exceptions, qualification/run-in,
status automation, dual-screening and re-screening flags, study-type flags,
notification/consent/identity options, site staff/training, and an audit change log.
All visible protocol option checkboxes were unchecked at inspection.
Blank fields in Add forms are not evidence of an existing rule; inspect the
associated rule list. Re-read live values before proposing edits: this baseline
is a dated observation, not a required test assertion. No protocol changes were made.

### Verification certificate expectations

User-confirmed on 2026-10-14: ID and location are not printed in verification
certificates; this is expected. AutoTest RA 2 has dosing cohorts disabled
(`NOT A DOSING/COHORT STUDY`), so no cohort is expected in this scenario.
Certificate timestamps in GMT-5 are acceptable even when the Subject Number
template uses the runner's local timezone.

The age-failure certificate from the normal Verify Subject flow incorrectly
says "Details related to this prescreen". The user confirmed this wording is a
bug and has reported it to developers; no issue was filed by this session.

---

## Migration Goal

Legacy → Modern rewrite:

| Legacy | Target |
|--------|--------|
| ASP.NET Web Forms + .NET Framework | .NET Core API + React (Shadcn/ui) |
| SQL Server (186 tables, 170 stored procs) | Modular monolith + Clean Architecture |
| Monorepo on Azure DevOps | Microservices on Azure, modular monolith |

**Modernization progress (as of 2026-06):**
- `VCT.Notification` — done
- `VCT.UserManagement` — done
- `VCT.Verification` — done
- `VCT.Portal.Sponsor` — ~90% done
- `VCT.Portal.Site` — started
- `VCT.Portal.Admin` — <10%

---

## 13 Business Domains

```
CORE:        Subjects & Verification · Protocols
PARTIES:     Sponsors · Sites · Identity & Access
SUPPORTING:  Protocol Sync · Biometrics · Training · Communication · Global API/IRT
CROSS-CUT:   Audit & Compliance · Invoicing · Reporting
```

### Key domain concepts

**Verification flow:** Subject presents at a site → identity confirmed (fingerprint or manual PII) → protocol eligibility checked (washout, health conditions, dual-enrollment, age, cohort) → result: pass or Potential Protocol Violation (PPV).

**Screening statuses** (with sync weight): In-Screening(1) → Qualification Run-In(2) → Randomized(5) → terminal(10: Completed / Screen Failure / Early Termination / Run-in Drug Failure / Qualified Alternate / ICF Declined). Higher weight wins in sync conflict resolution.

**Protocol Sync:** Scheduled multi-source ingestion (SFTP, Databricks, Google Cloud Storage, Selenium scraping) that keeps subject statuses current across external IRT systems and VCT.

**PPV (Potential Protocol Violation):** A flagged eligibility breach. Types: dual-enrollment, washout/compound violation, re-enrollment, late verification. Acknowledged PPVs are sent automatically; challenged ones require admin review. *Not* the same as "per-patient visit" billing.

**Washout period:** Mandatory interval after a subject's prior compound exposure before new enrollment. Non-dosing/observation studies don't trigger washout. Configurable exceptions exist per protocol.

**Verification Plus (V+):** Enhanced US-only verification adding SSN/identity check via LexisNexis IDMS v3.

---

## Legacy Architecture — Key Technical Debt

### Three simultaneous ORM/data-access stacks
1. **EF6** (`VctDbContext`) — main API DAL
2. **LINQ-to-SQL** (`VCTLinq.dbml`) — older repositories
3. **Dapper + raw `EXEC` proc** — sync, scheduled jobs

`AuditLogService` has 2 constructors and writes to 2 different tables (`VCT_AUDIT_LOGS` vs `VCT_AUDIT_LOG`) depending on which ORM the caller used.

### Database schema quirks
- **DOB as 3 INT columns** (`DOB_DAY/MONTH/YEAR`) — no DB-level date validation; inconsistent: `VCT_SUBJECT_VERIFICATION` uses `SMALLDATETIME`
- **`IS_ACTIVE` sometimes `INT`** — overloaded (not a simple boolean in all tables)
- **170 stored procs** `VCT_SP_<VERB>_<NOUN>`, versioned `_V2/_V3`
- **`_TEMP` staging pattern** — ~25 tables have a `_TEMP` twin; wizard drafts promoted by proc
- **One shared database** across all portals+services — schema change = globally breaking
- **Business logic in DB triggers** — `TRG_INSERT_LOG` on `VCT_SUBJECTS`
- **PII in `NVARCHAR(MAX)`** — field encryption inconsistent (main subject table is plaintext)
- **Custom `__MigrationHistory`** table — not EF migrations; idempotent dated sprint scripts

### Region code forks (not just config)
`LocaleDefiner.IsUSVersion` branches to `EU/` namespaces in security and DAL layers. US and EU execute different code from the same solution — a major rebuild constraint.

---

## External Integrations

| System | Purpose | Risk |
|--------|---------|------|
| **LexisNexis IDMS v3** | SSN/identity V+ (US only) | ⚠️ Full SSN+PII written to flat log file — HIPAA exposure |
| **Neurotec (ASMX SOAP v1/v2/v3)** | Fingerprint capture/matching | ⚠️ Hardcoded credentials; plain HTTP to internal IP |
| **SFTP / Databricks / GCS** | Protocol sync data sources | ⚠️ Study routing hardcoded in controller code |
| **SMTP (O365)** | Verification alerts, error emails | ⚠️ Subject PII in error emails |
| **VCT.Notification (HTTP)** | Templated notifications (modern service) | Active bridge |
| **Power BI (embedded URL)** | Sponsor reporting | Anti-pattern: CSV export → manual charts |
| **ClinSpark / Pfizer** | Partner verification integration | Session-coupled (WebForms dependency) |
| **Azure Blob / Google Storage** | Document storage | ⚠️ Storage key committed in plaintext |

**Not in legacy** (modern repos only): Azure B2C, SendGrid, Snowflake.

---

## Security Debt (High Priority for Rebuild)

| Issue | Location |
|-------|---------|
| Passwords: double-MD5 (Argon2 partial migration) | `WebApiSecurity.cs:146-149` |
| **MFA bypass hardcoded** for `anizovtsev@verifiedclinicaltrials.com` | `MFAService.cs:89` |
| JWT hardcoded signing secret | `JWTHelper.cs:15` |
| Token 72-hour grace window after expiry | `WebApiSecurity.cs:129` |
| SQL password, SMTP password, Storage key, Rijndael keys in `Web.config` | `Web.config:13,37,76,21-28` |
| `Access-Control-Allow-Origin: *` | `Web.config:97` |
| Shared NuGet `VCT.Infrastructure.Encryption`: hardcoded key + static IV | `RecordEncryptionVCT.cs:14,34-47` |
| Decrypted tokens, API keys, DB connection strings written to flat files | `HttpRequestExtensions.cs:39,45,109` |
| Full SSN/identity payloads in `App_Data/ServiceLog/VPlus.log` | `LexisNexisService.cs:48,52` |

---

## Admin Portal UI (Phase 3 scope)

13 screen groups in the Admin portal:
`dashboard` · `subjects-verification` · `protocols` · `protocol-sync` · `sites` · `sponsors` · `users-access` · `biometrics-scanners` · `training` · `communication-faq` · `invoicing` · `reporting` · `config-admin`

172 legacy ASPX pages inventoried and grouped. React/Vite/Shadcn mockups built for primary screens in each group.

**Design system:** Shadcn/ui + Tailwind, VCT-specific tokens, composite components: `DataTable`, `FilterBar`, `PageHeader`, `DetailLayout`, `ESignBar`, `StatusBadge`, `Wizard`.

---

## Key Glossary Terms

- **Cohort** — subgroup within a protocol; drives eligibility/health checks
- **Compound** — investigational drug; drives washout/exclusion rules
- **Dual enrollment** — subject active in 2 trials simultaneously → PPV
- **IRT** — Interactive Response Technology; external randomization/drug-supply systems integrating via Global API
- **JCA** — site onboarding artifact (exact meaning unconfirmed in specs)
- **Location** — physical site location under a Site; washout behavior differs same-location vs different-location
- **OLE** — Open-Label Extension; post-trial open-label phase
- **Override** — admin action permitting a subject to proceed despite a PPV finding
- **Pre-screen / registry subject** — candidate before formal enrollment; separate `REGISTER_SUBJECT*` table family
- **Protocol form** — submission-form representation vs. live protocol tables
- **Rescreen** — re-attempt screening; protocols configure allowed rescreen count/scope
- **Run-in Drug Failure** — terminal status: failed run-in/qualification phase
- **Screen Failure** — terminal status: didn't meet screening criteria
- **V+** — Verification Plus; SSN/identity check via LexisNexis (US only)
- **Verification certificate** — printable attestation of completed subject verification

---

## Repository Layout (Module 6 / this repo)

```
e2e/                    Playwright E2E tests (Playwright + TypeScript)
  tests/                test specs
  pages/                Page Object Model classes
  playwright.config.ts  config (default: QA US)
VCT.Analysis.zip        Full 3-phase project analysis archive
CLAUDE.md               Claude Code context (auto-read by Claude Code CLI)
```

The `VCT.Analysis.zip` contains 334 files: specs, data models, domain docs, UI specs, HTML documentation site, React mockups, and phase plans (all phases completed).
