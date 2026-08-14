# Non-Functional Requirements

## Performance
- Normal CRUD operations: fast, no specific SLA given by client — treat as sub-second for typical single-user data volumes (MVP scale, not enterprise).
- PDF generation: within a few seconds (client requirement, verbatim).

## Accessibility
- Keyboard navigation across all forms/flows.
- Proper labels on all form inputs.
- Visible focus states.
- Accessible forms generally (implies semantic HTML, ARIA where needed).
- `existing-documents/UI-UX Specification.md` has detailed accessibility rules (breakpoints, ARIA patterns) — that document's accessibility section remains authoritative even though its color/typography tokens were superseded by the Serene Sanctuary design system (see `.devflow/decisions/decisions.md`).

## Security
- HTTPS everywhere, protected APIs.
- Password hashing (not plaintext) — see `.devflow/security/security.md`.
- Strict per-user data isolation — no user can read/write another user's records.
- Server-side validation on every write path, not just client-side.

## Reliability / Data Integrity
- All monetary values `NUMERIC(12,2)` in PostgreSQL — no floating point, avoids rounding errors.
- Quotes become read-only/locked once converted to an Invoice — audit trail preserved, no silent divergence between quote and invoice line items after conversion.

## Scalability
- MVP explicitly targets solo-developer / small-business scale, not enterprise. No stated concurrency or load targets.
- File storage starts local filesystem, explicitly deferred to S3 post-MVP once real usage demands it — don't over-build storage abstraction now.

## Platform
- Responsive web (desktop/tablet/mobile breakpoints) + native Android/iOS via Flutter, sharing one backend.
