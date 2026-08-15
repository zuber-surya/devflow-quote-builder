# Decisions

Approved decisions only. Each entry: decision, rationale, source, date.

## Architecture / Stack

- **Framework:** Next.js 15 + React 19, TypeScript 5.3 strict mode.
- **UI:** Tailwind CSS 3.4 + shadcn/ui.
- **Backend:** Next.js API Routes (modular monolith, no separate service).
- **Database:** PostgreSQL 14+ via Prisma 6. All money fields `NUMERIC(12,2)` — no floats.
- **Mobile:** Flutter (separate repo), shares the same REST API/DB/business logic as web.
- **Testing:** Vitest (unit/integration), Playwright (E2E, per Testing & QA Spec).
- Source: root `README.md`, `existing-documents/System Architecture Document.md`, `existing-documents/sot-brain storming.md`. All three agree — no conflict.

## M1 Authentication implementation (2026-08-15, issue #2)

- **Auth library:** `package.json` had `@auth/nextjs@^0.25.0` — not a real published package (npm only has an unrelated `0.0.0-<hash>` canary under that name). Replaced with `next-auth@^5.0.0-beta.32`, the real App-Router-native Auth.js package, paired with the already-correct `@auth/prisma-adapter`.
- **No `PrismaAdapter` wired up yet**, despite the dependency being installed. Credentials + JWT session strategy never touches `Account`/`Session`/`VerificationToken`, and this schema doesn't have those tables (`database.md`). Add the adapter back only alongside those three tables, together, when an OAuth provider is introduced.
- **Env vars:** Auth.js reads `AUTH_SECRET`, falling back to `NEXTAUTH_SECRET` (confirmed in `next-auth/lib/env.js`) — existing `SETUP.md`/`GETTING_STARTED.md` already set `NEXTAUTH_SECRET`, no doc change needed. Mobile JWT signing uses `JWT_SECRET` (matches those same docs).
- **Refresh tokens:** opaque random tokens (not JWTs), stored as SHA-256 hashes only, rotated on every use inside a Prisma transaction (lookup+delete+reissue atomic, prevents a replayed token from yielding two live sessions).
- **`package.json` had several other dependency versions that don't exist or don't support React 19**: `jsonwebtoken@^9.1.0` (no such version, latest 9.x is 9.0.3), `lucide-react@^0.363.0`, `@testing-library/react@^14.1.0`, `react-hook-form@^7.49.0`, `@hookform/resolvers@^3.3.0`, `next-themes@^0.2.0`, and all 8 pinned `@radix-ui/*` packages — all bumped to current versions with confirmed React 19 peer support. `zod` bumped `^3.22.0` → `^3.25.0` (required by the `@hookform/resolvers` bump). `@types/react`/`@types/react-dom` bumped to `^19.0.0` to match.
- **Known CVEs surfaced by `npm audit`** in `postcss`/`sharp` (bundled inside `next@15.x`) and `uuid@9.x` — all fixes require a major version bump (Next 15→16, uuid 9→14). Not done as part of this auth fix; flagged for a deliberate decision, not silently upgraded.
- **Deferred:** `password-reset` endpoint — needs a `PasswordResetToken` schema addition and an email-provider decision. See `questions/open-questions.md` item 7.

## calculations.ts fixes (2026-08-15)

Pre-existing Phase-0 scaffolding, not yet wired into any route (M4/M5), reviewed via `financial-calc-reviewer` and fixed before it becomes load-bearing:

- **Real bug:** `calculatePaymentStatus` used `p.equals(t)` for PAID — an overpayment (`paidAmount > total`) fell through to `UNPAID`. Fixed to `greaterThanOrEqualTo`.
- **Missing OVERDUE derivation:** `isOverdue()` existed standalone but nothing combined it with payment status. Added `derivePaymentStatus(total, paidAmount, dueAt)` — overlays OVERDUE onto Unpaid/Partially-Paid only, never onto PAID (matches `business-rules.md`: "past due AND not fully paid").
- **Negative totals:** `calculateLineTotal`/`calculateGrandTotal` had no floor — a discount exceeding the line subtotal (or document subtotal+tax) could go negative. Both now floor at 0 via `Decimal.max`.
- **Discount validation:** `validateLineItem` checked quantity/price/tax but never discount. Added negative-discount and discount-exceeds-line-subtotal checks.
- **Rounding consistency:** added `quantize()` (Decimal-returning, unlike the existing string-returning `roundToTwoDecimals`). Each line total and its tax now round to 2dp individually before summing into subtotal/total-tax, matching the `NUMERIC(14,2)` columns they land in — avoids a persisted line total and persisted subtotal disagreeing by a cent.
- Added `tests/lib/calculations.test.ts` (28 tests) — this module had zero coverage despite being the one place a bug is a real billing error.
- **Not done:** tightening `Decimal | number` signatures to reject raw floats from untyped request bodies — flagged by the reviewer as worth doing before M4/M5 wires this to a route, not urgent for scaffolding.

## Blocker resolutions (approved 2026-08-14)

1. **PDF library: `pdfkit`.** Server-side Node, mature, no React dependency in the PDF layer. Rejected `@react-pdf/renderer` (floated only in an archived, non-authoritative doc — see `existing-documents/_archived/`) and `puppeteer` (heavier, browser-spawn overhead not worth it for solo-dev MVP).
2. **Quote → Invoice conversion:** "Convert to Invoice" button on an Accepted quote copies line items into a new Invoice, links `invoice.quote_id → quote.id`, sets `quote.status = 'Converted'`, locks the quote read-only. Quote is never deleted — audit trail preserved.
3. **Auth strategy:** Hybrid — Auth.js session cookies for web, JWT + refresh token for Flutter mobile. Same `/api/v1/auth/*` endpoints; client type detected via `x-client-type` header, response shape branches accordingly.
4. **Payment tracking:** Simple manual marking for V1 — `invoice.paid_amount` (NUMERIC) + `invoice.payment_status` (ENUM: Unpaid/Partially Paid/Paid/Overdue), `marked_paid_at`/`marked_paid_by` fields. No separate `payments` table, no refund workflow, no payment gateway — explicitly post-MVP.
5. **File storage:** Local filesystem (`/public/business-logos/{userId}/...`) for MVP. S3/CDN migration is post-MVP, not blocking.
6. **Document numbering:** Year-based auto-increment per user — `Q-2026-00001`, `INV-2026-00001`. Resets annually.

Full option analysis for each: `.devflow/artifacts/CRITICAL_BLOCKERS.md` (now marked all-resolved, kept as reference only — this file is the source of truth going forward).

## Documentation hygiene (approved 2026-08-14)

- **`existing-documents/Sprint Plan.md` and `existing-documents/Architecture Decisions.md` archived** to `existing-documents/_archived/` with disclaimer headers. **Correction (2026-08-14):** originally archived as "fictional/template" content — that was wrong. They accurately describe `github.com/zuber-surya/quote-invoice-builder`, a real, separate, actively developed sister repo (Sprints 1-14 done, ~84 merged PRs) this local folder was never connected to. Per explicit human decision, this project (`devflow-quote-builder`) is an intentionally fresh, separate repo — so that sprint history still isn't this repo's history, but it's real, not made up. Kept for reference; may inform this repo's own milestones/ADRs deliberately.
- **Leaked credential removed:** a live Google Stitch API key was committed plaintext in `.devflow/artifacts/stitch/README.md`. Replaced with an env-var placeholder. **Action still needed from the human: rotate/revoke that key in Google Cloud console** — removing it from the file doesn't invalidate it.
- **`.devflow/` canonical layer populated** (this pass) from `existing-documents/` + `client-requirements/` + `stitch/`, per CLAUDE.md's expectation that this folder is the project intelligence layer, not `existing-documents/` (which stays as original-input reference).

## UI/UX direction (approved 2026-08-14)

- **"Serene Sanctuary" (stitch) design system wins** over the formal `UI-UX Specification.md`'s neutral SaaS palette. Rationale: distinctive brand identity was preferred over generic-SaaS look; screens need full React/shadcn rebuild regardless of which system is chosen, so the extra theming cost of the boutique look isn't a differentiator either way.
- `UI-UX Specification.md` marked partially-superseded: its screen inventory, IA, and accessibility rules (keyboard nav, focus states, ARIA, responsive breakpoints) remain authoritative; its color/typography tokens do not.
- Canonical design tokens now live in `.devflow/ui-ux/ui-ux.md`, synced from `stitch/serene_sanctuary/DESIGN.md`.
- Known gaps carried forward to `.devflow/questions/open-questions.md`: no Login/Register/Forgot-Password mockups, no Settings hub, no Quote PDF preview, no mobile/responsive mockups exist yet in stitch.
