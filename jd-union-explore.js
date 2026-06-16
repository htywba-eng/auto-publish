const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  const page = await context.newPage();

  console.log('=== 京东联盟 完整浏览 ===\n');

  // Step 1: 打开京东联盟首页
  await page.goto('https://union.jd.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'I:/自動發布/jd-01-homepage.png', fullPage: true });
  console.log('1. 首页 URL:', page.url());
  console.log('   标题:', await page.title());

  // 获取所有导航链接
  const navLinks = await page.$$eval('nav a, .nav a, header a, [class*="nav"] a, .menu a, [class*="menu"] a', els =>
    els.map(e => ({ text: e.textContent.trim(), href: e.getAttribute('href') })).filter(l => l.text && l.text.length < 30)
  );
  console.log('   导航链接:', JSON.stringify([...new Set(navLinks.map(l => l.text))], null, 2));

  // 获取所有可见文字按钮/链接
  const allClickables = await page.$$eval('a, button, span[class*="btn"], div[class*="btn"], [onclick]', els =>
    els.map(e => ({ tag: e.tagName, text: e.textContent.trim().substring(0, 40), href: e.getAttribute('href') || '' }))
      .filter(l => l.text && l.text.length > 1 && l.text.length < 40)
  );
  console.log('\n   所有可点击元素:', JSON.stringify(allClickables.slice(0, 40), null, 2));

  // Step 2: 点击"推广管理"（如果有的话）
  const promoLinks = await page.$$('a:has-text("推广管理"), span:has-text("推广管理"), div:has-text("推广管理"), li:has-text("推广管理")');
  console.log('\n2. 找到"推广管理"数量:', promoLinks.length);

  if (promoLinks.length > 0) {
    await promoLinks[0].click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'I:/自動發布/jd-02-promo-manage.png', fullPage: true });
    console.log('   推广管理页面 URL:', page.url());

    // 获取推广管理下的子菜单
    const subLinks = await page.$$eval('a, li, span, div[class*="menu"]', els =>
      els.map(e => e.textContent.trim()).filter(t => t && t.length > 1 && t.length < 30)
    );
    console.log('   子菜单:', [...new Set(subLinks)].slice(0, 30));
  }

  // Step 3: 直接遍历所有可能的应用管理入口
  console.log('\n3. 搜索"应用"/"app"/"key"相关入口...');
  const appLinks = await page.$$eval('a, button, span', els =>
    els.filter(e => /应用|app|key|工具|tool|管理/.test(e.textContent))
       .map(e => ({ text: e.textContent.trim().substring(0, 40), href: e.getAttribute('href') || '', tag: e.tagName }))
  );
  console.log('   应用相关:', JSON.stringify(appLinks.slice(0, 20), null, 2));

  // Step 4: 尝试常见URL模式
  const urlsToTry = [
    'https://union.jd.com/siteManage/index',
    'https://union.jd.com/site/apply',
    'https://union.jd.com/tool/unionApp',
    'https://union.jd.com/manager/application',
    'https://union.jd.com/#/site/create',
    'https://union.jd.com/site/create',
    'https://union.jd.com/manager/app',
  ];

  for (const url of urlsToTry) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      const headings = await page.$$eval('h1,h2,h3,h4,.title', els => els.map(e => e.textContent.trim()).filter(t => t));
      if (headings.length > 0) {
        console.log(`\n   ✅ ${url} → ${headings.slice(0, 3).join(' | ')}`);
        await page.screenshot({ path: `I:/自動發布/jd-url-${urlsToTry.indexOf(url)}.png`, fullPage: true });
      }
    } catch(e) {
      // skip
    }
  }

  // Step 5: 回到首页，截完整页面文字
  await page.goto('https://union.jd.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 5000));
  console.log('\n===== 首页完整文字内容 =====');
  console.log(bodyText);

  await browser.close();
  console.log('\n完成。查看 I:/自動發布/jd-*.png');
})();
