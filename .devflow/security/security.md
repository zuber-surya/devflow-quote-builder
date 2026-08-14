# Security

## Authentication
- Passwords hashed (never stored plaintext) — Auth.js handles this for web credential login.
- Web: httpOnly session cookies (Auth.js + Prisma adapter).
- Mobile: JWT + refresh token, stored in Flutter secure storage (not plain SharedPreferences).
- `RefreshToken` records are revocable server-side (table exists in schema) — logout should invalidate them, not just discard client-side.

## Data isolation
- Every business record (Customer, Product, Quote, Invoice, BusinessProfile) has a direct `userId` FK.
- All queries/mutations must filter by `req.user.id` — no endpoint should accept a raw resource ID without verifying ownership first.

## Transport & API
- HTTPS required in all environments beyond local dev.
- Server-side validation on every write endpoint — client-side validation is UX only, never the security boundary.
- Financial totals always server-recalculated (see `api/api.md`) — prevents client-side tampering with quote/invoice amounts.

## Secrets hygiene (incident, 2026-08-14)
- A live Google Stitch API key was found committed plaintext in `.devflow/artifacts/stitch/README.md`. Removed and replaced with an env-var reference — **the key itself still needs rotation/revocation in Google Cloud console**, since removing it from the file doesn't invalidate it.
- Going forward: no API keys, tokens, or credentials in any `.devflow/` or `docs/` markdown file — use `.env.local` (gitignored) only.

## Not yet designed (flag before Phase 1 auth work starts)
- Rate limiting on auth endpoints (login/register/password-reset) — not specified anywhere in existing docs, should be added before public exposure.
- CSRF protection strategy for the session-cookie (web) path — Auth.js has defaults, confirm they're enabled, don't assume.
