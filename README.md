# Quote & Invoice Builder - MVP

**Status:** Phase 0 Complete, Ready for Phase 1 (Authentication)  
**Development Model:** Solo developer using Claude Code  
**Timeline:** Flexible (12+ weeks available)  
**Version:** 0.1.0-dev

---

## 📖 QUICK START

### For the First Time

1. **Setup Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your PostgreSQL connection details
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Initialize Database**
   ```bash
   npm run db:migrate:dev
   npm run db:seed              # Add sample data
   ```

4. **Start Development**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

See **[SETUP.md](SETUP.md)** for detailed instructions.

### Continue Work Later

Tell Claude:
> Continue this DevFlow-managed project from the current state. Read `.devflow/state.md` and relevant `.devflow/` documents.

---

## 📚 KEY DOCUMENTS

| Document | Purpose | Location |
|----------|---------|----------|
| **SETUP.md** | Local development setup guide | Root folder |
| **State & Progress** | Current phase, completed work, blockers | `.devflow/state.md` |
| **Architecture** | Technology stack, design decisions | `docs/ARCHITECTURE.md` |
| **Development Guide** | Quick reference for developers | `.devflow/artifacts/DEVELOPMENT_QUICK_START.md` |
| **Application Review** | Comprehensive analysis (14 sections) | `.devflow/artifacts/APPLICATION_REVIEW.md` |
| **Blocker Resolutions** | All 6 critical decisions documented | `.devflow/artifacts/CRITICAL_BLOCKERS.md` |

---

## 🏗️ PROJECT STRUCTURE

```
Quote & Invoice Builder/
├── SETUP.md                          # ← START HERE
├── CLAUDE.md                         # Development instructions
├── package.json                      # Dependencies & npm scripts
├── tsconfig.json                     # TypeScript strict mode
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore patterns
│
├── .devflow/
│   ├── state.md                      # Current project state
│   └── artifacts/                    # Planning documents
│       ├── APPLICATION_REVIEW.md     # Full analysis
│       ├── DEVELOPMENT_QUICK_START.md  # Developer reference
│       ├── CRITICAL_BLOCKERS.md      # Decision framework
│       └── client-requirements/      # Original requirements
│
├── docs/
│   ├── ARCHITECTURE.md               # Tech stack, design
│   ├── API.md                        # API documentation
│   ├── DATABASE.md                   # Database schema
│   ├── SECURITY.md                   # Security considerations
│   ├── TESTING.md                    # Testing strategy
│   └── UI-UX.md                      # UI design principles
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── globals.css               # Global styles
│   │   └── api/v1/                   # REST API (to be built)
│   │
│   ├── lib/
│   │   ├── db.ts                     # Prisma client
│   │   ├── calculations.ts           # Business logic
│   │   └── auth.ts                   # (to be created)
│   │
│   ├── types/
│   │   └── api.ts                    # TypeScript API types
│   │
│   └── components/                   # (to be built)
│
├── prisma/
│   ├── schema.prisma                 # Complete database schema
│   ├── seed.ts                       # Database seeding
│   └── migrations/                   # Database migrations
│
├── tests/                            # (to be built)
│   ├── api/
│   ├── services/
│   └── lib/
│
└── public/
    └── business-logos/               # Uploaded business logos
```

---

## 🎯 WHAT THIS PROJECT DOES

**Quote & Invoice Builder** is an MVP web application for freelancers and small businesses to:

✅ Create and manage business profiles  
✅ Store customer information  
✅ Create product/service catalogs  
✅ Generate professional quotes  
✅ Convert quotes to invoices  
✅ Track payment status  
✅ Export quotes & invoices as PDFs  
✅ Multi-platform support (web + Flutter mobile)

---

## 🛠️ TECHNOLOGY STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + Next.js | 19 + 15 |
| **UI** | Tailwind CSS + shadcn/ui | 3.4 + latest |
| **Backend** | Next.js API Routes | 15 |
| **Database** | PostgreSQL | 14+ |
| **ORM** | Prisma | 6 |
| **Auth** | Auth.js (NextAuth) + JWT | latest |
| **Language** | TypeScript | 5.3 (strict mode) |
| **PDF** | pdfkit | 0.14 |
| **Testing** | Vitest | 1.0 |
| **Mobile** | Flutter | (separate repo) |

---

## 🔐 AUTHENTICATION

- **Web**: Session-based (NextAuth.js + Prisma adapter)
- **Mobile**: JWT token-based (for Flutter app)
- **Hybrid**: Same endpoints detect client type via `x-client-type` header

---

## 📊 DATABASE SCHEMA

**Core Entities:**
- `User` - User accounts with email/password
- `BusinessProfile` - Company info (1:1 with User)
- `Customer` - Customer contacts (N:1 with User)
- `Product` - Service/product catalog (N:1 with User)
- `Quote` - Quotations (N:1 with User)
- `QuoteItem` - Quote line items (N:1 with Quote)
- `Invoice` - Invoices (N:1 with User)
- `InvoiceItem` - Invoice line items (N:1 with Invoice)
- `RefreshToken` - JWT refresh tokens (for mobile)

**Financial Data:**
- All monetary values use PostgreSQL `NUMERIC(12,2)` type
- Prevents floating-point rounding errors
- Supports all global currencies

---

## 📈 DEVELOPMENT PHASES

| Phase | Name | Status | ETA |
|-------|------|--------|-----|
| 0 | Foundation | ✅ COMPLETE | - |
| 1 | Authentication & Database | 🔄 IN PROGRESS | Week 1 |
| 2 | Business Profile | ⏳ PENDING | Week 1-2 |
| 3 | Customers & Products | ⏳ PENDING | Week 2-3 |
| 4 | Quotes | ⏳ PENDING | Week 3-4 |
| 5 | Invoices | ⏳ PENDING | Week 4-5 |
| 6 | PDF & Polish | ⏳ PENDING | Week 5-6 |

---

## 🚀 COMMON COMMANDS

```bash
# Development
npm run dev                # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Code Quality
npm run lint               # Check code style
npm run type-check         # Type check TypeScript

# Database
npm run db:migrate:dev     # Create migration & apply
npm run db:migrate:prod    # Deploy migrations
npm run db:seed            # Populate sample data
npm run db:studio          # Open Prisma GUI

# Testing
npm test                   # Run tests
npm run test:coverage      # Coverage report
```

---

## ✅ CRITICAL DECISIONS (RESOLVED)

All architectural blockers have been resolved. See [CRITICAL_BLOCKERS.md](.devflow/artifacts/CRITICAL_BLOCKERS.md):

1. ✅ **PDF Generation**: pdfkit (server-side Node.js)
2. ✅ **Quote→Invoice**: Locking conversion with audit trail
3. ✅ **Authentication**: Hybrid session + JWT
4. ✅ **Payment Tracking**: Simple manual marking (MVP)
5. ✅ **File Storage**: Local filesystem (MVP), S3 post-MVP
6. ✅ **Document Numbering**: Year-based auto-increment

---

## 🔗 FOR DEVELOPERS

**Read These First:**
1. [SETUP.md](SETUP.md) - Local setup
2. `.devflow/state.md` - Current progress
3. `CLAUDE.md` - Development rules

**Reference Docs:**
- `.devflow/artifacts/APPLICATION_REVIEW.md` - Full context
- `.devflow/artifacts/DEVELOPMENT_QUICK_START.md` - Quick ref
- `docs/ARCHITECTURE.md` - System design

---

## 🐛 DEBUGGING

If you encounter issues, check:
1. **SETUP.md** → Troubleshooting section
2. **DATABASE_URL** in `.env.local` is correct
3. **PostgreSQL** is running (`npm run db:studio` to test)
4. **Dependencies** installed (`npm install`)
5. **TypeScript errors** (`npm run type-check`)

---

## 🎓 LEARNING NOTES

This project uses:
- **Strict TypeScript** - All types fully specified, no `any`
- **Prisma** - Type-safe database access with migrations
- **shadcn/ui** - Copy-paste component library built on Radix UI
- **Tailwind CSS** - Utility-first CSS with automatic purging
- **Auth.js** - Industry standard for web authentication
- **Decimal Types** - NUMERIC for financial accuracy (no floating-point)

---

## ❓ QUESTIONS?

- **Setup Issues?** → See [SETUP.md](SETUP.md)
- **Architecture?** → See `docs/ARCHITECTURE.md`
- **Code Examples?** → See `.devflow/artifacts/DEVELOPMENT_QUICK_START.md`
- **Full Context?** → See `.devflow/artifacts/APPLICATION_REVIEW.md`

---

## 📝 DevFlow Note

This is a **DevFlow-managed project**. When continuing work:

1. Read `.devflow/state.md` for current status
2. Review `.devflow/README.md` for workflow rules
3. Check `CLAUDE.md` for development instructions
4. Follow the approved phase plan
5. Update `.devflow/state.md` when phases complete

**Do not skip gates or silently modify requirements.**

---

**Version 0.1.0** | Last Updated: August 14, 2026
