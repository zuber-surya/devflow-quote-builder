---
name: db-change-workflow
description: Safely change the Prisma schema/database for the Quote & Invoice Builder - explain impact before migrating. Use whenever a task requires adding, removing, or altering a Prisma model/field/relation, not just when explicitly asked to "migrate the database."
---

# Database Change Workflow

Packages `.devflow/artifacts/existing-documents/Code & Development Workflow.md` §51. Never modify `prisma/schema.prisma` without going through this first — schema changes are hard to reverse once data exists.

## Steps

1. **Read** `prisma/schema.prisma` and `.devflow/database/database.md` before proposing any change.

2. **Explain before implementing**, in this order:
   - Which table(s)/model(s) are affected.
   - Which relationships change (FKs, cascades, uniqueness constraints).
   - Migration impact — is this additive (safe) or does it rename/remove/retype an existing column (potentially destructive)?
   - Does existing data need a backfill or transformation? If seed data or real data already exists, say what breaks without one.

3. **Check for conflicts** with `.devflow/decisions/decisions.md` and `.devflow/business/business-rules.md` — e.g. don't add a field that contradicts an approved business rule (like a second currency field, which is explicitly out of V1 scope).

4. **Then implement**: update `schema.prisma`, run `npm run db:migrate:dev` to generate the migration, review the generated SQL before considering it done — Prisma's inferred migration isn't always what you want for renames (it may drop+recreate instead of `RENAME COLUMN`).

5. **Update `.devflow/database/database.md`** to reflect the new schema so the canonical docs don't drift from `schema.prisma`.

## Guardrails

- Never manually edit already-applied migration files in `prisma/migrations/`.
- Never silently rename/remove a field that other code or docs (`.devflow/api/api.md`, `.devflow/business/business-rules.md`) reference — grep for usages first.
- All money fields stay `NUMERIC`/`Decimal` — never introduce a float/`Float` type for anything financial.
