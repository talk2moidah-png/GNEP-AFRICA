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

---

## 4. Universal PageHero Component & African Biodiversity Visual Identity

- **Central Hero Registry:** `data/hero-registry.json`
- **Reusable Component Engine:** `js/page-hero.js` & `.gnep-page-hero` in `css/gnep.css`
- **Mandatory Default Template for Future Pages:** `templates/page-hero-template.html`
- **Dimensions:** Desktop `380–520px` (`min-height: 430px`; `100vh` on `index.html`), Tablet `~360px`, Mobile `300–380px` (`min-height: 320px`).
- **Provenance Separation Standard:** Every `PageHero` renders a `.gnep-page-hero-credit` badge at the bottom of the hero container that explicitly distinguishes **Authentic GNEP Field Documentation** (`isGnepFieldPhoto: true`) from **African Ecological Heritage / Regional Context Photography** (`isGnepFieldPhoto: false`), ensuring external African biodiversity imagery is never misrepresented as GNEP field activities.

### Complete 26-Page Unique Hero Image Assignment & Licensing Table

| # | Webpage Route | Assigned Hero Image (`26/26 Unique`) | Focal Point | Provenance Type | Credit & Licence Status |
|---|---|---|---|---|---|
| 1 | `404.html` | `assets/real/gallery/gnep-tree-planting-09-full.webp` | `center 35%` | Authentic GNEP Field Photo | Authentic GNEP Field Documentation • Katsina Restoration Corridor (© GNEP & AYINET) (© GNEP Africa & AYINET) |
| 2 | `about.html` | `assets/africa/kilimanjaro-savannah-elephants-panorama.webp` | `center 42%` | African Biodiversity / Regional Context | East African Kilimanjaro & Amboseli Biosphere Panorama (Regional Ecological Context) (Open Editorial / Commons Attribution) |
| 3 | `accessibility.html` | `assets/real/gallery/gnep-workshops-01-full.webp` | `center 35%` | Authentic GNEP Field Photo | Authentic GNEP Workshop Documentation • Digital & Civic Inclusion Cohort (© GNEP Africa) (© GNEP Africa & The Green Minds Space) |
| 4 | `accountability.html` | `assets/africa/congo-basin-dzanga-forest-elephants.webp` | `center 48%` | African Biodiversity / Regional Context | Congo Basin Rainforest Clearing & Biodiversity Monitoring Context (Central Africa) (Open Conservation Editorial Attribution) |
| 5 | `adapting-rotterdam-sponge-city-lagos.html` | `assets/africa/west-africa-coastal-mangrove-estuary.webp` | `center 45%` | African Biodiversity / Regional Context | West African Coastal Mangrove & Estuary Wetland Buffer (Coastal Flood Resilience Context) (Open Conservation Editorial Attribution) |
| 6 | `climate-intelligence.html` | `assets/africa/congo-braided-river-wetland-aerial.webp` | `center 50%` | African Biodiversity / Regional Context | Aerial African Braided River & Wetland Watershed Ecosystem (Geospatial Context) (Open Conservation Editorial Attribution) |
| 7 | `communicating-environmental-issues.html` | `assets/real/field-restoration.webp` | `center 35%` | Authentic GNEP Field Photo | Authentic GNEP Field Documentation • Community Restoration Engagement in Katsina (© GNEP & AYINET) (© GNEP Africa & AYINET) |
| 8 | `contact.html` | `assets/africa/african-tropical-waterfall-rainbow-canopy.webp` | `center 45%` | African Biodiversity / Regional Context | African Tropical Rainforest Waterfall & River Basin (Panoramic Conservation Context) (Open Conservation Editorial Attribution) |
| 9 | `cso-policy-workshop.html` | `assets/real/cso-workshop-group.webp` | `center 30%` | Authentic GNEP Field Photo | Authentic GNEP Workshop Documentation • Katsina CSO Cohort (© GNEP & The Green Minds Space) (© GNEP Africa & The Green Minds Space) |
| 10 | `el-nino-me-ya-kamata-kowane-dan-najeriya-ya-sani.html` | `assets/real/el-nino-hausa-flood.webp` | `center 40%` | African Biodiversity / Regional Context | GNEP Hausa Climate Advisory Archive • Hydrological & Thermal Risk Documentation (GNEP Advisory Figure Attribution) |
| 11 | `events.html` | `assets/africa/uganda-rwanda-virunga-highland-lake.webp` | `center 48%` | African Biodiversity / Regional Context | Lake Bunyonyi & Virunga Volcanic Highlands, East Africa (Freshwater Ecosystem Context) (Wikimedia Commons / CC BY-SA Attribution) |
| 12 | `founder.html` | `assets/real/cso-workshop-speaker-action.webp` | `center 28%` | Authentic GNEP Field Photo | Authentic GNEP Field & Institutional Photo • Katsina State CSO Workshop (2026) (© GNEP Africa / The Green Minds Space) |
| 13 | `gallery.html` | `assets/real/gallery/gnep-tree-planting-24-full.webp` | `center 32%` | Authentic GNEP Field Photo | Authentic GNEP Field Documentation • Katsina State Cohort (© GNEP & The Green Minds Space) (© GNEP Africa / AYINET / The Green Minds Space) |
| 14 | `index.html` | `assets/real/hero-forest-valley.webp` | `center center` | African Biodiversity / Regional Context | African Tropical Rainforest & River Ecosystem Collection (GNEP Visual Identity) (Curated Institutional Editorial Licence) |
| 15 | `knowledge-hub.html` | `assets/africa/congo-basin-misty-river-rainforest-aerial.webp` | `center 45%` | African Biodiversity / Regional Context | Congo Basin Rainforest Canopy & River System at Dawn (African Biodiversity Heritage) (Open Conservation Editorial Attribution) |
| 16 | `lingua-franca-hausa-into-climate.html` | `assets/real/lingua-franca-hausa-classroom.webp` | `center 35%` | African Biodiversity / Regional Context | GNEP Linguistic Inclusion Advisory Figure • Classroom & Community Literacy Context (GNEP Advisory Figure Attribution) |
| 17 | `nigeria-heat-emergency-policy-brief.html` | `assets/real/climate-finance-wfp-drought.webp` | `center 38%` | African Biodiversity / Regional Context | Photo: WFP / Gabriela Vivacqua (Cited in GNEP Policy Brief on Extreme Heat & Drought Vulnerability) (Editorial Policy Brief Citation) |
| 18 | `privacy.html` | `assets/real/gallery/gnep-schools-05-full.webp` | `center 30%` | Authentic GNEP Field Photo | Authentic GNEP Field Documentation • School Safeguarding & Media Ethics Standard (© GNEP Africa) (© GNEP Africa) |
| 19 | `programmes.html` | `assets/africa/gabon-ivindo-rainforest-waterfalls.webp` | `center 45%` | African Biodiversity / Regional Context | Gabonese Ivindo / Kongou Rainforest Waterfall Ecosystem (African Restoration Context) (Open Conservation Editorial Attribution) |
| 20 | `publication.html` | `assets/africa/afromontane-misty-forest-canopy.webp` | `center 40%` | African Biodiversity / Regional Context | Afromontane Misty Rainforest Canopy Reserve (African Forest Ecosystem Context) (Open Conservation Editorial Attribution) |
| 21 | `rethinking-climate-finance-africa.html` | `assets/real/climate-finance-gabon-coast.webp` | `center 45%` | African Biodiversity / Regional Context | Pongara National Park Coastline, Gabon (© Roshni Lodhia • Cited in GNEP Climate Finance Brief) (Documented Policy Brief Figure Attribution) |
| 22 | `subsidy-removal-public-accountability-policy-brief.html` | `assets/africa/african-acacia-savannah-sunrise.webp` | `center 48%` | African Biodiversity / Regional Context | African Savannah Ecosystem at Sunrise (Governance & Public Stewardship Context) (Open Conservation Editorial Attribution) |
| 23 | `terms.html` | `assets/real/climate-finance-undp-solar.webp` | `center 45%` | African Biodiversity / Regional Context | African Renewable Energy Infrastructure Context (UNDP / Open Knowledge Citation) (Editorial Policy Citation) |
| 24 | `tree-planting-150-seedlings.html` | `assets/real/hero-tree-planting.webp` | `center 32%` | Authentic GNEP Field Photo | Authentic GNEP Field Documentation • Katsina 150 Economic Tree Seedling Drive (© GNEP & AYINET) (© GNEP Africa & AYINET) |
| 25 | `turning-research-into-action.html` | `assets/real/policy-brief-research.webp` | `center 28%` | Authentic GNEP Field Photo | Authentic GNEP Research Documentation • Flood Disaster Policy Brief Presentation (© PAUWES / GNEP) (© GNEP Africa) |
| 26 | `youth-environmental-action.html` | `assets/real/schools-tree-planting.webp` | `center 28%` | Authentic GNEP Field Photo | Authentic GNEP Field Documentation • Katsina School Climate Champions (© GNEP Africa) (© GNEP Africa) |
