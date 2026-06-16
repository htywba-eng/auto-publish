const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();

  console.log('=== Fiverr: Google Login → Seller Onboarding ===\n');

  // Step 1: Go to login page
  await page.goto('https://www.fiverr.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-login-step1.png' });

  // Step 2: Click "Continue with Google"
  console.log('Step 1: Click "Continue with Google"...');
  const googleBtn = page.locator('div:has-text("Continue with Google"), button:has-text("Google")').first();
  if (googleBtn) {
    await googleBtn.click();
    console.log('  Clicked Google login');
    await page.waitForTimeout(8000); // Wait for Google popup
    await page.screenshot({ path: 'I:/自動發布/fiverr-google-popup.png' });
    console.log('  URL after Google click:', page.url());

    // Check if Google account picker appeared
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    if (pageText.includes('Choose an account') || pageText.includes('Sign in with Google')) {
      console.log('  ✅ Google account picker opened!');
      console.log('  → Please select htywba@gmail.com in the popup window');
      console.log('  → Waiting 25 seconds for you to complete...');
      await page.waitForTimeout(25000);
      await page.screenshot({ path: 'I:/自動發布/fiverr-after-google-login.png' });
      console.log('  URL after Google auth:', page.url());
    }
  } else {
    console.log('  Google button not found!');
  }

  // Step 3: Check if we're logged in
  const isLoggedIn = !page.url().includes('/login');
  console.log('\nLogged in:', isLoggedIn);

  if (isLoggedIn) {
    console.log('\n✅ Logged in! Proceeding to seller setup...');
    // Go to seller onboarding
    await page.goto('https://www.fiverr.com/seller_onboarding/welcome', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-seller-wizard.png' });
    console.log('Seller wizard URL:', page.url());
    console.log('Title:', await page.title());

    const headings = await page.$$eval('h1,h2,h3', els => els.map(e => e.textContent.trim()).filter(t => t));
    console.log('Headings:', headings.slice(0, 8));

    // Try to fill/continue the wizard
    const inputFields = await page.$$eval('input:not([type="hidden"]), textarea', els =>
      els.map(e => ({ type: e.type, name: e.name, placeholder: e.placeholder })).slice(0, 10)
    );
    console.log('Inputs:', JSON.stringify(inputFields, null, 2));
  } else {
    console.log('\nStill not logged in. Checking options...');
    // Try email login instead
    await page.goto('https://www.fiverr.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Click email login option
    const emailOption = page.locator('div:has-text("Continue with email"), button:has-text("email")').first();
    if (emailOption) {
      await emailOption.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'I:/自動發布/fiverr-email-login.png' });
      console.log('Email login form opened');

      // Fill email
      const emailInput = await page.$('input[type="email"], input[name="email"]');
      if (emailInput) {
        await emailInput.fill('htywba@gmail.com');
        console.log('Filled email');
      }

      const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
      if (continueBtn) {
        await continueBtn.click();
        console.log('Clicked Continue');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'I:/自動發布/fiverr-email-password.png' });
        console.log('Password page - URL:', page.url());

        // Fill password if field appears
        const pwdInput = await page.$('input[type="password"]');
        if (pwdInput) {
          console.log('⚠️  Password field appeared. Please type your Fiverr password in Chrome.');
          console.log('    Waiting 30 seconds...');
          await page.waitForTimeout(30000);
          await page.screenshot({ path: 'I:/自動發布/fiverr-after-password.png' });
          console.log('After password - URL:', page.url());
        }
      }
    }
  }

  console.log('\nFinal URL:', page.url());
  await page.screenshot({ path: 'I:/自動發布/fiverr-finaaal.png' });
  await browser.close();
  console.log('Done.');
})();
