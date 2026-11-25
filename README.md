# GNEP Africa — Global Nature and Environmental Partnership

> **Connecting people, policy, and nature for a more resilient future.**

Official international standard website for **Global Nature and Environmental Partnership (GNEP Africa)**, a youth-led environmental and climate resilience initiative founded in January 2025 in Katsina State, Nigeria.

---

## 📁 Website Structure & Pages

| File | Page Name | Description |
|---|---|---|
| [index.html](index.html) | **Homepage** | UNEP-pattern utility topbar & navbar, lightweight hero with email updates form, WWF editorial mission band, verified evidence counters (150 trees, 20 CSO reps, 2025 founded), 3 pillars, 6 focus areas with status badges, 3 recent updates, verified leadership section, 6-photo field gallery showcase with Lightbox2, and partner collaboration row. |
| [bout.html](about.html) | **About GNEP** | Origin story, name etymology (Global / Nature & Environmental / Partnership), mission and vision statements, 5 core values with full principles, leadership profiles, and our transparent reporting approach. |
| [events.html](events.html) | **Updates & Field Work** | Filterable documented activities (Workshops, Field Updates, Participations), SUBEB/UNICEF institutional event (accurately labelled *Participated In*), Climate Literacy training note, and 4 coming-soon initiatives. |
| [gallery.html](gallery.html) | **Field Documentation Gallery** | 28 authentic project photos with full WebP optimization, category filter tabs (Tree Planting, CSO Workshops, Schools & Youth, Policy & Research), Lightbox2 modal expansion, field captions, and partner attribution. |
| [contact.html](contact.html) | **Contact & Partner** | Comprehensive partnership inquiry form (full African countries select + privacy consent), direct contact info, verified LinkedIn link, and 4 collaboration models. |
| [404.html](404.html) | **Error 404** | Branded page with helpful recovery navigation back to Home, Gallery, or Contact. |

---

## 🎨 Visual Identity & Technical Stack

- **Framework**: Bootstrap 5.0.0
- **Typography**:
  - Headings & Brand: *Plus Jakarta Sans* (Google Fonts)
  - Body & Form Controls: *Inter* (Google Fonts)
  - Editorial Quotes & Mission: *Newsreader* (Serif Google Fonts)
- **Primary Color Palette**:
  - Deep Forest: #0B2516 (Authority, editorial depth)
  - Mid Forest: #113821 / #1A4D2E (Secondary nature tone)
  - Accent Green: #15803D (Action items, verified badges)
  - GNEP Navy: #0A3258 (Policy, research, governance)
  - Soft Tint Background: #F4F8F5
- **Accessibility & Performance**:
  - Fully responsive across Mobile (375px), Tablet (768px), and Desktop (1280px+)
  - WCAG AA contrast compliant text colors
  - Accessible skip-to-content links on every page
  - Images converted to WebP format with responsive thumbnail and full-resolution sizes
  - Native loading="lazy" on all below-the-fold media
  - Strictly **ZERO** donation or payment processing buttons anywhere on the site

---

## 🚀 How to Run Locally

You can preview the site immediately without installing any build tools:

### Option 1: Double-click
Double-click index.html in your file explorer to open it directly in Google Chrome, Microsoft Edge, or Mozilla Firefox.

### Option 2: Local HTTP Server (Python)
Open a terminal in this folder and run:
`ash
python -m http.server 8000
`
Then visit http://localhost:8000 in your web browser.

---

## 🌐 How to Deploy Live

This site is 100% static HTML, CSS, and vanilla JS. It can be deployed in under 2 minutes to any modern static host:

1. **Netlify**: Drag and drop this folder directly onto [Netlify Drop](https://app.netlify.com/drop).
2. **Vercel**: Run ercel in this folder or connect via GitHub repository.
3. **GitHub Pages**: Push this repository to GitHub and enable GitHub Pages in Settings > Pages (Source: main branch, root /).
4. **Cloudflare Pages**: Connect your Git repository and set the output directory to /.

---

## ✉️ Inquiry Form Configuration

The forms on index.html and contact.html currently submit via mailto:
mailto:gnep.partnership@gmail.com

To connect to a free backend form handler (such as Formspree):
1. Sign up for a free endpoint at [formspree.io](https://formspree.io).
2. In index.html and contact.html, change:
   `html
   <form action="mailto:gnep.partnership@gmail.com" method="POST">
   `
   to:
   `html
   <form action="https://formspree.io/f/YOUR_ENDPOINT_ID" method="POST">
   `

---

## 👥 Verified Leadership & Contact

- **Mohammed Labaran Sani** — Founder & Lead (PAUWES MSc Climate Change Policy candidate)
- **Muhammad Garba Isah** — Project Lead
- **Abdulrahman Muhammad Tijanni** — Project Lead
- **Email**: gnep.partnership@gmail.com
- **Phone**: +234 706 588 5070
- **Location**: Katsina State, Nigeria
- **LinkedIn**: [GNEP Africa on LinkedIn](https://www.linkedin.com/company/global-nature-environmental-partnership/)

&copy; 2026 Global Nature and Environmental Partnership (GNEP Africa). All rights reserved.
