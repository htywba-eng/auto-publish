const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();

  console.log('=== Fiverr: Multiple strategies to trigger seller onboarding ===\n');

  await page.goto('https://www.fiverr.com/start_selling', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Strategy 1: Click the SECOND "Get started" (bottom one, usually works)
  console.log('Strategy 1: Click bottom "Get started" button...');
  const buttons = await page.$$('button, a');
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && /get started/i.test(text.trim())) {
      console.log('  Found button:', text.trim());
    }
  }

  // Strategy 2: Use evaluate to click the button programmatically
  console.log('\nStrategy 2: JS click on Get Started...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const getStarted = buttons.find(b => /get started/i.test(b.textContent));
    if (getStarted) {
      getStarted.scrollIntoView({ block: 'center' });
      getStarted.click();
      return true;
    }
    return false;
  });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-js-clicked.png' });
  console.log('URL after JS click:', page.url());

  // Strategy 3: Directly navigate to seller join registration
  console.log('\nStrategy 3: Direct seller join URL...');
  await page.goto('https://www.fiverr.com/join/seller', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-join-seller-direct.png' });
  console.log('URL:', page.url());
  console.log('Title:', await page.title());

  const headings = await page.$$eval('h1,h2,h3', els => els.map(e => e.textContent.trim()).filter(t => t));
  console.log('Headings:', headings.slice(0, 10));

  // If join page has form
  const inputs = await page.$$eval('input:not([type="hidden"])', els => els.map(e => ({type:e.type, name:e.name, placeholder:e.placeholder})));
  console.log('Inputs:', JSON.stringify(inputs.slice(0, 15), null, 2));

  // Strategy 4: Try the actual Fiverr seller profile creation
  // This is the URL new sellers use to set up their profile
  await page.goto('https://www.fiverr.com/users/htywba/edit_profile', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  console.log('\nEdit profile URL:', page.url());

  await page.screenshot({ path: 'I:/自動發布/fiverr-edit-profile.png' });
  const profileHeadings = await page.$$eval('h1,h2,h3,h4', els => els.map(e => e.textContent.trim()).filter(t => t));
  console.log('Profile headings:', profileHeadings.slice(0, 10));

  // Get page text
  const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log('\nPage text:', text.substring(0, 1000));

  await browser.close();
  console.log('\nDone.');
})();
