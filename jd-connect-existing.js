const { chromium } = require('playwright');

(async () => {
  // 连接到已打开的 Chrome（9222端口）
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  console.log('已连接到你的Chrome浏览器');
  console.log('打开的页面数:', browser.contexts().length);

  // 找到京东联盟的页面
  let jdPage = null;
  for (const context of browser.contexts()) {
    const pages = context.pages();
    for (const page of pages) {
      const url = page.url();
      console.log('页面:', url.substring(0, 80));
      if (url.includes('union.jd.com')) {
        jdPage = page;
        console.log('  ✅ 找到京东联盟页面!');
      }
    }
  }

  if (!jdPage) {
    console.log('\n没有找到京东联盟页面，创建新标签页打开...');
    const contexts = browser.contexts();
    jdPage = await contexts[0].newPage();
    await jdPage.goto('https://union.jd.com/index', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await jdPage.waitForTimeout(3000);
    console.log('已打开京东联盟');
  }

  // 扫描当前页面的所有导航和入口
  await jdPage.waitForTimeout(1000);
  console.log('\n当前URL:', jdPage.url());
  console.log('标题:', await jdPage.title());

  // 获取所有导航链接
  const allNav = await jdPage.$$eval('a, li, span[class*="menu"], div[class*="menu"]', els =>
    els.map(e => ({ text: e.textContent.trim().substring(0, 40), href: e.getAttribute('href') || e.getAttribute('to') || '' }))
       .filter(l => l.text && l.text.length > 1 && l.text.length < 50)
  );
  const unique = [...new Set(allNav.map(l => l.text))];
  console.log('\n导航/菜单项:');
  unique.forEach((t, i) => console.log(`  ${i+1}. ${t}`));

  // 获取页面正文
  const bodyText = await jdPage.evaluate(() => document.body.innerText.substring(0, 5000));
  console.log('\n===== 页面完整文字 =====');
  console.log(bodyText);

  // 截图
  await jdPage.screenshot({ path: 'I:/自動發布/jd-current-tab.png', fullPage: true });
  console.log('\n截图已保存: I:/自動發布/jd-current-tab.png');

  // 现在探索所有关键入口
  console.log('\n===== 探索所有入口 =====');
  const urls = [
    { name: '开放平台', url: 'https://union.jd.com/openplatform' },
    { name: '推广管理-站点', url: 'https://union.jd.com/siteManage/index' },
    { name: '我的推广', url: 'https://union.jd.com/siteManage/mySite' },
    { name: '推广工具', url: 'https://union.jd.com/tool/unionApp' },
    { name: '联盟APP', url: 'https://union.jd.com/manager/application' },
    { name: 'API管理', url: 'https://union.jd.com/openplatform/api' },
  ];

  for (const { name, url } of urls) {
    try {
      await jdPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await jdPage.waitForTimeout(3000);
      const curUrl = jdPage.url();
      const headings = await jdPage.$$eval('h1,h2,h3,h4,[class*="title"]', els =>
        els.map(e => e.textContent.trim()).filter(t => t && t.length < 80)
      );
      const keyActions = await jdPage.$$eval('a, button', els =>
        els.filter(e => /创建|申请|新增|新建|应用|app|key|secret|site|站点|管理/i.test(e.textContent))
           .map(e => ({ tag: e.tagName, text: e.textContent.trim().substring(0, 50), href: e.getAttribute('href') || '' }))
           .slice(0, 10)
      );
      console.log(`\n--- ${name} ---`);
      console.log(`  URL: ${curUrl.substring(0, 80)}`);
      console.log(`  标题: ${headings.slice(0, 5).join(' | ') || '(空)'}`);
      console.log(`  关键操作: ${keyActions.length > 0 ? JSON.stringify(keyActions, null, 2) : '(无)'}`);
      await jdPage.screenshot({ path: `I:/自動發布/jd-${name.replace(/[\/\\]/g,'-')}.png`, fullPage: true });
    } catch(e) {
      console.log(`  --- ${name} --- 错误: ${e.message}`);
    }
  }

  console.log('\n完成。');
})();
