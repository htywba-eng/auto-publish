const { chromium } = require('playwright');

(async () => {
  // Use system-installed Google Chrome, NOT bundled Chromium
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome'  // Uses your installed Google Chrome
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'en-US'
  });
  const page = await context.newPage();

  // Already registered on Fiverr Pro. Go to seller onboarding.
  console.log('=== Fiverr Seller Onboarding ===');

  // Click "Become a Seller" CTA
  await page.goto('https://www.fiverr.com/start_selling', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Find and click the "Become a Seller" button
  const becomeBtn = await page.$('a[href*="become_a_seller"], a:has-text("Become a Seller"), button:has-text("Become")');
  if (becomeBtn) {
    console.log('Clicking Become a Seller button...');
    await becomeBtn.click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-onboarding-1.png' });
    console.log('URL after click:', page.url());
  }

  // Try direct seller profile creation URL
  await page.goto('https://www.fiverr.com/seller_onboarding', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-onboarding-2.png' });
  console.log('Onboarding URL:', page.url());
  console.log('Title:', await page.title());

  // Check what's on the page
  const headings = await page.$$eval('h1, h2, h3, h4, [role="heading"]', els => els.map(e => e.textContent.trim()).filter(t => t));
  console.log('Headings:', headings.slice(0, 10));

  const buttons = await page.$$eval('button, a[role="button"]', els => els.map(e => e.textContent.trim()).filter(t => t).slice(0, 10));
  console.log('Buttons:', buttons);

  // Try seller profile edit page
  await page.goto('https://www.fiverr.com/selling/profile', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-profile-edit.png' });
  console.log('Profile page URL:', page.url());
  console.log('Title:', await page.title());

  // Extract form fields
  const inputs = await page.$$eval('input:not([type="hidden"]), textarea, select', els =>
    els.map(e => ({ type: e.type || e.tagName, name: e.name, placeholder: e.placeholder, id: e.id, label: e.getAttribute('aria-label') }))
  );
  console.log('Form fields:', JSON.stringify(inputs.slice(0, 30), null, 2));

  // Try to fill description field if present
  const descField = await page.$('[placeholder*="describe"], [placeholder*="skill"], [placeholder*="about"], [name*="description"], [name*="bio"]');
  if (descField) {
    console.log('Found description field, filling...');
    await descField.fill('Professional automation and content creation specialist. I build custom scripts and tools that help businesses automate their content workflow - from WeChat Official Account publishing to Xiaohongshu card generation. 5+ years Python/Node.js experience. I deliver production-ready code with documentation.');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-profile-filled.png' });
  }

  await browser.close();
  console.log('\nDone. Check screenshots.');
})();
