const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();

  console.log('=== Fiverr: Login → Become a Seller ===\n');

  // Step 1: Sign in to Fiverr first
  await page.goto('https://www.fiverr.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-login.png' });
  console.log('Step 1 - Login page');
  console.log('URL:', page.url());

  // Check login state
  const emailInput = await page.$('input[type="email"], input[name="email"], input[name="username"]');
  if (emailInput) {
    console.log('\n⚠️  Login form detected - you need to log in manually.');
    console.log('Please enter your email and password in the Chrome window.');
    console.log('After logging in, the script will continue in 20 seconds...\n');
    await page.waitForTimeout(20000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-after-login.png' });
    console.log('After login - URL:', page.url());
  } else {
    console.log('No login form - may already be logged in or different page');
  }

  // Step 2: Navigate to Become a Seller page
  await page.goto('https://www.fiverr.com/become_a_seller', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-become-seller.png' });
  console.log('\nStep 2 - Become a Seller');
  console.log('URL:', page.url());

  // Check if we got through or redirected
  const headings = await page.$$eval('h1, h2, h3', els => els.map(e => e.textContent.trim()).filter(t => t && t.length < 100));
  console.log('Headings:', headings.slice(0, 8));

  // Try the direct seller creation flow
  const getStartedBtn = await page.$('a[href*="sell"], button:has-text("Start"), button:has-text("Get"), button:has-text("Create"), a:has-text("Become")');
  if (getStartedBtn) {
    console.log('Found CTA button, clicking...');
    await getStartedBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-seller-flow.png' });
    console.log('Flow URL:', page.url());
  }

  // If all else fails - navigate to gig creation directly
  console.log('\n🔍 Trying direct gig creation...');
  await page.goto('https://www.fiverr.com/users/htywba/seller_onboarding', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  console.log('\nFinal URL:', page.url());
  console.log('Title:', await page.title());

  const pageHeadings = await page.$$eval('h1, h2, h3, h4', els => els.map(e => e.textContent.trim()).filter(t => t && t.length < 100));
  console.log('Final headings:', pageHeadings.slice(0, 10));

  await page.screenshot({ path: 'I:/自動發布/fiverr-final-state.png' });
  console.log('\nCheck screenshots:');
  console.log('  fiverr-login.png - Login page');
  console.log('  fiverr-after-login.png - After 20s wait');
  console.log('  fiverr-become-seller.png - Become a seller');
  console.log('  fiverr-final-state.png - Final state');

  await browser.close();
  console.log('\nDone.');
})();
