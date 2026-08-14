# UI/UX

**Design direction (decided 2026-08-14):** "Serene Sanctuary" boutique system, from `.devflow/artifacts/stitch/serene_sanctuary/DESIGN.md`, wins over the formal `existing-documents/UI-UX Specification.md`'s neutral SaaS palette. See `decisions/decisions.md` for rationale. That spec's screen inventory, IA, and accessibility rules still apply.

## Design tokens (source: stitch/serene_sanctuary/DESIGN.md)

**Palette** ("Digital Respite" — stone/leaf/earth, minimalism + tactile softness):
- Primary (Deep Sage): `#334537`, on-primary `#ffffff`
- Secondary (Soft Clay): `#7d562d`
- Background/surface (Alabaster Cream): `#fbf9f6`
- Surface container: `#ffffff` (elevated cards)
- Text (Charcoal Green): `#1b1c1a`
- Error: `#ba1a1a`
- Full Material-3-style token set (containers, fixed variants, tertiary) in the source file — map into `tailwind.config.js` / shadcn theme as CSS variables, don't hand-roll a second palette.

**Typography:**
- Headlines: **EB Garamond** (serif) — used as substitute for Cormorant Garamond, per source doc. Sizes 24-64px.
- Body/UI: **Outfit** (geometric sans) — 12-20px. Line height 1.5-1.6x for body text.

**Shape & elevation:**
- Cards/modals: 24px corner radius, min 32px interior padding, "Whisper Shadow" (`0 12px 24px -4px rgba(44,53,45,0.05)`) — no hard shadows, no structural borders.
- Buttons/inputs: 12-16px radius.
- Layout: 12-column grid, 32px gutters, 48px container padding minimum, 80px between sections. Occasional asymmetrical "scrapbook" layout is intentional, not a bug.

**Implementation note:** stitch `code.html` files are static Tailwind-CDN HTML (no React/JSX/shadcn) — treat as high-fidelity visual reference only. Every screen needs rebuilding as React/shadcn components against the actual stack (Next.js 15 + React 19 + Tailwind 3.4 + shadcn/ui). Don't copy the HTML directly.

## Screen inventory (source: stitch/quote_invoice_builder_screen_architecture.md + client requirements)

Covered by existing stitch mockups:
1. Dashboard (Overview)
2. Customer Directory
3. Products/Services Catalog
4. Create Quote (multi-step builder)
5. Quotations list
6. Invoices (cash-flow view)
7. Invoice PDF Preview
8. Business Profile
9. Tax Settings

**Gaps — no mockup exists yet, needed before/during the relevant build phase:**
- Login / Register / Forgot Password (needed for Phase 1)
- Settings hub beyond Tax + Business Profile — quote/invoice numbering prefs, account settings (needed for Phase 6)
- Quote PDF preview (only Invoice preview exists — needed for Phase 4)
- Record Payment modal (needed for Phase 5)
- Mobile/responsive versions — stitch is desktop-first only; formal spec's breakpoints (`existing-documents/UI-UX Specification.md`) are the fallback reference until mobile mockups exist

Track these as they come up: `questions/open-questions.md`.

## Accessibility (still authoritative from formal spec, not superseded)
Keyboard navigation, visible focus states, proper labels, ARIA where semantic HTML isn't enough, responsive breakpoints per `existing-documents/UI-UX Specification.md`.
