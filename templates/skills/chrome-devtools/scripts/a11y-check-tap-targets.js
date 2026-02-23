// Check tap target sizes (minimum 48x48px per WCAG).
// Pass a uid from take_snapshot, or omit to scan all interactive elements.
// Use via evaluate_script in Chrome DevTools MCP.
((uid) => {
  const MIN_SIZE = 48;
  const MIN_SPACING = 8;
  const selectors = 'a, button, input, select, textarea, [role="button"], [role="link"], [tabindex]';
  const elements = uid
    ? [document.querySelector(`[data-uid="${uid}"]`)].filter(Boolean)
    : [...document.querySelectorAll(selectors)];

  const issues = [];
  const rects = elements.map((el) => ({ el, rect: el.getBoundingClientRect() }));

  for (const { el, rect } of rects) {
    if (rect.width === 0 && rect.height === 0) continue;
    const problems = [];
    if (rect.width < MIN_SIZE) problems.push(`width ${Math.round(rect.width)}px < ${MIN_SIZE}px`);
    if (rect.height < MIN_SIZE) problems.push(`height ${Math.round(rect.height)}px < ${MIN_SIZE}px`);

    // Check spacing to nearest sibling interactive element
    for (const { el: other, rect: otherRect } of rects) {
      if (other === el || (otherRect.width === 0 && otherRect.height === 0)) continue;
      const dx = Math.max(0, Math.max(rect.left, otherRect.left) - Math.min(rect.right, otherRect.right));
      const dy = Math.max(0, Math.max(rect.top, otherRect.top) - Math.min(rect.bottom, otherRect.bottom));
      const gap = Math.sqrt(dx * dx + dy * dy);
      if (gap < MIN_SPACING && gap > 0) {
        problems.push(`spacing ${Math.round(gap)}px to nearby target`);
        break;
      }
    }

    if (problems.length > 0) {
      issues.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 60),
        size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
        problems,
      });
    }
  }
  return { scanned: elements.length, issues: issues.length, elements: issues };
})();
