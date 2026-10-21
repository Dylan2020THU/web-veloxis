// Public reference quotes. Provider timestamps do not establish exchange-level latency.
export const INDEX_GROUPS=[
 {name:'三大指数',indices:[['SSE','000001','上证指数'],['SZSE','399001','深证成指'],['SZSE','399006','创业板指']]},
 {name:'科创成长',indices:[['SSE','000688','科创50'],['SSE','000698','科创100'],['SSE','000680','科创综指'],['SZSE','399673','创业板50'],['BSE','899050','北证50']]},
 {name:'市场对照',indices:[['SSE','000300','沪深300'],['SSE','000905','中证500'],['SSE','000852','中证1000']]}
].map(group=>({...group,indices:group.indices.map(([market,code,name])=>({id:`${market}:index:${code}`,symbol:({SSE:'sh',SZSE:'sz',BSE:'bj'})[market]+code,code,name,group:group.name}))}));
const indices=INDEX_GROUPS.flatMap(g=>g.indices),symbols=new Map(indices.map(i=>[i.symbol,i]));
const numeric=value=>typeof value==='string'&&/^-?\d+(?:\.\d+)?$/.test(value)?Number(value):NaN;
function sourceTime(value){
 if(!/^\d{14}$/.test(value||''))return NaN;
 const iso=`${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}T${value.slice(8,10)}:${value.slice(10,12)}:${value.slice(12,14)}`;
 const ms=Date.parse(iso+'+08:00');
 return Number.isFinite(ms)&&new Date(ms+8*3600000).toISOString().slice(0,19)===iso?ms:NaN;
}
export function parseIndexQuotes(text,now=Date.now()){
 const rows=new Map(),duplicates=new Set();
 for(const match of text.matchAll(/(?:^|[;\n])\s*v_([a-z]{2}\d{6})="([^"\r\n]*)"(?=;)/g)){
  const [,symbol,payload]=match;if(!symbols.has(symbol))continue;
  if(rows.has(symbol))duplicates.add(symbol);rows.set(symbol,payload.split('~'));
 }
 const quotes=[];
 for(const [symbol,f]of rows){
  const index=symbols.get(symbol),last=numeric(f[3]),change=numeric(f[31]),changePct=numeric(f[32]),sourceAsOfMs=sourceTime(f[30]);
  if(duplicates.has(symbol)||f[2]!==index.code||last<=0||![last,change,changePct,sourceAsOfMs].every(Number.isFinite)||sourceAsOfMs>now+5000)continue;
  quotes.push({instrumentId:index.id,unit:'points',last,change,changePct,amountCny:null,volumeShares:null,state:'reference',timestampKind:'provider',sourceAsOfMs,source:{name:'腾讯证券',url:`https://gu.qq.com/${symbol}/zs`}});
 }
 return quotes;
}
export function createIndexFetch({fetchImpl=globalThis.fetch,now=Date.now}={}){
 return async(path,{signal}={})=>{
  const ids=new URL(path).searchParams.get('ids')?.split(',')||[];
  const requested=ids.map(id=>indices.find(i=>i.id===id));
  if(!ids.length||requested.some(i=>!i)||new Set(ids).size!==ids.length)throw Error('Unknown index');
  const response=await fetchImpl('https://qt.gtimg.cn/?q='+requested.map(i=>i.symbol).join(','),{signal,credentials:'omit',cache:'no-store'});
  if(!response.ok)throw Error('Index source unavailable');
  const text=new TextDecoder('gb18030').decode(await response.arrayBuffer());
  const quotes=parseIndexQuotes(text,now()).filter(q=>ids.includes(q.instrumentId));
  if(!quotes.length)throw Error('No valid index quotes');
  return {ok:true,json:async()=>({quotes})};
 };
}
