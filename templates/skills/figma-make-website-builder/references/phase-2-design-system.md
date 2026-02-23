---
title: Design System Generation
impact: CRITICAL
tags: design-system, colors, typography, spacing, components, tokens
---

# Phase 2 — Design System Generation

**Role:** Act as a Design Director.

## Purpose

Create a complete design system given a brand and its attributes (minimal, bold, luxury, playful). Output design tokens, CSS variables, and Figma-ready component descriptions.

## Deliverables

### 1. Color Palette

Define primary, secondary, semantic colors, and dark mode variants:

```json
{
  "colors": {
    "primary": {
      "50": "#eff6ff",
      "100": "#dbeafe",
      "200": "#bfdbfe",
      "300": "#93c5fd",
      "400": "#60a5fa",
      "500": "#3b82f6",
      "600": "#2563eb",
      "700": "#1d4ed8",
      "800": "#1e40af",
      "900": "#1e3a8a",
      "950": "#172554"
    },
    "secondary": { "50": "...", "900": "..." },
    "accent": { "50": "...", "900": "..." },
    "semantic": {
      "success": "#22c55e",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "info": "#3b82f6"
    },
    "neutral": {
      "50": "#fafafa",
      "100": "#f5f5f5",
      "200": "#e5e5e5",
      "300": "#d4d4d4",
      "400": "#a3a3a3",
      "500": "#737373",
      "600": "#525252",
      "700": "#404040",
      "800": "#262626",
      "900": "#171717",
      "950": "#0a0a0a"
    },
    "darkMode": {
      "background": "#0a0a0a",
      "surface": "#171717",
      "surfaceElevated": "#262626",
      "text": "#fafafa",
      "textMuted": "#a3a3a3",
      "border": "#404040"
    }
  }
}
```

### 2. Typography Scale (9 levels)

| Level | Name | Size | Line Height | Weight | Use Case |
|-------|------|------|-------------|--------|----------|
| 1 | Display | 72px / 4.5rem | 1.1 | 700 | Hero headlines |
| 2 | H1 | 48px / 3rem | 1.2 | 700 | Page titles |
| 3 | H2 | 36px / 2.25rem | 1.25 | 600 | Section headings |
| 4 | H3 | 30px / 1.875rem | 1.3 | 600 | Subsection headings |
| 5 | H4 | 24px / 1.5rem | 1.35 | 600 | Card titles |
| 6 | Large | 20px / 1.25rem | 1.5 | 400 | Lead paragraphs |
| 7 | Body | 16px / 1rem | 1.6 | 400 | Body text |
| 8 | Small | 14px / 0.875rem | 1.5 | 400 | Captions, labels |
| 9 | XSmall | 12px / 0.75rem | 1.4 | 400 | Legal, footnotes |

**Font recommendations by brand attribute:**
- Minimal: Inter, Satoshi, Plus Jakarta Sans
- Bold: Clash Display, Space Grotesk, Manrope
- Luxury: Playfair Display, Cormorant, Libre Baskerville
- Playful: Poppins, Quicksand, Nunito

### 3. Spacing System (8px base grid)

```json
{
  "spacing": {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
    "20": "80px",
    "24": "96px",
    "32": "128px"
  }
}
```

**Section spacing:** Use `64px`–`128px` between major page sections.
**Component spacing:** Use `16px`–`32px` for internal component padding.
**Element spacing:** Use `4px`–`12px` between related elements.

### 4. Component Specs (30+ components, all states)

For each component, define:

**Button:**
- Variants: Primary, Secondary, Outline, Ghost, Destructive
- Sizes: Small (32px), Medium (40px), Large (48px)
- States: Default, Hover, Active, Focus, Disabled, Loading
- Border radius: 8px (or pill for CTA)
- Padding: 12px 24px (medium)
- Font: Body weight 500

**Card:**
- Variants: Default, Elevated, Outlined, Interactive
- States: Default, Hover (lift + shadow), Focus
- Border radius: 12px
- Padding: 24px
- Shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Hover shadow: `0 10px 25px rgba(0,0,0,0.1)`

**Input:**
- Variants: Default, With Icon, With Addon
- States: Default, Focus, Error, Disabled, Success
- Height: 40px (medium)
- Border: 1px neutral-300, Focus: 2px primary-500
- Border radius: 8px
- Padding: 0 12px

*(Continue for all 30+ components from Phase 1 inventory)*

### 5. Layout Patterns with Responsive Breakpoints

```css
/* Breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1440px;

/* Container */
max-width: 1280px;
padding-inline: 16px (mobile), 24px (tablet), 32px (desktop);

/* Grid */
columns: 4 (mobile), 8 (tablet), 12 (desktop);
gap: 16px (mobile), 24px (desktop);
```

### 6. Animation Guidelines

| Property | Easing | Duration | Use Case |
|----------|--------|----------|----------|
| Hover | ease-out | 150ms | Button, card hover |
| Enter | ease-out | 200ms | Modal, dropdown open |
| Exit | ease-in | 150ms | Modal, dropdown close |
| Move | ease-in-out | 300ms | Layout shifts |
| Spring | cubic-bezier(0.34, 1.56, 0.64, 1) | 400ms | Playful interactions |
| Page transition | ease-out | 300ms | Route changes |

### 7. Accessibility (WCAG AA)

- **Contrast ratios:** 4.5:1 for body text, 3:1 for large text and UI components
- **Focus indicators:** 2px outline, offset 2px, primary-500 color
- **Touch targets:** Minimum 44x44px
- **Motion:** Respect `prefers-reduced-motion`
- **Screen readers:** All interactive elements have accessible names
- **Color:** Never use color alone to convey information

## Export Formats

### Design Tokens (JSON)
Export as a tokens.json file following the W3C Design Tokens specification.

### CSS Variables
```css
:root {
  --color-primary-500: #3b82f6;
  --font-display: 'Inter', sans-serif;
  --spacing-4: 16px;
  --radius-md: 8px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  /* ... */
}
```

### Figma-Ready Component Descriptions
Natural language descriptions for each component that Figma Make can interpret, including dimensions, colors, typography, spacing, and interactive states.

## Next Phase

Pass the design system to [Phase 3 — Content Architecture](phase-3-content-architecture.md).
