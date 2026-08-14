# Requirements Traceability

Maps each functional area (see `functional.md`) to its implementation phase and source docs. Update as phases complete.

| Requirement Area | Phase | Primary Source Docs |
|---|---|---|
| Authentication | Phase 1 | client-requirements/README.md §1, decisions.md (hybrid auth) |
| Business Profile | Phase 2 | client-requirements/README.md §2, stitch/business_profile_identity_branding |
| Dashboard | Phase 2+ (populated as data exists) | client-requirements/README.md §3, stitch/dashboard_business_overview_serene_sanctuary |
| Customers | Phase 3 | client-requirements/README.md §4, stitch/customer_directory_client_management |
| Products/Services | Phase 3 | client-requirements/README.md §5, stitch/products_services_catalog_management |
| Quotes | Phase 4 | client-requirements/README.md §6, stitch/create_quote_professional_builder, stitch/quotations_manage_leads |
| Invoices | Phase 5 | client-requirements/README.md §7, stitch/invoices_manage_cash_flow, stitch/invoice_preview_inv_00018 |
| PDF Documents | Phase 6 | client-requirements/README.md §8, decisions.md (pdfkit) |
| Search & Filters | Cross-cutting (Phases 3-5) | client-requirements/README.md §9 |
| Web + Mobile | Cross-cutting (web Phases 1-6, Flutter mobile separate track) | client-requirements/README.md §10 |
| Settings | Phase 2 (business profile) + Phase 6 (tax/currency) | client-requirements/README.md §11, stitch/tax_settings_compliance_regional |
| Security & Validation | Cross-cutting, enforced every phase | client-requirements/README.md §12, security/security.md |
| Performance & Accessibility | Cross-cutting, verified every phase | client-requirements/README.md §13, non-functional.md |

Gaps not yet covered by any phase plan (see `questions/open-questions.md`): Login/Register UI screens, Settings hub UI, Quote PDF preview UI, mobile-responsive mockups.
