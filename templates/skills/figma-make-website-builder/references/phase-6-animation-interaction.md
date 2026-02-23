---
title: Animation & Interaction Design
impact: HIGH
tags: animation, motion, interaction, scroll, hover, micro-interactions
---

# Phase 6 — Animation & Interaction Design

**Role:** Act as a Motion Designer.

## Purpose

For each website section, define animations and interactions with technical specs. Describe in natural language that Figma Make can interpret while providing precise implementation values.

## Animation Categories

### 1. Page Load Sequence

Define the stagger order for elements appearing on initial page load:

```
Load Sequence (Homepage):
  0ms    — Navbar fades in (opacity 0→1, 200ms, ease-out)
  100ms  — Hero headline slides up from 30px below (300ms, ease-out)
  200ms  — Hero subheadline slides up from 20px below (300ms, ease-out)
  350ms  — Hero CTA buttons fade in and scale from 0.95→1 (250ms, ease-out)
  500ms  — Hero image/illustration fades in from right 40px (400ms, ease-out)
  700ms  — Background gradient or decorative elements fade in (500ms, ease-out)
```

**Rules:**
- Total load sequence should complete within 1.2s
- Stagger between elements: 100-150ms
- Critical content (headline, CTA) loads first
- Decorative elements load last
- Never block interaction waiting for animations

### 2. Scroll Behaviors

**Parallax:**
```
Hero background image: scrolls at 0.5x speed (50% parallax)
Floating decorative elements: scroll at 0.3x speed
Section divider graphics: scroll at 0.7x speed
```

**Scroll reveal (per section):**
```
On scroll into viewport (threshold: 20%):
  Section heading: fade up from 20px, 400ms, ease-out
  Content cards: stagger fade up, 300ms each, 100ms delay between cards
  Images: fade in + subtle scale from 0.98→1, 500ms, ease-out
  Stats/numbers: count up animation from 0 to target, 1000ms, ease-out
```

**Pin effects:**
```
Navbar: At scroll > 80px, shrink from 80px to 60px height, add background blur and shadow. Transition: 300ms ease-out.
Sidebar (dashboard): Pin to left edge, independent scroll from main content.
```

**Reveal patterns:**
```
Feature sections: Alternate left/right slide-in as user scrolls
Timeline items: Fade in sequentially as they enter viewport
Gallery images: Masonry-style stagger reveal
```

### 3. Hover States

**Cards:**
```
Default → Hover:
  Transform: translateY(-4px)
  Box-shadow: 0 4px 12px rgba(0,0,0,0.05) → 0 20px 40px rgba(0,0,0,0.1)
  Duration: 200ms
  Easing: ease-out
  Optional: border-color transition to primary
```

**Buttons:**
```
Primary button:
  Default → Hover: background darkens 10%, subtle scale(1.02)
  Hover → Active: scale(0.98), instant
  Duration: 150ms ease-out

Ghost button:
  Default → Hover: background appears (primary-50), text color to primary-600
  Duration: 150ms ease-out

Icon button:
  Default → Hover: background circle appears, icon color changes
  Duration: 150ms ease-out
```

**Links:**
```
Text link:
  Default → Hover: underline slides in from left to right
  Duration: 200ms ease-out
  Alternative: highlight/background color sweep
```

**Images:**
```
Portfolio/gallery image:
  Default → Hover: scale(1.05) with overflow hidden, overlay fades in (dark 60% opacity), text label appears
  Duration: 300ms ease-out
```

**Navigation items:**
```
Nav link:
  Default → Hover: underline indicator slides in, text color transitions
  Active: indicator stays, bold weight
  Duration: 200ms ease-out
```

### 4. Click Transitions

**Page transitions:**
```
Route change:
  Current page: fade out + slide left 20px (200ms, ease-in)
  New page: fade in + slide from right 20px (300ms, ease-out)
  Total transition: ~400ms

Alternative (crossfade):
  Current page: opacity 1→0 (200ms)
  New page: opacity 0→1 (200ms)
  Overlap: 100ms crossfade
```

**Modal open:**
```
Backdrop: opacity 0→1, black 50% (200ms, ease-out)
Modal: scale(0.95)→scale(1) + opacity 0→1 (250ms, cubic-bezier(0.34, 1.56, 0.64, 1))
Close: reverse at 150ms ease-in
```

**Dropdown open:**
```
Open: scaleY(0.95)→scaleY(1) + opacity 0→1, transform-origin top (200ms, ease-out)
Close: opacity 1→0 (150ms, ease-in)
Items: stagger fade in, 30ms between items
```

**Accordion expand:**
```
Open: height 0→auto with overflow hidden (300ms, ease-out)
Arrow/indicator: rotate 0→180deg (200ms, ease-out)
Close: reverse at 250ms ease-in
```

**Tab switch:**
```
Active indicator: slide to new position (250ms, ease-in-out)
Old content: fade out (100ms)
New content: fade in (200ms, 50ms delay)
```

### 5. Gesture Support

**Swipe (carousels, mobile):**
```
Carousel swipe:
  Follow finger with 1:1 tracking
  Release: snap to nearest slide (300ms, spring easing)
  Overscroll: elastic resistance at edges (rubber band)
  Velocity-based: fast swipe skips to next, slow swipe returns

Threshold: 50px or 20% of container width
```

**Pull to refresh:**
```
Pull: indicator appears and rotates with pull distance
Threshold: 80px pull distance to trigger
Release above threshold: snap to refresh position, show spinner
Release below threshold: snap back to top
Refresh complete: content pushes down, indicator fades out
```

**Pinch (images):**
```
Image zoom:
  Pinch: scale follows gesture 1:1
  Min scale: 1x (no zoom out beyond original)
  Max scale: 3x
  Double-tap: toggle between 1x and 2x
  Release: snap to nearest whole scale or return to 1x if close
```

## Technical Specifications

### Easing Functions

| Name | Value | Use Case |
|------|-------|----------|
| ease-out | cubic-bezier(0.0, 0.0, 0.2, 1.0) | Entrances, hover |
| ease-in | cubic-bezier(0.4, 0.0, 1.0, 1.0) | Exits |
| ease-in-out | cubic-bezier(0.4, 0.0, 0.2, 1.0) | Movement, position changes |
| spring | cubic-bezier(0.34, 1.56, 0.64, 1.0) | Playful, bouncy elements |
| sharp | cubic-bezier(0.4, 0.0, 0.6, 1.0) | Quick, snappy interactions |

### Duration Guidelines

| Type | Duration | Example |
|------|----------|---------|
| Instant feedback | 100ms | Button active state |
| Quick transition | 150-200ms | Hover states, tooltips |
| Standard transition | 250-300ms | Modal open, tab switch |
| Complex animation | 400-500ms | Page transition, reveal |
| Scroll animation | 500-800ms | Parallax, count-up |
| Stagger delay | 50-150ms | Between staggered items |

### Performance Considerations

- **GPU-accelerated properties only:** `transform`, `opacity`. Avoid animating `width`, `height`, `top`, `left`, `margin`, `padding`.
- **`will-change`:** Apply to elements that will animate, remove after animation completes.
- **`prefers-reduced-motion`:** Provide fallback — instant state changes instead of animations.
- **60fps target:** Keep animations under 16ms per frame. Test on low-end devices.
- **Composite layers:** Limit to ~10 simultaneously animating elements.

## Natural Language Descriptions for Figma Make

When describing animations to Figma Make, use this format:

```
"On scroll: The feature cards fade in one by one from below, each rising 20px and becoming fully visible over 0.3 seconds with a 0.1 second delay between each card. Use a gentle ease-out curve."

"On hover: The card lifts up 4px with an expanding shadow underneath, transitioning smoothly over 0.2 seconds."

"On page load: The navbar appears first, then the headline text slides up smoothly, followed by the subtitle, and finally the CTA buttons scale in with a slight bounce effect. The entire sequence takes about 1 second."
```

## Next Phase

Pass animation specs to [Phase 7 — Responsive Behavior Strategy](phase-7-responsive-strategy.md).
