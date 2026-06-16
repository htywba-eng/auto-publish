const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'en-US'
  });
  const page = await context.newPage();

  // Fiverr Pro - 用户已注册成功
  await page.goto('https://pro.fiverr.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Screenshot current state
  await page.screenshot({ path: 'I:/自動發布/fiverr-pro-landing.png', fullPage: false });
  console.log('✅ Screenshot saved: fiverr-pro-landing.png');

  const title = await page.title();
  console.log('Page title:', title);
  console.log('Current URL:', page.url());

  // Try to find "Become a Seller" or "Start Selling" or user menu
  const sellLinks = await page.$$('a[href*="sell"], a[href*="seller"], a[href*="gig"], button:has-text("Sell"), button:has-text("Start"), button:has-text("Become")');
  console.log('Sell-related links found:', sellLinks.length);

  // Look for user avatar / dashboard
  const userMenu = await page.$('[data-testid="user-menu"], .user-menu, .profile-picture, .avatar');
  console.log('User menu found:', !!userMenu);

  // Navigate to seller dashboard
  try {
    await page.goto('https://pro.fiverr.com/seller_dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-seller-dashboard.png' });
    console.log('✅ Seller dashboard screenshot saved');
  } catch(e) {
    console.log('Seller dashboard timeout - may need login');
  }

  // Navigate to create gig
  try {
    await page.goto('https://pro.fiverr.com/sellers/gigs/create', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-create-gig.png' });
    console.log('✅ Create gig page loaded');
  } catch(e) {
    console.log('Create gig page timeout');
  }

  console.log('\n--- Page Content Summary ---');
  const bodyText = await page.evaluate(() => {
    const h1s = Array.from(document.querySelectorAll('h1,h2,h3')).map(h => h.textContent.trim());
    return h1s.join('\n');
  });
  console.log('Headings:', bodyText.substring(0, 500));

  await browser.close();
  console.log('\nDone. Review screenshots in I:/自動發布/');
})();
