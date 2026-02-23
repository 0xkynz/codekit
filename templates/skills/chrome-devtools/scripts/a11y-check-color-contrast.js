// Simplified color contrast check against WCAG AA ratios.
// Checks text elements for foreground/background contrast.
// For production-grade auditing, inject axe-core instead.
// Use via evaluate_script in Chrome DevTools MCP.
(() => {
  function luminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function parseColor(str) {
    const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3] };
  }

  function contrastRatio(fg, bg) {
    const l1 = luminance(fg.r, fg.g, fg.b) + 0.05;
    const l2 = luminance(bg.r, bg.g, bg.b) + 0.05;
    return l1 > l2 ? l1 / l2 : l2 / l1;
  }

  const textNodes = document.querySelectorAll(
    'p, span, a, button, label, h1, h2, h3, h4, h5, h6, li, td, th, dt, dd, figcaption'
  );
  const issues = [];

  for (const el of textNodes) {
    if (!el.textContent?.trim()) continue;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;

    const fg = parseColor(style.color);
    const bg = parseColor(style.backgroundColor);
    if (!fg || !bg) continue;
    // Skip transparent backgrounds (can't determine actual bg)
    if (style.backgroundColor === 'rgba(0, 0, 0, 0)') continue;

    const ratio = contrastRatio(fg, bg);
    const fontSize = parseFloat(style.fontSize);
    const isBold = parseInt(style.fontWeight) >= 700 || style.fontWeight === 'bold';
    const isLarge = fontSize >= 24 || (fontSize >= 18.66 && isBold);
    const threshold = isLarge ? 3.0 : 4.5;

    if (ratio < threshold) {
      issues.push({
        tag: el.tagName.toLowerCase(),
        text: el.textContent.trim().slice(0, 60),
        ratio: Math.round(ratio * 100) / 100,
        required: threshold,
        fontSize: `${fontSize}px`,
        fg: style.color,
        bg: style.backgroundColor,
      });
    }
  }

  return { scanned: textNodes.length, issues: issues.length, elements: issues };
})();
