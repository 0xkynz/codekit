// Runs an automated "smoke test" suite against the current DOM.
// Checks for basic page health indicators without needing a testing framework.
// Use via evaluate_script in Chrome DevTools MCP.
(async () => {
  const assertions = [];
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  // Helper to assert conditions
  const assert = (name, condition, failureMessage, isWarning = false) => {
    const passed = !!condition;
    if (passed) {
      results.passed++;
      results.details.push({ test: name, status: 'PASS' });
    } else if (isWarning) {
      results.warnings++;
      results.details.push({ test: name, status: 'WARN', message: failureMessage });
    } else {
      results.failed++;
      results.details.push({ test: name, status: 'FAIL', message: failureMessage });
    }
  };

  // --- 1. Basic Structure Assertions ---
  assert('Page Title', document.title && document.title.length > 0, 'Document has no title');
  
  assert('Main Content', 
    document.querySelector('main') || document.querySelector('[role="main"]') || document.querySelector('#main'), 
    'No <main> tag or main role found', true);

  assert('H1 Present', document.querySelector('h1'), 'No <h1> tag found on the page', true);

  // --- 2. Resource Assertions ---
  // Check for broken images
  const images = Array.from(document.images);
  const brokenImages = images.filter(img => 
    img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)
  );
  assert('Images Loaded', brokenImages.length === 0, `${brokenImages.length} image(s) appear broken/failed to load`);

  // Check failed network requests if performance API is available
  if (window.performance && window.performance.getEntriesByType) {
    // We can't definitively check 404s from standard PerformanceResourceTiming without server headers,
    // but some browsers put it in nextHopProtocol or size. A common basic check is JS/CSS that took unusually long
    // or failed to parse. Direct error checking usually requires DevTools Network tab.
    // So we'll provide a warning check if resource count is unexpectedly 0 (indicating bad tracking or offline)
    const resources = window.performance.getEntriesByType('resource');
    assert('Network Tracking', resources.length > 0, 'No network resources tracked by Performance API', true);
  }

  // --- 3. Viewport / Accessibility Assertions ---
  // Ensure the page is responsive (has viewport meta tag)
  const metaViewport = document.querySelector('meta[name="viewport"]');
  assert('Responsive Viewport', metaViewport && metaViewport.content.includes('width=device-width'), 'Missing proper mobile viewport meta tag');

  // --- 4. Obvious Errors in DOM ---
  // Sometimes JS errors are output visually in frameworks (like Next.js/React error overlays)
  const errorOverlays = document.querySelectorAll('[class*="error-overlay"], [id*="webpack-dev-server-client-overlay"]');
  assert('No Error Overlays', errorOverlays.length === 0, 'A visual error overlay was detected on the page');

  return {
    summary: {
      total: results.passed + results.failed + results.warnings,
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      overallStatus: results.failed === 0 ? 'SUCCESS' : 'FAILURE'
    },
    tests: results.details
  };
})();
