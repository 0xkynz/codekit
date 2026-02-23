---
title: Figma Make Prompt Engineering
impact: CRITICAL
tags: figma-make, prompts, ai, design, conversion
---

# Phase 5 — Figma Make Prompt Engineering

**Role:** Act as an AI Prompt Engineer specializing in Figma Make.

## Purpose

Convert the technical specifications from Phases 1-4 into optimized Figma Make prompts. Generate 5 prompts from simple to complex. Each prompt produces a deployable website section or full page.

## Prompt Principles

1. **Start with the outcome**, not the process
2. **Include brand context** — colors, typography, mood
3. **Specify interactions** — hover, click, scroll, animate
4. **Define responsive behavior** — mobile, tablet, desktop
5. **Request specific sections** — hero, features, CTA, footer
6. **Be concrete** — pixel values, color codes, font names over vague descriptions

## Prompt Template

```
Build a [WEBSITE TYPE] website with a [MOOD/AESTHETIC] aesthetic.

Brand: Use [PRIMARY COLOR] as the primary color and [SECONDARY COLOR] as accent.
Typography: [HEADING FONT] for headings, [BODY FONT] for body text.
Style: [DESCRIPTORS — e.g., clean lines, generous whitespace, subtle shadows].

Include these sections:
1) Hero — [SPECIFIC ELEMENTS: headline text, subheadline, CTA button text, background treatment, image/illustration placement]
2) [SECTION NAME] — [SPECIFIC ELEMENTS with layout details]
3) [SECTION NAME] — [SPECIFIC ELEMENTS with interaction details]
...

Interactions:
- [ELEMENT]: [BEHAVIOR] (e.g., "Cards: lift 4px with shadow on hover")
- [ELEMENT]: [BEHAVIOR]

Responsive: [SPECIFIC BEHAVIOR — e.g., "3-column grid stacks to single column on mobile, navbar collapses to hamburger"]

Animations: [STYLE — e.g., "Subtle fade-up on scroll, 0.3s ease-out"]
```

## 5 Prompt Variations

### Prompt 1 — Simple Landing Page

```
Build a modern SaaS landing page with a clean, minimal aesthetic.

Brand: Use #3b82f6 (blue) as primary and #0f172a (dark navy) for text.
Typography: Inter for all text, 700 weight for headings, 400 for body.
Style: Clean lines, generous whitespace, subtle rounded corners (12px).

Include:
1) Hero — Full-width section with centered headline "Ship Products That Users Love", subheadline "Stop guessing what customers want. Turn user feedback into decisions in minutes.", blue primary CTA button "Start Free Trial", ghost secondary button "Watch Demo". Light gradient background.
2) Logo bar — "Trusted by 10,000+ teams" with 6 greyscale company logos.
3) 3-column feature grid — Each card has an icon, bold headline, and 2-line description. Cards have subtle border and 12px radius.
4) CTA section — Dark background (#0f172a), white headline "Ready to ship better products?", blue button "Get Started Free", small text "No credit card required."
5) Footer — 4-column layout with links, social icons, and copyright.

Make it fully responsive: grid stacks on mobile, navbar gets hamburger menu.
Animations: Subtle fade-up on scroll for each section.
```

### Prompt 2 — Product Page with Interactions

```
Build a SaaS product page with a bold, modern aesthetic.

Brand: Primary #7c3aed (purple), secondary #06b6d4 (cyan), dark mode background #0a0a0a.
Typography: Space Grotesk for headings (700), Inter for body (400).
Style: Dark theme, vibrant accent colors, glassmorphism cards, neon glow effects.

Include:
1) Hero — Split layout: left side has headline "Analytics That Actually Make Sense", subheadline, and two CTAs. Right side has a floating dashboard mockup with subtle parallax.
2) Feature showcase — Tab component with 4 tabs. Each tab reveals a different product screenshot with feature description. Active tab has purple underline.
3) Interactive pricing — 3 pricing tiers in cards. Monthly/annual toggle with "Save 20%" badge. Middle card highlighted with "Most Popular" badge and purple border. Hover: cards lift with glow.
4) Testimonial carousel — Auto-playing carousel with 3 testimonial cards. Glassmorphism card style. Navigation dots and arrow buttons.
5) FAQ accordion — 8 questions with smooth expand/collapse animation. Purple indicator for open state.
6) Final CTA — Gradient background (purple to cyan), large headline, centered button with glow effect.

Interactions: Tab switching with content fade, pricing toggle with smooth number animation, accordion with 300ms ease-out, card hover lift.
Responsive: Tabs become horizontal scroll on mobile, pricing cards stack vertically, hero stacks with image above text.
```

### Prompt 3 — Multi-Page Site with Navigation

```
Build a complete agency portfolio website with a luxury, refined aesthetic.

Brand: Primary #b8860b (gold), neutral #1a1a1a (charcoal), background #faf9f6 (warm white).
Typography: Playfair Display for headings (700), Inter for body (400).
Style: Elegant, editorial layout, large imagery, sophisticated spacing, serif/sans-serif contrast.

Pages:
1) Homepage:
   - Full-screen hero with video background, overlay text "We Craft Digital Experiences", gold CTA "View Our Work"
   - Featured projects grid: 2x2 masonry layout with hover overlay showing project title and category
   - Services section: 4 services with minimal icons and descriptions
   - Client logos bar
   - Contact CTA with split layout (text left, form right)

2) Work page:
   - Filterable project grid (All, Branding, Web, Mobile)
   - Each project card shows image, title, category
   - Hover reveals "View Case Study" overlay

3) About page:
   - Team section with photo grid
   - Company values (3 columns)
   - Timeline of milestones

4) Contact page:
   - Split layout: contact form left, office info + map right
   - Form fields: name, email, project type dropdown, budget range, message

Navigation: Minimal top navbar with logo left, links center, CTA button right. Sticky on scroll with background blur.
Responsive: Masonry becomes single column on mobile, team grid 2-up on tablet.
Animations: Smooth page transitions, image parallax, text reveal on scroll.
```

### Prompt 4 — E-Commerce Product Detail

```
Build an e-commerce product detail page with a clean, premium aesthetic.

Brand: Primary #000000, accent #e11d48 (rose for sale badges), neutral grays.
Typography: Satoshi for headings (700), Inter for body (400).
Style: Minimal, product-focused, lots of whitespace, sharp imagery.

Include:
1) Product gallery — Left side: thumbnail strip (vertical) + main image. Click thumbnail to change main image. Zoom on hover. Mobile: horizontal carousel with dots.
2) Product info — Right side: breadcrumb, product title (H1), star rating with count, price (with strikethrough for sale), color swatches (clickable circles), size selector (button group), quantity counter (+/-), "Add to Cart" button (full width, black), "Add to Wishlist" (outline button with heart icon).
3) Product tabs — Description, Specifications (table), Reviews (with rating breakdown bar chart + individual review cards).
4) Related products — Horizontal scroll of 4 product cards with image, title, price. "Quick Add" button on hover.
5) Recently viewed — Same format as related products.

Interactions: Image zoom on hover, color swatch changes product image, size selection highlights active, quantity has min 1 max 10, tab switching with underline animation, "Add to Cart" shows checkmark animation on click.
Responsive: Gallery stacks above info on mobile, tabs become accordion, related products horizontal scroll on all sizes.
```

### Prompt 5 — Full Application Dashboard

```
Build a SaaS analytics dashboard with a professional, data-dense aesthetic.

Brand: Primary #6366f1 (indigo), success #22c55e, warning #f59e0b, error #ef4444, background #f8fafc, sidebar #1e1b4b (dark indigo).
Typography: Plus Jakarta Sans for all text. 700 for headings, 500 for labels, 400 for body.
Style: Clean data visualization, card-based layout, subtle borders, minimal shadows.

Include:
1) Sidebar — Dark background, logo at top, navigation groups (Dashboard, Analytics, Customers, Products, Settings) with icons. Active state: indigo highlight. Collapse to icons on tablet.
2) Top bar — Search input, notification bell with badge, user avatar dropdown.
3) Dashboard header — "Welcome back, [Name]" with date range picker and "Export" button.
4) Stats row — 4 metric cards: Revenue ($45,231 +20.1%), Users (2,350 +15%), Orders (1,234 -5%), Conversion (3.2% +0.5%). Each with sparkline chart and trend arrow (green up / red down).
5) Main chart — Line/area chart showing revenue over time. Toggle between 7d, 30d, 90d, 12m. Hover shows tooltip with exact values.
6) Two-column below chart:
   - Left: "Recent Orders" table with columns (Order ID, Customer, Product, Amount, Status badge). Pagination.
   - Right: "Top Products" list with product image, name, units sold, revenue. Progress bar for each.
7) Activity feed — Timeline of recent events with icons, descriptions, and relative timestamps.

Interactions: Date picker dropdown, chart period toggle, table row hover highlight, notification dropdown, sidebar collapse.
Responsive: Sidebar becomes bottom navigation on mobile, stats cards 2x2 grid, chart full width, table horizontal scroll, two-column stacks.
```

## Tips for Effective Figma Make Prompts

1. **Be specific about numbers** — "12px radius" not "rounded corners"
2. **Name your colors** — "#3b82f6" not "blue"
3. **Describe layout precisely** — "split 60/40 layout" not "side by side"
4. **Include content** — actual headlines and copy, not "headline here"
5. **Specify all states** — hover, active, disabled, loading, empty
6. **Think in sections** — numbered list, top to bottom
7. **Describe responsive changes explicitly** — don't just say "responsive"
8. **Include micro-interactions** — these make designs feel polished

## Next Phase

After generating Figma Make output, proceed to [Phase 6 — Animation & Interaction Design](phase-6-animation-interaction.md).
