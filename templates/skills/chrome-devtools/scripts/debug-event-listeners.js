// Summarizes interactive elements and identifies potential event listeners.
// Since standard DOM APIs don't expose bound JS event listeners easily,
// this script finds elements with inline handlers, framework hints, and 
// natural interactive elements.
// Use via evaluate_script in Chrome DevTools MCP.
(() => {
  const elements = Array.from(document.querySelectorAll('*'));
  
  const stats = {
    totalElements: elements.length,
    inlineHandlers: 0,
    frameworkHints: 0,
    interactiveTags: 0
  };

  const commonEvents = ['onclick', 'onchange', 'onmouseover', 'onmouseout', 'onkeydown', 'onkeyup', 'onsubmit'];
  const frameworkAttributes = ['data-reactroot', 'data-v-', 'ng-version', 'data-svelte'];
  
  const interactiveNodes = [];

  elements.forEach(el => {
    let hasInline = false;
    let hasFrameworkHint = false;
    const isInteractiveTag = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'FORM'].includes(el.tagName);

    // Check inline event handlers
    commonEvents.forEach(evt => {
      if (el.hasAttribute(evt)) {
        hasInline = true;
      }
    });

    // Check framework specific hints
    if (el.dataset) {
      Object.keys(el.dataset).forEach(key => {
        if (key.includes('react') || key.includes('vue') || key.includes('ng')) {
          hasFrameworkHint = true;
        }
      });
    }

    if (hasInline) stats.inlineHandlers++;
    if (hasFrameworkHint) stats.frameworkHints++;
    if (isInteractiveTag) stats.interactiveTags++;

    // Collect interesting elements for the report
    if (hasInline || (isInteractiveTag && !['A', 'FORM'].includes(el.tagName))) {
      interactiveNodes.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: el.className || null,
        type: el.type || null,
        text: el.textContent.trim().substring(0, 50),
        hasInlineHandler: hasInline,
        attributes: Array.from(el.attributes)
          .filter(a => a.name.startsWith('on') || a.name.startsWith('data-'))
          .map(a => `${a.name}="${a.value.substring(0, 20)}"`)
      });
    }
  });

  return {
    summary: stats,
    notes: [
      "Standard DOM APIs cannot perfectly extract event listeners added via JavaScript (addEventListener).",
      "This script identifies inline handlers (onclick) and standard interactive elements.",
      "Use DevTools 'getEventListeners(node)' in the actual console for perfect extraction."
    ],
    interactiveElementsSample: interactiveNodes.slice(0, 100) // limit output size
  };
})();
