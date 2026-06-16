const { chromium } = require('playwright');

(async () => {
  // Use your Google Chrome
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome'
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'en-US'
  });
  const page = await context.newPage();

  console.log('=== Fiverr SELLER Registration ===');
  console.log('Your Pro account is a BUYER account. Registering as SELLER now.\n');

  // Step 1: Go to Fiverr seller join page
  await page.goto('https://www.fiverr.com/join/seller', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-join-seller.png' });
  console.log('Step 1 - Join seller page');
  console.log('URL:', page.url());
  console.log('Title:', await page.title());

  // Check if we need to log in first
  const loginPrompt = await page.$('text=Log in, text=Sign in, text=Welcome back');
  if (loginPrompt) {
    console.log('Need to login first. Looking for login options...');
    // Try email login if available
    const emailField = await page.$('input[type="email"], input[name="email"], input[placeholder*="email"]');
    const continueBtn = await page.$('button:has-text("Continue"), button:has-text("Next"), button:has-text("Log")');
    if (emailField) {
      console.log('Email login form found');
    }
  }

  // Step 2: Check if we're on the "become a seller" flow
  const headings = await page.$$eval('h1, h2, h3', els => els.map(e => e.textContent.trim()).filter(t => t));
  console.log('Headings:', headings.slice(0, 10));

  // Step 3: Try to click through to seller signup
  // Look for "Become a Seller" or "Join as a Seller" specific links
  const sellerLinks = await page.$$('a[href*="become"], a[href*="seller"], button:has-text("Seller"), button:has-text("Join")');
  console.log(`Found ${sellerLinks.length} seller-related links`);

  const buttons = await page.$$eval('button, a[role="button"], .btn', els =>
    els.map(e => ({ text: e.textContent.trim().substring(0, 40), href: e.getAttribute('href') || '' })).filter(b => b.text)
  );
  console.log('Buttons/Links:', buttons.slice(0, 15));

  await page.waitForTimeout(2000);
  await browser.close();
  console.log('\nDone. Check fiverr-join-seller.png');
})();
