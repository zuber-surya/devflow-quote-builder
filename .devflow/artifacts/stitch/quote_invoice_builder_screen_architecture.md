# Quote & Invoice Builder MVP - V1

## Product Summary
A simple, professional tool for freelancers and small businesses to manage the flow from **Customer → Quote → Invoice → Payment**.

## Screen List & Architecture

### 1. Dashboard (Overview)
- **Purpose:** Quick business pulse and primary actions.
- **Key Elements:** Summary cards (Total Quotes, Invoices, Outstanding, Paid), Recent Activity tables, and a prominent "+ Create Quote" primary action.

### 2. Customer Management (List & Details)
- **Purpose:** Maintain a reusable directory of clients.
- **Key Elements:** Searchable list of customers with contact info and document counts. Detailed view showing all quotes/invoices for a specific client.

### 3. Product/Service Catalog
- **Purpose:** Reusable line items for quick document creation.
- **Key Elements:** Simple grid/list of services with units, prices, and default tax rates.

### 4. Quote Builder (The Engine)
- **Purpose:** Create and calculate professional quotations.
- **Key Elements:** Multi-step form (Header, Itemized List with auto-calculation, Summary, Notes/Terms). Status management (Draft, Sent, Accepted, etc.).

### 5. Invoice Management & Payment Tracking
- **Purpose:** Convert accepted quotes and track cash flow.
- **Key Elements:** "Convert to Invoice" flow, payment status badges (Unpaid, Partial, Paid), and due date tracking.

### 6. Document Preview (The PDF View)
- **Purpose:** Professional branding for the end client.
- **Key Elements:** High-fidelity document view with business logo, professional layout, and clear totals.

### 7. Business Profile & Settings
- **Purpose:** Set up the "Sender" identity.
- **Key Elements:** Business logo upload, tax/GST registration info, default terms, and currency settings (Default: INR).

## Technical Constraints
- **Responsive:** Desktop, Tablet, and Mobile support.
- **Calculation:** Authority rests in backend logic (Quantity x Price + Tax - Discount).
- **Security:** Strict data isolation between users.
