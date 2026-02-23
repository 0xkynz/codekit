---
title: QA & Optimization Checklist
impact: CRITICAL
tags: qa, performance, accessibility, seo, security, testing
---

# Phase 9 — QA & Optimization Checklist

**Role:** Act as a QA Engineer.

## Purpose

Review the website specification and implementation against performance, accessibility, SEO, security, browser compatibility, mobile optimization, and analytics requirements. Generate a punch list for the next Figma Make iteration.

## 1. Performance (Core Web Vitals)

### Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| Largest Contentful Paint (LCP) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| Interaction to Next Paint (INP) | ≤ 200ms | ≤ 500ms | > 500ms |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| First Contentful Paint (FCP) | ≤ 1.8s | ≤ 3.0s | > 3.0s |
| Time to First Byte (TTFB) | ≤ 800ms | ≤ 1.8s | > 1.8s |

### Checklist

- [ ] Images optimized (WebP/AVIF, proper sizing, lazy loading below fold)
- [ ] Fonts optimized (`font-display: swap`, preload critical fonts, subset if possible)
- [ ] JavaScript bundle < 200KB gzipped (code split routes)
- [ ] CSS critical path inlined, non-critical deferred
- [ ] No render-blocking resources
- [ ] Third-party scripts deferred or loaded async
- [ ] Server response time < 200ms (check hosting/CDN)
- [ ] Preconnect to required origins (`<link rel="preconnect">`)
- [ ] HTML/CSS/JS minified
- [ ] Gzip or Brotli compression enabled
- [ ] No layout shifts from dynamic content (reserve space for images, ads, embeds)
- [ ] Route-based code splitting implemented

## 2. Accessibility (WCAG 2.2 AA)

### Checklist

- [ ] All images have meaningful `alt` text (decorative images: `alt=""`)
- [ ] Color contrast ratios meet minimums (4.5:1 body text, 3:1 large text/UI)
- [ ] All interactive elements keyboard accessible (tab order logical)
- [ ] Focus indicators visible (2px outline, high contrast)
- [ ] Skip navigation link present ("Skip to main content")
- [ ] Headings follow hierarchy (H1 → H2 → H3, no skipping)
- [ ] Form inputs have associated `<label>` elements
- [ ] Form errors announced to screen readers (`aria-live`, `aria-describedby`)
- [ ] ARIA landmarks used (`main`, `nav`, `aside`, `footer`)
- [ ] Interactive elements have accessible names (buttons, links)
- [ ] Touch targets ≥ 44x44px
- [ ] `prefers-reduced-motion` respected (disable/reduce animations)
- [ ] `prefers-color-scheme` supported (dark/light mode)
- [ ] Language attribute set on `<html>` element
- [ ] No content accessible only via hover (provide alternatives)
- [ ] Video/audio have captions or transcripts
- [ ] No auto-playing media with sound

### Testing Tools
- axe DevTools (browser extension)
- Lighthouse accessibility audit
- NVDA/VoiceOver manual screen reader testing
- Keyboard-only navigation test

## 3. SEO

### Checklist

- [ ] Unique `<title>` per page (50-60 characters)
- [ ] Unique `<meta name="description">` per page (150-160 characters)
- [ ] Open Graph tags present (`og:title`, `og:description`, `og:image`, `og:url`)
- [ ] Twitter Card tags present (`twitter:card`, `twitter:title`, `twitter:image`)
- [ ] Canonical URLs set (`<link rel="canonical">`)
- [ ] Structured data (JSON-LD) for relevant content types:
  - Organization schema on homepage
  - Product schema on product pages
  - Article schema on blog posts
  - FAQ schema on FAQ sections
  - BreadcrumbList on pages with breadcrumbs
- [ ] XML sitemap generated and submitted
- [ ] `robots.txt` configured correctly
- [ ] Clean URL structure (descriptive slugs, no query params for content)
- [ ] Internal linking strategy (related content, breadcrumbs)
- [ ] 404 page with helpful navigation
- [ ] Redirect strategy for moved/removed pages (301 redirects)
- [ ] Image `alt` text descriptive and keyword-relevant
- [ ] Page load speed meets Core Web Vitals (see Performance section)
- [ ] Mobile-friendly (responsive, no horizontal scroll)

### Meta Template

```html
<head>
  <title>{Page Title} | {Site Name}</title>
  <meta name="description" content="{150-160 char description}">
  <link rel="canonical" href="https://example.com/{path}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="{Page Title}">
  <meta property="og:description" content="{Description}">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <meta property="og:url" content="https://example.com/{path}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{Page Title}">
  <meta name="twitter:description" content="{Description}">
  <meta name="twitter:image" content="https://example.com/twitter-image.jpg">

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "{Company Name}",
    "url": "https://example.com",
    "logo": "https://example.com/logo.png"
  }
  </script>
</head>
```

## 4. Security

### Checklist

- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] Content Security Policy (CSP) headers configured
- [ ] X-Frame-Options set to DENY or SAMEORIGIN
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer-Policy set (strict-origin-when-cross-origin)
- [ ] Permissions-Policy configured (camera, microphone, geolocation)
- [ ] Form inputs sanitized server-side (prevent XSS, SQL injection)
- [ ] CSRF protection on form submissions
- [ ] Rate limiting on auth endpoints and form submissions
- [ ] Sensitive data not exposed in client-side code (API keys, secrets)
- [ ] Environment variables used for configuration (not hardcoded)
- [ ] Dependencies audited for known vulnerabilities
- [ ] File upload validation (type, size, sanitization) if applicable
- [ ] Auth tokens stored securely (httpOnly cookies preferred)

## 5. Browser Compatibility

### Target Browsers

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Last 2 versions | Critical |
| Safari | Last 2 versions | Critical |
| Firefox | Last 2 versions | High |
| Edge | Last 2 versions | High |
| Safari iOS | Last 2 versions | Critical |
| Chrome Android | Last 2 versions | Critical |

### Checklist

- [ ] CSS features have adequate browser support (check caniuse.com)
- [ ] JavaScript features polyfilled or transpiled as needed
- [ ] Flexbox/Grid layouts render correctly across browsers
- [ ] Custom fonts load correctly (fallback fonts specified)
- [ ] Form elements styled consistently (or use native where appropriate)
- [ ] Scroll behavior works across browsers (smooth scroll polyfill if needed)
- [ ] SVGs render correctly (fallback for older browsers if needed)
- [ ] No vendor-specific CSS without standards equivalent

## 6. Mobile Optimization

### Checklist

- [ ] Viewport meta tag present: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] No horizontal scroll on any page
- [ ] Touch targets ≥ 44x44px with ≥ 8px spacing
- [ ] Input fields have appropriate `type` attributes (email, tel, url, number)
- [ ] Input font size ≥ 16px (prevents iOS zoom)
- [ ] Forms use `autocomplete` attributes
- [ ] Bottom navigation or hamburger menu for mobile
- [ ] Swipe gestures enabled for carousels and galleries
- [ ] Images served at appropriate sizes per device (`srcset` and `sizes`)
- [ ] Critical above-the-fold content loads without JavaScript
- [ ] Modals are full-screen on mobile
- [ ] No fixed-position elements blocking content on small screens
- [ ] Tested on real devices (not just browser DevTools)

## 7. Analytics Integration

### Events to Track

| Event | Trigger | Properties |
|-------|---------|------------|
| page_view | Route change | page_path, page_title, referrer |
| cta_click | CTA button click | button_text, location, destination |
| form_submit | Form submission | form_name, success/failure |
| signup | Account creation | method (email, google, github) |
| login | Successful login | method |
| product_view | Product page visit | product_id, product_name, price |
| add_to_cart | Add to cart click | product_id, quantity, price |
| purchase | Checkout complete | order_id, total, items_count |
| search | Search executed | query, results_count |
| filter_apply | Filter selected | filter_type, filter_value |
| scroll_depth | 25%, 50%, 75%, 100% | page_path, depth_percent |
| error | JavaScript error | error_message, stack, page |

### Goals/Funnels

Define conversion funnels:
1. **Signup funnel:** Landing → Pricing → Signup → Verification → Dashboard
2. **Purchase funnel:** Product List → Product Detail → Add to Cart → Checkout → Confirmation
3. **Contact funnel:** Landing → Contact Page → Form Submit → Thank You

### Implementation

```typescript
// Analytics wrapper
function track(event: string, properties?: Record<string, unknown>) {
  // Google Analytics 4
  gtag('event', event, properties);

  // Optional: Posthog, Mixpanel, Plausible, etc.
}

// Page view tracking (automatic with Next.js or router)
// Event tracking (on user interactions)
// Error tracking (global error boundary)
```

## Issue Report Format

For each issue found, report:

```
## Issue: [Short Description]

**Severity:** Critical | High | Medium | Low
**Location:** [Page] / [Section] / [Component]
**Category:** Performance | Accessibility | SEO | Security | Compatibility | Mobile | Analytics

**Description:**
[What the issue is and why it matters]

**Fix Recommendation:**
[Specific steps to resolve]

**Figma Make Action:**
[What to change in the next Figma Make iteration]
```

## Punch List Template

After completing the audit, generate a prioritized punch list:

| # | Severity | Category | Issue | Fix | Status |
|---|----------|----------|-------|-----|--------|
| 1 | Critical | Performance | LCP > 4s on mobile | Optimize hero image, add preload | Open |
| 2 | Critical | Accessibility | Missing alt text on 12 images | Add descriptive alt text | Open |
| 3 | High | SEO | No structured data on product pages | Add Product JSON-LD | Open |
| 4 | High | Security | No CSP headers | Configure Content-Security-Policy | Open |
| 5 | Medium | Mobile | CTA buttons too small (36px) | Increase to 44px minimum | Open |

## Iteration Loop

After generating the punch list:
1. Prioritize Critical and High issues
2. Create Figma Make prompts to address visual/layout issues
3. Update code for technical issues (SEO, security, performance)
4. Re-run QA checklist
5. Repeat until all Critical and High issues are resolved
