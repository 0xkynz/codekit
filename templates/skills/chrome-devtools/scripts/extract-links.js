// Extracts all links from the page and categorizes them.
// Use via evaluate_script in Chrome DevTools MCP.
(() => {
  const links = Array.from(document.querySelectorAll('a'));
  const currentHost = window.location.hostname;
  
  const extractedLinks = [];
  const summary = {
    total: links.length,
    internal: 0,
    external: 0,
    missingHref: 0,
    mailto: 0,
    tel: 0,
    javascript: 0,
    hash: 0
  };

  links.forEach(link => {
    const href = link.getAttribute('href');
    const text = link.textContent.trim().substring(0, 100);
    const hasTargetBlank = link.getAttribute('target') === '_blank';
    
    const linkData = {
      text: text || '[No Text]',
      href: href,
      hasTargetBlank
    };

    if (!href) {
      summary.missingHref++;
      linkData.type = 'missing_href';
    } else if (href.startsWith('mailto:')) {
      summary.mailto++;
      linkData.type = 'mailto';
    } else if (href.startsWith('tel:')) {
      summary.tel++;
      linkData.type = 'tel';
    } else if (href.startsWith('javascript:')) {
      summary.javascript++;
      linkData.type = 'javascript';
    } else if (href.startsWith('#')) {
      summary.hash++;
      linkData.type = 'hash';
    } else {
      try {
        // Try to parse as absolute URL first
        const url = new URL(href, window.location.href);
        if (url.hostname === currentHost || url.hostname === '') {
          summary.internal++;
          linkData.type = 'internal';
        } else {
          summary.external++;
          linkData.type = 'external';
        }
        linkData.absoluteUrl = url.href;
      } catch (e) {
        // Fallback for weird URLs
        linkData.type = 'unknown';
      }
    }
    
    extractedLinks.push(linkData);
  });

  return {
    summary,
    // Return sample of links to avoid max output limit, prioritize external and missing
    links: {
      missingHref: extractedLinks.filter(l => l.type === 'missing_href'),
      external: extractedLinks.filter(l => l.type === 'external').slice(0, 50),
      internal: extractedLinks.filter(l => l.type === 'internal').slice(0, 50),
      other: extractedLinks.filter(l => !['missing_href', 'external', 'internal'].includes(l.type)).slice(0, 20)
    }
  };
})();
