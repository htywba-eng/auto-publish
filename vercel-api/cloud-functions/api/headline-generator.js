// EdgeOne Cloud Function — 公众号爆文标题生成器
const FORMULAS = {reflection:[{name:'反常识+个人结果',template:'我{action}了{thing}之后，{surprise}'},{name:'跨域嫁接',template:'我用{years}年前的{old_thing}，{result}'},{name:'大事件平民视角',template:'{big_event}——跟普通人有什么关系'}]};
const fills = [{action:'学',thing:'AI',surprise:'发现了一个更可怕的问题',years:'两千',old_thing:'古籍',result:'治好了AI焦虑',big_event:'大厂开始叫停AI滥用'}];

export function onRequest(context) {
  const { request } = context;
  if (request.method !== 'POST') return new Response(JSON.stringify({error:'POST only'}),{status:405});

  return request.json().then(data => {
    const { topic, style = 'reflection', count = 3 } = data;
    if (!topic) return new Response(JSON.stringify({error:'topic required'}),{status:400});
    const formulas = FORMULAS[style] || FORMULAS.reflection;
    const f = fills[0];
    const headlines = formulas.slice(0, count).map(formula => {
      let title = formula.template;
      for (const [k,v] of Object.entries(f)) title = title.replace(`{${k}}`, v);
      return {title, formula: formula.name, ctr_estimate: '中高'};
    });
    return new Response(JSON.stringify({topic, style, headlines}),{headers:{'Content-Type':'application/json'}});
  }).catch(() => new Response(JSON.stringify({error:'invalid JSON'}),{status:400}));
}
