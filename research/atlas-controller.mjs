import {reduceMap,visibleNodes,memberUrl} from './map-state.mjs';
import {createPanoramaView} from './panorama-view.mjs';
import {normalizeAtlasSnapshot,validAtlasCamera} from './atlas-snapshot.mjs';
import {createRelationPanel} from './relation-panel.mjs';
import {createTechIcon,sectorColors} from './tech-icons.mjs';
import {initialAtlasState,reduceAtlas} from './atlas-state.mjs';
import {createSystemView} from './system-view.mjs';
export function createAtlasController({data,root:host,onCompanyResearch,memberOrigin=null}){
const config={memberOrigin},$=s=>host.querySelector(s);
function el(tag,text,className){const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e;}
let active=false,preserved=null,actionId=0,focusAbort=null,selectedRelationId=null,hoveredRelationId=null,fallbackCamera=null,fallbackReturnCamera=null;
  const {nodes,reports}=data,byId=new Map(nodes.map(n=>[n.id,n]));let state={expanded:new Set(),selectedId:null},lastFocus=null,atlas=initialAtlasState(),returnTrigger=null;
  const depth=n=>n.parentId?1+depth(byId.get(n.parentId)):0;
  const root=n=>n.parentId?root(byId.get(n.parentId)):n;
  function setDirectory(open,restoreFocus=true){$('#directory').classList.toggle('open',open);$('#open-directory').setAttribute('aria-expanded',open);if(restoreFocus)(open?$('input[type="search"]'):$('#open-directory')).focus();}
  for(const n of nodes)n.color=sectorColors[root(n).id];
  for(const n of nodes.filter(n=>!n.parentId)){const option=el('option',n.label);option.value=n.id;$('#sector-picker').append(option);}
  const view=createPanoramaView({root:host,data,onSelectNode:id=>dispatch({type:'enter',id}),onToggleNode:id=>dispatch({type:'toggle',id}),onPreviewSector:sectorId=>{atlas=reduceAtlas(data,atlas,{type:'hover',sectorId});view.setSectorState(atlas);},onSelectRelation:chooseRelation,onPreviewRelation:id=>{hoveredRelationId=id;view.setRelationState({hoveredRelationId,selectedRelationId});},onClearRelation:()=>chooseRelation(null),onModeChange:()=>{
    cancelNavigation();if(fallbackCamera)view.restoreCamera(fallbackCamera);
    if(atlas.returnOverview)atlas={...atlas,returnOverview:{...atlas.returnOverview,mode:'2d',camera:fallbackReturnCamera||view.getCamera()}};
    fallbackCamera=null;fallbackReturnCamera=null;
  }});
  const relationPanel=createRelationPanel({host:$('#relation-panel'),data,onOpenSector:(sectorId,componentId)=>openContext({sectorId,componentId},{animate:true,trigger:document.activeElement}),onClose:()=>{chooseRelation(null);$('#atlas-3d-canvas')?.focus({preventScroll:true});}});
  function chooseRelation(id){cancelNavigation();selectRelation(id);}
  function selectRelation(id){selectedRelationId=data.sectorRelations?.some(r=>r.id===id)?id:null;view.setRelationState({hoveredRelationId,selectedRelationId});if(selectedRelationId&&!atlas.selectedSectorId)relationPanel.show(selectedRelationId);else relationPanel.hide();}
  if(!data.sectorRelations?.length)$('#scene-instruction').textContent='暂无已核验跨领域关系，仍可探索各领域系统';
  function overview(){return {mode:view.getMode(),camera:view.getCamera(),selectedRelationId};}
  function cancelNavigation(){actionId++;focusAbort?.abort();focusAbort=null;}
  async function openContext({sectorId,componentId},{animate=false,trigger=document.activeElement}={}){
    if(!data.systems.some(s=>s.nodeId===sectorId))return 'invalid';
    cancelNavigation();const id=actionId,returnView=atlas.returnOverview||overview();focusAbort=new AbortController();
    if(animate){const result=await view.focus(sectorId,{animate:true,signal:focusAbort.signal});if(!result||id!==actionId||!active)return 'cancelled';}
    showSystem(sectorId,trigger,returnView);if(componentId)selectComponent(componentId);return 'opened';
  }
  function openSystem(sectorId,trigger=document.activeElement){return openContext({sectorId},{animate:true,trigger});}
  const systemView=createSystemView($('#system-diagram'),selectComponent);
  function sourceElements(sources){return sources.map(s=>{const wrap=el('div'),a=el('a',s.title+' ↗');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';wrap.append(a,el('small','核验 '+s.checkedAt));return wrap;});}
  function currentSystem(){return data.systems.find(s=>s.nodeId===atlas.selectedSectorId);}
  function updateBreadcrumb(){const system=currentSystem(),component=data.components.find(c=>c.id===atlas.selectedComponentId),path=system?[byId.get(system.nodeId).label,system.title,component?.title].filter(Boolean).join(' / '):state.selectedId?root(byId.get(state.selectedId)).label:'产业全景';$('#map-context').textContent=path;$('#system-breadcrumb').textContent=path;$('#sector-picker').value=system?.nodeId||(state.selectedId?root(byId.get(state.selectedId)).id:'');}
  function showSystem(sectorId,trigger=document.activeElement,returnView=overview()){
    const first=!atlas.selectedSectorId;if(first)returnTrigger={element:trigger,id:trigger?.id,testid:trigger?.dataset.testid,region:trigger?.dataset.region};
    atlas=reduceAtlas(data,atlas,{type:'open',sectorId,overview:returnView});const system=currentSystem();if(!system)return;
    relationPanel.hide();view.setActive(false);
    state={...state,selectedId:null};setDirectory(false,false);render(false);
    $('#system-panel').hidden=false;$('.map-shell').classList.add('panel-open');$('#view-panorama').setAttribute('aria-pressed','false');$('#view-exploded').setAttribute('aria-pressed','true');
    $('#system-title').textContent=system.title;$('#system-scope').textContent=system.scope;$('#system-panel').style.setProperty('--sector',byId.get(sectorId).color);
    const components=data.components.filter(c=>c.systemId===system.id);
    $('#component-buttons').replaceChildren(...components.map((c,i)=>{const b=el('button');b.dataset.componentButton=c.id;b.setAttribute('aria-pressed','false');b.append(el('span',String(i+1).padStart(2,'0')),el('strong',c.title),el('small',c.kind==='physical'?'实体部件':'功能模块'));b.onclick=()=>selectComponent(c.id);return b;}));
    systemView.clear();systemView.show(system,components);renderComponent();view.setSectorState(atlas);updateBreadcrumb();$('#system-title').focus({preventScroll:true});
  }
  function selectComponent(componentId){atlas=reduceAtlas(data,atlas,{type:'component',componentId});systemView.setSelection(atlas.selectedComponentId);renderComponent();updateBreadcrumb();}
  function renderReports(host,nodeId){host.replaceChildren();const related=reports.filter(r=>r.nodeIds.includes(nodeId));if(!related.length){host.append(el('p','专题报告待发布。当前可浏览技术介绍与公开来源。'));return;}for(const r of related){const card=el('article',null,'report-preview'),url=memberUrl(config.memberOrigin,r.id),title=el(url?'a':'h4',r.title,'report-link');if(url){title.href=url;title.rel='noopener';}card.append(el('small',r.demo?'演示报告 · 非正式研究':'专题研究'),title,el('p',r.summary));if(!url)card.append(el('small','完整报告入口暂未开放'));host.append(card);}}
  function renderComponent(){
    const system=currentSystem(),component=data.components.find(c=>c.id===atlas.selectedComponentId);$('#company-detail').hidden=true;$('#company-detail').replaceChildren();$('#company-groups').replaceChildren();$('#component-related').replaceChildren();
    $('#component-kind').textContent=component?(component.kind==='physical'?'PHYSICAL COMPONENT / 实体部件':'FUNCTIONAL MODULE / 功能模块'):'SYSTEM OVERVIEW';$('#component-title').textContent=component?.title||'选择一个组成元素';$('#component-summary').textContent=component?.summary||'从图中部件或下方目录开始，查看其系统作用与中外企业。';$('#component-role').textContent=component?.role||'';
    for(const b of document.querySelectorAll('[data-component-button]'))b.setAttribute('aria-pressed',b.dataset.componentButton===component?.id);
    if(component){
      const links=data.companyLinks.filter(l=>l.componentId===component.id);
      for(const [region,label]of [['china','中国企业'],['overseas','海外企业']]){const group=el('section',null,'company-group'),filtered=links.filter(l=>data.companies.find(c=>c.id===l.companyId).region===region);group.append(el('h4',label+' / '+String(filtered.length).padStart(2,'0')));if(!filtered.length)group.append(el('p','资料正在核验'));for(const link of filtered){const company=data.companies.find(c=>c.id===link.companyId),b=el('button',null,'company-card');b.dataset.company=company.id;b.setAttribute('aria-expanded','false');b.append(el('strong',company.name),el('small',company.countryOrRegion+' · '+(link.leadership?'具备专项依据':'相关企业')),el('span',link.products.join(' / ')));b.onclick=()=>selectCompany(company.id);group.append(b);}$('#company-groups').append(group);}
      $('#component-related').append(el('h4','相关赛道'));for(const id of component.nodeIds){const b=el('button',byId.get(id).label+' ↗');b.onclick=()=>{if(!byId.get(id).parentId)setDirectory(true);else dispatch({type:'reveal',id});};$('#component-related').append(b);}
    }
    $('#component-sources').replaceChildren(...sourceElements(component?.sources||system.sources));renderReports($('#system-reports'),system.nodeId);$('.system-inspector').scrollTop=0;
  }
  function selectCompany(companyId){
    atlas=reduceAtlas(data,atlas,{type:'company',companyId});const company=data.companies.find(c=>c.id===atlas.selectedCompanyId),link=data.companyLinks.find(l=>l.componentId===atlas.selectedComponentId&&l.companyId===companyId);if(!company||!link)return;
    for(const b of document.querySelectorAll('[data-company]'))b.setAttribute('aria-expanded',b.dataset.company===companyId);
    const detail=$('#company-detail');detail.hidden=false;detail.replaceChildren(el('h4',company.name),el('p',link.role),el('h5','相关产品 / 业务'),el('p',link.products.join('、')),el('h5','公司主体与上市信息'));
    detail.append(el('p',company.countryOrRegion+' · '+(company.listing?(company.listing.status==='listed'?company.listing.securities.map(s=>s.market+' '+s.ticker).join(' / '):'未上市'):'上市信息待核验')));
    if(company.parentCompanyId){const parent=data.companies.find(c=>c.id===company.parentCompanyId);detail.append(el('p','所属 / 控股主体：'+parent.name+'。上市代码按各自主体分别记录。'));}
    if(company.listing)detail.append(el('small','身份资料时期 '+company.listing.asOf));
    if(link.leadership)detail.append(el('h5','专项入选依据'),el('p',link.leadership.statement),el('small','事实时期 '+link.leadership.period));else detail.append(el('p','收录依据：公开产品资料证实与本元素相关，未据此判定市场排名。'));
    const research=el('button','进入企业研究','research-entry');research.onclick=()=>onCompanyResearch(company.id);detail.append(research);
    const sources=[...link.sources,...company.sources,...(company.listing?.sources||[]),...(link.leadership?.sources||[])];detail.append(...sourceElements([...new Map(sources.map(s=>[s.url,s])).values()]));
  }
  function closeSystem(restoreFocus=true){
    if(fallbackReturnCamera){fallbackCamera=fallbackReturnCamera;fallbackReturnCamera=null;}
    cancelNavigation();const returned=atlas.returnOverview;if(!returned)return;atlas=reduceAtlas(data,atlas,{type:'close'});systemView.clear();$('#system-panel').hidden=true;$('.map-shell').classList.remove('panel-open');$('#view-panorama').setAttribute('aria-pressed','true');$('#view-exploded').setAttribute('aria-pressed','false');view.setSectorState(atlas);view.setActive(active);view.restoreCamera(returned.camera);selectRelation(returned.selectedRelationId);updateBreadcrumb();
    if(restoreFocus){const t=returnTrigger,live=t?.element?.isConnected?t.element:t?.id?document.getElementById(t.id):t?.testid?document.querySelector(`[data-testid="${t.testid}"]`):t?.region?document.querySelector(`[data-region="${t.region}"]`):null;((live&&live.getClientRects().length&&!live.closest('#directory:not(.open)'))?live:$('#sector-picker')).focus({preventScroll:true});}returnTrigger=null;
  }
  function dispatch(action){
    const focused=document.activeElement;lastFocus=focused?.dataset.testid||focused?.dataset.toggle||focused?.id;
    if(['select','reveal','enter'].includes(action.type)&&byId.get(action.id)?.parentId===null){openSystem(action.id,focused);return;}
    if(action.type==='reset'){closeSystem(false);selectRelation(null);state=reduceMap(nodes,state,action);render(true);$('#sector-picker').value='';return;}
    state=reduceMap(nodes,state,action);
    render(false);
    if(['select','reveal','enter'].includes(action.type)){cancelNavigation();selectRelation(null);setDirectory(false,false);view.focus(action.id);$('#detail-title').focus({preventScroll:true});}
    else if(action.type==='toggle'&&state.expanded.has(action.id))view.focus(action.id);
  }
  function render(refit){
    const tree=$('#tree');tree.replaceChildren();
    for(const n of visibleNodes(nodes,state.expanded)){
      const row=el('div',null,'tree-row level-'+depth(n)+(n.id===state.selectedId?' selected':''));row.style.setProperty('--sector',n.color);
      const children=nodes.filter(c=>c.parentId===n.id),toggle=el('button',children.length?(state.expanded.has(n.id)?'⌄':'›'):'·','tree-toggle');
      toggle.setAttribute('aria-label',(state.expanded.has(n.id)?'收起 ':'展开 ')+n.label);if(children.length){toggle.setAttribute('aria-expanded',state.expanded.has(n.id));toggle.onclick=()=>{dispatch({type:'toggle',id:n.id});tree.querySelector(`[data-toggle="${n.id}"]`)?.focus();};toggle.dataset.toggle=n.id;}else{toggle.disabled=true;toggle.setAttribute('aria-hidden','true');}
      const select=el('button',null,'tree-select');select.setAttribute('aria-label','查看 '+n.label);select.append(createTechIcon(n.id,n.color),el('span',n.label));select.onclick=()=>dispatch({type:'select',id:n.id});row.append(toggle,select);if(!n.parentId)row.append(el('span','03','tree-count'));tree.append(row);
    }
    view.draw(state,refit);const n=byId.get(state.selectedId);$('#detail').hidden=!n;
    updateBreadcrumb();view.setSectorState(atlas);if(!n)return;
    $('#detail-level').textContent=['RESEARCH SECTOR / 研究领域','INDUSTRY TRACK / 细分赛道','KEY TECHNOLOGY / 关键技术'][depth(n)];$('#detail-title').textContent=n.label;$('#detail-summary').textContent=n.summary;
    $('#detail').style.setProperty('--sector',n.color);$('#detail-art').replaceChildren(createTechIcon(n.id,n.color));
    $('#detail-children').replaceChildren(...nodes.filter(c=>c.parentId===n.id).map(c=>{const b=el('button',c.label+' ↗');b.onclick=()=>dispatch({type:'reveal',id:c.id});return b;}));
    const related=reports.filter(r=>r.nodeIds.includes(n.id));$('#detail-reports').replaceChildren();
    if(!related.length)$('#detail-reports').append(el('p','专题报告待发布。当前可浏览技术介绍与公开来源。'));
    for(const report of related){const card=el('article',null,'report-preview'),url=memberUrl(config.memberOrigin,report.id),title=el(url?'a':'h4',report.title,'report-link');if(url){title.href=url;title.rel='noopener';}card.append(el('small',report.demo?'演示报告 · 非正式研究':'专题研究'),title,el('p',report.summary));if(!url)card.append(el('small','完整报告入口暂未开放'));$('#detail-reports').append(card);}
    $('#detail-sources').replaceChildren(...n.sources.map(s=>{const wrap=el('div'),a=el('a',s.title+' ↗');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';wrap.append(a,el('small','核对日期 '+s.checkedAt));return wrap;}));
  }
  $('#detail .detail-close').onclick=()=>{state={...state,selectedId:null};render(false);const target=lastFocus&&(document.getElementById(lastFocus)||Array.from(document.querySelectorAll('[data-testid],[data-toggle]')).find(e=>e.dataset.testid===lastFocus||e.dataset.toggle===lastFocus));(target||$('#fit')).focus({preventScroll:true});};
  $('#zoom-in').onclick=()=>view.zoom(1.2);$('#zoom-out').onclick=()=>view.zoom(1/1.2);$('#fit').onclick=()=>{cancelNavigation();view.fit();};$('#reset').onclick=()=>dispatch({type:'reset'});
  $('#view-panorama').onclick=()=>closeSystem();$('#view-exploded').onclick=()=>openSystem(atlas.selectedSectorId||(state.selectedId?root(byId.get(state.selectedId)).id:'ai'));$('#inspect-layers').onclick=()=>openSystem(root(byId.get(state.selectedId)).id);
  $('#close-system').onclick=()=>closeSystem();$('#system-tracks').onclick=()=>setDirectory(true);
  $('#sector-picker').onchange=e=>{if(e.target.value)dispatch({type:'enter',id:e.target.value});else dispatch({type:'reset'});};
  $('#immersive').onclick=()=>{const active=$('.map-shell').classList.toggle('immersive');$('#immersive').setAttribute('aria-pressed',active);document.body.classList.toggle('in-immersive',active);for(const background of document.querySelectorAll('.topbar,.intro,footer'))background.inert=active;view.fit();};
  const input=$('input[type="search"]');input.oninput=()=>{const q=input.value.trim().toLocaleLowerCase(),results=$('#search-results');results.replaceChildren();results.hidden=!q;$('#tree').hidden=!!q;if(!q)return;const found=nodes.filter(n=>n.label.toLowerCase().includes(q)||n.labelEn?.toLowerCase().includes(q));for(const n of found){const button=el('button',n.label);button.append(el('small',root(n).label+' / '+['领域','赛道','技术'][depth(n)]));button.onclick=()=>{input.value='';input.oninput();dispatch({type:'reveal',id:n.id});};results.append(button);}if(!found.length)results.append(el('p','没有匹配的节点，请尝试其他关键词。'));};
  $('#open-directory').onclick=()=>setDirectory(true);$('#close-directory').onclick=()=>setDirectory(false);
  const onKeyDown=e=>{if(!active)return;if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();setDirectory(true);}if(e.key==='Escape'){if(document.querySelector('dialog[open]'))return;if($('#directory').classList.contains('open'))setDirectory(false);else if(!$('#detail').hidden)$('#detail .detail-close').click();else if(!$('#relation-panel').hidden)chooseRelation(null);else if(atlas.selectedSectorId)closeSystem();else if($('.map-shell').classList.contains('immersive'))$('#immersive').click();else cancelNavigation();}};document.addEventListener('keydown',onKeyDown);
  render(true);
  function snapshot(){return {version:2,atlas:{selectedSectorId:atlas.selectedSectorId,selectedComponentId:atlas.selectedComponentId,selectedCompanyId:atlas.selectedCompanyId},state:{expanded:[...state.expanded],selectedId:state.selectedId},overview:overview(),returnOverview:structuredClone(atlas.returnOverview),lastFocus,returnTrigger:returnTrigger?{id:returnTrigger.id,testid:returnTrigger.testid,region:returnTrigger.region}:null};}
  function restore(value){
    cancelNavigation();
    if(view.getMode()==='3d'){
      const current=value?.version===1?{...value.camera,kind:'2d'}:value?.overview?.camera;
      const returned=value?.version===1?{...value.atlas?.returnCamera,kind:'2d'}:value?.returnOverview?.camera;
      fallbackCamera=current?.kind==='2d'&&validAtlasCamera(current)?structuredClone(current):null;
      fallbackReturnCamera=returned?.kind==='2d'&&validAtlasCamera(returned)?structuredClone(returned):null;
    }
    value=normalizeAtlasSnapshot(data,value,{mode:view.getMode(),defaultCamera:view.getCamera()});if(!value)return false;
    const a=value.atlas;
    state={expanded:new Set(value.state.expanded),selectedId:value.state.selectedId};
    if(a.selectedSectorId){showSystem(a.selectedSectorId,undefined,value.returnOverview);if(a.selectedComponentId)selectComponent(a.selectedComponentId);if(a.selectedCompanyId)selectCompany(a.selectedCompanyId);atlas={...atlas,returnOverview:value.returnOverview};}
    else{if(atlas.selectedSectorId)closeSystem(false);render(false);}
    returnTrigger=value.returnTrigger;lastFocus=value.lastFocus;view.restoreCamera(value.overview.camera);selectRelation(value.overview.selectedRelationId);return true;
  }
  return {snapshot,restore,activate(){active=true;host.inert=false;view.setActive(!atlas.selectedSectorId);if(preserved){view.restoreCamera(preserved.overview.camera);preserved=null;}},deactivate(){cancelNavigation();preserved=snapshot();active=false;host.inert=true;if($('.map-shell').classList.contains('immersive'))$('#immersive').click();view.setActive(false);return preserved;},openContext,destroy(){cancelNavigation();active=false;document.removeEventListener('keydown',onKeyDown);systemView.clear();relationPanel.destroy();view.destroy();}};
}
