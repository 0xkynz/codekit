// Attempts to capture Cumulative Layout Shifts (CLS) using PerformanceObserver.
// NOTE: Must be injected early or run while interacting with the page.
// Returns currently buffered layout shift entries.
// Use via evaluate_script in Chrome DevTools MCP.
(async () => {
  return new Promise((resolve) => {
    if (!window.PerformanceObserver || !PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      return resolve({
        error: "Layout Shift API is not supported in this browser."
      });
    }

    try {
      // Get all buffered layout-shift entries that occurred before this script ran
      const entries = performance.getEntriesByType('layout-shift');
      
      let totalCLS = 0;
      const shifts = [];

      entries.forEach(entry => {
        // Only count shifts that didn't occur shortly after user input
        if (!entry.hadRecentInput) {
          totalCLS += entry.value;
          
          const shiftData = {
            value: entry.value,
            timeMs: entry.startTime,
            sources: []
          };

          if (entry.sources) {
            entry.sources.forEach(source => {
              const el = source.node;
              shiftData.sources.push({
                nodeName: el ? el.nodeName.toLowerCase() : 'unknown',
                id: el ? el.id : null,
                className: el ? el.className : null,
                previousRect: source.previousRect,
                currentRect: source.currentRect
              });
            });
          }
          
          shifts.push(shiftData);
        }
      });

      resolve({
        summary: {
          totalCumulativeLayoutShift: totalCLS,
          shiftEventsCount: shifts.length,
          assessment: totalCLS < 0.1 ? 'Good' : totalCLS < 0.25 ? 'Needs Improvement' : 'Poor'
        },
        shifts: shifts.sort((a, b) => b.value - a.value) // Sort largest shifts first
      });

    } catch (e) {
      resolve({
        error: "Failed to read layout shifts: " + e.message
      });
    }
  });
})();
