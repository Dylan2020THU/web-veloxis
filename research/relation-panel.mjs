import {getSectorRelation} from './sector-relations.mjs';
export function createRelationPanel({host,data,onOpenSector,onClose}){
 const nodes=new Map(data.nodes.map(n=>[n.id,n])),types={'technology-supply':'技术或产品供给','application-support':'应用支持','infrastructure-support':'基础配套'};
 const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
 function hide(){host.hidden=true;host.closest('.map-shell').classList.remove('relation-open');}
 function show(id){
  const r=getSectorRelation(data,id);if(!r){hide();return;}
  const close=el('button','×');close.className='relation-close';close.setAttribute('aria-label','关闭产业关系');close.onclick=onClose;
  const heading=el('h2',r.title);heading.tabIndex=-1;heading.id='relation-title';
  host.replaceChildren(close,el('small','INDUSTRY CONNECTION / 产业联系'),heading,el('p',nodes.get(r.fromSectorId).label+' → '+nodes.get(r.toSectorId).label),el('span',types[r.type]),el('p',r.summary));
  if(r.componentIds.length){host.append(el('h3','相关组成元素'));for(const id of r.componentIds){const c=data.components.find(c=>c.id===id),sector=data.systems.find(s=>s.id===c.systemId).nodeId,b=el('button',c.title+' ↗');b.className='relation-component';b.onclick=()=>onOpenSector(sector,c.id);host.append(b);}}
  host.append(el('h3','公开来源'));
  for(const source of r.sources){const entry=el('div'),a=el('a',source.title+' ↗');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';entry.append(a,el('small',source.locator),el('p',source.evidenceNote),el('small','核验 '+source.checkedAt));entry.className='relation-source';host.append(entry);}
  const actions=el('div');actions.className='relation-actions';for(const sector of [r.fromSectorId,r.toSectorId]){const b=el('button','进入'+nodes.get(sector).label+'系统 ↗');b.dataset.openSector=sector;b.onclick=()=>onOpenSector(sector);actions.append(b);}host.append(actions);
  host.hidden=false;host.closest('.map-shell').classList.add('relation-open');
 }
 return {show,hide,destroy(){hide();host.replaceChildren();}};
}
