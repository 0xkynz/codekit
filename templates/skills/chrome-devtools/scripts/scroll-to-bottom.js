// Smoothly scrolls to the bottom of the page to trigger lazy loading.
// Use via evaluate_script in Chrome DevTools MCP.
// It returns a promise that resolves when scrolling is complete.
(async () => {
  return new Promise((resolve) => {
    let totalHeight = 0;
    const distance = 100;
    const maxScrolls = 250; // Safety limit
    let scrolls = 0;
    
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      const scrollHeight = document.body.scrollHeight;
      window.scrollBy(0, distance);
      totalHeight += distance;
      scrolls++;

      if (totalHeight >= scrollHeight || scrolls >= maxScrolls) {
        clearInterval(timer);
        resolve({
          success: true,
          scrolledPixels: totalHeight,
          totalScrollHeight: scrollHeight,
          maxScrollsReached: scrolls >= maxScrolls,
          durationMs: Date.now() - startTime
        });
      }
    }, 50); // Small interval for smooth scrolling, giving time for lazy loads
  });
})();
