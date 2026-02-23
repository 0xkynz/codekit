// Analyzes the current page and generates a starter Playwright test script.
// It finds key interactive elements and attempts to generate the most
// robust Playwright locators (e.g., getByTestId, getByRole, getByLabel).
// Use via evaluate_script in Chrome DevTools MCP.
(() => {
  const elements = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
  const testSteps = [];
  
  // Try to find the best locator for an element
  const getLocator = (el) => {
    // 1. data-testid is the gold standard
    if (el.dataset && el.dataset.testid) {
      return `page.getByTestId('${el.dataset.testid}')`;
    }
    
    const tag = el.tagName.toLowerCase();
    
    // 2. Form controls
    if (['input', 'textarea', 'select'].includes(tag)) {
      // Find associated label
      if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label && label.textContent.trim()) {
          return `page.getByLabel('${label.textContent.trim()}')`;
        }
      }
      
      if (el.getAttribute('aria-label')) {
         return `page.getByLabel('${el.getAttribute('aria-label')}')`;
      }

      if (el.placeholder) {
        return `page.getByPlaceholder('${el.placeholder}')`;
      }
    }

    // 3. Buttons and Links
    if (tag === 'button' || (tag === 'input' && (el.type === 'submit' || el.type === 'button'))) {
      const text = el.textContent.trim() || el.value || el.getAttribute('aria-label') || '';
      if (text) {
        return `page.getByRole('button', { name: '${text.substring(0, 30)}' })`;
      }
    }
    
    if (tag === 'a') {
      const text = el.textContent.trim();
      if (text && text.length < 50) {
        return `page.getByRole('link', { name: '${text}' })`;
      }
    }

    // Fallback to text
    if (el.textContent.trim() && el.textContent.trim().length < 40) {
       return `page.getByText('${el.textContent.trim()}')`;
    }

    return null; // Skip if we can't find a good locator
  };

  const url = window.location.href;
  const title = document.title;

  testSteps.push(`  // Navigate to the page`);
  testSteps.push(`  await page.goto('${url}');`);
  testSteps.push(`  `);
  testSteps.push(`  // Validate title`);
  testSteps.push(`  await expect(page).toHaveTitle('${title.replace(/'/g, "\\\\'")}');`);
  testSteps.push(`  `);

  // Track what we've seen to avoid duplicating simple "getByText" or similar
  const seenLocators = new Set();
  let interactCount = 0;

  elements.forEach(el => {
    if (interactCount >= 10) return; // Limit to 10 meaningful interactions for a starter script

    // Check if element is visible
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || el.offsetWidth === 0) return;

    const locator = getLocator(el);
    if (locator && !seenLocators.has(locator)) {
      seenLocators.add(locator);
      
      const tag = el.tagName.toLowerCase();
      testSteps.push(`  // Element: <${tag}>`);
      testSteps.push(`  await expect(${locator}).toBeVisible();`);
      
      if (tag === 'input' && (el.type === 'text' || el.type === 'email' || el.type === 'password')) {
        testSteps.push(`  // await ${locator}.fill('Test Input');`);
      } else if (tag === 'button' || tag === 'a') {
        testSteps.push(`  // await ${locator}.click();`);
      }
      
      testSteps.push(``);
      interactCount++;
    }
  });

  const testName = url.split('/').pop() || 'HomePage';
  const finalCode = `import { test, expect } from '@playwright/test';

test('Smoke test ${testName}', async ({ page }) => {
${testSteps.join('\n')}
});
`;

  return {
    locatorsFound: Array.from(seenLocators),
    generatedPlaywrightScript: finalCode
  };
})();
