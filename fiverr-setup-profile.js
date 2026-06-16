const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'en-US'
  });
  const page = await context.newPage();

  // Go to Fiverr Pro and start freelancer journey
  await page.goto('https://pro.fiverr.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('=== Fiverr Pro Freelancer Journey ===');

  // Find and click "Become a Seller" or "Start Selling" button
  const startButtons = await page.$$('a[href*="become"], a[href*="freelancer"], a[href*="seller"], button:has-text("Start"), button:has-text("Become"), button:has-text("Join")');
  console.log(`Found ${startButtons.length} start/seller buttons`);

  // Try clicking the "Become a Seller" link
  const becomeLink = await page.$('a[href*="become_a_seller"], a[href*="freelancers"], a:has-text("Become a Seller"), a:has-text("Start Selling")');
  if (becomeLink) {
    console.log('Clicking Become a Seller...');
    await becomeLink.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-become-seller.png' });
    console.log('Current URL:', page.url());
  }

  // Try navigating directly to new gig creation
  await page.goto('https://www.fiverr.com/start_selling', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-start-selling.png' });
  console.log('Start selling URL:', page.url());
  console.log('Page title:', await page.title());

  // Extract form fields if present
  const inputs = await page.$$eval('input, textarea, select', els =>
    els.map(e => ({ type: e.type || e.tagName, name: e.name, placeholder: e.placeholder, id: e.id }))
  );
  console.log('Form fields found:', JSON.stringify(inputs.slice(0, 20), null, 2));

  // Save page HTML for analysis
  const html = await page.content();
  const fs = require('fs');
  fs.writeFileSync('I:/自動發布/fiverr-page.html', html.substring(0, 50000));
  console.log('Page HTML saved');

  await browser.close();
  console.log('Done');
})();
