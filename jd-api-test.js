const crypto = require('crypto');

// 从京东联盟拿到的凭证
const APP_KEY = 'b32dacfd38e92e383894f2973c1bdb80';
const APP_SECRET = '4809677daa694df3ab8c6d161aa2fd18';
const API_URL = 'https://api.jd.com/routerjson';

// JD API签名算法: MD5(secret + 排序后参数字符串 + secret) 大写
function jdSign(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map(k => `${k}${params[k]}`).join('');
  return crypto.createHash('md5').update(secret + signStr + secret).digest('hex').toUpperCase();
}

async function jdApi(method, paramJson) {
  // 京东要求时间戳格式: yyyy-MM-dd HH:mm:ss
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

  console.log('=== JD API 测试 ===');
  console.log('Method:', method);
  console.log('Param JSON:', JSON.stringify(paramJson));
  console.log('Sign:', params.sign);
  console.log('');

  try {
    const resp = await fetch(fullUrl, { method: 'GET' });
    const data = await resp.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    return data;
  } catch(e) {
    console.error('Error:', e.message);
    return null;
  }
}

// 测试1: 搜索商品 - 用 jingfen.query 接口（京东联盟精选商品）
async function testSearch() {
  console.log('\n========== 测试: 商品搜索 ==========');

  // jd.union.open.goods.jingfen.query - 精选商品查询
  const param = {
    goodsReq: {
      eliteId: 1,  // 1=爆款推荐
      pageIndex: 1,
      pageSize: 5,
      sortName: 'commission',  // 按佣金排序
      sort: 'desc'
    }
  };
  await jdApi('jd.union.open.goods.jingfen.query', param);
}

// 测试2: 关键词搜索商品
async function testKeywordSearch() {
  console.log('\n========== 测试: 关键词搜索 ==========');

  const param = {
    goodsReq: {
      keyword: '纸巾',
      pageIndex: 1,
      pageSize: 3,
      sortName: 'commission',
      sort: 'desc'
    }
  };
  await jdApi('jd.union.open.goods.query', param);
}

// 测试3: 生成推广链接
async function testPromotionUrl() {
  console.log('\n========== 测试: 生成推广链接 ==========');

  const param = {
    promotionCodeReq: {
      materialId: 'https://item.jd.com/100012043978.html',
      siteId: '',  // 需要siteId
      positionId: 0
    }
  };
  await jdApi('jd.union.open.promotion.common.get', param);
}

(async () => {
  await testSearch();
  await testKeywordSearch();
})();
