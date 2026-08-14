# Claude Code Implementation Guide

## Objective

Build DevFlow AI itself from this repository.

## First task

Inspect the repository and implement the smallest vertical slice:

Client requirement
→ project initialization
→ `.devflow/state.md`
→ Discovery prompt
→ Human question
→ knowledge update
→ state update
→ next action.

## Do not build everything at once

Use feature-by-feature implementation.

For every feature:
1. Read `FEATURES.md`.
2. Read the relevant workflow/prompt.
3. Plan.
4. Human review.
5. Implement.
6. Test.
7. Review.
8. Update documentation.

## First vertical slice acceptance criteria

- A user can create a project from `project-skeleton/`.
- The project remains outside the DevFlow repository.
- A client requirement can be added under `.devflow/artifacts/client-requirements/`.
- DevFlow can inspect it.
- DevFlow can start Discovery.
- DevFlow can ask a question.
- The answer is written to the appropriate Markdown knowledge file.
- `.devflow/state.md` is updated.
- The AI clearly states the next action.
- The workflow can be resumed later.
