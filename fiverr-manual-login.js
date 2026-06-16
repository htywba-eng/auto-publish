const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    args: ['--start-maximized']
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();

  console.log('=== Fiverr: Manual Login + Become Seller ===');
  console.log('1. Opening Fiverr login page');
  console.log('2. Please manually sign in with your account');
  console.log('3. After you see your dashboard, type "ready" here\n');

  await page.goto('https://www.fiverr.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Show login page
  console.log('On login page:', await page.title());
  console.log('Please log in now in the Chrome window...');
  console.log('The script will wait 30 seconds for you.\n');

  // Wait for manual login
  await page.waitForTimeout(30000);

  await page.screenshot({ path: 'I:/自動發布/fiverr-post-login.png' });
  console.log('After 30s - URL:', page.url());
  console.log('Title:', await page.title());

  // Check if logged in
  const isLoggedIn = !page.url().includes('/login');
  console.log('Logged in:', isLoggedIn);

  if (isLoggedIn) {
    // Go to sell page
    await page.goto('https://www.fiverr.com/selling', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-selling-dash.png' });
    console.log('Selling page URL:', page.url());

    // Check if we can create a gig
    const headings = await page.$$eval('h1,h2,h3,h4', els => els.map(e => e.textContent.trim()).filter(t => t));
    console.log('Headings:', headings);

    // Look for "Create Gig" or setup buttons
    const actionButtons = await page.$$eval('a, button', els =>
      els.map(e => ({ text: (e.textContent||'').trim().substring(0,60), href: (e.getAttribute('href')||'').substring(0,80) }))
        .filter(b => b.text && /gig|create|start|setup|profile/i.test(b.text))
    );
    console.log('Action buttons:', actionButtons.slice(0, 10));

    // Try to create first gig
    const gigLink = await page.$('a[href*="new_gig"], a[href*="create_gig"], a[href*="manage_gigs"], button:has-text("Create"), a:has-text("Gig")');
    if (gigLink) {
      await gigLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'I:/自動發布/fiverr-gig-flow.png' });
      console.log('Gig creation URL:', page.url());
    }
  } else {
    console.log('Still on login page - please try again');
  }

  await browser.close();
  console.log('\nDone.');
})();
