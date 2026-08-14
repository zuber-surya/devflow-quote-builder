# Quote & Invoice Builder — CRITICAL BLOCKERS (P0)

**Status:** ✅ ALL RESOLVED (2026-08-14) — see `.devflow/decisions/decisions.md` for canonical record  
**Note:** "Owner"/"Team discussion"/"Friday deadline" language below is template boilerplate — this is a solo-dev project (see root README.md). Options/tradeoffs kept for reference; only the final picks matter now.

---

## BLOCKER #1: PDF Library Selection

### Problem
PDF generation library not specified in architecture. Two main options with different trade-offs.

### Impact
- 🔴 **HIGH** — Blocks PDF feature development
- Affects quote export, invoice export, email integration
- Performance characteristics impact user experience

### Options to Evaluate

#### Option A: `@react-pdf/renderer`
**Pros:**
- React component-based API (familiar to team)
- Renders to PDF directly
- Works with custom components
- Good for styled documents

**Cons:**
- Smaller ecosystem
- Performance may vary with complex layouts
- Limited JavaScript support in PDF

**Good for:** React developers, component-based approach

#### Option B: `pdfkit` (Node.js)
**Pros:**
- Pure Node.js, works server-side
- Mature, stable
- Strong typography support
- Good performance

**Cons:**
- Lower-level API (more code)
- Not component-based
- Learning curve for React team

**Good for:** Performance-critical, heavy PDF generation

#### Option C: `puppeteer` + HTML-to-PDF
**Pros:**
- Browser rendering precision
- Can use Tailwind/existing UI code
- High fidelity

**Cons:**
- Heavier (spawns browser)
- Slower
- Infrastructure complexity

**Good for:** High-fidelity documents, complex layouts

### Decision (2026-08-14)

**`pdfkit`.** Matches root README.md/state.md. `@react-pdf/renderer` was floated in an
archived, non-authoritative doc (`existing-documents/_archived/Architecture Decisions.md`)
that doesn't reflect this repo's actual state — disregard it. No spike needed; pdfkit's
maturity and server-side performance profile fit a solo-dev MVP better than the smaller
`@react-pdf/renderer` ecosystem, and avoids `puppeteer`'s browser-spawn overhead.

### Owner Action
**Assigned to: Architecture Lead**
- [ ] Create spike branch
- [ ] Implement sample quote PDF with Option A
- [ ] Implement sample quote PDF with Option B
- [ ] Document findings
- [ ] Present recommendation to team
- [ ] Final decision + document in architecture.md

### Decide By
**Friday of this week**

---

## BLOCKER #2: Quote → Invoice Conversion Workflow

### Problem
How does quote status transition to invoice? What happens to original quote?

### Impact
- 🔴 **HIGH** — Blocks core MVP flow
- Affects database design, API design, UI flow
- Financial/audit requirements

### Questions to Answer

1. **What triggers conversion?**
   - Manual button click in UI?
   - Automatic when customer accepts?
   - Manual approval workflow?

2. **What happens to the original quote?**
   ```
   Option A: Quote status → "Converted to Invoice"
             (quote remains, becomes read-only)
   
   Option B: Quote marked "Invoiced"
             (link to created invoice maintained)
   
   Option C: Quote archived/hidden
             (still queryable but not in active lists)
   ```

3. **Data duplication?**
   ```
   Option A: Copy line items to invoice
             (independent records, allows future quote changes)
   
   Option B: Reference line items
             (single source of truth, prevents divergence)
   
   Option C: Freeze line items
             (copy at conversion, can't change after)
   ```

4. **Can quote be edited after invoicing?**
   ```
   Yes → Allow edits to quote (new version?)
   No  → Lock quote after conversion
   ```

5. **What if invoice is deleted?**
   ```
   Option A: Quote reverts to "Sent" (retrievable)
   Option B: Quote stays "Converted" (historical reference)
   Option C: Prevent deletion (immutable financial record)
   ```

### Recommended Approach

**Proposal:**
```
Quote Conversion Flow:
1. User clicks "Convert to Invoice" button
2. System validates quote status = "Accepted"
3. Create new Invoice with copied line items
4. Create link: invoice.quote_id → quote.id
5. Update quote.status → "Converted"
6. Lock quote for editing (read-only)
7. Show user the created invoice
8. Original quote remains in history
```

**Rationale:**
- Clear audit trail (quote never deleted)
- Prevents accidental re-invoicing
- Allows invoice independent lifecycle
- Financial records immutable

### Database Impact

```sql
-- Quote table
quotes (
  ...,
  status ENUM('Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Converted'),
  converted_to_invoice_id UUID FK NULLABLE
)

-- Invoice table
invoices (
  ...,
  quote_id UUID FK NULLABLE (reference to source quote)
)
```

### Owner Action
**Assigned to: Product Manager + Architecture Lead**
- [ ] Determine business requirements (from client if needed)
- [ ] Choose workflow option above
- [ ] Document state machine (quote statuses, transitions)
- [ ] Document invoice creation logic
- [ ] Update database schema comments
- [ ] Create API design for POST /api/v1/quotes/{id}/convert-to-invoice

### Decide By
**Friday of this week**

---

## BLOCKER #3: Authentication Strategy for Flutter

### Problem
How does Flutter mobile app authenticate with backend? Session vs. JWT vs. OAuth?

### Impact
- 🔴 **HIGH** — Blocks Flutter development
- Affects API authentication design
- Affects security posture

### Current State
- Web: Auth.js (session-based, works great for Next.js)
- Mobile: TBD

### Options

#### Option A: Session-Based (Keep Auth.js style)
**API Flow:**
1. Flutter calls `/api/v1/auth/login` → server returns session cookie
2. Flutter stores cookie in secure storage
3. All subsequent requests include cookie in headers
4. Server validates session

**Pros:**
- Consistent with web
- Simpler server logic
- Familiar pattern

**Cons:**
- Cookies on mobile are finicky
- Session state server-side
- Scaling issues with multiple servers

#### Option B: JWT Tokens
**API Flow:**
1. Flutter calls `/api/v1/auth/login` → server returns JWT + refresh token
2. Flutter stores in secure storage
3. All requests send JWT in Authorization header
4. Server validates JWT signature

**Pros:**
- Stateless (scales easily)
- Standard for mobile apps
- No cookie complexity
- Refresh token for long-lived sessions

**Cons:**
- Different from web session approach
- Need refresh token logic
- Token revocation harder

#### Option C: OAuth2 / Social Login
**API Flow:**
1. Flutter redirects to OAuth provider
2. Gets access token
3. Backend validates token with provider

**Pros:**
- No password storage
- Industry standard
- Can use Google/GitHub for sign-up

**Cons:**
- Adds complexity
- Not in MVP scope probably
- Requires OAuth provider setup

### Recommended Approach

**Proposal: Hybrid (Sessions for Web, JWT for Mobile)**

```
Web Application (Next.js):
├── POST /api/v1/auth/login
│   ├── Validates credentials
│   ├── Creates session (Auth.js)
│   └── Sets secure httpOnly cookie
└── Requests use cookies

Flutter Mobile:
├── POST /api/v1/auth/login
│   ├── Same endpoint
│   ├── Returns JWT + refresh token (if Authorization header present)
│   └── Returns cookie (if not)
└── Requests use Authorization: Bearer {jwt}
```

**Implementation:**
```typescript
// API route: /api/v1/auth/login
export async function POST(req) {
  const user = validateCredentials(...);
  
  const isFromMobile = req.headers.get('x-client') === 'flutter';
  
  if (isFromMobile) {
    // Return JWT
    return { 
      jwt: generateJWT(user),
      refreshToken: generateRefreshToken(user)
    };
  } else {
    // Create session (Auth.js)
    await auth.signIn(user);
    // Cookie set automatically
    return { success: true };
  }
}
```

**Middleware validation:**
```typescript
// Middleware: validate auth on protected routes
export async function getCurrentUser(req) {
  // Try session first (web)
  const session = await getSession(req);
  if (session) return session.user;
  
  // Try JWT next (mobile)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const jwt = authHeader.slice(7);
    return verifyJWT(jwt);
  }
  
  return null;
}
```

### Database Impact
```sql
-- No change to users table
-- Add refresh_tokens table for JWT refresh
refresh_tokens (
  id UUID PK,
  user_id UUID FK,
  token_hash VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP
)
```

### Owner Action
**Assigned to: Architecture Lead + Flutter Lead**
- [ ] Confirm Flutter team comfort with JWT approach
- [ ] Design JWT token structure (claims, expiry)
- [ ] Design refresh token flow
- [ ] Create /api/v1/auth/refresh endpoint spec
- [ ] Create /api/v1/auth/logout endpoint spec
- [ ] Document mobile client implementation guide
- [ ] Update API Specification document

### Decide By
**Friday of this week**

---

## BLOCKER #4: Payment Tracking Entity Design

### Problem
How is invoice payment tracked? Single payment record? Multiple payments? Refunds?

### Impact
- 🔴 **HIGH** — Blocks invoice status logic
- Affects database schema
- Affects API endpoints
- Affects UI display

### Current State
- Invoice has `payment_status` ENUM (Unpaid, Partially Paid, Paid, Overdue)
- No detail on HOW payments are recorded

### Questions

1. **Can invoice be paid in multiple installments?**
   - Yes → Need payment records table
   - No → Just invoice.paid_amount field

2. **Do we track payment details?**
   - Payment date?
   - Payment method (cash, check, bank transfer, credit card)?
   - Transaction ID?
   - Notes?

3. **Is there a refund workflow?**
   - Can invoices be refunded?
   - Partial refunds supported?
   - If yes: separate Credit Note or adjustment?

4. **Who can mark invoice as paid?**
   - Business user manually marks
   - Auto-sync from payment gateway (future)
   - Both?

### Recommended Approach

**Proposal: Simple Payment Tracking**

```
Phase 1 (MVP): Manual payment marking
├── Invoice.paid_amount NUMERIC
├── Invoice.payment_status ENUM
└── User marks paid via button

Later (Post-MVP): Detailed tracking
├── payments table (date, method, amount, notes)
├── payment_events (audit trail)
└── Payment gateway integrations
```

**Schema (MVP):**
```sql
invoices (
  ...,
  amount NUMERIC,
  paid_amount NUMERIC DEFAULT 0,
  payment_status ENUM (
    'Unpaid',      -- paid_amount = 0
    'Partially Paid', -- 0 < paid_amount < amount
    'Paid',        -- paid_amount >= amount
    'Overdue'      -- past due_date AND not paid
  ),
  marked_paid_at TIMESTAMP NULLABLE,
  marked_paid_by UUID FK NULLABLE (user_id)
)
```

**API Endpoints:**
```
PUT /api/v1/invoices/{id}/mark-paid
  Body: { amount: 5000, note?: "Received bank transfer" }
  Returns: Updated invoice
  
PUT /api/v1/invoices/{id}/mark-unpaid
  Reverts to unpaid (for corrections)
  
GET /api/v1/invoices/{id}/payment-history
  Returns: { marked_paid_at, marked_paid_by, amount }
```

**UI:**
- Invoice details page shows "Mark as Paid" button
- Clicking opens modal to enter paid amount
- Can change if error (but audit trail kept)
- Payment history visible

**For Future Enhancement:**
```sql
-- Post-MVP: Detailed payment tracking
payments (
  id UUID PK,
  invoice_id UUID FK,
  amount NUMERIC,
  payment_date DATE,
  payment_method VARCHAR (cash, check, bank, card, other),
  transaction_id VARCHAR NULLABLE,
  notes TEXT,
  recorded_by UUID FK (user),
  created_at TIMESTAMP
)

-- Payment events for audit
payment_events (
  id UUID PK,
  invoice_id UUID FK,
  event_type ENUM (paid, refunded, adjusted),
  amount NUMERIC,
  created_by UUID FK,
  created_at TIMESTAMP
)
```

### Owner Action
**Assigned to: Product Manager + Database Architect**
- [ ] Decide: Simple payment marking or detailed tracking in MVP?
- [ ] Document payment workflow
- [ ] Update database schema
- [ ] Specify API endpoints for payment marking
- [ ] Create payment status transition rules (Unpaid → Overdue logic)
- [ ] Design UI for marking payments

### Decide By
**Friday of this week**

---

## BLOCKER #5: File Upload Strategy (Business Logo)

### Problem
Where/how do we store business logo?

### Impact
- 🟡 **MEDIUM** — Blocks business profile UI
- Affects database design, API endpoints
- Production infrastructure decision

### Options

#### Option A: S3 / Cloud Storage
**Flow:**
1. User uploads file to signed S3 URL
2. Frontend uploads directly to S3
3. Backend stores S3 URL in database

**Pros:**
- Scalable
- Secure (signed URLs)
- Industry standard
- CDN-friendly

**Cons:**
- AWS/cloud account required
- Extra cost
- Configuration complexity

#### Option B: Local File System
**Flow:**
1. User uploads file
2. Backend saves to `/public/uploads/`
3. Backend stores URL in database
4. Frontend accesses via static URL

**Pros:**
- Simple
- No extra cost
- Good for MVP

**Cons:**
- Not scalable
- Deployment complexity
- Loss on server restart (if ephemeral)

#### Option C: Database (Base64)
**Flow:**
1. User uploads small image
2. Backend encodes to base64
3. Stores directly in database

**Pros:**
- No external storage
- Single source of truth

**Cons:**
- Database bloat
- Slow to serve
- Not recommended for production

### Recommended Approach

**Proposal: Local file system for MVP, migrate to S3 later**

```
MVP (Development/Staging):
├── Store in /public/business-logos/
├── Path format: /public/business-logos/{userId}/{filename}
├── Database: business_profiles.logo_url = "/business-logos/{userId}/..."
├── API: POST /api/v1/business-profile/upload-logo

Production (Post-MVP):
├── Migrate to AWS S3 or similar
├── Signed URLs for upload
├── CloudFront CDN
├── Cost: ~$1-5/month for small usage
```

**Implementation (MVP):**
```typescript
// API: POST /api/v1/business-profile/upload-logo
export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('logo');
  
  // Validate: jpg, png, max 5MB
  if (!file || !['image/jpeg', 'image/png'].includes(file.type)) {
    return { error: 'Invalid file' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File too large' };
  }
  
  // Save to /public/business-logos/{userId}/
  const userId = getCurrentUser().id;
  const filename = `${Date.now()}-${file.name}`;
  const path = `/public/business-logos/${userId}/`;
  
  await writeFile(`${path}${filename}`, await file.arrayBuffer());
  
  // Update database
  const logoUrl = `/business-logos/${userId}/${filename}`;
  await prisma.businessProfile.update({
    where: { user_id: userId },
    data: { logo_url: logoUrl }
  });
  
  return { logoUrl };
}
```

**Database:**
```sql
business_profiles (
  ...,
  logo_url VARCHAR(500) NULLABLE,
  logo_uploaded_at TIMESTAMP NULLABLE
)
```

### Owner Action
**Assigned to: Architecture Lead + Backend Lead**
- [ ] Decide: Local file system (MVP) or S3 from start?
- [ ] If S3: Set up AWS account, S3 bucket, IAM permissions
- [ ] If local: Create /public/business-logos/ directory structure
- [ ] Document file upload API endpoint
- [ ] Specify file validation rules (size, format, MIME type)
- [ ] Plan storage limits/cleanup strategy

### Decide By
**Friday of this week**

---

## BLOCKER #6: Quote/Invoice Number Generation

### Problem
How are user-facing document numbers generated? Auto-increment? Year-based? Custom format?

### Impact
- 🟡 **MEDIUM** — Blocks quote/invoice creation
- Affects database design
- User-facing numbering must be professional

### Options

#### Option A: Global Auto-Increment
```
Quote: Q-00001, Q-00002, Q-00003, ...
Invoice: INV-00001, INV-00002, INV-00003, ...

Pros: Simple
Cons: Numbers get huge over time
```

#### Option B: Year-Based
```
Quote: Q-2026-00001, Q-2026-00002, ...
Invoice: INV-2026-00001, INV-2026-00002, ...

Pros: Easy to scan by year, restarts annually
Cons: Slightly more complex
```

#### Option C: Custom Format (User-Configurable)
```
Quote: {PREFIX}-{YEAR}-{RUNNING_NUMBER}
Invoice: {PREFIX}-{YEAR}-{RUNNING_NUMBER}

Example: MyBiz-Q-2026-001, MyBiz-INV-2026-001

Pros: Professional, brandable
Cons: Adds UI complexity, not MVP
```

### Recommended Approach

**Proposal: Year-based numbering**

```
Quote:   Q-2026-00001, Q-2026-00002, ...
Invoice: INV-2026-00001, INV-2026-00002, ...

Resets annually (natural for businesses)
User-friendly
Professional appearance
```

**Implementation:**

```typescript
// Service: generateQuoteNumber(userId, year)
export async function generateQuoteNumber(userId: string) {
  const year = new Date().getFullYear();
  
  // Find max number for this user this year
  const maxQuote = await prisma.quote.findFirst({
    where: {
      user_id: userId,
      quote_number: { startsWith: `Q-${year}-` }
    },
    orderBy: { created_at: 'desc' },
    select: { quote_number: true }
  });
  
  let nextNumber = 1;
  if (maxQuote) {
    const lastNum = parseInt(maxQuote.quote_number.split('-')[2]);
    nextNumber = lastNum + 1;
  }
  
  return `Q-${year}-${String(nextNumber).padStart(5, '0')}`;
}

// Similar for invoices: INV-{year}-{number}
```

**Database (optional helper table):**
```sql
-- Track sequences (optional for performance)
number_sequences (
  id UUID PK,
  user_id UUID FK,
  entity_type ENUM ('quote', 'invoice'),
  year INT,
  current_number INT,
  updated_at TIMESTAMP
)
```

**API:**
```
POST /api/v1/quotes
{
  customer_id: "...",
  items: [...]
}

Response:
{
  id: "550e...",
  quote_number: "Q-2026-00001",  ← Auto-generated
  ...
}
```

### Owner Action
**Assigned to: Backend Lead**
- [ ] Decide on numbering format (year-based recommended)
- [ ] Implement quote_number generation function
- [ ] Implement invoice_number generation function
- [ ] Add UNIQUE constraint to database
- [ ] Test edge cases (year boundary, concurrent generation)
- [ ] Document algorithm

### Decide By
**Friday of this week**

---

## RESOLUTION PROCESS

### For Each Blocker

1. **Owner**: Takes ownership (assigned above)
2. **Research** (1 day): Gather facts, options, implications
3. **Discuss** (0.5 day): Team discussion, questions
4. **Decide** (0.5 day): Choose option, document rationale
5. **Update Docs** (0.5 day): Update schema, API specs, architecture
6. **Approve** (by Friday EOD)

### Sign-Off Checklist

- [x] **Blocker #1 (PDF):** Resolved — `pdfkit`. Approved 2026-08-14.
- [x] **Blocker #2 (Conversion):** Resolved — lock quote, copy line items, audit trail (Proposal above). Approved 2026-08-14.
- [x] **Blocker #3 (Auth):** Resolved — hybrid session (web) + JWT (mobile) via `x-client-type` header (Proposal above). Approved 2026-08-14.
- [x] **Blocker #4 (Payments):** Resolved — simple manual marking, `paid_amount`/`payment_status` fields, no separate payments table for V1 (Proposal above). Approved 2026-08-14.
- [x] **Blocker #5 (Logo Upload):** Resolved — local filesystem `/public/business-logos/`, S3 post-MVP (Proposal above). Approved 2026-08-14.
- [x] **Blocker #6 (Numbering):** Resolved — year-based auto-increment, `Q-2026-00001` / `INV-2026-00001` (Proposal above). Approved 2026-08-14.

### Once All Resolved
✅ **Development can start immediately**

---

## OWNER ASSIGNMENTS & DEADLINES

| Blocker | Owner | Deadline |
|---|---|---|
| #1: PDF Library | Architecture Lead | Friday 5pm |
| #2: Quote→Invoice | PM + Architect | Friday 5pm |
| #3: Flutter Auth | Architect + Flutter Lead | Friday 5pm |
| #4: Payment Tracking | PM + Database Lead | Friday 5pm |
| #5: File Upload | Architect + Backend Lead | Friday 5pm |
| #6: Numbering | Backend Lead | Friday 5pm |

**All decisions must be documented in this file with rationale.**

---

## STATUS TRACKING

| Blocker | Status | Decision |
|---|---|---|
| #1: PDF | ✅ Resolved | pdfkit |
| #2: Conversion | ✅ Resolved | Lock + copy + audit trail |
| #3: Auth | ✅ Resolved | Hybrid session + JWT |
| #4: Payments | ✅ Resolved | Simple manual marking |
| #5: Upload | ✅ Resolved | Local filesystem (MVP) |
| #6: Numbering | ✅ Resolved | Year-based auto-increment |

**Last Updated:** August 14, 2026

---

**🚀 UNBLOCK US SO WE CAN BUILD! 🚀**

