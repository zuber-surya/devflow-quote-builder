# Users & Roles

**V1 model:** single role. One `User` = one account = one business. No team members, no role hierarchy, no permissions system, no customer-facing portal login.

- `User` — owns exactly one `BusinessProfile` (1:1), and owns Customers, Products, Quotes, Invoices (all N:1 to User).
- Auth: web via Auth.js session; mobile (Flutter) via JWT + refresh token. Same account, detected by `x-client-type` header — not two separate user types, just two auth transports for the same role. See `architecture/architecture.md` and `decisions/decisions.md`.

**Explicitly out of V1:** team management, multi-user accounts, role-based permissions, customer self-service portal/login. If any of these come up in a future request, flag it — it's a scope addition beyond the approved PRD, not an oversight.
