# Architecture

**Pattern:** Modular monolith. Next.js 15 API Routes serve both the web frontend and the Flutter mobile app from one codebase/deployment — no separate microservice.

## Stack
| Layer | Choice |
|---|---|
| Frontend | React 19 + Next.js 15 |
| UI | Tailwind CSS 3.4 + shadcn/ui |
| Backend | Next.js API Routes (`src/app/api/v1/`) |
| Database | PostgreSQL 14+ |
| ORM | Prisma 6 |
| Auth | Auth.js (session, web) + JWT/refresh token (mobile), hybrid via `x-client-type` header |
| PDF | `pdfkit` (see `decisions/decisions.md`) |
| Testing | Vitest (unit/integration) + Playwright (E2E) |
| Mobile | Flutter (separate repo), same REST API |

## Why these choices
- Modular monolith over microservices: solo dev, MVP scale — microservice overhead isn't justified.
- Hybrid auth over pure JWT or pure session: web gets the simpler/more secure Auth.js session pattern; mobile gets standard stateless JWT without forcing cookies onto Flutter.
- `pdfkit` over `@react-pdf/renderer`/`puppeteer`: mature, server-side, no browser-spawn overhead. See `decisions/decisions.md` for full rationale.

## Phases (see root `README.md` / `state.md` for live status)
0. Foundation (scaffolding, schema, config) — done
1. Authentication & Database — next
2. Business Profile
3. Customers & Products
4. Quotes
5. Invoices
6. PDF & Polish

## Known documentation risk
`existing-documents/_archived/Sprint Plan.md` and `Architecture Decisions.md` describe a further-along, fictional implementation state (Sprints 1-14 "done"). They're archived with disclaimers — don't treat them as real history when reasoning about what exists in this repo. Trust the phase table above and actual `src/` contents instead.
