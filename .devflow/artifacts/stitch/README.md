# Stitch

**SECURITY:** a live Google Stitch API key was previously committed in this file, plaintext. Rotate/revoke it in Google Cloud console, then set the replacement via env var — never commit a key here again.

# MCP
claude mcp add stitch \
  --transport http \
  --header "X-Goog-Api-Key: ${STITCH_API_KEY}" \
  https://stitch.googleapis.com/mcp
  
# Google Stitch exports/references.

web application/stitch/projects/11218798274693828725/screens/acfaa4acc43f4d4ba104dce358b4c0c3
# Quote & Invoice Builder - Project Brief

## 1. Product Vision
A serene, high-end management suite designed for freelancers and small businesses. The platform prioritizes a distraction-free "sanctuary" experience while providing robust tools for document creation, tax compliance, and client management.

## 2. Visual Identity (Serene Sanctuary)
*   **Palette:** Alabaster Cream backgrounds, Deep Sage accents, and soft charcoal text.
*   **Typography:** Elegant **Cormorant Garamond** for headers and high-fidelity documents; functional **Outfit** for UI labels and data grids.
*   **Atmosphere:** High-end, professional, and calm.

## 3. Core Modules & Screen Architecture

### A. Dashboard & Overview
*   **Main Dashboard:** Real-time pulse of business health (Paid, Unpaid, Outstanding) with quick-action entry points for new documents.

### B. Document Lifecycle
*   **Professional Quote Builder:** Multi-step creation flow with GST/LUT support for local and international (export) compliance.
*   **Invoice Management:** Tracking cash flow with status-driven filtering (Paid, Overdue, Unpaid).
*   **High-Fidelity PDF Preview:** A polished, "printed" view of documents for client delivery.

### C. Resource Management
*   **Customer Directory (CRM):** Centralized client profiles tracking total document history and contact details.
*   **Products & Services Catalog:** A reusable inventory of offerings with default rates and tax configurations.

### D. Compliance & Brand
*   **Business Profile:** Brand identity hub (logos, primary accents, footer notes).
*   **Tax & Regulatory:** Specialized settings for GSTIN, LUT numbers, and export certificate management.

## 4. Technical Specifications
*   **Device Support:** Desktop-first (Current), with Mobile versions planned.
*   **Key Features:** Global search, advanced filtering, pagination, and full CRUD operations for all listings.
*   **Tax Logic:** Automated GST calculation and LUT-based tax exemption support.

---
*Status: MVP V1 Foundation Complete*

## Stitch Instructions

Get the images and code for the following Stitch project's screens:

## Project
Title: Aurora Wellness Sanctuary
ID: 11218798274693828725

## Screens:
1. Quote & Invoice Builder - Project Brief
    ID: acfaa4acc43f4d4ba104dce358b4c0c3

Use a utility like `curl -L` to download the hosted URLs.


## Stitch Instructions

Get the images and code for the following Stitch project's screens:

## Project
Title: Aurora Wellness Sanctuary
ID: 11218798274693828725

## Screens:
1. Design System
    ID: asset-stub-assets_c470e8b1526d4ffba838c17a7a9601ca

2. Quote & Invoice Builder - Screen Architecture
    ID: 1f9384dcc8274fc6b10becb7cad7ab49

3. Dashboard
    ID: 938a0e14aa0b4c69a836c53d36e841b2

4. Quoates
    ID: 9e6bd5f6f62c4b6192435f6a7ecd6b06

5. Create Quote
    ID: 3cfc6de01a794f008b4578aff2faeaab

6. Invoices - Manage Cash Flow
    ID: ab5cf4a7830d40c9ad5dfb4f4df7a232

7. Invoice Preview - INV-00018
    ID: b35bd9cbb572482d977107fdd07622c3

8. Business Profile - Identity & Branding
    ID: 2880bb3f42824e3fb19f4c398103942c

9. Tax Settings - Compliance & Regional
    ID: 13ec16bf898c4c0f9c716d9047683547

10. Products & Services - Catalog Management
    ID: 68ac1ad3653641d0abd723de73d94f17

11. Customer Directory - Client Management
    ID: a9f1bfe5d5d44ef9ab5917d17b9c918d

12. Quote & Invoice Builder - Project Brief
    ID: acfaa4acc43f4d4ba104dce358b4c0c3

Use a utility like `curl -L` to download the hosted URLs.