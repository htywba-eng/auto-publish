import crypto from 'crypto';

const APP_KEY = process.env.JD_APP_KEY || 'b32dacfd38e92e383894f2973c1bdb80';
const APP_SECRET = process.env.JD_APP_SECRET || '4809677daa694df3ab8c6d161aa2fd18';
const API_URL = 'https://api.jd.com/routerjson';

function jdSign(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map(k => `${k}${params[k]}`).join('');
  return crypto.createHash('md5').update(secret + signStr + secret).digest('hex').toUpperCase();
}

async function jdApi(method, paramJson) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  // 京东要求 yyyy-MM-dd HH:mm:ss 格式，且必须是北京时间，与服务器时间差<5分钟
  // Vercel运行在美国，需要手动构造北京时间
  const bjTime = new Date(now.getTime() + 8 * 3600000); // UTC+8
  const timestamp = `${bjTime.getUTCFullYear()}-${pad(bjTime.getUTCMonth()+1)}-${pad(bjTime.getUTCDate())} ${pad(bjTime.getUTCHours())}:${pad(bjTime.getUTCMinutes())}:${pad(bjTime.getUTCSeconds())}`;

  const params = {
    method,
    app_key: APP_KEY,
    timestamp,
    format: 'json',
    v: '1.0',
    sign_method: 'md5',
    '360buy_param_json': JSON.stringify(paramJson)
  };
  params.sign = jdSign(params, APP_SECRET);

  const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  const resp = await fetch(`${API_URL}?${qs}`);
  const text = await resp.text();
  let data;
  try { data = JSON.parse(text); } catch(e) { throw new Error(`JD returned non-JSON: ${text.substring(0,200)}`); }
  const key = Object.keys(data).find(k => k.includes('responce'));
  console.error('JD raw:', text.substring(0,500));
  if (!key) throw new Error(`Invalid JD response: ${text.substring(0,200)}`);
  const outer = data[key];
  if (outer.code !== '0') throw new Error(outer.zh_desc || outer.message || `Error ${outer.code}`);
  return JSON.parse(outer.queryResult || outer.result || '{}');
}

// 精选频道映射
const ELITE_IDS = {
  hot: 1,        // 好券推荐
  best: 2,       // 爆款推荐
  jdSelf: 3,     // 京东自营
  home: 4,       // 家居家装
  beauty: 5,     // 美妆个护
  baby: 6,       // 母婴玩具
  digital: 7,    // 数码家电
  food: 8,       // 食品饮料
  clothes: 9,    // 服饰鞋包
  sports: 10     // 运动户外
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { keyword, eliteId, sort, pageSize } = req.body || {};

  try {
    if (keyword) {
      // 关键词搜索
      const result = await jdApi('jd.union.open.goods.query', {
        goodsReq: {
          keyword,
          pageIndex: 1,
          pageSize: Math.min(pageSize || 10, 20),
          sortName: sort || 'commission',
          sort: 'desc'
        }
      });

      const items = (result.data || []).map(g => ({
        title: g.skuName,
        price: g.priceInfo?.price,
        lowestPrice: g.priceInfo?.lowestCouponPrice || g.purchasePriceInfo?.purchasePrice,
        commission: g.commissionInfo?.commission,
        commissionRate: g.commissionInfo?.commissionShare,
        couponDiscount: g.couponInfo?.couponList?.[0]?.discount,
        couponQuota: g.couponInfo?.couponList?.[0]?.quota,
        shopName: g.shopInfo?.shopName,
        imageUrl: g.imageInfo?.imageList?.[0]?.url,
        sales30d: g.inOrderCount30Days,
        materialUrl: g.materialUrl
      }));

      return res.json({ code: 0, total: result.totalCount, items });
    }

    // 高佣精选频道
    const eid = ELITE_IDS[eliteId] || eliteId || 1;
    const result = await jdApi('jd.union.open.goods.jingfen.query', {
      goodsReq: {
        eliteId: eid,
        pageIndex: 1,
        pageSize: Math.min(pageSize || 20, 50),
        sortName: sort || 'commission',
        sort: 'desc'
      }
    });

    const items = (result.data || []).map(g => ({
      title: g.skuName,
      price: g.priceInfo?.price,
      lowestPrice: g.purchasePriceInfo?.purchasePrice || g.priceInfo?.lowestCouponPrice,
      commission: g.commissionInfo?.commission,
      commissionRate: g.commissionInfo?.commissionShare,
      couponDiscount: g.couponInfo?.couponList?.find(c => c.isBest)?.discount || g.couponInfo?.couponList?.[0]?.discount,
      couponQuota: g.couponInfo?.couponList?.find(c => c.isBest)?.quota || g.couponInfo?.couponList?.[0]?.quota,
      shopName: g.shopInfo?.shopName,
      shopLevel: g.shopInfo?.shopLevel,
      imageUrl: g.imageInfo?.imageList?.[0]?.url,
      sales30d: g.inOrderCount30Days,
      materialUrl: g.materialUrl
    }));

    return res.json({ code: 0, total: result.totalCount, items });
  } catch (e) {
    return res.status(500).json({ code: -1, error: e.message });
  }
}
