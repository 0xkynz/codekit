---
title: Responsive Behavior Strategy
impact: HIGH
tags: responsive, breakpoints, mobile, tablet, desktop, layout
---

# Phase 7 — Responsive Behavior Strategy

**Role:** Act as a Responsive Design Specialist.

## Purpose

Plan responsive behavior for every page section across three breakpoints. Define layout transformations, typography scaling, image behavior, navigation adaptation, and content prioritization.

## Breakpoints

| Name | Width | Target Devices |
|------|-------|----------------|
| Mobile | 375px | iPhone, small Android |
| Tablet | 768px | iPad, Android tablets |
| Desktop | 1440px | Laptops, monitors |

Additional breakpoints if needed:
- Small mobile: 320px (iPhone SE)
- Large tablet: 1024px (iPad Pro landscape)
- Wide desktop: 1920px (large monitors)

## Responsive Decision Matrix

### Navbar

| Aspect | Mobile (375px) | Tablet (768px) | Desktop (1440px) | Notes |
|--------|---------------|-----------------|-------------------|-------|
| Layout | Hamburger + logo | Logo + primary links + hamburger for secondary | Full horizontal nav | |
| Height | 56px | 64px | 80px | Shrink to 60px on scroll |
| Logo | Icon only or small | Full logo | Full logo | |
| CTA button | Hidden (in menu) | Visible | Visible | |
| Search | Icon → full screen overlay | Icon → expanding input | Visible input | |
| Position | Sticky top | Sticky top | Sticky top | |

### Hero Section

| Aspect | Mobile | Tablet | Desktop | Notes |
|--------|--------|--------|---------|-------|
| Layout | Single column, stacked | Single column, wider | Split 50/50 or 60/40 | |
| Headline size | 36px / 2.25rem | 48px / 3rem | 72px / 4.5rem | |
| Subheadline | 16px, 2 lines max | 18px | 20px | Truncate on mobile if needed |
| CTA buttons | Full width, stacked | Side by side | Side by side | |
| Hero image | Below text, full width | Below text, contained | Right side, parallax | |
| Min height | auto | 500px | 100vh | |
| Padding | 24px horizontal | 48px horizontal | 80px horizontal | |

### Feature Grid

| Aspect | Mobile | Tablet | Desktop | Notes |
|--------|--------|--------|---------|-------|
| Columns | 1 | 2 | 3 | |
| Card layout | Horizontal (icon left, text right) | Vertical (icon top) | Vertical (icon top) | |
| Gap | 16px | 24px | 32px | |
| Card padding | 16px | 24px | 24px | |
| Icon size | 40px | 48px | 48px | |

### Pricing Section

| Aspect | Mobile | Tablet | Desktop | Notes |
|--------|--------|--------|---------|-------|
| Layout | Single column, swipeable | 3 columns, equal | 3 columns, middle highlighted | |
| Card width | 100% | 33% | 33% | |
| Highlighted card | Badge only (no scale) | Slight scale | Scale 1.05 + shadow | |
| Feature list | Collapsed (show top 5 + "See all") | Full | Full | |
| CTA size | Full width | Auto width | Auto width | |

### Testimonials

| Aspect | Mobile | Tablet | Desktop | Notes |
|--------|--------|--------|---------|-------|
| Layout | Single card, swipeable | 2 visible | 3 visible | |
| Navigation | Dots below | Dots + arrows | Arrows on sides | |
| Auto-play | Off | On (5s interval) | On (5s interval) | Save battery on mobile |
| Quote length | Truncate to 80 words | Full | Full | |

### Footer

| Aspect | Mobile | Tablet | Desktop | Notes |
|--------|--------|--------|---------|-------|
| Columns | 1 (accordion) | 2 | 4 | |
| Link groups | Collapsible sections | Visible | Visible | |
| Newsletter | Full width below columns | Inline | Inline | |
| Social icons | Centered row | Left-aligned | Left-aligned | |
| Padding | 40px vertical | 60px vertical | 80px vertical | |

### Dashboard Sidebar (if applicable)

| Aspect | Mobile | Tablet | Desktop | Notes |
|--------|--------|--------|---------|-------|
| Layout | Bottom tab bar | Collapsed icon rail (60px) | Full sidebar (260px) | |
| Items shown | 5 primary tabs | Icons + tooltips | Icons + labels | |
| Toggle | None (always visible) | Click to expand | Always expanded | |
| Overlay | Full screen when expanded | Push content | N/A | |

### Data Tables (if applicable)

| Aspect | Mobile | Tablet | Desktop | Notes |
|--------|--------|--------|---------|-------|
| Layout | Card list (each row = card) | Horizontal scroll | Full table | |
| Columns shown | 2-3 key columns | 4-5 columns | All columns | |
| Actions | Bottom of card | Last column | Last column | |
| Sort/filter | Dropdown above | Inline headers | Inline headers | |

## Typography Scaling

| Level | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| Display | 36px / 2.25rem | 56px / 3.5rem | 72px / 4.5rem |
| H1 | 30px / 1.875rem | 40px / 2.5rem | 48px / 3rem |
| H2 | 24px / 1.5rem | 30px / 1.875rem | 36px / 2.25rem |
| H3 | 20px / 1.25rem | 24px / 1.5rem | 30px / 1.875rem |
| H4 | 18px / 1.125rem | 20px / 1.25rem | 24px / 1.5rem |
| Large | 18px / 1.125rem | 18px / 1.125rem | 20px / 1.25rem |
| Body | 16px / 1rem | 16px / 1rem | 16px / 1rem |
| Small | 14px / 0.875rem | 14px / 0.875rem | 14px / 0.875rem |

Use `clamp()` for fluid typography:
```css
font-size: clamp(2.25rem, 5vw, 4.5rem); /* Display */
font-size: clamp(1.875rem, 4vw, 3rem);  /* H1 */
```

## Image Behavior

| Strategy | When to Use | Implementation |
|----------|-------------|----------------|
| **Scale** | Hero images, backgrounds | `object-fit: cover` with aspect ratio container |
| **Crop** | Product images, thumbnails | Different `object-position` per breakpoint |
| **Hide** | Decorative images | `display: none` on mobile |
| **Swap** | Complex illustrations | Different image sources via `<picture>` element |
| **Resize** | All images | `srcset` with width descriptors |
| **Lazy load** | Below the fold | `loading="lazy"` attribute |

## Spacing Adjustments

| Location | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Section padding (vertical) | 48px | 64px | 96px |
| Section padding (horizontal) | 16px | 32px | 80px |
| Container max-width | 100% | 720px | 1280px |
| Card gap | 16px | 20px | 24px |
| Content width | 100% | 85% | 65% (for reading) |

## Content Prioritization

On mobile, prioritize essential content and defer or hide secondary elements:

| Priority | Content Type | Mobile Behavior |
|----------|-------------|-----------------|
| Critical | Headlines, CTAs, primary images | Always visible |
| High | Feature descriptions, prices | Visible but may be truncated |
| Medium | Testimonials, secondary images | Collapsed or swipeable |
| Low | Decorative elements, animations | Hidden |
| Deferred | Large data tables, detailed charts | Simplified or linked to full view |

## Touch Considerations

- **Touch targets:** Minimum 44x44px for all interactive elements
- **Spacing between targets:** Minimum 8px gap
- **Swipe gestures:** Enable on carousels and horizontal lists
- **Hover states:** Replace with tap states on touch devices
- **Sticky elements:** Limit to navbar only on mobile (preserve scroll space)
- **Input fields:** 16px minimum font size (prevents iOS zoom)
- **Modals:** Full screen on mobile, centered overlay on desktop

## Next Phase

Pass responsive specs to [Phase 8 — Data Integration Planning](phase-8-data-integration.md).
