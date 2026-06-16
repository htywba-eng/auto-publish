const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  const page = await context.newPage();

  console.log('=== 京东联盟 登录后 详细探索 ===\n');

  // Step 1: 打开首页
  await page.goto('https://union.jd.com/index', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Step 2: 扫码登录提示 — 需要你手动扫码
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  if (bodyText.includes('扫码登录') || bodyText.includes('账号登录')) {
    console.log('⚠️  需要登录！页面显示：');
    console.log(bodyText.substring(0, 500));
    console.log('\n→ 请用京东APP扫描Chrome窗口中的二维码登录');
    console.log('→ 等待 60 秒...\n');
    await page.waitForTimeout(60000);
    await page.screenshot({ path: 'I:/自動發布/jd-after-login.png', fullPage: true });
  }

  // Step 3: 逐一访问关键URL
  const pages = [
    { name: 'siteManage', url: 'https://union.jd.com/siteManage/index' },
    { name: 'site-apply', url: 'https://union.jd.com/site/apply' },
    { name: 'openplatform', url: 'https://union.jd.com/openplatform' },
    { name: 'mySite', url: 'https://union.jd.com/siteManage/mySite' },
    { name: 'myApp', url: 'https://union.jd.com/manager/application' },
  ];

  console.log('=== 逐页探索 ===\n');
  for (const { name, url } of pages) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `I:/自動發布/jd-${name}.png`, fullPage: true });

      const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
      const headings = await page.$$eval('h1,h2,h3,h4,.title,[class*="title"]', els => els.map(e => e.textContent.trim()).filter(t => t && t.length < 80));

      console.log(`--- ${name} ---`);
      console.log(`URL: ${page.url()}`);
      console.log(`标题: ${headings.slice(0, 5).join(' | ') || '(无标题)'}`);

      // 搜索关键按钮/链接
      const keyLinks = await page.$$eval('a, button, span[class*="btn"]', els =>
        els.filter(e => /创建|申请|新增|应用|app|key|secret|site/i.test(e.textContent))
           .map(e => ({ tag: e.tagName, text: e.textContent.trim().substring(0, 50), href: e.getAttribute('href') || '' }))
      );
      if (keyLinks.length > 0) {
        console.log(`关键按钮: ${JSON.stringify(keyLinks, null, 2)}`);
      }

      // 搜索表格
      const tableHeaders = await page.$$eval('th, thead td', els => els.map(e => e.textContent.trim()).filter(t => t));
      if (tableHeaders.length > 0) {
        console.log(`表格头: ${tableHeaders.join(' | ')}`);
      }

      // 如果页面有内容，打印前1000字
      const cleanText = text.replace(/\s+/g, ' ').trim();
      console.log(`页面内容: ${cleanText.substring(0, 500)}`);
      console.log('');
    } catch(e) {
      console.log(`--- ${name} --- 跳过 (${e.message})`);
    }
  }

  // Step 4: 尝试 openplatform 详细查看
  console.log('=== 开放平台页 详细 ===');
  await page.goto('https://union.jd.com/openplatform', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  const opText = await page.evaluate(() => document.body.innerText.substring(0, 5000));
  console.log(opText);

  // 找所有链接
  const opLinks = await page.$$eval('a', els =>
    els.map(e => ({ text: e.textContent.trim().substring(0, 40), href: e.getAttribute('href') }))
       .filter(l => l.href && !l.href.includes('javascript') && l.text)
       .slice(0, 30)
  );
  console.log('\n开放平台链接:', JSON.stringify(opLinks, null, 2));

  await page.screenshot({ path: 'I:/自動發布/jd-openplatform.png', fullPage: true });
  await browser.close();
  console.log('\n完成。查看 I:/自動發布/jd-*.png');
})();
