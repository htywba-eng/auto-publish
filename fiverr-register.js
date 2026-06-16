const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'en-US'
  });
  const page = await context.newPage();

  // Navigate to Fiverr
  console.log('Navigating to Fiverr...');
  await page.goto('https://www.fiverr.com', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Take screenshot of homepage
  await page.screenshot({ path: 'I:/自動發布/fiverr-homepage.png' });
  console.log('Screenshot saved: fiverr-homepage.png');

  // Check if already logged in
  const joinBtn = await page.$('button:has-text("Join")');
  const signInBtn = await page.$('a:has-text("Sign In")');

  if (joinBtn || signInBtn) {
    console.log('Not logged in. Clicking Join...');

    // Click Join button
    try {
      await page.click('button:has-text("Join")');
    } catch {
      await page.click('a:has-text("Join")');
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-join.png' });
    console.log('Join page screenshot saved');

    // Check available signup methods
    const pageContent = await page.content();
    console.log('Page title:', await page.title());

    // Look for email signup option
    const emailOption = await page.$('text=Continue with email');
    const googleOption = await page.$('text=Continue with Google');
    const facebookOption = await page.$('text=Continue with Facebook');

    console.log('Email signup available:', !!emailOption);
    console.log('Google signup available:', !!googleOption);
    console.log('Facebook signup available:', !!facebookOption);
  } else {
    console.log('Already logged in or different page state');
  }

  await page.waitForTimeout(3000);
  await browser.close();
  console.log('Done');
})();
