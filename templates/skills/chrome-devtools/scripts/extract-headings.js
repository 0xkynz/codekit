// Extracts the heading hierarchy of the page.
// Use via evaluate_script in Chrome DevTools MCP.
(() => {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  
  const structure = headings.map(h => {
    const level = parseInt(h.tagName.substring(1), 10);
    return {
      tag: h.tagName.toLowerCase(),
      level: level,
      text: h.textContent.replace(/\s+/g, ' ').trim().substring(0, 150),
      id: h.id || null
    };
  });

  // Calculate stats
  const stats = {
    h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0, total: 0
  };
  
  // Detect structural issues (e.g., jumping from H1 to H3)
  const issues = [];
  let prevLevel = 0;

  structure.forEach(h => {
    stats[h.tag]++;
    stats.total++;
    
    // Skipping levels check (except for the first heading where prevLevel is 0)
    if (prevLevel > 0 && h.level > prevLevel + 1) {
      issues.push(`Skipped heading level: jumping from H${prevLevel} to H${h.level} ("${h.text}")`);
    }
    prevLevel = h.level;
  });

  if (stats.h1 === 0) issues.push('No H1 heading found on the page');
  if (stats.h1 > 1) issues.push('Multiple H1 headings found (usually better to have just one)');

  // Format as a simple text tree for easy reading in output
  const treeText = structure.map(h => {
    const indent = '  '.repeat(h.level - 1);
    return `${indent}${h.tag.toUpperCase()}: ${h.text}`;
  }).join('\n');

  return {
    stats,
    issues,
    treeText,
    headings: structure
  };
})();
