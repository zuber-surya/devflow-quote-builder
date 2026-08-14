---
name: implement-feature
description: Implement one GitHub issue (one M0-M9 milestone task) end to end following this project's approved workflow - read docs, plan, implement smallest correct change, test, self-review, commit. Use whenever picking up a new feature/issue for the Quote & Invoice Builder, instead of jumping straight to code.
---

# Implement Feature

Packages the workflow from `.devflow/artifacts/existing-documents/Code & Development Workflow.md` §10-14, §48, §80 for this repo. Run this whenever starting work on a GitHub issue.

## Steps

1. **Read `CLAUDE.md` and `AGENTS.md`.** Then read the specific `.devflow/` docs relevant to this feature — check `.devflow/requirements/traceability.md` to find which docs apply (requirements, business-rules, architecture, database, api, ui-ux, security).

2. **State scope before touching code.** Report back:
   - What existing code is relevant?
   - What files likely need changes?
   - Implementation plan (short — feature, goal, files to modify/create, API changes, DB changes, UI changes, tests, risks).
   - Do not implement scope beyond the one issue being worked. If the issue is "Create customer list," don't also build customer creation, quotes, or anything else, even if related, unless explicitly asked.

3. **Implement the smallest correct change.** No inline CSS, no `any`, no duplicated logic — reuse `src/lib/`, `src/components/` where they already exist. Backend recalculates and re-validates everything financial and everything authorization-related — never trust the client.

4. **Test.** Add/update tests for the logic just written per CLAUDE.md rules 9-10. Run `npm run lint`, `npm run type-check`, `npm test`.

5. **Self-review before committing.** Dispatch the `feature-code-reviewer` subagent (and `financial-calc-reviewer` too, if money/calculations were touched) against the diff. Fix what it finds, or explain why a finding doesn't apply.

6. **Commit in small, focused commits** — conventional commit format (`feat:`, `fix:`, `test:`, etc.), one logical change per commit, per CLAUDE.md's Git section.

7. **Update the GitHub issue** — check off completed tasks in the issue body, or comment with status if not fully done yet.

## Guardrails

- One issue at a time. Don't open unrelated work mid-feature.
- If implementation would conflict with an approved requirement or architecture decision, stop and raise it — don't silently deviate (`.devflow/decisions/decisions.md` is the source of truth for decisions already made).
- Refactoring happens in its own commit/PR, separate from feature work, when avoidable.
