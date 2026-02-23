// Analyzes z-index stacking contexts to help debug overlapping elements.
// Finds elements with explicit z-index and their computed positioning.
// Use via evaluate_script in Chrome DevTools MCP.
(() => {
  const elements = Array.from(document.querySelectorAll('*'));
  const zIndexedElements = [];

  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    const zIndex = style.zIndex;
    const position = style.position;
    const opacity = style.opacity;
    const transform = style.transform;
    
    // An element establishes a stacking context if:
    // - position is relative/absolute and z-index is not auto
    // - position is fixed or sticky
    // - opacity < 1
    // - transform is not none
    // - and several other CSS properties
    let createsStackingContext = false;
    let stackingContextReason = [];

    if (position !== 'static' && zIndex !== 'auto') {
      createsStackingContext = true;
      stackingContextReason.push('positioned with z-index');
    }
    if (position === 'fixed' || position === 'sticky') {
      createsStackingContext = true;
      stackingContextReason.push(`position: ${position}`);
    }
    if (opacity !== '1') {
      createsStackingContext = true;
      stackingContextReason.push('opacity < 1');
    }
    if (transform !== 'none') {
      createsStackingContext = true;
      stackingContextReason.push('transform != none');
    }

    if (zIndex !== 'auto' && zIndex !== '0' || createsStackingContext) {
      zIndexedElements.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: el.className || null,
        computedZIndex: zIndex,
        position: position,
        createsStackingContext: createsStackingContext,
        stackingReasons: stackingContextReason,
        dimensions: {
          width: el.offsetWidth,
          height: el.offsetHeight
        },
        snippet: el.outerHTML.substring(0, 100)
      });
    }
  });

  // Sort by z-index descending (handling 'auto' and string conversions)
  zIndexedElements.sort((a, b) => {
    const zA = a.computedZIndex === 'auto' ? 0 : parseInt(a.computedZIndex, 10);
    const zB = b.computedZIndex === 'auto' ? 0 : parseInt(b.computedZIndex, 10);
    return zB - zA;
  });

  const highZIndexCount = zIndexedElements.filter(el => {
    const z = parseInt(el.computedZIndex, 10);
    return !isNaN(z) && z > 1000;
  }).length;

  return {
    summary: {
      totalFound: zIndexedElements.length,
      warningHighZIndexCount: highZIndexCount,
      stackingContextRootsCount: zIndexedElements.filter(e => e.createsStackingContext).length
    },
    topZIndexElements: zIndexedElements.filter(e => e.computedZIndex !== 'auto').slice(0, 30),
    stackingContexts: zIndexedElements.filter(e => e.createsStackingContext).slice(0, 20)
  };
})();
