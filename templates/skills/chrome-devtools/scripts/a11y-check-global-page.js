// Check global page accessibility requirements.
// Verifies: lang attribute, title, viewport meta, prefers-reduced-motion.
// Use via evaluate_script in Chrome DevTools MCP.
(() => {
  const html = document.documentElement;
  const checks = {};

  // 1. lang attribute on <html>
  const lang = html.getAttribute('lang');
  checks.lang = {
    pass: !!lang,
    value: lang || null,
    issue: lang ? null : 'Missing lang attribute on <html>. Screen readers need this for pronunciation.',
  };

  // 2. <title> element
  const title = document.title;
  checks.title = {
    pass: !!title?.trim(),
    value: title || null,
    issue: title?.trim() ? null : 'Missing or empty <title>. Required for page context.',
  };

  // 3. Viewport meta
  const viewport = document.querySelector('meta[name="viewport"]');
  const viewportContent = viewport?.getAttribute('content') || '';
  const disablesZoom =
    /user-scalable\s*=\s*no/i.test(viewportContent) ||
    /maximum-scale\s*=\s*1([^.]|$)/i.test(viewportContent);
  checks.viewport = {
    pass: !disablesZoom,
    value: viewportContent || null,
    issue: disablesZoom
      ? 'Viewport disables user scaling. Users with low vision need pinch-to-zoom.'
      : null,
  };

  // 4. prefers-reduced-motion support
  let hasReducedMotion = false;
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.conditionText?.includes('prefers-reduced-motion')) {
          hasReducedMotion = true;
          break;
        }
      }
    } catch (e) {
      // Cross-origin stylesheet, skip
    }
    if (hasReducedMotion) break;
  }
  checks.reducedMotion = {
    pass: hasReducedMotion,
    value: hasReducedMotion ? 'Found prefers-reduced-motion media query' : null,
    issue: hasReducedMotion
      ? null
      : 'No prefers-reduced-motion media query detected. Consider supporting reduced motion preferences.',
  };

  const passed = Object.values(checks).filter((c) => c.pass).length;
  const total = Object.keys(checks).length;
  return { passed, total, checks };
})();
