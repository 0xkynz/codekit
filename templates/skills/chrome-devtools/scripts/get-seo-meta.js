// Extracts common SEO metadata tags.
// Use via evaluate_script in Chrome DevTools MCP.
(() => {
  const getMetaContent = (query) => {
    const el = document.querySelector(query);
    return el ? el.getAttribute('content') || '' : null;
  };

  const getLinkHref = (query) => {
    const el = document.querySelector(query);
    return el ? el.getAttribute('href') || '' : null;
  };

  // Extract all headings for structure analysis
  const h1Elements = Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim());

  // Count images with/without alt text
  const images = Array.from(document.querySelectorAll('img'));
  const missingAltImages = images.filter(img => !img.hasAttribute('alt')).map(img => img.src.substring(0, 100));

  const seoData = {
    title: document.title,
    titleLength: document.title.length,
    description: getMetaContent('meta[name="description"]'),
    descriptionLength: getMetaContent('meta[name="description"]')?.length || 0,
    canonical: getLinkHref('link[rel="canonical"]'),
    robots: getMetaContent('meta[name="robots"]'),
    
    // Open Graph
    ogTitle: getMetaContent('meta[property="og:title"]'),
    ogDescription: getMetaContent('meta[property="og:description"]'),
    ogImage: getMetaContent('meta[property="og:image"]'),
    ogUrl: getMetaContent('meta[property="og:url"]'),
    
    // Twitter
    twitterCard: getMetaContent('meta[name="twitter:card"]'),
    twitterTitle: getMetaContent('meta[name="twitter:title"]'),
    twitterDescription: getMetaContent('meta[name="twitter:description"]'),
    twitterImage: getMetaContent('meta[name="twitter:image"]'),
    
    // Content structure
    h1Count: h1Elements.length,
    h1Contents: h1Elements,
    wordCount: document.body.innerText.split(/\s+/).length,
    
    // Images
    imageAltStats: {
      total: images.length,
      missingAlt: missingAltImages.length,
    }
  };

  // Identify common basic issues
  const issues = [];
  if (!seoData.title) issues.push('Missing Title tag');
  else if (seoData.titleLength < 30) issues.push('Title may be too short (< 30 chars)');
  else if (seoData.titleLength > 65) issues.push('Title may be too long (> 65 chars)');

  if (!seoData.description) issues.push('Missing Meta Description');
  else if (seoData.descriptionLength < 50) issues.push('Meta Description may be too short (< 50 chars)');
  else if (seoData.descriptionLength > 160) issues.push('Meta Description may be too long (> 160 chars)');

  if (seoData.h1Count === 0) issues.push('Missing H1 tag');
  else if (seoData.h1Count > 1) issues.push('Multiple H1 tags found (may be intentional in HTML5, but often an issue)');

  if (seoData.imageAltStats.missingAlt > 0) issues.push(`${seoData.imageAltStats.missingAlt} images missing alt attributes`);

  return {
    url: window.location.href,
    metadata: seoData,
    detectedIssues: issues
  };
})();
