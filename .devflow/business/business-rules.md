# Business Rules

## Quote lifecycle
- Statuses: `Draft → Sent → Accepted | Rejected | Expired`. On accept + conversion, add terminal state `Converted`.
- Only an `Accepted` quote can be converted to an invoice.
- Line items: quantity × price + tax − discount, calculated authoritatively server-side (client display is a preview only, never trusted as source of truth).

## Quote → Invoice conversion (approved, see `decisions/decisions.md`)
1. User clicks "Convert to Invoice" on an Accepted quote.
2. Server validates `quote.status === 'Accepted'`.
3. New Invoice created, line items copied (not referenced) from the quote — invoice can diverge after creation without touching quote history.
4. `invoice.quote_id → quote.id` link recorded.
5. `quote.status → 'Converted'`, quote becomes read-only.
6. Original quote is never deleted — permanent audit trail.

## Invoice lifecycle
- Statuses: `Unpaid → Partially Paid → Paid`, plus `Overdue` (derived: past `due_date` and not fully paid).
- Payment status derived from `paid_amount` vs `amount`: `paid_amount = 0` → Unpaid; `0 < paid_amount < amount` → Partially Paid; `paid_amount >= amount` → Paid.
- Marking paid/unpaid is manual (button), not gateway-driven — no payment gateway integration in V1.

## Numbering
- Format: `Q-{year}-{00001}` for quotes, `INV-{year}-{00001}` for invoices. Per-user sequence, resets each calendar year.

## Data isolation
- Every query scoped to the authenticated user's own records — Customer, Product, Quote, Invoice all belong to exactly one User (N:1). No cross-user reads or writes, enforced server-side, not just hidden in UI.

## PDF
- Quote/Invoice PDFs must include: business profile info (name, logo, address, GST/tax number, website), customer info, line items, tax breakdown, totals, notes/terms.
