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
