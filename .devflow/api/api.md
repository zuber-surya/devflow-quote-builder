# API

**Base:** `/api/v1/*`, Next.js API Routes. Full contract in `existing-documents/API Specification.md` (1572 lines) — this file is the condensed navigable summary.

## Auth (hybrid — see `decisions/decisions.md`)
- `POST /api/v1/auth/register`, `/login`, `/logout`, `/password-reset` — shared by web and mobile.
- Client type detected via `x-client-type` header (or presence of `Authorization` header).
  - Web: Auth.js sets an httpOnly session cookie.
  - Mobile: response includes `{ jwt, refreshToken }`.
- `POST /api/v1/auth/refresh` — mobile JWT refresh.
- Middleware resolves current user by trying session first, then `Authorization: Bearer <jwt>`.

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
