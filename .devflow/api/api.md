# API

**Base:** `/api/v1/*`, Next.js API Routes. Full contract in `existing-documents/API Specification.md` (1572 lines) — this file is the condensed navigable summary.

## Auth (hybrid — see `decisions/decisions.md`)
- `POST /api/v1/auth/register` — implemented.
- `POST /api/v1/auth/login` — implemented. Client type detected via `x-client-type: flutter|mobile` header.
  - Web: verifies credentials, then calls Auth.js `signIn()` to set an httpOnly session cookie. Response body: `{ user }`.
  - Mobile: response includes `{ user, accessToken, refreshToken }`.
- `POST /api/v1/auth/logout` — implemented. Web: Auth.js `signOut()`. Mobile: pass `{ refreshToken }` in body to revoke it.
- `POST /api/v1/auth/refresh` — implemented, mobile only. Body `{ refreshToken }` → response `{ accessToken, expiresIn, refreshToken }`. **Refresh tokens rotate on every use** — the old one is deleted, a new one is issued; the client must persist the new value.
- `POST /api/v1/auth/password-reset` — **not implemented**. Needs a `PasswordResetToken` schema addition and an email-delivery provider decision first (none made yet) — see `questions/open-questions.md`.
- Auth.js's own routes are mounted at `/api/auth/[...nextauth]` (internal, not part of the `/api/v1` contract — needed for cookie session management).
- `getCurrentUser`/`requireUser` (`src/lib/session.ts`) resolve the current user by trying the Auth.js session first, then `Authorization: Bearer <jwt>`.

## Resource endpoints (standard CRUD unless noted)
- `/api/v1/business-profile` — GET/PUT (singleton per user), `POST /upload-logo`.
- `/api/v1/customers` — CRUD + search.
- `/api/v1/products` — CRUD + search.
- `/api/v1/quotes` — CRUD, `POST /{id}/duplicate`, `POST /{id}/convert-to-invoice`, `GET /{id}/pdf`.
- `/api/v1/invoices` — CRUD, `PUT /{id}/mark-paid`, `PUT /{id}/mark-unpaid`, `GET /{id}/pdf`.
- All list endpoints support filter/search params per `requirements/functional.md` §9 (status, customer, date range, number).

## Rules
- Server recalculates all financial totals — never trust client-submitted subtotal/tax/total.
- Every resource query scoped to `req.user.id` — enforced in the data layer, not just route guards.
- Data isolation and validation apply identically regardless of client type (web/mobile).
