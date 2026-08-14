# Testing Strategy

**Stack:** Vitest (unit + integration) + React Testing Library (component) + Playwright (E2E). Source: `existing-documents/Testing & QA Specification.md`, consistent with root README.md.

## Coverage expectations (per CLAUDE.md mandatory rules)
- Every meaningful feature needs appropriate tests.
- Every bug fix needs regression coverage where technically applicable.

## Priority areas (financial correctness matters most here)
- Calculation logic (`src/lib/calculations.ts`) — tax, totals, discount math. Unit-test edge cases: zero quantity, 100% discount, rounding at `NUMERIC(12,2)` boundaries.
- Quote → Invoice conversion — line items copied correctly, quote locks, audit trail intact (see `business/business-rules.md`).
- Data isolation — a test user must never be able to read/write another user's Customer/Product/Quote/Invoice via the API.
- Auth — both session (web) and JWT (mobile) paths, including refresh-token expiry/rotation.
- Payment status derivation — Unpaid/Partially Paid/Paid/Overdue transitions match `business/business-rules.md`.

## Not yet populated
`testing/test-cases.md`, `testing/traceability.md`, `testing/regression-cases.md` stay stubs until code exists to test against — populate incrementally per phase, not upfront, since no implementation exists yet beyond Phase 0 scaffolding.
