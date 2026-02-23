# Chrome DevTools MCP Accessibility Testing

Accessibility (a11y) debugging and auditing based on web.dev guidelines using Chrome DevTools MCP tools.

## Core Concepts

**Accessibility Tree vs DOM**: Visually hiding an element (e.g., CSS `opacity: 0`) behaves differently for screen readers than `display: none` or `aria-hidden="true"`. The `take_snapshot` tool returns the accessibility tree — what assistive technologies "see" — making it the most reliable source of truth for semantic structure.

**Reading web.dev docs**: Append `.md.txt` to any web.dev URL for clean markdown (e.g., `https://web.dev/articles/accessible-tap-targets.md.txt`).

## Workflow Patterns

### 1. Browser Issues & Audits

Chrome automatically checks for common a11y problems. Check native audits first:

```
list_console_messages with types: ["issue"], includePreservedMessages: true
```

This reveals missing labels, invalid ARIA attributes, and other critical errors without manual investigation.

### 2. Semantics & Structure

1. Navigate to the page
2. `take_snapshot` to capture the accessibility tree
3. **Check heading levels**: Ensure h1-h6 are logical and don't skip levels
4. **Verify reading order**: Compare `take_snapshot` (DOM order) with `take_screenshot` (visual layout) to catch CSS-reordered content

### 3. Labels, Forms & Text Alternatives

1. Locate buttons, inputs, images in `take_snapshot` output
2. Ensure interactive elements have accessible names (buttons shouldn't be empty)
3. **Check orphaned inputs**: Use [a11y-check-orphaned-inputs.js](../scripts/a11y-check-orphaned-inputs.js) via `evaluate_script` to find inputs missing labels
4. Check images for `alt` text

### 4. Focus & Keyboard Navigation

Test keyboard traps and focus management:

1. Use `press_key` with `"Tab"` or `"Shift+Tab"` to move focus
2. `take_snapshot` to capture updated accessibility tree
3. Locate the focused element to verify focus moved correctly
4. If a modal opens, verify focus traps within it until closed

### 5. Tap Targets

Tap targets should be at least 48x48 pixels with sufficient spacing. Use [a11y-check-tap-targets.js](../scripts/a11y-check-tap-targets.js) via `evaluate_script` — pass the element's `uid` from snapshot.

### 6. Color Contrast

1. `list_console_messages` with `types: ["issue"]` — look for "Low Contrast" issues
2. If native audits don't report (e.g., headless mode), use [a11y-check-color-contrast.js](../scripts/a11y-check-color-contrast.js) via `evaluate_script`
3. Test against WCAG AA: 4.5:1 for normal text, 3:1 for large text

**Note**: The contrast script uses a simplified algorithm. For production-grade auditing, inject `axe-core`.

### 7. Global Page Checks

Use [a11y-check-global-page.js](../scripts/a11y-check-global-page.js) via `evaluate_script` to verify:
- `lang` attribute on `<html>` (screen readers need this for pronunciation)
- `<title>` element (required for context)
- Viewport meta (check for `user-scalable=no` — bad practice)
- `prefers-reduced-motion` media query support

## Troubleshooting

If automated scripts return unexpected results:
- **Visual inspection fallback**: Use `take_screenshot` to capture the element. While models can't measure exact contrast ratios from images, they can assess legibility and identify obvious issues.
- **Complex backgrounds**: Scripts can't determine contrast over gradients or background images. Use visual inspection in these cases.
