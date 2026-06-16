const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await context.newPage();

  console.log('=== Fiverr: Continue with Google ===\n');
  console.log('→ Chrome window is opening with the Fiverr login page');
  console.log('→ This time, click "Continue with Google" manually');
  console.log('→ After logging in, wait and the script will auto-continue\n');
  console.log('⏰ Waiting 45 seconds for you to log in...\n');

  await page.goto('https://www.fiverr.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Wait for user to manually login
  await page.waitForTimeout(45000);

  // Check login state
  let url = page.url();
  console.log('URL after wait:', url);

  // If still on login, wait more
  if (url.includes('/login')) {
    console.log('Still on login. Waiting 30 more seconds...');
    await page.waitForTimeout(30000);
    url = page.url();
  }

  if (!url.includes('/login')) {
    console.log('\n✅ LOGGED IN! URL:', url);

    // Now try to become a seller
    await page.goto('https://www.fiverr.com/become_a_seller?source=top_nav', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    console.log('Become a seller - URL:', page.url());

    // Check what page we're on
    const title = await page.title();
    const headings = await page.$$eval('h1,h2,h3,h4', els => els.map(e => e.textContent.trim()).filter(t => t));
    console.log('Title:', title);
    console.log('Headings:', headings.slice(0, 8));

    // If become_a_seller profile page, try to fill
    const textareas = await page.$$('textarea');
    const textInputs = await page.$$('input[type="text"], input:not([type])');
    console.log(`Found ${textareas.length} textareas, ${textInputs.length} text inputs`);

    // Look for the profile form
    const allInputs = await page.$$eval('input:not([type="hidden"]), textarea, select', els =>
      els.map(e => ({ tag: e.tagName, type: e.type || '', name: e.name, placeholder: e.placeholder || '', id: e.id })).filter(i => i.type !== 'search')
    );
    console.log('Form fields:', JSON.stringify(allInputs.slice(0, 20), null, 2));

    // If there's a description field
    const descField = page.locator('textarea').first();
    if (await descField.count() > 0) {
      console.log('Filling description...');
      await descField.fill('I build automation tools and custom scripts that save content creators hours every day. From AI-powered writing pipelines to multi-platform publishing systems, I deliver production-ready solutions with clean documentation. Expert in Node.js, Python, Vercel, and WeChat ecosystem.');
      await page.screenshot({ path: 'I:/自動發布/fiverr-desc-done.png' });
    }

    // Look for Next/Continue/Save buttons
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Save"), button:has-text("Submit")').first();
    if (await nextBtn.count() > 0) {
      const btnText = await nextBtn.textContent();
      console.log(`Found button: "${btnText}"`);
    }

  } else {
    console.log('\n❌ Still not logged in after waiting');
    console.log('→ The Google popup may need you to click it manually');
    console.log('→ Try clicking "Continue with Google" in the Chrome window');
    console.log('→ Waiting one more time (30s)...');
    await page.waitForTimeout(30000);
    console.log('Final URL:', page.url());
  }

  await page.screenshot({ path: 'I:/自動發布/fiverr-final-result.png', fullPage: true });
  await browser.close();
  console.log('\nDone.');
})();
