---
title: Architecture Strategy
impact: CRITICAL
tags: architecture, site-map, user-journeys, components, tech-stack
---

# Phase 1 — Architecture Strategy

**Role:** Act as a Principal Architect.

## Purpose

For a given website type (portfolio, SaaS, e-commerce, etc.), produce a complete technical specification that serves as the foundation for all subsequent phases.

## Deliverables

### 1. Site Map with Full Page Hierarchy

Define every page and its nesting. Example structure:

```
Home
├── About
│   ├── Team
│   └── Mission
├── Products
│   ├── Product List
│   └── Product Detail (dynamic)
├── Blog
│   ├── Blog List
│   └── Blog Post (dynamic)
├── Contact
├── Pricing
├── Auth
│   ├── Login
│   ├── Signup
│   └── Reset Password
└── Legal
    ├── Privacy Policy
    └── Terms of Service
```

### 2. Primary User Journey Flows (3 minimum)

For each journey define:
- **Entry point** (how users arrive)
- **Steps** (page-by-page flow with actions)
- **Exit point** (conversion event or drop-off)
- **Key decision points**

Example journeys:
1. First-time visitor → conversion
2. Returning user → engagement
3. Support/help seeker → resolution

### 3. Data Models (if dynamic content)

Define entities, fields, types, and relationships:

```
User {
  id: UUID (PK)
  email: string (unique)
  name: string
  plan: enum(free, pro, enterprise)
  created_at: datetime
}

Product {
  id: UUID (PK)
  title: string
  description: text
  price: decimal
  images: string[]
  category_id: UUID (FK -> Category)
}
```

### 4. API Requirements (if applicable)

List endpoints with method, path, auth, and purpose:

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/products | No | List products |
| GET | /api/products/:id | No | Product detail |
| POST | /api/auth/login | No | User login |
| POST | /api/contact | No | Contact form |

### 5. Component Inventory (aim for 30+ components)

Group by category:

**Layout:** Navbar, Footer, Sidebar, Container, Section, Grid
**Navigation:** Breadcrumb, Pagination, Tabs, Dropdown Menu
**Content:** Hero, Feature Card, Testimonial Card, Pricing Card, Blog Card, Stat Counter
**Forms:** Input, Select, Textarea, Checkbox, Radio, File Upload, Search Bar
**Feedback:** Toast, Modal, Alert, Progress Bar, Skeleton Loader, Tooltip
**Media:** Image Gallery, Video Player, Carousel, Avatar, Icon Set
**Interactive:** Accordion, Toggle, Rating, Tag, Badge, Chip

### 6. Page Templates as Wireframe Descriptions

For each page, describe sections top-to-bottom:

```
Homepage:
  1. Navbar (sticky, transparent on hero)
  2. Hero (full-width, headline + subheadline + CTA + hero image)
  3. Logo Bar (trusted by section, 6 logos)
  4. Features Grid (3 columns, icon + title + description)
  5. How It Works (3 steps, numbered with illustrations)
  6. Testimonials (carousel, 3 cards)
  7. Pricing (3 tiers, highlighted middle)
  8. CTA Section (full-width, headline + button)
  9. Footer (4-column links + social + legal)
```

### 7. Technical Stack Recommendation

Recommend based on project needs:
- **Framework** (Next.js, Astro, SvelteKit, etc.)
- **Styling** (Tailwind, CSS Modules, styled-components)
- **Hosting** (Vercel, Netlify, Cloudflare Pages)
- **CMS** (if content-heavy: Sanity, Contentful, Strapi)
- **Database** (if dynamic: Supabase, PlanetScale, Neon)
- **Auth** (if needed: Clerk, Auth.js, Supabase Auth)

### 8. Performance Budgets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Time to Interactive | < 3.5s |
| Total bundle size (JS) | < 200KB gzipped |
| Image optimization | WebP/AVIF, lazy loading |

### 9. SEO Structure

- **URL patterns:** `/blog/[slug]`, `/products/[category]/[slug]`
- **Meta templates:** Title format, description length, OG tags
- **Structured data:** JSON-LD schemas (Organization, Product, Article, FAQ)
- **Sitemap:** Auto-generated with priorities
- **Robots.txt:** Crawl directives

## Output Format

Format everything as a technical specification document ready for Figma Make. Use clear headings, tables, and code blocks. This document becomes the single source of truth for all subsequent phases.

## Next Phase

Pass the complete specification to [Phase 2 — Design System](phase-2-design-system.md).
