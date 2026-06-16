const crypto = require('crypto');

const APP_KEY = 'b32dacfd38e92e383894f2973c1bdb80';
const APP_SECRET = '4809677daa694df3ab8c6d161aa2fd18';
const ACCESS_TOKEN = '0fb68ec29cc66ae7b9efddc4e2b640a54df78bd105a963fb7dc56da32cf4b0f487c88d7ea6549d51';
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
    access_token: ACCESS_TOKEN,
    timestamp: timestamp,
    format: 'json',
    v: '1.0',
    sign_method: 'md5',
    '360buy_param_json': JSON.stringify(paramJson)
  };
  params.sign = jdSign(params, APP_SECRET);

  const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  const fullUrl = `${API_URL}?${qs}`;

  try {
    const resp = await fetch(fullUrl, { method: 'GET' });
    return await resp.json();
  } catch(e) {
    return { error: e.message };
  }
}

(async () => {
  // 1. 关键词搜索（带access_token）
  console.log('=== 1. 关键词搜索"纸巾" ===');
  let r = await jdApi('jd.union.open.goods.query', {
    goodsReq: { keyword: '纸巾', pageIndex: 1, pageSize: 3 }
  });

  if (r.error) { console.log('Error:', r.error); return; }

  // 解析双层JSON
  const respKey = Object.keys(r).find(k => k.includes('responce') || k.includes('response'));
  if (!respKey) { console.log('Unknown resp:', JSON.stringify(r).substring(0,500)); return; }

  const outer = r[respKey];
  if (outer.code !== '0') { console.log('API error:', outer.code, outer.zh_desc || outer.message); return; }

  const result = JSON.parse(outer.queryResult || outer.result || '{}');
  console.log('Status:', result.code, result.message || '');
  console.log('Total:', result.totalCount, '\n');

  if (result.data) {
    result.data.forEach((g, i) => {
      const p = g.priceInfo || {};
      const c = g.commissionInfo || {};
      console.log(`${i+1}. ${(g.skuName||'').substring(0,50)}`);
      console.log(`   店铺: ${(g.shopInfo||{}).shopName || 'N/A'}`);
      console.log(`   价格: ¥${p.price} | 券后: ¥${p.lowestCouponPrice || p.price}`);
      console.log(`   佣金: ¥${c.commission} (${c.commissionShare}%)`);
      console.log(`   30天销量: ${g.inOrderCount30Days || 0}`);
      if (g.couponInfo && g.couponInfo.couponList) {
        const best = g.couponInfo.couponList.find(c => c.isBest) || g.couponInfo.couponList[0];
        console.log(`   优惠券: 满${best.quota}减${best.discount}`);
      }
      console.log('');
    });
  }

  // 2. 获取siteId（推广位）
  console.log('=== 2. 获取推广位 ===');
  r = await jdApi('jd.union.open.position.query', {
    positionReq: { pageIndex: 1, pageSize: 10 }
  });
  const prKey = Object.keys(r).find(k => k.includes('responce'));
  if (prKey) {
    const prOuter = r[prKey];
    if (prOuter.code === '0') {
      const pr = JSON.parse(prOuter.queryResult || '{}');
      console.log('Code:', pr.code, pr.message || '');
      if (pr.data && pr.data.length > 0) {
        pr.data.forEach(p => console.log(`  ID: ${p.id} | 名称: ${p.spaceName || p.name} | siteId: ${p.siteId}`));
      } else {
        console.log('暂无推广位，需要创建');
      }
    } else {
      console.log('Position error:', prOuter.code, prOuter.zh_desc || prOuter.message);
    }
  }

  // 3. 如果有关键词搜索成功，生成推广链接
  if (result.data && result.data.length > 0) {
    console.log('\n=== 3. 生成推广链接 ===');
    const sku = result.data[0];
    // 生成推广链接需要siteId — 先获取/创建一个
    // 尝试用union.open.promotion.common.get
    const promoR = await jdApi('jd.union.open.promotion.common.get', {
      promotionCodeReq: {
        materialId: sku.materialUrl || `https://item.jd.com/${sku.skuId}.html`,
        siteId: '',  // 空也可以试试
        positionId: 0,
        subUnionId: 'htywba'
      }
    });
    const promoKey = Object.keys(promoR).find(k => k.includes('responce'));
    if (promoKey) {
      const promoOuter = promoR[promoKey];
      if (promoOuter.code === '0') {
        const promo = JSON.parse(promoOuter.queryResult || promoOuter.result || '{}');
        console.log('推广链接:', promo.clickURL || promo.shortURL || JSON.stringify(promo).substring(0,200));
      } else {
        console.log('Promo error:', promoOuter.code, promoOuter.zh_desc || promoOuter.message);
        console.log('可能需要先在联盟后台创建推广位获取siteId');
      }
    }
  }
})();
