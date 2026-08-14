# Quote & Invoice Builder — Development Team Quick Start Guide

**Last Updated:** August 14, 2026

---

## 🎯 PROJECT OVERVIEW

**Quote & Invoice Builder** is an MVP Quote & Invoice management application for freelancers and small businesses.

**Core Flow:** Register → Create Customer → Create Quote → Convert to Invoice → Track Payment

**Timeline:** Design Complete → Ready for Development  
**Platform:** Web (Next.js) + Mobile (Flutter)  
**Database:** PostgreSQL + Prisma

---

## 📋 MUST-KNOW REQUIREMENTS

### MVP Scope (IN Scope)
✅ User authentication (register/login/password reset)  
✅ Business profile management (company info, branding)  
✅ Customer management (CRUD + search)  
✅ Product/Service catalog (CRUD)  
✅ Quote creation with tax calculation  
✅ Invoice generation from quotes  
✅ PDF export for quotes & invoices  
✅ Payment status tracking  
✅ Dashboard with KPIs  
✅ Responsive web + mobile apps  

### NOT in V1 (Out of Scope)
❌ AI features  
❌ WhatsApp integration  
❌ Online payments  
❌ Team collaboration  
❌ Customer portal  
❌ Advanced analytics  
❌ Multi-currency  

---

## 🏗️ ARCHITECTURE AT A GLANCE

```
Frontend: Next.js + React + Tailwind + shadcn/ui
Backend: Next.js API Routes (same repo as web)
Database: PostgreSQL + Prisma ORM
Auth: Auth.js
Mobile: Flutter (separate repo, same backend API)

Core Entities:
├── User (authentication)
├── BusinessProfile (1:1)
├── Customer (N:1)
├── Product (N:1)
├── Quote + QuoteItems
└── Invoice + InvoiceItems
```

---

## 🔒 CRITICAL SECURITY PRINCIPLES

**These are NON-NEGOTIABLE:**

1. **Never trust client calculations** — Always recalculate totals/tax on server
2. **User ID from auth, not request body** — `getCurrentUser()` determines ownership
3. **Server validation always** — Even if client validated first
4. **Authorization on every resource** — Check user ownership before returning data
5. **Use NUMERIC/DECIMAL for money** — Never floating-point for currency
6. **Financial data never deleted** — Soft delete only; maintain audit trail

---

## 📊 KEY TECHNICAL DECISIONS

| What | Choice | Why |
|---|---|---|
| IDs | UUIDs | Predictability prevention, API safety |
| Money storage | NUMERIC | Prevents rounding errors |
| Auth | Auth.js | Modern, well-maintained, session-based |
| PDF Library | **TBD** | spike needed (react-pdf vs pdfkit) |
| Quote numbers | Auto-generated (e.g., Q-00001) | User-facing, not exposed UUIDs |
| Invoice numbering | Auto-generated (e.g., INV-2026-001) | Unique per user/year |
| Tax calculation | Server-side only | Compliance requirement |

---

## ⚠️ BLOCKERS TO RESOLVE BEFORE CODE STARTS

| Blocker | Owner | Timeline |
|---|---|---|
| PDF library choice | Architect | 1-2 days |
| Quote → Invoice conversion workflow | PM | 1-2 days |
| Auth strategy for Flutter (JWT vs session) | Architect | 1-2 days |
| Payment tracking entity design | PM | 1-2 days |
| File upload strategy (business logo) | Architect | 1 day |
| Quote/Invoice number generation algorithm | Dev Lead | 1 day |

**Don't start coding until these are resolved.**

---

## 🚀 DEVELOPMENT PHASES

### Phase 1: Authentication & Setup (Week 1)
- [ ] Next.js project setup with TypeScript
- [ ] Auth.js configuration
- [ ] PostgreSQL & Prisma setup
- [ ] User registration/login/logout
- [ ] Database migrations

### Phase 2: Business Profile & Core Data (Week 2)
- [ ] Business profile CRUD
- [ ] Customer management (CRUD, search, list)
- [ ] Product/Service catalog (CRUD, list)
- [ ] Dashboard KPI cards

### Phase 3: Quote Workflow (Week 3)
- [ ] Quote creation form (multi-step)
- [ ] Quote item line entry
- [ ] Tax calculation engine
- [ ] Quote status management (Draft, Sent, Accepted, Rejected, Expired)
- [ ] Quote list with filtering

### Phase 4: PDF & Invoice (Week 4)
- [ ] PDF generation for quotes
- [ ] PDF generation for invoices
- [ ] Quote → Invoice conversion
- [ ] Invoice payment status tracking
- [ ] Invoice list with filtering

### Phase 5: Polish & Testing (Week 5)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Accessibility compliance
- [ ] Mobile responsiveness verification

---

## 💻 DEVELOPMENT STACK

### Required Skills
- TypeScript (strict mode)
- React / Next.js
- PostgreSQL / Prisma
- REST API design
- TailwindCSS / shadcn/ui

### Required Setup
```bash
Node.js 18+ 
PostgreSQL 14+
Docker (recommended for local postgres)
Git
VS Code (or preferred IDE)
```

### Key Dependencies
```json
{
  "next": "^15.x",
  "react": "^19.x",
  "prisma": "^6.x",
  "@auth/nextjs": "latest",
  "tailwindcss": "^3.x",
  "shadcn-ui": "latest",
  "typescript": "^5.x",
  "zod": "^3.x" // validation
}
```

---

## 🎨 UI/UX KEY POINTS

### Visual Identity: "Serene Sanctuary"
- **Palette:** Alabaster (backgrounds), Deep Sage (accents), Charcoal (text)
- **Typography:** Cormorant Garamond (headers) + Outfit (UI elements)
- **Tone:** Professional, calm, distraction-free

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Component Library
Use **shadcn/ui** for consistency:
- Forms (input, select, checkbox, radio, etc.)
- Tables (for quotes/invoices/customers lists)
- Cards (dashboard KPI cards)
- Modals/Dialogs (for confirmations)
- Buttons, badges, dropdowns

### Screens Designed (in Stitch)
✅ Dashboard  
✅ Quotations list  
✅ Create quotation  
✅ Invoices list  
✅ Invoice preview  
✅ Customer directory  
✅ Products/Services catalog  
✅ Business profile  
✅ Tax & regulatory settings  

---

## 📊 DATABASE SCHEMA SUMMARY

```sql
-- Core entities
users (id, email, name, password_hash, created_at, updated_at)
business_profiles (id, user_id, business_name, logo_url, tax_number, ...)
customers (id, user_id, customer_name, company_name, email, phone, ...)
products (id, user_id, name, description, price, tax_rate, ...)

-- Quote lifecycle
quotes (id, user_id, quote_number UNIQUE, customer_id, status, 
        subtotal, tax, total, created_at, ...)
quote_items (id, quote_id, product_id, quantity, unit_price, 
             discount, tax_rate, line_total, ...)

-- Invoice lifecycle
invoices (id, user_id, invoice_number UNIQUE, customer_id, 
          quote_id FK, due_date, payment_status, created_at, ...)
invoice_items (id, invoice_id, product_id, quantity, unit_price, 
               discount, tax_rate, line_total, ...)
```

**Key Design Principles:**
- Every record belongs to a user (user_id FK)
- Use NUMERIC for all monetary values
- Unique constraints on user-facing numbers (quote_number, invoice_number)
- Soft deletes for financial records (add deleted_at timestamp later if needed)
- Foreign keys enforced

---

## 🔌 API ENDPOINTS (v1)

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/password-reset
```

### Business Profile
```
GET    /api/v1/business-profile
PUT    /api/v1/business-profile
```

### Customers
```
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/customers/:id
PUT    /api/v1/customers/:id
DELETE /api/v1/customers/:id
```

### Products
```
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
```

### Quotes
```
GET    /api/v1/quotes
POST   /api/v1/quotes
GET    /api/v1/quotes/:id
PUT    /api/v1/quotes/:id
DELETE /api/v1/quotes/:id
POST   /api/v1/quotes/:id/pdf
POST   /api/v1/quotes/:id/convert-to-invoice
```

### Invoices
```
GET    /api/v1/invoices
POST   /api/v1/invoices
GET    /api/v1/invoices/:id
PUT    /api/v1/invoices/:id
DELETE /api/v1/invoices/:id
POST   /api/v1/invoices/:id/pdf
PUT    /api/v1/invoices/:id/mark-paid
```

### Dashboard
```
GET    /api/v1/dashboard
GET    /api/v1/dashboard/recent-quotes
GET    /api/v1/dashboard/recent-invoices
```

---

## ✅ TESTING STRATEGY

### Unit Tests (Per Module)
- Tax calculation logic
- Quote total calculation
- Invoice payment status transitions
- Input validation (Zod schemas)

### Integration Tests
- Quote creation → PDF generation
- Quote → Invoice conversion workflow
- Customer CRUD with quote/invoice relationships
- Authentication flows

### E2E Tests
- Complete quote creation flow
- Quote to invoice conversion
- PDF download
- Dashboard data accuracy

### Test Coverage Target
- Minimum 80% code coverage
- 100% coverage for financial calculation logic
- All API endpoints tested

---

## 🔍 CODE QUALITY STANDARDS

### TypeScript
- ✅ Strict mode: true
- ✅ No `any` types (use `unknown` if necessary)
- ✅ Explicit return types on functions
- ✅ Interface for all objects

### Validation
- ✅ Use Zod for runtime schema validation
- ✅ Validate on client AND server
- ✅ Consistent error messages

### Naming Conventions
- camelCase for functions/variables
- PascalCase for components/types
- UPPERCASE for constants
- Descriptive names (no single letters except loops)

### Code Organization
```
src/
├── app/                     # Next.js pages & layouts
│   ├── api/v1/              # API routes
│   ├── (auth)/              # Authentication pages
│   ├── dashboard/           # Dashboard
│   ├── customers/           # Customer pages
│   └── ...
├── components/              # Reusable React components
├── services/                # Business logic services
├── lib/                      # Utilities
├── db/                       # Database & Prisma
├── types/                    # TypeScript types/interfaces
└── middleware/              # Auth, validation, etc.
```

---

## 🚨 COMMON PITFALLS TO AVOID

| Pitfall | Consequence | Prevention |
|---|---|---|
| Calculating totals on client | ❌ Data inconsistency | Always recalculate on server |
| Using floats for money | ❌ Rounding errors | Use NUMERIC in DB |
| Accepting user_id from request | ❌ Security breach | Use getCurrentUser() from auth |
| Deleting financial records | ❌ Legal/audit issues | Soft delete only |
| Mixing business logic in API routes | ❌ Code duplication | Extract to services layer |
| Forgetting validation | ❌ Data corruption | Validate client AND server |
| Hard-coding tax rates | ❌ Not configurable | Store in business profile/settings |
| Not handling decimal precision | ❌ Tax calculation errors | Use NUMERIC, test edge cases |
| Skipping PDF testing | ❌ Broken PDFs in production | Test with various quote/invoice scenarios |
| Not enforcing user ownership | ❌ Users see others' data | ALWAYS check user_id on queries |

---

## 📞 GETTING HELP

### Documentation References
- Full Application Review: `.devflow/artifacts/APPLICATION_REVIEW.md`
- Product Requirements: `.devflow/artifacts/existing-documents/Product Requirements Document.md`
- Architecture Guide: `.devflow/artifacts/existing-documents/System Architecture Document.md`
- API Specification: `.devflow/artifacts/existing-documents/API Specification.md`
- Database Design: `.devflow/artifacts/existing-documents/Database Design Document.md`
- UI/UX Specification: `.devflow/artifacts/existing-documents/UI-UX Specification.md`

### Stitch Design Files
- Location: `.devflow/artifacts/stitch/`
- Contains 9 screen mockups with design tokens and component specs

### DevFlow State
- Current progress: `.devflow/state.md`
- Architecture decisions: `.devflow/architecture/architecture.md`
- API details: `.devflow/api/api.md`

---

## 🎯 SUCCESS METRICS (MVP)

| Metric | Target |
|---|---|
| Page load time | < 2 seconds |
| API response time | < 200ms |
| PDF generation time | < 5 seconds |
| Create quote workflow | < 2 minutes for experienced user |
| Dashboard data accuracy | 100% |
| Test coverage | ≥ 80% |
| Accessibility compliance | WCAG 2.1 AA |
| Mobile responsiveness | Works on 320px - 1920px |
| Uptime | 99.5% |
| Security: Zero data breaches | 100% |

---

## 🚀 READY TO CODE?

✅ All blockers resolved?  
✅ Team aligned on architecture?  
✅ Development environment ready?  
✅ Prisma schema created?  
✅ API contracts finalized?  

**Then: Let's build! 🎉**

---

**Questions?** Review the full APPLICATION_REVIEW.md or check DEVFLOW_ARTIFACTS for detailed docs.

