Authorize成功了！让我确认Key和测搜索接口。

const crypto = require('crypto');

const APP_KEY = 'b32dacfd38e92e383894f2973c1bdb80';
const APP_SECRET = '4809677daa694df3ab8c6d161aa2fd18';
const API_URL = 'https://api.jd.com/routerjson';

function jdSign(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map(k => `${k}${params[k]}`).join('');
  return crypto.createHash('md5').update(secret + signStr + secret).digest('hex').toUpperCase();
}

async function jdApi(method, paramJson) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const params = {
    method: method,
    app_key: APP_KEY,
    timestamp: timestamp,
    format: 'json',
    v: '1.0',
    sign_method: 'md5',
    '360buy_param_json': JSON.stringify(paramJson)
  };
  params.sign = jdSign(params, APP_SECRET);

  const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  const fullUrl = `${API_URL}?${qs}`;

  console.log('Method:', method);
  try {
    const resp = await fetch(fullUrl, { method: 'GET' });
    const data = await resp.json();
    return data;
  } catch(e) {
    console.error('Error:', e.message);
    return null;
  }
}

(async () => {
  // 你给的授权key用于生成推广链接 - 先测关键词搜索
  console.log('=== 1. 关键词搜索"纸巾" ===');
  let r = await jdApi('jd.union.open.goods.query', {
    goodsReq: { keyword: '纸巾', pageIndex: 1, pageSize: 3 }
  });

  if (r.jd_union_open_goods_query_responce) {
    const result = JSON.parse(r.jd_union_open_goods_query_responce.queryResult);
    console.log('Code:', result.code, '| Message:', result.message);
    if (result.data) {
      result.data.forEach((g, i) => {
        const p = g.priceInfo || {};
        const c = g.commissionInfo || {};
        console.log(`\n${i+1}. ${(g.skuName||'').substring(0,40)}`);
        console.log(`   价格: ¥${p.price} | 最低: ¥${p.lowestCouponPrice}`);
        console.log(`   佣金: ¥${c.commission} (${c.commissionShare}%)`);
        if (g.couponInfo && g.couponInfo.couponList) {
          const best = g.couponInfo.couponList.find(c => c.isBest) || g.couponInfo.couponList[0];
          console.log(`   券: 满${best.quota}减${best.discount}`);
        }
      });
      console.log(`\n总计: ${result.totalCount} 件商品`);
    }
  } else {
    console.log('Response:', JSON.stringify(r).substring(0, 500));
  }

  // 2. 测推广链接生成（需要siteId）
  console.log('\n=== 2. 测siteId获取 ===');
  // 先获取已有的site
  r = await jdApi('jd.union.open.position.query', { positionReq: { pageIndex: 1, pageSize: 10 } });
  console.log('Position查询:', JSON.stringify(r).substring(0, 500));
})();
