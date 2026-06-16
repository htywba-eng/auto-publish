const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();

  console.log('=== Fiverr Seller Onboarding ===\n');
  console.log('ℹ️  Fiverr is slow from China. Using fast navigation.\n');

  // Strategy 1: Join as seller
  await page.goto('https://www.fiverr.com/join/seller', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  console.log('1. Join Seller - URL:', page.url());
  console.log('   Title:', await page.title());

  let headings = await page.$$eval('h1,h2,h3', els => els.map(e => e.textContent.trim()).filter(t => t && t.length < 100));
  console.log('   Headings:', headings.slice(0, 6));

  // If on login, use Google SSO
  if (page.url().includes('login')) {
    console.log('\n   → Need to login. Looking for Google SSO...');
    const googleBtn = await page.$('div:has-text("Google"), button:has-text("Google")');
    if (googleBtn) {
      console.log('   Clicking Google...');
      await googleBtn.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'I:/自動發布/fiverr-google-sso.png' });
      console.log('   Google SSO URL:', page.url());
    }
  }

  // Strategy 2: Direct seller profile creation page
  console.log('\n2. Trying profile edit...');
  await page.goto('https://www.fiverr.com/settings/seller_profile', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-seller-profile.png' });
  console.log('   URL:', page.url());
  headings = await page.$$eval('h1,h2,h3', els => els.map(e => e.textContent.trim()).filter(t => t));
  console.log('   Headings:', headings.slice(0, 6));

  // Strategy 3: Try /seller_onboarding
  console.log('\n3. Trying seller onboarding wizard...');
  await page.goto('https://www.fiverr.com/seller_onboarding/welcome', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-onboarding-wizard.png' });
  console.log('   URL:', page.url());
  headings = await page.$$eval('h1,h2,h3', els => els.map(e => e.textContent.trim()).filter(t => t));
  console.log('   Headings:', headings.slice(0, 6));

  // If any page logged us in, look for seller setup
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  if (bodyText.includes('Create your') || bodyText.includes('Profile') || bodyText.includes('Personal')) {
    console.log('\n✅ Found seller setup page!');
    console.log(bodyText.substring(0, 1500));
  }

  console.log('\n===== CURRENT STATE =====');
  console.log('URL:', page.url());
  console.log('Title:', await page.title());

  // Check login state
  const hasJoin = bodyText.includes('Join');
  const hasSignIn = bodyText.includes('Sign in');
  console.log('Has Join link:', hasJoin);
  console.log('Has Sign in link:', hasSignIn);
  console.log('Logged in:', !hasJoin || page.url().includes('settings'));

  await browser.close();
  console.log('\nDone. Review screenshots.');
})();
