# Assumptions

Tracked assumptions not explicitly confirmed by the client but implied by requirements/design. Flag to the human if any of these turn out wrong.

- One `BusinessProfile` per `User` (1:1) — no multi-business/multi-brand accounts.
- Quote/Invoice numbering sequences reset yearly per user, not globally — two different users can both have `Q-2026-00001`.
- "A few seconds" for PDF generation (client requirement) interpreted as under ~5s for a typical single-page quote/invoice — no explicit numeric SLA given.
- GSTIN/tax-number fields are free-text (not validated against India's GSTIN checksum format) unless a future requirement says otherwise — the stitch Tax Settings mockup adds GSTIN + LUT fields beyond the base PRD, treated as acceptable elaboration, not scope creep, since it's still within "GST/tax settings."
- Mobile Flutter app is a separate repo/track and not expected to ship simultaneously with each web phase — web phases 1-6 can complete independently.
- `Product.sku` field (present in schema, absent from PRD) is a harmless optional addition, not removed — see `database/database.md`.
