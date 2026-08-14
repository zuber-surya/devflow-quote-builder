# Quote & Invoice Builder — Development Setup Guide

**For:** Solo Developer using Claude Code  
**Status:** Ready to Setup  
**Created:** August 14, 2026

---

## ✅ PREREQUISITES

Before starting, ensure you have:

- **Node.js 18+** → [Install](https://nodejs.org/en/download/)
- **PostgreSQL 14+** → [Install](https://www.postgresql.org/download/)
- **Git** → [Install](https://git-scm.com/)
- **VS Code + Claude Code extension** (you have this ✓)

---

## 🚀 STEP 1: Local Database Setup (5 min)

### Option A: Docker (Recommended - Simplest)

```bash
# Create a Docker network
docker network create qib-network

# Start PostgreSQL in Docker
docker run -d \
  --name qib-postgres \
  --network qib-network \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=quote_invoice_builder_dev \
  -p 5432:5432 \
  postgres:16-alpine

# Verify it's running
docker ps | grep qib-postgres
```

### Option B: Local PostgreSQL Installation

```bash
# Create database
createdb quote_invoice_builder_dev

# Verify
psql -l | grep quote_invoice_builder_dev
```

---

## 📋 STEP 2: Environment Configuration (2 min)

```bash
# Copy example env to actual .env
cp .env.example .env.local

# Edit .env.local with your database URL
```

**If using Docker:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quote_invoice_builder_dev"
```

**If using local PostgreSQL:**
```
DATABASE_URL="postgresql://youruser:yourpassword@localhost:5432/quote_invoice_builder_dev"
```

**Other required values:**
```
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret-key-change-this-in-production"
```

---

## 📦 STEP 3: Install Dependencies (3-5 min)

```bash
# Install all Node packages
npm install

# Generate Prisma Client
npm run db:generate
```

**What this does:**
- Installs React, Next.js, Prisma, Auth.js, and all dependencies
- Generates Prisma client for database access
- Sets up TypeScript definitions

---

## 🗄️ STEP 4: Database Migration (2 min)

```bash
# Create initial database schema
npm run db:migrate:dev

# Follow prompts:
# 1. Give migration a name (e.g., "init")
# 2. Prisma applies schema to database
# 3. Generates migration files
```

**What this creates:**
- `users` table (authentication)
- `business_profiles` table (1:1 with user)
- `customers` table
- `products` table
- `quotes` & `quote_items` tables
- `invoices` & `invoice_items` tables
- `refresh_tokens` table (for JWT)

**Verify it worked:**
```bash
# Open Prisma Studio to view database
npm run db:studio

# Browser opens to http://localhost:5555
# Shows all tables and data (empty for now)
```

---

## 🔨 STEP 5: Project Structure Setup (2 min)

```bash
# Create required directories
mkdir -p src/app/api/v1
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/services
mkdir -p src/types
mkdir -p public/business-logos
mkdir -p tmp/pdfs

# Create .gitkeep files to track directories
touch public/business-logos/.gitkeep
touch tmp/pdfs/.gitkeep
```

---

## ▶️ STEP 6: Start Development Server (1 min)

```bash
# Start Next.js dev server
npm run dev

# Output:
# > ready - started server on 0.0.0.0:3000, url: http://localhost:3000
# > event - compiled client and server successfully

# Open browser
# http://localhost:3000
```

You should see a **Next.js welcome page** (or blank page - we'll fix that).

---

## ✨ STEP 7: Verify Setup (2 min)

Test everything is working:

```bash
# 1. Check database connection
npm run db:studio
# Should open Prisma Studio with empty tables

# 2. Check Node dependencies
npm ls --depth=0
# Should show all packages installed

# 3. Check TypeScript
npm run type-check
# Should show "No errors"

# 4. Check linting
npm run lint
# Should show any style issues (probably none yet)
```

---

## 🎯 STEP 8: Create Your First Page (5 min)

Create a simple home page to verify setup:

**File: `src/app/page.tsx`**
```typescript
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Quote & Invoice Builder
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          MVP Development Environment Ready ✓
        </p>
        <div className="space-y-2 text-sm text-slate-500">
          <p>✅ Database Connected</p>
          <p>✅ Prisma Schema Loaded</p>
          <p>✅ Next.js Running</p>
          <p>✅ TypeScript Active</p>
        </div>
      </div>
    </main>
  );
}
```

Refresh browser → Should see your page!

---

## 📁 Project Structure

After setup, you should have:

```
quote-invoice-builder/
├── .env.local                    # Local environment (DO NOT commit)
├── .env.example                  # Template for env vars
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
│
├── prisma/
│   ├── schema.prisma             # Database schema (THE FOUNDATION)
│   └── migrations/               # Database version history
│       └── [timestamp]_init/
│           └── migration.sql
│
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout
│   │   ├── (auth)/               # Auth pages (login, register)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── dashboard/            # Dashboard page
│   │   ├── customers/            # Customer management
│   │   ├── products/             # Products management
│   │   ├── quotes/               # Quotes management
│   │   ├── invoices/             # Invoices management
│   │   └── api/v1/               # REST API
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── register/route.ts
│   │       │   └── refresh/route.ts
│   │       ├── business-profile/route.ts
│   │       ├── customers/route.ts
│   │       ├── products/route.ts
│   │       ├── quotes/route.ts
│   │       └── invoices/route.ts
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── forms/                # Form components
│   │   ├── layouts/              # Layout components
│   │   └── common/               # Common components
│   │
│   ├── lib/                      # Utilities
│   │   ├── db.ts                 # Prisma client
│   │   ├── auth.ts               # Auth utilities
│   │   ├── jwt.ts                # JWT utilities
│   │   └── calculations.ts       # Business logic (tax, totals)
│   │
│   ├── services/                 # Business logic
│   │   ├── auth.service.ts
│   │   ├── customer.service.ts
│   │   ├── product.service.ts
│   │   ├── quote.service.ts
│   │   ├── invoice.service.ts
│   │   └── pdf.service.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── auth.ts
│   │   ├── customer.ts
│   │   ├── quote.ts
│   │   └── invoice.ts
│   │
│   ├── middleware.ts             # Next.js middleware
│   └── constants.ts              # App constants
│
├── public/
│   ├── business-logos/           # Uploaded business logos
│   └── fonts/                    # Custom fonts (optional)
│
├── tmp/
│   └── pdfs/                     # Temporary PDF files
│
├── tests/                        # Test files
│   ├── api/
│   ├── services/
│   └── lib/
│
└── docs/
    ├── API.md                    # API documentation
    ├── SETUP.md                  # This file
    └── ARCHITECTURE.md           # Architecture guide
```

---

## 🐛 TROUBLESHOOTING

### Problem: "Cannot connect to database"

```bash
# Check PostgreSQL is running
psql -U postgres -d quote_invoice_builder_dev -c "SELECT 1"

# If error, restart database
# Docker: docker start qib-postgres
# Local: pg_ctl -D /usr/local/var/postgres start
```

### Problem: "Prisma Client not found"

```bash
# Regenerate Prisma Client
npm run db:generate
```

### Problem: "Port 3000 already in use"

```bash
# Kill process on port 3000
# macOS/Linux: lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
# Windows: netstat -ano | findstr :3000 (then taskkill /PID <PID> /F)

# Or use different port
npm run dev -- -p 3001
```

### Problem: "NEXTAUTH_SECRET not set"

```bash
# Generate a secure secret
openssl rand -base64 32

# Copy to .env.local
NEXTAUTH_SECRET="<generated-secret>"
```

---

## 📚 NEXT STEPS (After Setup)

Once setup completes:

1. **Priority #2: Authentication** → Implement login/register endpoints
2. **Priority #3: Database Helpers** → Create services for CRUD operations
3. **Priority #4: Business Profile** → Build profile setup flow
4. **Priority #5: Customers** → Build customer management
5. **Priority #6: Products** → Build product catalog
6. **Priority #7: Quotes** → Build quote creation workflow
7. **Priority #8: Invoices** → Build invoice workflow
8. **Priority #9: PDF** → Implement PDF generation
9. **Priority #10: Testing** → Add test coverage

---

## 💡 USEFUL COMMANDS

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Check code style
npm run lint:fix         # Auto-fix style issues
npm run type-check       # Check TypeScript types

# Database
npm run db:push          # Apply schema changes (dev)
npm run db:migrate:dev   # Create new migration (dev)
npm run db:migrate:prod  # Apply migrations (prod)
npm run db:seed          # Seed with sample data
npm run db:studio        # Open Prisma Studio GUI

# Testing
npm test                 # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

---

## 🔗 USEFUL RESOURCES

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **TypeScript Docs:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Auth.js Docs:** https://authjs.dev
- **shadcn/ui:** https://ui.shadcn.com

---

## ✅ SETUP CHECKLIST

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ running
- [ ] `.env.local` created with values
- [ ] `npm install` completed
- [ ] `npm run db:migrate:dev` completed
- [ ] `npm run dev` starts without errors
- [ ] `http://localhost:3000` loads
- [ ] Prisma Studio opens (`npm run db:studio`)
- [ ] All tests pass (`npm run type-check`)

**Once all checked: ✅ Ready to build Phase 1 (Authentication)**

---

**Questions?** Check the error logs or review the ARCHITECTURE.md for context.

**Ready to start?** Let's build! 🚀

