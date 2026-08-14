# Functional Requirements

Source: `.devflow/artifacts/client-requirements/README.md` (originals, unchanged) + `existing-documents/Product Requirements Document.md` (consistent, no conflicts found).

## 1. Authentication
Register, login, logout, password reset. Secure per-user data isolation (no cross-user access).

## 2. Business Profile
Business name, logo, contact/address, GST/tax number, website. Appears on generated PDFs. 1:1 with User.

## 3. Dashboard
Quote count, invoice count, paid amount, outstanding amount. Recent quotes/invoices list. Quick "Create Quote" action.

## 4. Customers
Create/edit/delete/search. Store contact, address, GST/tax, notes. View a customer's quote/invoice history.

## 5. Products / Services
Create/edit/delete/search. Store name, description, unit, price, tax rate.

## 6. Quotes
Create/edit/delete/duplicate. Multiple line items (quantity, price, discount, tax). Auto-calculated subtotal/tax/total (backend authority, per `stitch/quote_invoice_builder_screen_architecture.md`). Statuses: Draft, Sent, Accepted, Rejected, Expired. Generate/download/share PDF. Convert Accepted → Invoice (see `.devflow/decisions/decisions.md`).

## 7. Invoices
Create/manage. Auto-generated invoice numbers (year-based, see decisions.md). Items, discounts, taxes. Due date. Generate/download/share PDF. Statuses: Unpaid, Partially Paid, Paid, Overdue. Manual mark-as-paid.

## 8. PDF Documents
Professional quote/invoice PDFs via `pdfkit`. Include business info, customer info, items, taxes, totals, notes, terms.

## 9. Search & Filters
Search customers/products. Filter quotes/invoices by number, customer, status, date.

## 10. Web + Mobile
Responsive web (desktop/tablet/mobile). Android + iOS via Flutter. Shared backend/API/DB/business logic — no duplicated logic per platform.

## 11. Settings
Business profile, quote/invoice settings, terms, default tax, currency (default **INR ₹**), account settings.

## 12. Security & Validation
Server + client validation. Secure auth, password hashing. Strict per-user data isolation. HTTPS, protected APIs.

## 13. Performance & Accessibility
Fast CRUD. PDF generation within a few seconds. Keyboard navigation, labels, focus states, accessible forms.

## Core MVP Flow
Register → Business Profile → Add Customer → Add Product → Create Quote → Generate PDF → Send/Share → Accept → Convert to Invoice → Generate Invoice PDF → Receive Payment → Mark Paid.

## Explicitly OUT of V1
AI, WhatsApp automation, online payments, accounting, inventory, team management, recurring invoices, customer portal, advanced analytics, expenses, multi-currency, advanced reporting. Verified: none of these appear in the stitch mockups or the 13 existing-documents (see review 2026-08-14).
