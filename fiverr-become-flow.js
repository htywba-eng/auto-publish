const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();

  console.log('=== Fiverr: Become a Seller (Logged In) ===\n');

  // You're already logged in. Go to start_selling
  await page.goto('https://www.fiverr.com/start_selling', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('URL:', page.url());

  // Click "Become a Seller" button
  const ctaButtons = await page.$$eval('a, button', els =>
    els.filter(e => /seller|freelancer|start|begin|get started/i.test(e.textContent))
       .map(e => ({ tag: e.tagName, text: e.textContent.trim().substring(0, 50), href: e.getAttribute('href') || '' }))
  );
  console.log('CTA buttons:', JSON.stringify(ctaButtons.slice(0, 10), null, 2));

  // Try clicking the main CTA
  try {
    // Fiverr's become-a-seller CTA is usually a link or button
    await page.click('a[href*="become"], a:has-text("Become a Seller"), button:has-text("Become")');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-cta-clicked.png' });
    console.log('After CTA click URL:', page.url());
  } catch(e) {
    console.log('CTA click failed:', e.message);
  }

  // Check if seller profile form appeared
  const formFields = await page.$$eval('input:not([type="hidden"]), textarea, select', els =>
    els.slice(0, 10).map(e => ({ type: e.type, name: e.name, placeholder: e.placeholder, id: e.id }))
  );
  console.log('Form fields:', JSON.stringify(formFields, null, 2));

  const headings = await page.$$eval('h1,h2,h3,h4', els => els.map(e => e.textContent.trim()).filter(t => t));
  console.log('Headings:', headings.slice(0, 10));

  // If seller onboarding: try filling personal info
  const descInput = await page.$('textarea, [contenteditable="true"]');
  if (descInput) {
    console.log('Found description field!');
    await descInput.fill('Professional full-stack developer and automation specialist. Expert in building custom scripts, APIs, and automation tools for content creators and businesses. I deliver production-ready, well-documented code.');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-desc-filled.png' });
  }

  // Check for profile photo upload
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    console.log('Found file upload!');
  }

  await page.screenshot({ path: 'I:/自動發布/fiverr-current-state.png', fullPage: true });

  // Save page text for analysis
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 5000));
  console.log('\n--- Full page text ---');
  console.log(bodyText);

  await browser.close();
  console.log('\nDone. Check screenshots.');
})();
