// Extracts basic performance timing metrics.
// Use via evaluate_script in Chrome DevTools MCP.
(() => {
  if (!window.performance || !window.performance.timing) {
    return { error: 'Performance Timing API not available' };
  }

  const timing = window.performance.timing;
  const now = new Date().getTime();
  
  // Calculate key metrics (in ms)
  const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
  const connectTime = timing.connectEnd - timing.connectStart;
  const ttfb = timing.responseStart - timing.navigationStart;
  const downloadTime = timing.responseEnd - timing.responseStart;
  const domInteractive = timing.domInteractive - timing.navigationStart;
  const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
  const pageLoadTime = timing.loadEventEnd > 0 
    ? timing.loadEventEnd - timing.navigationStart 
    : now - timing.navigationStart;

  // Modern navigation timing if available
  let paintMetrics = [];
  if (window.performance.getEntriesByType) {
    const paintEntries = window.performance.getEntriesByType('paint');
    paintMetrics = paintEntries.map(entry => ({
      name: entry.name,
      timeMs: Math.round(entry.startTime)
    }));
  }

  return {
    metrics: {
      dnsLookupMs: Math.max(0, dnsTime),
      connectionMs: Math.max(0, connectTime),
      timeToFirstByteMs: Math.max(0, ttfb),
      downloadMs: Math.max(0, downloadTime),
      domInteractiveMs: Math.max(0, domInteractive),
      domContentLoadedMs: Math.max(0, domContentLoaded),
      pageLoadMs: Math.max(0, pageLoadTime)
    },
    paintMetrics: paintMetrics,
    rawTiming: timing.toJSON ? timing.toJSON() : {}
  };
})();
