const states={live:'实时',delayed:'延迟',unverified:'时间未核验',unavailable:'暂不可用',closed:'休市 / 休盘',halted:'停牌'};
export function validateQuoteOrigin(origin){if(origin===null||origin===undefined)return null;const u=new URL(origin);if(u.protocol!=='https:'||u.origin!==origin||u.username||u.password)throw Error('Invalid quote API origin');return origin;}
export function displayQuoteState(q,now){
 if(!q||!Number.isFinite(q.last))return 'unavailable';if(q.state!=='live')return states[q.state]?q.state:'unverified';
 if(q.timestampKind!=='snapshot'||!Number.isFinite(q.sourceAsOfMs)||q.sourceAsOfMs>now+5000||q.phase!=='trading')return 'unverified';
 return q.issue||now-q.sourceAsOfMs>30000?'delayed':'live';
}
const date=ms=>new Date(ms+8*3600000).toISOString().slice(0,10);
export function trendSegments(trend,now){
 if(!trend||trend.tradeDate!==date(now)||!Number.isInteger(trend.intervalSeconds)||trend.intervalSeconds<60||!Array.isArray(trend.points)||trend.points.length>2000)return [];
 const segments=[];let previous=null;for(const p of trend.points){if(!Number.isFinite(p.atMs)||p.atMs>now+5000||date(p.atMs)!==trend.tradeDate||!Number.isFinite(p.price)||p.price<0||(previous&&p.atMs<=previous.atMs))return [];if(!previous||p.atMs-previous.atMs>trend.intervalSeconds*1000)segments.push([]);segments.at(-1).push(p);previous=p;}return segments;
}
export function createQuoteView(host,{apiOrigin,instrumentIds,labels={},intraday=false,fetchImpl=globalThis.fetch,clock={now:Date.now,setTimeout:(fn,ms)=>globalThis.setTimeout(fn,ms),clearTimeout:id=>globalThis.clearTimeout(id)},document=globalThis.document}){
 const origin=validateQuoteOrigin(apiOrigin),quotes=new Map();let active=false,generation=0,ageTimer,quotePoll,trendPoll,trend=null;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const number=(value,suffix='')=>Number.isFinite(value)?value.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})+suffix:'—';
 function render(){
  host.replaceChildren();for(const id of instrumentIds){const q=quotes.get(id),state=displayQuoteState(q,clock.now()),card=el('div',undefined,'quote-item');card.dataset.instrument=id;card.dataset.state=origin?state:'unconfigured';
   card.append(el('span',labels[id]||id,'quote-name'),el('strong',number(q?.last),'quote-price'),el('span',number(q?.changePct,'%'),Number.isFinite(q?.changePct)&&q.changePct>0?'quote-up':q?.changePct<0?'quote-down':'quote-flat'),el('small',origin?states[state]:'行情尚未接入','quote-status'));
   if(intraday){card.append(el('p','成交额 '+number(q?.amountCny,' 元')+' · 成交量 '+number(q?.volumeShares,' 股'),'quote-volume'));}
   if(q){const time=Number.isFinite(q.sourceAsOfMs)?new Date(q.sourceAsOfMs).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}):'未提供快照时间';const source=el('small',(q.source?.name||'来源待核验')+' · '+time+' (上海时间)','quote-source');card.append(source);}
   host.append(card);
  }
  if(intraday){const box=el('section',undefined,'quote-trend'),segments=trendSegments(trend,clock.now());box.append(el('p','当日分时 · '+(trend?.tradeDate||'待接入'),'meta'));
   if(!segments.length)box.append(el('p','暂无可核验的当日分时数据。','muted'));else{const points=segments.flat(),min=Math.min(...points.map(p=>p.price)),max=Math.max(...points.map(p=>p.price)),start=points[0].atMs,end=points.at(-1).atMs,svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 600 180');svg.setAttribute('role','img');svg.setAttribute('aria-label',`${trend.tradeDate} 分时走势，${trend.intervalSeconds} 秒分辨率，缺失时段断开`);
    for(const segment of segments){const coords=segment.map(p=>[12+(p.atMs-start)/Math.max(end-start,60000)*576,160-(p.price-min)/Math.max(max-min,0.01)*140]);if(coords.length===1){const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('cx',coords[0][0]);circle.setAttribute('cy',coords[0][1]);circle.setAttribute('r','2');svg.append(circle);}else{const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');line.setAttribute('points',coords.map(p=>p.join(',')).join(' '));line.setAttribute('fill','none');line.setAttribute('stroke','currentColor');line.setAttribute('stroke-width','2');svg.append(line);}}
    box.append(svg,el('small',`${new Date(start).toLocaleTimeString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false})} — ${new Date(end).toLocaleTimeString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false})} · ${trend.intervalSeconds} 秒分辨率 · ${trend.source?.name||'来源待核验'}${trend.issue?' · 更新失败':''}`,'quote-source'));}
   host.append(box);
  }
 }
 async function request(path,signal){const response=await fetchImpl(origin+path,{signal,credentials:'omit',cache:'no-store'});if(!response.ok)throw Error('Quote unavailable');return response.json();}
 function poll(load,period,onFailure){let timer,controller,timeout,failures=0,run=0;async function tick(){if(!active||document.hidden)return;const token=++run,version=generation;controller=new AbortController();let rejectTimeout;
   const deadline=new Promise((_,reject)=>{rejectTimeout=()=>reject(Error('Timeout'));timeout=clock.setTimeout(()=>{controller.abort();rejectTimeout();},8000);});
   try{const result=await Promise.race([load(controller.signal),deadline]);if(token!==run||version!==generation||!active)return;result();failures=0;}catch{if(token!==run||version!==generation||!active)return;failures++;onFailure();}finally{if(token===run){clock.clearTimeout(timeout);if(active&&!document.hidden){render();timer=clock.setTimeout(tick,failures?Math.min(60000,10000*2**(failures-1)):period);}}}
  }return {start(){failures=0;tick();},stop(){run++;clock.clearTimeout(timer);clock.clearTimeout(timeout);controller?.abort();}};
 }
 function resume(){if(!active||!origin||document.hidden)return;
  quotePoll=poll(async signal=>{const result=await request('/api/research/quotes?ids='+encodeURIComponent(instrumentIds.join(',')),signal);if(!Array.isArray(result.quotes))throw Error('Invalid quotes');return ()=>{for(const id of instrumentIds){const q=result.quotes.find(q=>q.instrumentId===id);if(q&&[q.last,q.changePct,q.amountCny,q.volumeShares].every(n=>n===null||Number.isFinite(n)))quotes.set(id,q);else if(quotes.has(id))quotes.set(id,{...quotes.get(id),state:'delayed',issue:'source-unavailable'});}};},10000,()=>{for(const [id,q]of quotes)quotes.set(id,{...q,state:q.state==='closed'||q.state==='halted'?q.state:'delayed',issue:'source-unavailable'});});quotePoll.start();
  if(intraday&&instrumentIds.length===1){trendPoll=poll(async signal=>{const result=await request('/api/research/intraday?instrumentId='+encodeURIComponent(instrumentIds[0]),signal);if(result.instrumentId!==instrumentIds[0])throw Error('Wrong trend');return ()=>{trend=result;};},60000,()=>{if(trend)trend={...trend,issue:'source-unavailable'};});trendPoll.start();}
  function age(){if(!active||document.hidden)return;render();ageTimer=clock.setTimeout(age,1000);}age();
 }
 function pause(){generation++;quotePoll?.stop();trendPoll?.stop();clock.clearTimeout(ageTimer);}
 function visibility(){pause();if(!document.hidden)resume();}
 document.addEventListener('visibilitychange',visibility);render();
 return {start(){if(active)return;active=true;resume();},stop(){active=false;pause();},destroy(){active=false;pause();document.removeEventListener('visibilitychange',visibility);}};
}
