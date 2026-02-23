// Find form inputs missing associated labels.
// Use via evaluate_script in Chrome DevTools MCP.
(() => {
  const inputs = document.querySelectorAll('input, select, textarea');
  const orphaned = [];
  for (const input of inputs) {
    if (input.type === 'hidden') continue;
    const hasLabel =
      input.labels?.length > 0 ||
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      input.getAttribute('title') ||
      input.placeholder;
    if (!hasLabel) {
      orphaned.push({
        tag: input.tagName.toLowerCase(),
        type: input.type || null,
        id: input.id || null,
        name: input.name || null,
        outerHTML: input.outerHTML.slice(0, 200),
      });
    }
  }
  return {
    total: inputs.length,
    orphaned: orphaned.length,
    elements: orphaned,
  };
})();
