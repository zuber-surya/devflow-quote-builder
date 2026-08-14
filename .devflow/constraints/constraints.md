# Constraints

- **Solo developer**, using Claude Code — no team-process boilerplate ("Owner: PM", "Friday deadlines") applies; disregard that language where it appears in `existing-documents/`.
- **Flexible timeline**, 12+ weeks available — no hard external deadline driving scope cuts.
- **No cloud infrastructure for MVP** — local Postgres, local filesystem for file storage, no S3/AWS until post-MVP.
- **Default currency INR (₹)** — no multi-currency support in V1.
- **Single-user accounts only** — no team/role system, no customer portal login.
- **Desktop-first design assets** — stitch mockups don't cover mobile/responsive yet; formal spec's breakpoints are the fallback until they do.
- **PDF generation must complete in a few seconds** — rules out approaches with heavy per-request overhead (informed the `pdfkit` over `puppeteer` decision).
