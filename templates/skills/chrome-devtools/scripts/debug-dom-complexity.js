// Analyzes the page for complex DOM structures and heavy elements.
// Deep nesting and massive text blocks can cause memory leaks and layout jank.
// Use via evaluate_script in Chrome DevTools MCP.
(() => {
  const allElements = document.querySelectorAll('*');
  const totalNodes = allElements.length;

  let maxDepth = 0;
  let deepestNode = null;
  
  const heavyNodes = [];

  allElements.forEach(el => {
    // Calculate depth
    let depth = 0;
    let curr = el;
    while (curr.parentElement) {
      depth++;
      curr = curr.parentElement;
    }
    
    if (depth > maxDepth) {
      maxDepth = depth;
      deepestNode = el;
    }

    // Calculate "heaviness" (direct text length + number of attributes)
    // Avoid counting children's text by creating a clone and clearing children
    let directTextLength = 0;
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        directTextLength += node.textContent.trim().length;
      }
    });

    if (directTextLength > 5000 || el.attributes.length > 20) {
      heavyNodes.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: el.className || null,
        depth: depth,
        directTextLength: directTextLength,
        attributeCount: el.attributes.length,
        snippet: el.outerHTML.substring(0, 150) + '...'
      });
    }
  });

  // Sort heavy nodes by text length
  heavyNodes.sort((a, b) => b.directTextLength - a.directTextLength);

  let deepestNodeInfo = null;
  if (deepestNode) {
    deepestNodeInfo = {
      tag: deepestNode.tagName.toLowerCase(),
      id: deepestNode.id || null,
      className: deepestNode.className || null,
      depth: maxDepth
    };
  }

  const issues = [];
  if (totalNodes > 1500) {
    issues.push(`DOM has ${totalNodes} nodes. Google recommends < 1,500 total nodes for optimal performance.`);
  }
  if (maxDepth > 32) {
    issues.push(`Maximum DOM depth is ${maxDepth}. Google recommends depth < 32.`);
  }

  return {
    summary: {
      totalElements: totalNodes,
      maxDepth: maxDepth,
      heavyElementCount: heavyNodes.length
    },
    issues: issues,
    deepestElement: deepestNodeInfo,
    heaviestElements: heavyNodes.slice(0, 20)
  };
})();
