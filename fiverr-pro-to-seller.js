const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    args: ['--disable-blink-features=AutomationControlled', '--disable-popup-blocking']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'en-US'
  });
  const page = await context.newPage();

  console.log('=== Fiverr: Pro → Seller Conversion ===\n');
  console.log('Your Pro account is active. Converting to seller...\n');

  // Step 1: Go to Pro (already logged in)
  await page.goto('https://pro.fiverr.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('1. Pro homepage URL:', page.url());

  // Step 2: Navigate to main Fiverr and check login via cookies
  await page.goto('https://www.fiverr.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Look for user avatar/menu (indicates logged in)
  const userAvatar = await page.$('[data-testid="user-menu"], .user-menu-trigger, .avatar-wrapper, img[alt*="profile"]');
  const joinBtn = await page.$('text=Join');
  console.log('2. Main site - User avatar found:', !!userAvatar);
  console.log('   Join button visible:', !!joinBtn);
  console.log('   URL:', page.url());

  // Step 3: Go directly to Become a Seller
  await page.goto('https://www.fiverr.com/become_a_seller', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-become-a-seller-now.png', fullPage: true });
  console.log('3. Become a Seller URL:', page.url());

  const headings = await page.$$eval('h1,h2,h3,h4', els => els.map(e => e.textContent.trim()).filter(t => t && t.length < 120));
  console.log('   Headings:', headings.slice(0, 10));

  // Step 4: If redirected to start_selling, click the CTA
  if (page.url().includes('start_selling')) {
    console.log('\n4. On start_selling page. Trying to click through...');

    // Try multiple approaches to trigger seller wizard
    const actions = [
      () => page.evaluate(() => {
        const btns = document.querySelectorAll('button, a');
        for (const b of btns) {
          if (/get started|become|start selling/i.test(b.textContent) && b.offsetParent !== null) {
            b.click();
            return true;
          }
        }
        return false;
      }),
      () => page.goto('https://www.fiverr.com/seller_onboarding/personal_info', { waitUntil: 'domcontentloaded' }),
      () => page.goto('https://www.fiverr.com/selling/profile', { waitUntil: 'domcontentloaded' }),
    ];

    for (const action of actions) {
      try {
        await action();
        await page.waitForTimeout(3000);
        console.log('   Tried action, URL:', page.url());
        if (!page.url().includes('start_selling') && !page.url().includes('login')) break;
      } catch(e) {}
    }

    await page.screenshot({ path: 'I:/自動發布/fiverr-after-cta.png', fullPage: true });
  }

  // Step 5: If we made it to seller area, start filling
  const finalUrl = page.url();
  console.log('\nFinal URL:', finalUrl);

  if (finalUrl.includes('selling') || finalUrl.includes('seller') || finalUrl.includes('onboarding')) {
    console.log('\n✅ REACHED SELLER AREA!');
    const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('Page text:', text.substring(0, 1000));

    // Fill description
    const descField = await page.$('textarea, [contenteditable="true"]');
    if (descField) {
      await descField.fill('Professional full-stack developer. I automate content workflows, build custom APIs, and create tools for creators. 5+ years Node.js/Python. Fast delivery, clean code.');
      console.log('Filled description');
      await page.screenshot({ path: 'I:/自動發布/fiverr-filled.png', fullPage: true });
    }
  }

  await page.screenshot({ path: 'I:/自動發布/fiverr-seller-final.png', fullPage: true });
  await browser.close();
  console.log('\nDone. Check screenshots.');
})();
