# Client Requirements

Original client requirements. Keep originals unchanged.


Here’s the **short version of the requirements** from the PRD: 

### Quote & Invoice Builder — MVP Requirements

1. **Authentication**

   * Register, login, logout, password reset.
   * Secure user data isolation.

2. **Business Profile**

   * Business name, logo, contact/address, GST/tax number, website.
   * Profile details appear on PDFs.

3. **Dashboard**

   * Quote count, invoice count, paid amount, outstanding amount.
   * Recent quotes and invoices.
   * Quick **Create Quote** action.

4. **Customers**

   * Create, edit, delete, search customers.
   * Store contact, address, GST/tax and notes.
   * View customer quotes/invoices.

5. **Products / Services**

   * Create, edit, delete, search products/services.
   * Store name, description, unit, price and tax.

6. **Quotes**

   * Create/edit/delete/duplicate quotes.
   * Add multiple items, quantity, price, discount and tax.
   * Auto-calculate subtotal, tax and total.
   * Quote statuses: **Draft, Sent, Accepted, Rejected, Expired**.
   * Generate/download/share PDF.
   * Convert **Accepted Quote → Invoice**.

7. **Invoices**

   * Create/manage invoices.
   * Auto-generate invoice numbers.
   * Add items, discounts and taxes.
   * Set due date.
   * Generate/download/share PDF.
   * Payment statuses: **Unpaid, Partially Paid, Paid, Overdue**.
   * Mark invoices as paid.

8. **PDF Documents**

   * Professional quote and invoice PDFs.
   * Include business, customer, items, taxes, totals, notes and terms.

9. **Search & Filters**

   * Search customers/products.
   * Filter quotes/invoices by number, customer, status and date.

10. **Web + Mobile**

    * Responsive web app for desktop/tablet/mobile.
    * Android and iOS apps.
    * Shared backend/API/database and business logic.

11. **Settings**

    * Business profile, quote/invoice settings, terms, default tax, currency and account settings.
    * Default currency: **INR (₹)**.

12. **Security & Validation**

    * Server + client validation.
    * Secure authentication and password hashing.
    * Prevent users from accessing other users' data.
    * HTTPS and protected APIs.

13. **Performance & Accessibility**

    * Fast normal CRUD operations.
    * PDF generation within a few seconds.
    * Keyboard navigation, proper labels, focus states and accessible forms.

### Core MVP Flow

**Register → Business Profile → Add Customer → Add Product → Create Quote → Generate PDF → Send/Share → Accept → Convert to Invoice → Generate Invoice PDF → Receive Payment → Mark Paid**

### Not included in V1

**AI, WhatsApp automation, online payments, accounting, inventory, team management, recurring invoices, customer portal, advanced analytics, expenses, multi-currency, and advanced reporting.**
