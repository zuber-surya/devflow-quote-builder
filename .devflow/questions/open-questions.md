# Open Questions

Items surfaced during the 2026-08-14 documentation review that still need a human call, roughly in the order they'll block a phase.

1. **Auth screen designs** (blocks Phase 1 UI) — no stitch mockup exists for Login/Register/Forgot Password. Need either a stitch pass or hand-build against the Serene Sanctuary tokens in `ui-ux/ui-ux.md`.
2. **Settings hub** (blocks Phase 6) — only Tax Settings + Business Profile exist as screens. Need a plan for where quote/invoice-numbering prefs and account settings live in the UI.
3. **Quote PDF preview** (blocks Phase 4) — only an Invoice PDF preview mockup exists. Confirm quote PDF should mirror the same template or needs its own pass.
4. **Mobile/responsive mockups** (blocks Flutter work + responsive web) — stitch is desktop-first only ("Mobile versions planned" per its own README). Formal spec's breakpoints are the interim fallback.
5. **GSTIN/LUT field validation** — stitch Tax Settings mockup shows export/zero-rated-supply fields beyond the base PRD's "tax settings, GST" line. Confirm these are wanted for V1 or trim at build time.
6. **Rotate the leaked Stitch API key** — see `security/security.md`. Human action required in Google Cloud console; not something this session can do.

Resolved this session (kept here briefly for continuity, remove once Phase 1 starts): PDF library, quote→invoice workflow, auth strategy, payment tracking, file upload, numbering, UI design-system choice, Sprint Plan/ADR fiction-vs-reality mismatch — all recorded in `decisions/decisions.md`.
