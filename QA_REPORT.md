# GNEP Africa 2.0 — Quality Assurance & Verification Report

**QA Execution Date:** November 25, 2026  
**Automated Verifier Script:** `run_phase1_audit.py`  
**Total HTML Pages Tested:** 26 / 26  
**Overall Result:** **PASS (0 Broken Links, 0 Unresolved Assets, 100% Landmark & Metadata Compliance)**

---

## 1. Automated 26-Page Structural & Accessibility Audit Results

| Check Category | Target Standard | Result Across All 26 HTML Pages |
|---|---|---|
| **Single `<h1>` Landmark** | Exactly `1` `<h1>` per page (including static fallback on `publication.html`) | **26 / 26 PASS** (`H1=1` on every page) |
| **Skip-to-Content Link** | `<a class="skip-to-content" href="#main-content">` targeting `<main id="main-content">` | **26 / 26 PASS** (`skip=True`, `main=True`) |
| **Canonical Design Tokens** | `css/design-tokens.css` loaded before `bootstrap.min.css`, `style.css`, and `gnep.css` | **26 / 26 PASS** (`tokens=True`) |
| **SEO & Social Metadata** | Unique `<title>`, `<meta name="description">`, `<link rel="canonical">`, and `og:*` tags | **26 / 26 PASS** (`canon=True`, `desc=True`) |
| **Placeholder Link Elimination** | Zero dead `href="#"` anchor links across navigation, cards, or footers | **26 / 26 PASS** (`href#=0` across all 26 pages) |
| **Local Asset & Link Integrity** | Every internal `href` and `src` resolves to an existing file on disk | **26 / 26 PASS** (`missing=[]` across all 26 pages) |
| **Language Attribute Compliance** | `lang="en"` on 25 English pages; `lang="ha"` on Hausa El Niño advisory page | **26 / 26 PASS** |

---

## 2. Functional & Component Verification

1. **Knowledge Hub Repository (`knowledge-hub.html` & `data/publications.json`):**
   - Verified all **11 publications** render with accurate metadata, category filter pills, search filtering, direct HTML webpage links (`Read Full Article`), and direct PDF download links (`Download PDF`).
   - Verified all 11 PDF files exist in `assets/publications/` and are non-empty, clean GNEP-typeset documents.
2. **Programmes & Impact Observatory (`programmes.html`):**
   - Verified client-side status filter buttons (`All Portfolio Records`, `Completed`, `Active / Ongoing`, `Planned / In Development`) filter `#portfolio-grid` cards and update `#portfolio-count-label`.
   - Verified 5-stage Results-Chain table clearly distinguishes verified outputs (`150 seedlings`, `20 CSO representatives`, `11 publications`) from medium-term outcomes.
3. **Climate Intelligence & Policy Observatory (`climate-intelligence.html`):**
   - Verified Leaflet 1.9.4 map (`#gnep-intelligence-map`) initializes with 7 colour-coded markers, interactive layer checkboxes, and popups linking to evidence pages.
   - Verified full accessible HTML table fallback immediately below the map so keyboard/screen-reader and no-JS users have 100% data parity.
4. **Governance & Accountability Centre (`accountability.html`):**
   - Verified 5-tier Partnership Classification Vocabulary, Research Integrity standards, Safeguarding protocols, and 1-click `mailto:gnep.partnership@gmail.com` correction link.

---

## 3. Known Static-Hosting Boundaries (Disclosed Candidly)

- **Form & Newsletter Delivery:** Because the site is deployed as a static Cloudflare Pages project without a paid third-party form backend credential, `contact.html` and `#kh-newsletter-form` use validated `mailto:gnep.partnership@gmail.com` dispatch with explicit user feedback.
- **Geospatial Map Tiles:** `climate-intelligence.html` loads standard OpenStreetMap tiles via HTTPS (`tile.openstreetmap.org`) when online and degrades gracefully to the static geo-referenced HTML data table when offline.
