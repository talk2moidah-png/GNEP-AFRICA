# GNEP Africa 2.0 — Comprehensive Website Audit & Baseline

**Project:** Global Nature and Environmental Partnership (GNEP Africa) — `https://gnep-africa.pages.dev`  
**Audit Date:** November 25, 2026  
**Framework:** Static HTML5 / CSS3 (`design-tokens.css`, `bootstrap.min.css`, `style.css`, `gnep.css`) / Vanilla JS & jQuery 3.6.4 + Leaflet 1.9.4  
**Total HTML Routes Audited:** 26 HTML pages (23 baseline + 3 new GNEP Africa 2.0 institutional hubs)

---

## 1. Confirmed Defects Found & Resolved

### P1 — Critical Usability, Contrast & Architectural Defects
| ID | Defect | Affected Files | Resolution Implemented |
|---|---|---|---|
| **P1-01** | **Broken Hero Overlays on Homepage:** Legacy `#cesiumContainer`, `#data-layer-panel` ("Environmental Data Layers"), `#dark-mode-toggle`, and "Stay Connected" signup box overlapped the front-page hero banner. | `index.html`, `js/data-layers.js`, `js/dark-mode.js` | Removed all overlapping boxes from `index.html`; relocated geo-referenced climate intelligence and data layers to a dedicated, provenance-backed hub (`climate-intelligence.html`) and guarded `js/data-layers.js` & `js/dark-mode.js` with null checks. |
| **P1-02** | **Dropdown Active/Hover Low Contrast (~1.24:1):** `.gnep-navbar .dropdown-item.active` and `:hover` inherited dark text (`#1A2E22`) over a dark green background (`#0E3A2F`). | `css/gnep.css` | Set `.gnep-navbar .dropdown-item:hover` and `:focus` to background `#ECFDF5` with text `#0B2516 !important` (**14.2:1 contrast**) and `.active` to background `#0E3A2F` with text `#FFFFFF !important` (**11.9:1 contrast**). |
| **P1-03** | **Simulated Form Submissions Without Delivery:** `contact.html` and `#kh-newsletter-form` prevented default submission and showed a success toast without sending data anywhere. | `contact.html`, `js/knowledge-hub.js` | Replaced with honest, validated `mailto:gnep.partnership@gmail.com` dispatch that formats the user's structured inquiry and opens their email client while displaying an explicit fallback notice and copyable email address. |
| **P1-04** | **Incomplete Knowledge Hub Index (6 vs. 11 Publications):** 5 newly published HTML policy briefs and advisories (including 2 Hausa/bilingual advisories) were absent from `data/publications.json` and `js/knowledge-hub.js`. | `data/publications.json`, `js/knowledge-hub.js`, `knowledge-hub.html` | Indexed all **11 verified GNEP publications** with dual direct links (`article_url` to full HTML webpage + `file_url` to clean typeset downloadable PDF). |

### P2 — Information Architecture, Brand Consistency & Governance Gaps
| ID | Defect | Affected Files | Resolution Implemented |
|---|---|---|---|
| **P2-01** | **Missing GNEP 2.0 Institutional Hubs:** No dedicated Programmes & Impact Portfolio directory, no Climate Intelligence & Policy Observatory, and no Governance & Accountability Centre. | Site-wide architecture | Built `programmes.html` (GCF-inspired project portfolio + results-chain methodology), `climate-intelligence.html` (Leaflet map + accessible table fallback + Policy Observatory), and `accountability.html` (governance, partner role taxonomy, editorial integrity, safeguarding, and corrections route). |
| **P2-02** | **Fragmented Global Navigation & Footer:** Older inner pages used a 4-link navbar and lacked links to `programmes.html`, `climate-intelligence.html`, `accountability.html`, and legal pages, as well as the explicit institutional non-affiliation disclaimer. | All 26 `.html` files | Deployed the unified GNEP Africa 2.0 6-pillar dropdown header and 5-column institutional footer with the Institutional Independence & Non-Affiliation Notice across all 26 HTML pages. |
| **P2-03** | **Design Token Drift & Stylesheet Load Order:** `css/design-tokens.css` used generic colors instead of GNEP's `#0B2516` canopy green and `#0A3258` policy blue, and was missing on 25 pages. | `css/design-tokens.css`, all 26 `.html` files | Rebuilt `css/design-tokens.css` as the canonical token layer and standardized stylesheet load order (`design-tokens.css` -> `bootstrap.min.css` -> `style.css` -> `gnep.css`) across all 26 HTML pages. |
| **P2-04** | **Publication Detail Page Empty `<h1>` Without JS:** `publication.html` rendered `<h1 id="pub-title"></h1>` empty before JavaScript execution. | `publication.html`, `js/publication-detail.js` | Added static fallback `<h1>GNEP Africa Publication Repository</h1>` and `<noscript>` fallback links to all 11 HTML policy briefs and downloadable PDFs. |

### P3 — SEO, Crawlability & Security Headers
| ID | Defect | Affected Files | Resolution Implemented |
|---|---|---|---|
| **P3-01** | **Missing Canonical Tags, Open Graph & Twitter Metadata:** 12 pages lacked `<link rel="canonical">` or complete social preview tags. | All 26 `.html` files | Injected canonical URLs, `og:*`, `twitter:*`, and `Organization` / `Article` JSON-LD across all pages. |
| **P3-02** | **Missing `sitemap.xml`, `robots.txt`, and `_headers`:** No XML sitemap, crawl directives, or HTTP security headers for Cloudflare Pages. | `sitemap.xml`, `robots.txt`, `_headers` | Generated valid `sitemap.xml` (25 public routes), `robots.txt`, and Cloudflare Pages `_headers`. |
