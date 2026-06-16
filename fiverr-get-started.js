const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();

  console.log('=== Fiverr: Click Get Started ===\n');

  await page.goto('https://www.fiverr.com/start_selling', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Click the first "Get started" button
  const getStartedBtn = page.locator('button:has-text("Get started")').first();
  await getStartedBtn.click();
  console.log('Clicked "Get started" button');

  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-get-started-clicked.png', fullPage: true });
  console.log('URL after click:', page.url());
  console.log('Title:', await page.title());

  // Check what appeared
  const headings = await page.$$eval('h1,h2,h3,h4', els => els.map(e => e.textContent.trim()).filter(t => t));
  console.log('Headings:', headings.slice(0, 12));

  // Look for profile creation form
  const formInputs = await page.$$eval('input:not([type="hidden"]), textarea, select', els =>
    els.slice(0, 15).map(e => ({ type: e.type, name: e.name, placeholder: e.placeholder, id: e.id }))
  );
  console.log('\nForm inputs:', JSON.stringify(formInputs, null, 2));

  // If there's a profile creation wizard, follow it
  const nextBtn = await page.$('button:has-text("Next"), button:has-text("Continue"), button:has-text("Save")');
  if (nextBtn) {
    console.log('\nFound next/continue button!');
  }

  // Try to fill in profile fields if present
  const fullName = await page.$('input[name*="name"], input[name*="full"], input[placeholder*="name"]');
  const description = await page.$('textarea[name*="description"], textarea[placeholder*="description"], textarea[placeholder*="about"]');
  const language = await page.$('select[name*="language"], input[name*="language"]');

  console.log('Full name field:', !!fullName);
  console.log('Description field:', !!description);
  console.log('Language field:', !!language);

  if (fullName) {
    console.log('Filling name...');
    await fullName.fill('HT Ywba');
  }
  if (description) {
    console.log('Filling description...');
    await description.fill('Professional full-stack developer and content automation specialist with 5+ years experience. I help businesses automate their content pipelines - from AI writing to multi-platform publishing. Expert in Node.js, Python, Vercel, and WeChat/Xiaohongshu content systems.');
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-profile-filled-auto.png', fullPage: true });

  // Get body text for full analysis
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 4000));
  console.log('\n--- Page body ---');
  console.log(bodyText);

  await browser.close();
  console.log('\nDone.');
})();
