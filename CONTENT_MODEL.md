# GNEP Africa 2.0 — Structured Content Model & Schemas

This document defines the canonical data schemas used across GNEP Africa's JSON repositories (`data/publications.json`), HTML templates, and institutional observatories (`programmes.html`, `climate-intelligence.html`, `knowledge-hub.html`).

---

## 1. Publication & Policy Brief Schema (`data/publications.json`)

Every publication indexed in the Knowledge Hub conforms to the following schema and must provide **both** a native HTML webpage (`article_url`) and a downloadable typeset PDF (`file_url`):

```json
{
  "id": "pub-008",
  "slug": "subsidy-removal-public-accountability-policy-brief",
  "title": "Subsidy Removal and the Crisis of Public Accountability in Nigeria",
  "subtitle": "Why Weak Institutions Undermine Economic Reform and How Transparency Can Rebuild Trust",
  "type": "Policy Brief",
  "status": "Published",
  "language": "en",
  "date_published": "2026-10-01",
  "year": 2026,
  "authors": ["Muhammad Garba Isah"],
  "organization": "Global Nature and Environmental Partnership (GNEP Africa)",
  "thematic_pillar": "Environmental Governance & Policy",
  "geography": "Nigeria",
  "summary": "Examines why fossil fuel subsidy removal in Nigeria has triggered acute social strain due to opaque reinvestment governance, and proposes five actionable public accountability reforms.",
  "article_url": "subsidy-removal-public-accountability-policy-brief.html",
  "file_url": "assets/publications/subsidy-removal-public-accountability-policy-brief.pdf",
  "file_size_kb": 314,
  "page_count": 12,
  "cover_image": "assets/real/subsidy-removal-policy-brief-cover.webp",
  "citation": "Isah, M. G. (2026). Subsidy Removal and the Crisis of Public Accountability in Nigeria. GNEP Africa Policy Brief Series, October 2026."
}
```

---

## 2. Project Portfolio & Results-Chain Schema (`programmes.html`)

Modeled on the Green Climate Fund (GCF) portfolio disclosure standard, every GNEP programme record separates **status**, **partner role**, and **output vs. outcome**:

| Field | Type | Allowed Values / Description |
|---|---|---|
| `project_id` | String | Format `GNEP-PRJ-YYYY-NNN` or `GNEP-PRJ-PLAN-NNN` |
| `title` | String | Official descriptive title of the activity or programme |
| `status` | Enum | `Completed` \| `Active / Ongoing` \| `Planned / In Development` |
| `pillar` | Enum | `Nature & Ecosystem Restoration` \| `Environmental Governance & Policy` \| `Youth Leadership & Participation` \| `Climate Action & Resilience` \| `WEFE Nexus` \| `Research & Capacity Development` |
| `location` | String | Geo-referenced state/LGA (e.g., `Katsina LGA, Katsina State, Nigeria (12.9816°N, 7.6223°E)`) |
| `partner_name` | String | Partner or convener name (e.g., `AYINET`, `The Green Minds Space`, `SUBEB Katsina & UNICEF`) |
| `partner_role` | Enum | `Implementation Partner` \| `Workshop Co-Host` \| `Event Convener — GNEP Participant` \| `Lead Organization` |
| `verified_output` | String | Direct countable delivery (e.g., `150 economic tree seedlings planted`, `20 CSO representatives trained`) |
| `outcome_tracking_note` | String | Candid note on medium-term outcome monitoring (e.g., `12–24 month seedling survival audit pending`) |
| `evidence_url` | URL | Link to field dossier HTML page, PDF report, or photo gallery |

---

## 3. African Climate Policy Observatory Schema (`climate-intelligence.html`)

To maintain analytical integrity, every policy tracked in the Observatory separates **Official Statutory / Institutional Source Facts** from **GNEP Analytical Assessment**:

| Field | Description |
|---|---|
| `policy_name` | Official title of the statute, treaty, or plan (e.g., *Nigeria Climate Change Act, 2021*) |
| `jurisdiction` | `Federal Republic of Nigeria`, `Lagos State / Sub-National`, or `African Union / Continental` |
| `adoption_date` | Enactment or adoption year/month |
| `official_statutory_mandate` | Strictly factual summary of the statutory provisions and lead government agency |
| `gnep_analytical_assessment` | Clearly labelled GNEP commentary on implementation bottlenecks, local delivery gaps, and links to relevant GNEP policy briefs |

---

## 4. Climate Intelligence Data Layer & Indicator Schema (`climate-intelligence.html`)

Every environmental, climate finance, or energy indicator displayed on the site must include:
- `indicator_name` and `metric_value`
- `geographic_scope` and `spatial_resolution`
- `reference_period`
- `primary_source_provider` and `licence`
- `methodology_and_limitations`
