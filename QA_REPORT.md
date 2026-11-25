# GNEP Africa — Quality Assurance & Verification Report (`QA_REPORT.md`)

**Date:** 25 November 2026  
**Deployment Target:** Cloudflare Pages (`https://gnep-africa.pages.dev/`) & GitHub (`talk2moidah-png/gnep-africa`)  

---

## 1. Automated & Structural Verification Results (All 23 HTML Pages)

| Check Category | Target Standard | Result | Evidence / Notes |
|---|---|---|---|
| **Internal Link & Asset Integrity** | Zero broken internal `href` or `src` attributes across all 23 HTML files | **PASSED (0 missing)** | Verified every local HTML, CSS, JS, WebP/PNG image, and PDF path resolves on disk and in the deployed bundle. |
| **Placeholder Dead Links (`href="#"`)** | Zero `href="#"` links across all 23 HTML files | **PASSED (0 remaining)** | Replaced all footer `Privacy`, `Terms`, and `Accessibility` links with `privacy.html`, `terms.html`, and `accessibility.html`, and all `back-to-top` links with `#main-content`. |
| **Single Descriptive `<h1>` Per Page** | Exactly 1 `<h1>` per HTML document | **PASSED (23 / 23 pages)** | Confirmed `H1=1` across all 23 pages, including static `<h1>` fallback on `publication.html`. |
| **Skip-to-Content Landmark** | First focusable element in `<body>` on every page | **PASSED (23 / 23 pages)** | Verified `.skip-to-content` link targeting `#main-content` on all 23 pages. |
| **Canonical Design Token Loading** | `css/design-tokens.css` loaded before `css/gnep.css` on every page | **PASSED (23 / 23 pages)** | Confirmed `tokens=True` on all 23 pages. |
| **Canonical URL & Favicon Tags** | Unique `<link rel="canonical">` and `<link rel="icon">` on every page | **PASSED (23 / 23 pages)** | Confirmed `canon=True` and favicon link on all 23 pages. |
| **Dropdown Menu Contrast (WCAG 2.2 AA)** | $\ge 4.5:1$ contrast across default, hover, focus-visible, and active states | **PASSED (>14:1)** | Default: `#0F172A` on `#FFFFFF` (17.4:1); Hover/Focus: `#0B2516` on `#ECFDF5` (14.2:1); Active: `#FFFFFF` on `#0B2516` (16.1:1). |
| **Knowledge Hub Search, Filters & PDF Downloads** | All 11 verified GNEP publications searchable, filterable, with webpage & PDF links | **PASSED** | All 11 items in `data/publications.json` and `js/knowledge-hub.js` link directly to their `.html` article webpage and downloadable `.pdf` in `assets/publications/`. |
| **Script Execution & Reduced Motion Guards** | Zero unguarded plugin calls or infinite timers | **PASSED** | `js/main.js`, `js/dark-mode.js`, and `js/data-layers.js` guarded against missing DOM elements, missing jQuery plugins, and `prefers-reduced-motion: reduce`. |
| **Live HTTP 200 Verification** | Key live routes on `https://gnep-africa.pages.dev/` return HTTP 200 | **PASSED** | Verified live responses on Cloudflare Pages deployment. |

---

## 2. Unconfigured External Services Requiring Owner Credentials
Per the Non-Negotiable Preservation Rules (Rule 7), the following services are transparently handled without false server-success claims until the owner provides external provider credentials:
1. **Contact Form Server Webhook (`contact.html`):** Because the live site is hosted on **Cloudflare Pages** rather than Netlify, `data-netlify="true"` does not trigger server-side email delivery on Cloudflare. The form now validates all required fields client-side and opens a structured, pre-addressed `mailto:gnep.partnership@gmail.com` dispatch with a transparent status banner. To enable background server-side POST delivery without opening the user's email client, the owner can provide a **Formspree endpoint ID**, **Web3Forms access key**, or **Cloudflare Pages Function (`functions/api/contact.js`)** with Resend/SendGrid API credentials.
2. **Knowledge Hub Research Alerts Newsletter (`knowledge-hub.html` & `publication.html`):** Currently prepares a direct subscription request email to `gnep.partnership@gmail.com` with an explicit configuration notice. To enable automated mailing-list signups, the owner can connect a **Buttondown**, **Mailchimp**, or **Brevo** form action URL.
3. **Web Analytics:** No third-party tracking scripts or cookies are active. If the owner enables **Cloudflare Web Analytics** in the Cloudflare Dashboard, `privacy.html` should be updated to note privacy-first aggregate telemetry.
