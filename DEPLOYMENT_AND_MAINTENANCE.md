# GNEP Africa 2.0 — Deployment, Backup & Maintenance Guide

**Live Production URL (Cloudflare Pages):** `https://gnep-africa.pages.dev/`  
**GitHub Repository:** `https://github.com/talk2moidah-png/gnep-africa` (`main` branch)  
**Source Directory:** `nature-website-template/`  
**Deployment Directory:** `dist-gnep/`

---

## 1. Architecture Overview

GNEP Africa 2.0 is built as a zero-dependency, high-resilience static HTML5/CSS3/JS institutional platform. It requires no Node.js build step to compile HTML/CSS, ensuring maximum longevity, instant edge caching on Cloudflare Pages, and zero server-side attack surface.

---

## 2. Deploying Updates to Cloudflare Pages

Using Wrangler CLI (`v4.x`):

```powershell
$env:CLOUDFLARE_API_TOKEN="<YOUR_CF_API_TOKEN>"
$env:CLOUDFLARE_ACCOUNT_ID="fa0fb28bc2ec9da3526b0c3deec018ee"
npx wrangler pages deploy "./dist-gnep" --project-name=gnep-africa --branch=main --commit-dirty=true
```

Cloudflare Pages automatically serves:
- `_headers` (HTTP security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and cache headers for `assets/`).
- `404.html` for any unmatched route.
- `sitemap.xml` and `robots.txt` at the root.

---

## 3. How to Add a New Policy Brief or Publication

1. **Create the HTML Article Page:** Duplicate `rethinking-climate-finance-africa.html` or `subsidy-removal-public-accountability-policy-brief.html` as `<new-slug>.html`, update the `<title>`, `<meta>`, canonical tag, breadcrumb, article body, and citation sidebar.
2. **Add the Downloadable PDF:** Place the typeset PDF in `assets/publications/<new-slug>.pdf` and its WebP cover image in `assets/real/<new-slug>-cover.webp`.
3. **Register in `data/publications.json` and `js/knowledge-hub.js`:** Append a new JSON object with `id`, `title`, `type`, `date_published`, `authors`, `summary`, `article_url`, and `file_url`.
4. **Update `sitemap.xml`:** Add a new `<url><loc>https://gnep-africa.pages.dev/<new-slug>.html</loc>...</url>` entry.
5. **Run the QA Audit Script:** Run `python run_phase1_audit.py` to confirm `H1=1`, `href#=0`, and `missing=[]`.

---

## 4. How to Add or Update a Project in the Programmes Observatory

1. Open `programmes.html` and locate `<div class="row g-4" id="portfolio-grid">`.
2. Add or update a `.portfolio-item` card with `data-status="completed"`, `data-status="active"`, or `data-status="planned"`.
3. Ensure every project card includes a unique code (`GNEP-PRJ-YYYY-NNN`), explicit partner role label (`Implementation Partner`, `Workshop Co-Host`, or `Event Convener — GNEP Participant`), and separates **Verified Output** from **Outcome / Impact Monitoring**.

---

## 5. Backup & Restore Procedure

- **Full Git Backup:** Every release is committed to `https://github.com/talk2moidah-png/gnep-africa` on the `main` branch.
- **Offline ZIP Archive:** A complete standalone ZIP package (`gnep-africa-work-package.zip` / `site_full.zip`) contains all 26 HTML pages, CSS, JS, JSON data, 11 PDFs, WebP images, and all 9 Markdown documentation deliverables. To restore, extract the ZIP and run `npx wrangler pages deploy`.
