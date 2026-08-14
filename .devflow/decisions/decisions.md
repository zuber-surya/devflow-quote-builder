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

## Blocker resolutions (approved 2026-08-14)

1. **PDF library: `pdfkit`.** Server-side Node, mature, no React dependency in the PDF layer. Rejected `@react-pdf/renderer` (floated only in an archived, non-authoritative doc — see `existing-documents/_archived/`) and `puppeteer` (heavier, browser-spawn overhead not worth it for solo-dev MVP).
2. **Quote → Invoice conversion:** "Convert to Invoice" button on an Accepted quote copies line items into a new Invoice, links `invoice.quote_id → quote.id`, sets `quote.status = 'Converted'`, locks the quote read-only. Quote is never deleted — audit trail preserved.
3. **Auth strategy:** Hybrid — Auth.js session cookies for web, JWT + refresh token for Flutter mobile. Same `/api/v1/auth/*` endpoints; client type detected via `x-client-type` header, response shape branches accordingly.
4. **Payment tracking:** Simple manual marking for V1 — `invoice.paid_amount` (NUMERIC) + `invoice.payment_status` (ENUM: Unpaid/Partially Paid/Paid/Overdue), `marked_paid_at`/`marked_paid_by` fields. No separate `payments` table, no refund workflow, no payment gateway — explicitly post-MVP.
5. **File storage:** Local filesystem (`/public/business-logos/{userId}/...`) for MVP. S3/CDN migration is post-MVP, not blocking.
6. **Document numbering:** Year-based auto-increment per user — `Q-2026-00001`, `INV-2026-00001`. Resets annually.

Full option analysis for each: `.devflow/artifacts/CRITICAL_BLOCKERS.md` (now marked all-resolved, kept as reference only — this file is the source of truth going forward).

## Documentation hygiene (approved 2026-08-14)

- **`existing-documents/Sprint Plan.md` and `existing-documents/Architecture Decisions.md` archived** to `existing-documents/_archived/` with disclaimer headers. Both described a fully-built app (Sprints 1-14, PRs to #82) that does not exist in this repo — fictional/template content, not real project history. Kept for reference only (Sprint Plan's module breakdown may still inform future sprint planning).
- **Leaked credential removed:** a live Google Stitch API key was committed plaintext in `.devflow/artifacts/stitch/README.md`. Replaced with an env-var placeholder. **Action still needed from the human: rotate/revoke that key in Google Cloud console** — removing it from the file doesn't invalidate it.
- **`.devflow/` canonical layer populated** (this pass) from `existing-documents/` + `client-requirements/` + `stitch/`, per CLAUDE.md's expectation that this folder is the project intelligence layer, not `existing-documents/` (which stays as original-input reference).

## UI/UX direction (approved 2026-08-14)

- **"Serene Sanctuary" (stitch) design system wins** over the formal `UI-UX Specification.md`'s neutral SaaS palette. Rationale: distinctive brand identity was preferred over generic-SaaS look; screens need full React/shadcn rebuild regardless of which system is chosen, so the extra theming cost of the boutique look isn't a differentiator either way.
- `UI-UX Specification.md` marked partially-superseded: its screen inventory, IA, and accessibility rules (keyboard nav, focus states, ARIA, responsive breakpoints) remain authoritative; its color/typography tokens do not.
- Canonical design tokens now live in `.devflow/ui-ux/ui-ux.md`, synced from `stitch/serene_sanctuary/DESIGN.md`.
- Known gaps carried forward to `.devflow/questions/open-questions.md`: no Login/Register/Forgot-Password mockups, no Settings hub, no Quote PDF preview, no mobile/responsive mockups exist yet in stitch.
