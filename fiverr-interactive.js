const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox',
           '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process',
           '--disable-popup-blocking']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'en-US',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('=== Fiverr: Interactive Seller Setup ===\n');
  console.log('⏰ This script gives you 60 seconds to manually log in.');
  console.log('📋 What to do:');
  console.log('   1. Click "Continue with Google"');
  console.log('   2. Select htywba@gmail.com');
  console.log('   3. Wait for dashboard to load');
  console.log('After login, I will check and continue with seller setup.\n');

  await page.goto('https://www.fiverr.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);

  console.log('→ Chrome window opened. Please log in now...');
  console.log('→ You have 60 seconds.\n');

  // Wait 60 seconds for manual login
  await page.waitForTimeout(60000);

  await page.screenshot({ path: 'I:/自動發布/fiverr-after-wait.png' });
  const url = page.url();
  console.log('\nAfter 60s - URL:', url);
  console.log('Title:', await page.title());

  // Determine state
  const isLoggedIn = !url.includes('/login');
  if (isLoggedIn) {
    console.log('\n✅ LOGGED IN!');
  } else {
    console.log('\n❌ Still on login page.');
    console.log('→ The Google popup may have been blocked.');
    console.log('→ Try clicking "Continue with Google" manually in the Chrome window.');
    console.log('→ Or use "Continue with email/username" with your credentials.');
    console.log('→ Giving you another 30 seconds...');
    await page.waitForTimeout(30000);

    // Check again
    const finalUrl = page.url();
    if (!finalUrl.includes('/login')) {
      console.log('\n✅ LOGGED IN after extra time!');
    } else {
      // Try an alternative: Fiverr uses cookies from Pro
      console.log('\n→ Trying alternative: set cookies from already-logged-in Fiverr Pro session');
      await page.goto('https://pro.fiverr.com/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      const proUrl = page.url();
      console.log('Pro URL:', proUrl);
      if (!proUrl.includes('login')) {
        console.log('✅ Pro session is active! Copying cookies to main site...');
        const cookies = await context.cookies();
        await page.goto('https://www.fiverr.com/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
        console.log('Main site URL:', page.url());
      }
    }
  }

  console.log('\nFinal state:', page.url());
  await page.screenshot({ path: 'I:/自動發布/fiverr-ultimate.png', fullPage: true });
  await browser.close();
  console.log('Done. Check fiverr-ultimate.png');
})();
