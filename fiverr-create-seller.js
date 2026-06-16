const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();

  console.log('=== Fiverr: Become a Seller (Step-by-Step) ===\n');

  // Already logged in via Pro. Go to selling page.
  // Fiverr seller wizard starts at /selling
  await page.goto('https://www.fiverr.com/selling', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'I:/自動發布/fiverr-selling.png' });
  console.log('Step 1 - /selling');
  console.log('URL:', page.url());
  console.log('Title:', await page.title());

  let headings = await page.$$eval('h1,h2,h3', els => els.map(e => e.textContent.trim()).filter(t => t));
  console.log('Headings:', headings.slice(0, 5));

  // Try to find "Create your first Gig" or "Set up your profile"
  const createGigBtn = await page.$('a[href*="gig"], button:has-text("Gig"), button:has-text("Create"), a:has-text("Create your first Gig")');
  if (createGigBtn) {
    console.log('Found gig creation button!');
    await createGigBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-gig-create.png' });
  }

  // If not, try profile setup
  const profileBtn = await page.$('a[href*="profile"], button:has-text("Profile"), a:has-text("Set up"), button:has-text("Start")');
  if (profileBtn) {
    console.log('Found profile setup button!');
    await profileBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'I:/自動發布/fiverr-profile-setup.png' });
  }

  // Try the old seller wizard URL
  await page.goto('https://www.fiverr.com/users/htywba/manage_gigs', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Dump what we see
  const allButtons = await page.$$eval('a, button', els =>
    els.map(e => ({
      text: (e.textContent || '').trim().substring(0, 60),
      href: (e.getAttribute('href') || '').substring(0, 80)
    })).filter(b => b.text && (b.text.includes('ell') || b.text.includes('ig') || b.text.includes('ofile') || b.text.includes('tart') || b.text.includes('reate') || b.text.includes('et up')))
  );
  console.log('\nRelevant buttons/links:', allButtons.slice(0, 20));

  console.log('\nCurrent URL:', page.url());
  console.log('Title:', await page.title());
  headings = await page.$$eval('h1,h2,h3,h4', els => els.map(e => e.textContent.trim()).filter(t => t));
  console.log('Headings:', headings.slice(0, 10));

  await page.screenshot({ path: 'I:/自動發布/fiverr-current.png' });
  await browser.close();
  console.log('\nDone - check fiverr-current.png');
})();
