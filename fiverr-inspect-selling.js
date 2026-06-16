const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();

  console.log('=== Fiverr: What does the selling page show? ===\n');

  await page.goto('https://www.fiverr.com/selling', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check if this is a "Become a Seller" landing page or actual dashboard
  const pageHTML = await page.evaluate(() => {
    // Get all visible text content, filter noise
    const body = document.body.innerText;
    return body.substring(0, 3000);
  });
  console.log('Page content (first 3000 chars):\n');
  console.log(pageHTML);

  // Try to find links to create gig / setup
  const allLinks = await page.$$eval('a', els =>
    els.map(e => ({ text: e.textContent.trim().substring(0, 60), href: e.getAttribute('href') }))
      .filter(l => l.href && !l.href.includes('category') && !l.href.includes('footer'))
      .slice(0, 30)
  );
  console.log('\n--- All key links ---');
  console.log(JSON.stringify(allLinks, null, 2));

  await page.screenshot({ path: 'I:/自動發布/fiverr-selling-full.png', fullPage: true });
  await browser.close();
  console.log('\nCheck fiverr-selling-full.png');
})();
