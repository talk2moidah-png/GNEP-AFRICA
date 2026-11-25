# GNEP Africa — Comprehensive Website Technical & Design Audit (`WEBSITE_AUDIT.md`)

**Live URL:** `https://gnep-africa.pages.dev/`  
**Organization:** Global Nature and Environmental Partnership (GNEP Africa) — Katsina State, Nigeria  
**Audit Date:** 25 November 2026  

---

## 1. Page & Asset Inventory Baseline

### 1.1 HTML Document Inventory (20 Existing Pages + 3 Required Legal/Accessibility Pages)
| File | Role / Purpose | Baseline Status | Identified Defects |
|---|---|---|---|
| `index.html` | Main Institutional Homepage | Active | Duplicate CSS declarations in `gnep.css`; pillar links & 2 update card links point to `#focus-areas` / `#updates` instead of dedicated pages; footer legal links point to `#`. |
| `about.html` | Institutional Mandate, Mission, Vision, Values & 6 Focus Areas | Active | Missing `css/design-tokens.css`, missing canonical tag, footer legal links point to `#`. |
| `events.html` | Documented Activities, Workshops, Participations & In-Development Programmes | Active | Missing `css/design-tokens.css`, missing canonical tag, footer legal links point to `#`. |
| `gallery.html` | Field Documentation Gallery (28 Verified Photos) | Active | Missing `css/design-tokens.css`, missing canonical tag, footer legal links point to `#`. |
| `founder.html` | Founder & Executive Lead Full Academic & Career Dossier | Active | Missing `css/design-tokens.css`, missing canonical tag, footer legal links point to `#`. |
| `contact.html` | Partnership & General Inquiry Page | Active | Uses `data-netlify="true"` on a Cloudflare Pages host without client-side validation/routing handler; missing `css/design-tokens.css` & canonical tag. |
| `knowledge-hub.html` | Pan-African Research & Policy Repository | Active | Missing `skip-to-content` link, missing `css/design-tokens.css`; newsletter form previously showed local-only subscription toast without live email backend; uses different footer markup from standard `gnep-footer`. |
| `publication.html` | Dynamic Publication Metadata & Citation Detail Template | Active | Missing static `<h1>` fallback and `skip-to-content` link; previously redirected away or showed empty spinner if visited without `?id=`. |
| `404.html` | Error 404 Not Found Page | Active | Uses legacy template styles without shared GNEP header/footer, `skip-to-content`, or `css/design-tokens.css`. |
| `subsidy-removal-public-accountability-policy-brief.html` | Policy Brief by Muhammad Garba Isah (Oct 2026) | Active | Footer legal links point to `#`. |
| `lingua-franca-hausa-into-climate.html` | Policy Brief on Hausa Climate Communication (Nov 2026) | Active | Needs standardized legal footer links (`privacy.html`, `terms.html`, `accessibility.html`). |
| `el-nino-me-ya-kamata-kowane-dan-najeriya-ya-sani.html` | Hausa Super El Niño Public Advisory (Oct 2026) | Active | Needs `lang="ha"` on article body container and standardized legal footer links. |
| `rethinking-climate-finance-africa.html` | Climate Finance Policy Brief by M. L. Sani & A. Baala (Oct 2026) | Active | Needs standardized legal footer links. |
| `adapting-rotterdam-sponge-city-lagos.html` | Urban Flood Resilience Case Study by M. L. Sani (Oct 2026) | Active | Needs standardized legal footer links. |
| `nigeria-heat-emergency-policy-brief.html` | Super El Niño Heat Emergency Policy Brief (Sep 2026) | Active | Missing `css/design-tokens.css`, canonical tag, PDF download button, and legal links. |
| `cso-policy-workshop.html` | Katsina CSO Policy Brief Workshop Press Release & Report (2026) | Active | Missing `css/design-tokens.css`, canonical tag, PDF download button, and legal links. |
| `tree-planting-150-seedlings.html` | 150 Economic Tree Seedlings Restoration Story with AYINET | Active | Missing `css/design-tokens.css`, canonical tag, PDF download button, and legal links. |
| `communicating-environmental-issues.html` | Environmental Storytelling Article by Maryam Dauda | Active | Missing `css/design-tokens.css`, canonical tag, PDF download button, and legal links. |
| `turning-research-into-action.html` | Evidence-Based Policy Engagement Article | Active | Missing `css/design-tokens.css`, canonical tag, PDF download button, and legal links. |
| `youth-environmental-action.html` | Youth-Led Environmental Action & School Climate Clubs Article | Active | Missing `css/design-tokens.css`, canonical tag, PDF download button, and legal links. |
| `privacy.html`, `terms.html`, `accessibility.html` | Institutional Privacy Policy, Terms of Use & WCAG 2.2 AA Accessibility Statement | **Missing** | Referenced in the footer of every page as `href="#"`; must be created as complete pages and linked site-wide. |

---

## 2. Confirmed Technical & UX Defects (By Severity)

### P1 — Critical Navigation, Contrast, Design Token & Form Defects
1. **Dropdown Active/Focus Contrast Failure (`css/bootstrap.min.css` vs. `css/gnep.css`):**
   - **Root Cause:** `css/bootstrap.min.css` defines `.dropdown-item.active, .dropdown-item:active { background-color: #001d23; color: #fff; }`, while `css/gnep.css` lines 374–387 define `.navbar .dropdown-item { color: #334155; }` with higher specificity (`0,2,0`) but no `:active`, `.active`, or `:focus` background override. As a result, active/clicked/selected dropdown items render dark `#334155` text on a dark `#001d23` navy background (contrast ratio **1.48:1**, failing WCAG 2.2 AA 4.5:1 minimum).
   - **Fix:** Explicitly define `.navbar .dropdown-item:hover`, `:focus`, `:focus-visible`, `.active`, and `:active` in `css/gnep.css` with high-contrast colours (`#0B2516` background with `#FFFFFF` text for `.active` / `:active`, and `#F0FDF4` background with `#0B2516` text for `:hover` / `:focus-visible`).
2. **Header Vertical Height & Contradictory Navbar Rules (`css/gnep.css` & `js/main.js`):**
   - **Root Cause:** `css/gnep.css` defines `.gnep-brand-title` and `.navbar-nav .nav-link` twice with conflicting light vs. dark colors (lines 199–259 vs. lines 318–357), and `js/main.js` lines 16–22 dynamically mutate `.fixed-top .container` inline `max-width` between `85%` and `100%` on scroll.
   - **Fix:** Consolidate header CSS into a single compact, predictable specification (`topbar` height `32px`, `navbar` padding `8px 0`, `scroll-margin-top: 96px` on all anchor targets) and remove the conflicting `max-width` mutation in `js/main.js`.
3. **Inconsistent Design Token Loading (`css/design-tokens.css`):**
   - **Root Cause:** `css/design-tokens.css` is only loaded on 6 of 20 pages, and its `:root` variables (`--color-primary`, `--border-radius: 0`) do not align with the authoritative GNEP tokens in `css/gnep.css`.
   - **Fix:** Make `css/design-tokens.css` the canonical design-token layer (defining all GNEP brand colours `#0B2516`, `#113821`, `#1A4D2E`, `#15803D`, `#0A3258`, `#0284C7`, typography stacks, spacing, radii, shadows, and breakpoints) and load stylesheets in the identical order (`bootstrap.min.css` $\rightarrow$ `style.css` $\rightarrow$ `design-tokens.css` $\rightarrow$ `gnep.css`) across all pages.
4. **Form & Newsletter Submission Integrity (`contact.html`, `knowledge-hub.html`, `publication.html`):**
   - **Root Cause:** The live site is deployed on **Cloudflare Pages** (`gnep-africa.pages.dev`), where `data-netlify="true"` on `contact.html` is not processed by Netlify Forms. Meanwhile, `#kh-newsletter-form` in `js/knowledge-hub.js` stores emails in browser `localStorage` and shows a `"Subscription confirmed"` message without transmitting to a server.
   - **Fix:**
     - On `contact.html`: Implement accessible client-side field validation with clear `aria-invalid` and error messages, and when no server webhook is configured, construct a structured, pre-filled inquiry dispatch to `gnep.partnership@gmail.com` with an honest status notice so the user never receives a false submission confirmation.
     - On `knowledge-hub.html` and `publication.html`: Replace the misleading localStorage fake-success message on `#kh-newsletter-form` with an honest configuration notice and a direct `mailto:gnep.partnership@gmail.com?subject=GNEP%20Knowledge%20Hub%20Research%20Alerts%20Subscription` action until an external mailing-list provider (e.g. Buttondown, Mailchimp, or Cloudflare Workers) is configured by the owner.

### P2 — Knowledge Hub Discovery, Homepage Rhythm, Script Guards & SEO Metadata
1. **Knowledge Hub Catalog Completeness & `publication.html` Fallback:**
   - **Root Cause:** `data/publications.json` should include all 11 verified GNEP publications/articles (the 5 new policy briefs/advisories plus the 6 verified GNEP reports/articles), each with working links to its full HTML article webpage (`article_url`) and downloadable PDF (`file_url`). Furthermore, visiting `publication.html` without `?id=` or before JS hydration had no static `<h1>` and redirected immediately without allowing users to view bibliographic details if desired.
   - **Fix:** Index all 11 verified GNEP publications in `data/publications.json` and `js/knowledge-hub.js`, provide both **"Read Full Article"** (`article_url`) and **"Metadata & Cite"** (`publication.html?id=...`) plus **"Download PDF"** (`file_url`), and give `publication.html` a semantic `<h1>` and clean bibliographic detail view.
2. **Homepage Internal Link Destinations (`index.html`):**
   - **Root Cause:** In `index.html`, the 3 Strategic Pillar cards (`Community and Schools`, `Civil Society and Institutions`, `Research and Policy`) all link to `#focus-areas`, and Update Cards 2 & 3 (`150 Economic Tree Seedlings`, `Storytelling & Persuasive Communication`) link to `#updates` instead of their dedicated pages (`tree-planting-150-seedlings.html` and `communicating-environmental-issues.html`). Also, the `"All Updates"` button links to `#updates` instead of `events.html`.
   - **Fix:** Point every card and button on `index.html` to its exact dedicated page (`youth-environmental-action.html`, `cso-policy-workshop.html`, `knowledge-hub.html`, `tree-planting-150-seedlings.html`, `communicating-environmental-issues.html`, `events.html`).
3. **Script Guards & Unused Polling (`js/main.js`, `js/dark-mode.js`, `js/data-layers.js`):**
   - **Root Cause:** `js/main.js` calls `.waypoint()`, `.counterUp()`, and `.owlCarousel()` without checking if those jQuery plugins are loaded; `js/data-layers.js` polls `setInterval` indefinitely looking for `window.cesiumViewer`.
   - **Fix:** Guard all plugin calls in `js/main.js`, guard `js/dark-mode.js` when no toggle button is present, and stop/disable `js/data-layers.js` polling when `#cesiumContainer` is absent.
4. **SEO & Social Metadata (`sitemap.xml`, `robots.txt`, Canonical URLs, Favicon, JSON-LD):**
   - **Root Cause:** 13 pages lack `<link rel="canonical">`, no pages include `<link rel="icon">`, and `sitemap.xml` / `robots.txt` / Cloudflare `_headers` are missing from the root directory.
   - **Fix:** Add canonical URLs, favicon links, Open Graph/Twitter tags, and factually accurate JSON-LD structured data across all pages, plus generate `sitemap.xml`, `robots.txt`, and `_headers`.

### P3 — Footer Legal Destinations & 404 Page
1. **Broken Footer Legal Links (`href="#"`):**
   - **Root Cause:** All pages have `<a href="#">Privacy</a>`, `<a href="#">Terms</a>`, and `<a href="#">Accessibility</a>` in the bottom legal bar.
   - **Fix:** Create complete, institutional `privacy.html`, `terms.html`, and `accessibility.html` pages and update all footer legal bars to link to them.
2. **404 Page (`404.html`):**
   - **Fix:** Upgrade `404.html` to use the shared GNEP header, footer, design tokens, and direct navigation links to Home, Knowledge Hub, Updates & Field Work, Field Gallery, and Contact.

---

## 3. Items Flagged for Owner Verification (Detailed in `CONTENT_REVIEW.md`)
Per the Non-Negotiable Preservation Rules, no statistics, dates, biographies, or partner attributions have been fabricated or altered. All factual claims requiring periodic owner confirmation (e.g., 150 economic tree seedlings with AYINET, 20 CSO representatives trained with The Green Minds Space, SUBEB/UNICEF 19 August 2026 workshop participation label, Founder PAUWES MSc timeline, and live form/newsletter backend credentials) are catalogued in `CONTENT_REVIEW.md`.
