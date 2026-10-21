import {INDEX_GROUPS,createIndexFetch} from './index-feed.mjs';
import {validateData,memberUrl} from './map-state.mjs';
import {buildResearchIndex,queryCompanies} from './research-data.mjs';
import {createPortalRouter,formatRoute} from './portal-router.mjs';
import {createAtlasController} from './atlas-controller.mjs?v=20261021-coordinated';
import {renderResearchPage} from './research-views.mjs';
import {createTechIcon,sectorColors} from './tech-icons.mjs';
import {createQuoteView} from './quote-view.mjs?v=20261021-coordinated';
const $=s=>document.querySelector(s);
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
try{
 const responses=await Promise.all([fetch('data.json'),fetch('config.json')]);if(responses.some(r=>!r.ok))throw Error('Load failed');
 const [data,config]=await Promise.all(responses.map(r=>r.json()));validateData(data);const index=buildResearchIndex(data);
 let initialReady=false;
 let router,currentRoute=null,currentEntry=null,currentView=null,stored=null;const scrolls=new Map(),mapSnapshots=new Map();
 try{stored=JSON.parse(sessionStorage.getItem('veloxis-atlas-v2')||sessionStorage.getItem('veloxis-atlas-v1'));}catch{}
 const controller=createAtlasController({data,root:$('#atlas'),memberOrigin:config.memberOrigin,onCompanyResearch:id=>router.navigate({page:'companies',id})});
 for(const n of data.nodes.filter(n=>!n.parentId)){const b=el('button');b.append(createTechIcon(n.id,sectorColors[n.id]),el('span',n.label),el('small','↗'));b.onclick=()=>controller.openContext({sectorId:n.id},{animate:true,trigger:b});$('#sector-shortcuts').append(b);}
 const indices=INDEX_GROUPS.flatMap(group=>group.indices),indexHost=el('div',undefined,'index-quotes');
 const marketHeading=el('div',undefined,'market-heading');marketHeading.append(el('h2','A 股指数'),el('span','三大指数 · 科创成长 · 市场对照'));
 $('#market-strip').insertBefore(marketHeading,$('.market-note'));$('#market-strip').insertBefore(indexHost,$('.market-note'));
 const indexQuotes=createQuoteView(indexHost,{apiOrigin:'https://qt.gtimg.cn',instrumentIds:indices.map(i=>i.id),labels:Object.fromEntries(indices.map(i=>[i.id,i.name])),descriptions:Object.fromEntries(indices.map(i=>[i.id,i.group+' · '+i.code])),pollInterval:15000,fetchImpl:createIndexFetch()});
 $('.market-note').replaceChildren(document.createTextNode('参考行情 · 每 15 秒刷新 · 数据可能延迟；报价时间为上海时间，休市期间保留最近报价 · '));
 const sourceLink=el('a','数据来源：腾讯证券 ↗');sourceLink.href='https://gu.qq.com/';sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';$('.market-note').append(sourceLink);
 Promise.all([controller.ready,indexQuotes.ready]).then(()=>{initialReady=true;$('#atlas').removeAttribute('data-loading');$('#research-loading').hidden=true;});
 window.addEventListener('pagehide',()=>indexQuotes.stop());window.addEventListener('pageshow',()=>{if(currentRoute?.page==='home')indexQuotes.start();});
 function persist(){if(currentRoute?.page==='home')try{sessionStorage.setItem('veloxis-atlas-v2',JSON.stringify({...controller.snapshot(),entryKey:currentEntry}));}catch{}}
 router=createPortalRouter({onChange(route,{entryKey}){
  if(currentRoute){if(currentRoute.page!=='not-found')scrolls.set(formatRoute(currentRoute),scrollY);if(currentRoute.page==='home'){mapSnapshots.set(currentEntry,controller.snapshot());controller.deactivate();persist();}}
  currentView?.destroy();currentView=null;const home=route.page==='home';$('#research-loading').hidden=!home||initialReady;if(home)indexQuotes.start();else indexQuotes.stop();$('#atlas').hidden=!home;$('#research-page').hidden=home;
  for(const a of document.querySelectorAll('[data-page]')){a.classList.toggle('active',a.dataset.page===route.page);if(a.dataset.page===route.page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
  if(home){controller.activate();const cached=mapSnapshots.get(entryKey);let restored=cached?controller.restore(cached):false;if(!restored&&stored&&(!route.query?.sectorId||stored.entryKey===entryKey))restored=controller.restore(stored);stored=null;if(route.query?.sectorId&&!restored)controller.openContext(route.query);document.title='产业全景 · 大川激流科创投研';}
  else{controller.deactivate();currentView=renderResearchPage($('#research-page'),route,{index,onNavigate:router.navigate,memberOrigin:config.memberOrigin,quoteApiOrigin:config.quoteApiOrigin});$('#research-page h1')?.focus({preventScroll:true});}
  currentRoute=route;currentEntry=entryKey;requestAnimationFrame(()=>scrollTo(0,route.page==='not-found'?0:scrolls.get(formatRoute(route))||0));
 }});
 window.addEventListener('pagehide',persist);
 for(const b of document.querySelectorAll('[data-dialog]'))b.onclick=()=>$('#'+b.dataset.dialog).showModal();
 for(const b of document.querySelectorAll('.dialog-close'))b.onclick=()=>b.closest('dialog').close();
 if(config.memberOrigin){memberUrl(config.memberOrigin,'validation');const a=el('a','进入独立会员中心 ↗','primary-link');a.href=new URL('/account',config.memberOrigin).href;$('#member-link').append(a);$('#membership-status').textContent='服务与价格请以会员中心为准';}
 $('#public-search-open').onclick=()=>{$('#public-search').showModal();$('#public-search-input').focus();};
 $('#public-search-input').oninput=e=>{const q=e.target.value.trim().toLowerCase(),results=$('#public-search-results');results.replaceChildren();if(!q)return;
  const found=[...data.nodes.filter(n=>(n.label+' '+n.summary).toLowerCase().includes(q)).map(n=>({title:n.label,page:'tracks',id:n.id})),...queryCompanies(index,{q}).map(c=>({title:c.name,page:'companies',id:c.id})),...data.reports.filter(r=>(r.title+' '+r.summary).toLowerCase().includes(q)).map(r=>({title:r.title,page:'reports',id:r.id}))];
  for(const item of found.slice(0,25)){const a=el('a',item.title);a.href=formatRoute(item);a.onclick=()=>$('#public-search').close();results.append(a);}if(!found.length)results.append(el('p','没有匹配的公开资料。'));
 };
}catch(error){$('#research-loading').hidden=true;$('#atlas').removeAttribute('data-loading');$('#atlas-loading').hidden=true;$('#map-canvas').setAttribute('aria-busy','false');$('#load-error').hidden=false;console.error('Research portal could not load:',error.message);}
