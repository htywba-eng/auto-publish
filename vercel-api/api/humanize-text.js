// 反AI检测文本优化
const BANNED = ['首先','其次','再者','最后','总之','综上所述','众所周知','不可否认','显而易见'];

function analyzeText(text) {
  const sentences = text.split(/[。！？\.!\?]/).filter(s => s.trim());
  const lengths = sentences.map(s => s.length);
  const avg = lengths.reduce((a,b)=>a+b,0)/(lengths.length||1);
  const variance = Math.sqrt(lengths.reduce((s,l)=>s+(l-avg)**2,0)/(lengths.length||1));
  let bannedCount = 0;
  BANNED.forEach(w => { if (text.includes(w)) bannedCount++; });
  const aiScore = Math.round(Math.max(10, 100 - variance*3 - (10-sentences.length)*2 - bannedCount*5));
  return {sentence_count:sentences.length,avg_length:Math.round(avg),variance_score:Math.round(variance),banned_word_count:bannedCount,ai_score:aiScore,risk_level:variance<8?'high':variance<15?'medium':'low'};
}

function optimizeText(text) {
  return text.replace(/首先/g,'第一件').replace(/其次/g,'还有').replace(/综上所述/g,'回过头看').replace(/不可否认/g,'得承认');
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});
  const { text } = req.body;
  if (!text) return res.status(400).json({error:'text required'});
  const before = analyzeText(text);
  const optimized = optimizeText(text);
  const after = analyzeText(optimized);
  res.status(200).json({original:before,optimized:{text:optimized.substring(0,200),...after},improvement:before.ai_score + ' -> ' + after.ai_score});
}
