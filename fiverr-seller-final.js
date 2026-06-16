const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();

  console.log('=== Fiverr Seller Registration ===\n');
  console.log('You have a Fiverr Pro (buyer) account.');
  console.log('This script will help you become a SELLER.\n');

  // Go directly to the seller join page
  // Fiverr's actual seller join URL:
  await page.goto('https://www.fiverr.com/seller-sign-up', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-seller-signup-1.png' });

  let url = page.url();
  console.log('Step 1 URL:', url);

  // If redirected to login, that means we need to login first
  // Check if there's Google SSO (Fiverr supports it)
  if (url.includes('login')) {
    console.log('Need to login. Looking for Google sign-in...');

    // Click "Continue with Google"
    const googleBtn = await page.$('button:has-text("Google"), div:has-text("Google"), button:has-text("Continue with Google")');
    if (googleBtn) {
      console.log('Found Google login button. Clicking...');
      await googleBtn.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'I:/自動發布/fiverr-google-login.png' });
      console.log('Google login URL:', page.url());
    }

    // Also try standard email login
    const emailField = await page.$('input[type="email"], input[name="email"]');
    if (emailField) {
      console.log('\n📧 Email login form found. Please manually fill in:');
      console.log('   Email: htywba@gmail.com');
      console.log('   Password: [your Fiverr password]');
      console.log('\nWaiting 30 seconds for manual login...');
      await page.waitForTimeout(30000);
      await page.screenshot({ path: 'I:/自動發布/fiverr-manual-login-result.png' });
      console.log('After login URL:', page.url());
    }
  }

  // After login, navigate to become a seller
  if (!page.url().includes('login')) {
    console.log('Logged in! Navigating to sell dashboard...');
    await page.goto('https://www.fiverr.com/selling', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-sell-dashboard.png' });
    console.log('Sell dashboard URL:', page.url());

    const headings = await page.$$eval('h1,h2,h3', els => els.map(e => e.textContent.trim()).filter(t => t));
    console.log('Headings:', headings.slice(0, 8));
  }

  await browser.close();
  console.log('\nDone.');
})();
