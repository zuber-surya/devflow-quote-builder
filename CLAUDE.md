# DevFlow Project Instructions

You are working inside a DevFlow-managed project: **Quote & Invoice Builder MVP**.

## Mandatory rules

1. Read `.devflow/state.md` before meaningful work.
2. Read only relevant `.devflow/` files.
3. Treat `.devflow/` as the project intelligence/workflow layer.
4. Treat `docs/` as formal output.
5. Do not manually copy requirements between files.
6. Do not silently modify approved requirements.
7. Do not implement a feature without an approved requirement/task (a GitHub issue under M0-M9, see `.devflow/state.md`).
8. For significant changes, stop for Human approval.
9. Every meaningful feature needs appropriate tests.
10. Every bug fix needs regression coverage when technically applicable.
11. Review code against requirements, architecture, security, and tests.
12. Keep changes focused and token-efficient.

## Current project state

Read `.devflow/state.md`.

## Development rule

Plan first for non-trivial work. Implement only the approved plan.

---

## Project

Quote and invoice management app for freelancers and small businesses. Core flow: Customer → Quote → PDF → Invoice → Payment.

Platforms: Responsive Web (this repo) + Flutter mobile (separate track, built after the web API is stable).

## Architecture

- Web: Next.js 15 + React 19 + TypeScript (strict) + Tailwind CSS + shadcn/ui
- Backend: Next.js API Routes (`src/app/api/v1/`) — no separate backend service
- Database: PostgreSQL + Prisma 6
- Auth: hybrid — Auth.js session (web), JWT + refresh token (Flutter), branched via `x-client-type` header
- PDF: `pdfkit`
- Testing: Vitest (unit/integration) + Playwright (E2E)

Full detail: `.devflow/architecture/architecture.md`, `.devflow/decisions/decisions.md`.

## Important rules

1. Read relevant `.devflow/` docs before implementing a feature.
2. Do not modify unrelated files.
3. Do not duplicate components or business logic.
4. No inline CSS — Tailwind + shadcn/ui only.
5. Use strict TypeScript. Avoid `any`.
6. Validate all external input server-side, not just client-side.
7. Backend is authoritative for financial calculations — never trust client-submitted totals.
8. Backend is authoritative for authorization — every query scoped to `req.user.id`.
9. Never expose secrets. No API keys/tokens in any committed file — `.env.local` only.
10. Add tests for critical business logic (calculations, conversion, payment status, auth).
11. Do not implement V1.1+ features unless explicitly requested — see `.devflow/requirements/functional.md` for the out-of-scope list.
12. Do not silently change API contracts or the database schema.
13. Never remove tests to make CI pass.
14. Keep implementation simple and appropriate for MVP.

## Before coding

1. Read the relevant `.devflow/` docs (requirements, business rules, architecture, database, api, ui-ux, security as applicable).
2. Inspect existing implementation.
3. Identify affected files.
4. Create a short implementation plan.
5. Implement the smallest correct change.
6. Run tests and validation (`npm run lint`, `npm run type-check`, `npm test`).
7. Review the diff.

Use the `implement-feature` skill for this workflow on a GitHub issue.

## Financial rules

Never trust client-submitted calculations. Server must validate/recompute:
- subtotal, tax, discount, total
- payment amount and payment status
- quote status and invoice status
- quote-to-invoice conversion

See `.devflow/business/business-rules.md`.

## Git

Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `ci:`. Keep commits focused — one logical change each.

Branch per feature: `feature/<name>`, off `main`/`master`. PR per feature, using `.github/pull_request_template.md`.

## Forbidden

Do not:
- use inline CSS
- hardcode secrets
- use `any` to bypass type errors
- duplicate components or business logic
- put database queries inside React components
- put HTTP calls directly in Flutter widgets (when mobile work starts)
- disable lint rules or TypeScript checks without justification
- remove tests
- rewrite unrelated modules
- implement features outside the current milestone's issue without asking first
