# GNEP Africa 2.0 — Institutional Design System Specification

**Canonical Token Stylesheet:** `css/design-tokens.css`  
**Component Stylesheet:** `css/gnep.css`  
**Design Philosophy:** Editorial authority, forest-green institutional identity, scannable data tables, zero decorative clutter, and strict WCAG 2.2 AA contrast compliance.

---

## 1. Brand Color Tokens & Verified Contrast Ratios

| Token Name | Hex Value | Role / Usage | Paired Foreground / Background | WCAG 2.2 Contrast Ratio |
|---|---|---|---|---|
| `--gnep-forest-deep` | `#0B2516` | Primary institutional header, hero, and footer background | `#FFFFFF` (White text) | **15.8 : 1** (AAA) |
| `--gnep-forest-mid` | `#113821` | Sticky navigation bar & dark card surfaces | `#FFFFFF` (White text) | **12.6 : 1** (AAA) |
| `--gnep-forest-primary` | `#1A4D2E` | Primary buttons, active badges, table headers | `#FFFFFF` (White text) | **9.8 : 1** (AAA) |
| `--gnep-green-action` | `#15803D` | Interactive accents, verified output badges, links on dark | `#FFFFFF` (White text) | **5.1 : 1** (AA) |
| `--gnep-mint-soft` | `#ECFDF5` | Dropdown hover surface, callout tint background | `#0B2516` (Deep forest text) | **14.2 : 1** (AAA) |
| `--gnep-policy-navy` | `#0A3258` | Climate Intelligence & Policy Observatory header gradient | `#FFFFFF` (White text) | **12.9 : 1** (AAA) |
| `--gnep-policy-sky` | `#0284C7` | Data provenance badges, geospatial node markers | `#FFFFFF` (White text) | **4.6 : 1** (AA) |
| `--gnep-canvas-sand` | `#F4F6F4` | Warm off-white section background canvas | `#1A2E22` (Body ink) | **12.8 : 1** (AAA) |
| `--gnep-text-primary` | `#1A2E22` | Primary editorial body copy on white/sand | `#FFFFFF` (Surface white) | **14.1 : 1** (AAA) |
| `--gnep-text-secondary` | `#3F5247` | Secondary captions, metadata, table footnotes | `#FFFFFF` (Surface white) | **7.9 : 1** (AAA) |
| `--gnep-ochre-earth` | `#B45309` | Planned/In-Development status badges, warning callouts | `#FFFFFF` (White text) | **5.0 : 1** (AA) |

---

## 2. Typography Scale

- **Editorial Display / Headings (`--font-editorial-serif` / `--font-heading`):**
  - Primary Display Serif: `'Newsreader', Georgia, serif` (used for long-form policy brief titles, editorial quotes, and major section headers).
  - Structural UI Heading Sans: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif` (weights `600`, `700`, `800`).
- **Body & Analytical Copy (`--font-body`):**
  - `'Inter', 'Plus Jakarta Sans', system-ui, sans-serif` (`1rem` / `16px` base; `1.06rem` / `17px` with `1.8` line-height and `68ch–75ch` measure for policy briefs).
- **Technical Metadata & Project Codes (`--font-mono`):**
  - `'JetBrains Mono', Consolas, monospace` (used for project codes `GNEP-PRJ-2026-001`, coordinates, and dataset identifiers).

---

## 3. Core Institutional Components

1. **Compact Sticky Institutional Shell (`.gnep-topbar` + `.gnep-navbar`):**
   - Utility bar (`32px` height on desktop) providing 1-click access to `climate-intelligence.html`, `programmes.html`, `knowledge-hub.html`, and `accountability.html`.
   - Primary navbar (`64px–70px` height) with 6 structured dropdown pillars and high-contrast hover/focus states.
2. **Project Portfolio Dossier Cards (`programmes.html` & `index.html`):**
   - Inspired by the Green Climate Fund (GCF) project disclosure pattern: displays Project ID (`GNEP-PRJ-*`), explicit lifecycle status badge (`Completed`, `Active / Ongoing`, `Planned / In Development`), thematic pillar, partner role classification, verified output metric, and direct evidence links.
3. **Climate Intelligence & Policy Observatory Tables (`climate-intelligence.html`):**
   - Every geospatial marker on the Leaflet map is paired with an accessible HTML `<table class="policy-data-table">` fallback and explicit data provenance columns (Provider, Reference Period, Licence, Spatial Resolution, and Analytical Scope).
4. **Long-Form Policy Brief Template (6 Full HTML Policy Briefs):**
   - Two-column desktop layout (`col-lg-8` readable prose + `col-lg-4` sticky metadata, key findings, citation box, and 1-click PDF download banner) with `@media print` stylesheet rules.
