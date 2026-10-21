import {validateData,normalizeMarket} from './map-state.mjs';

export function buildResearchIndex(data){
  validateData(data);
  return {data,nodes:new Map(data.nodes.map(n=>[n.id,n])),companies:new Map(data.companies.map(c=>[c.id,c])),components:new Map(data.components.map(c=>[c.id,c])),systems:new Map(data.systems.map(s=>[s.id,s]))};
}
const contains=(values,q)=>!q||values.join(' ').toLocaleLowerCase().includes(q.trim().toLocaleLowerCase());
function descendants(index,id){
  const ids=new Set([id]);let size;
  do{size=ids.size;for(const n of index.data.nodes)if(ids.has(n.parentId))ids.add(n.id);}while(size!==ids.size);
  return ids;
}
export function queryCompanies(index,{q='',trackId='',country='',listingStatus='',market=''}={}){
  const track=trackId?new Set(getTrackResearch(index,trackId)?.companies.map(c=>c.id)||[]):null;
  return index.data.companies.filter(c=>(!track||track.has(c.id))&&(!country||c.countryOrRegion===country||c.region===country)&&(!listingStatus||(c.listing?.status||'unknown')===listingStatus)&&(!market||c.listing?.securities.some(s=>normalizeMarket(s.market)===market))&&contains([c.name,...(c.listing?.securities||[]).map(s=>s.ticker)],q)).sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
}
export function getCompanyResearch(index,id){
  const company=index.companies.get(id);if(!company)return null;
  const links=index.data.companyLinks.filter(l=>l.companyId===id),tracks=new Set();
  for(const link of links){const component=index.components.get(link.componentId);for(let nodeId of [...component.nodeIds,index.systems.get(component.systemId).nodeId]){while(nodeId){tracks.add(nodeId);nodeId=index.nodes.get(nodeId)?.parentId;}}}
  const reports=index.data.reports.filter(r=>r.companyIds?.includes(id));
  return {company,links,instruments:(index.data.instruments||[]).filter(i=>i.companyId===id),notes:(index.data.researchNotes||[]).filter(n=>n.targetKind==='company'&&n.targetId===id),reports,relatedTrackReports:index.data.reports.filter(r=>!r.companyIds?.includes(id)&&r.nodeIds.some(n=>tracks.has(n)))};
}
export function getTrackResearch(index,id){
  const node=index.nodes.get(id);if(!node)return null;const ids=descendants(index,id);
  const systems=index.data.systems.filter(s=>ids.has(s.nodeId));
  const components=index.data.components.filter(c=>c.nodeIds.some(n=>ids.has(n))||systems.some(s=>s.id===c.systemId));
  const componentIds=new Set(components.map(c=>c.id)),companyIds=new Set(index.data.companyLinks.filter(l=>componentIds.has(l.componentId)).map(l=>l.companyId));
  return {node,systems,components,companies:index.data.companies.filter(c=>companyIds.has(c.id)),notes:(index.data.researchNotes||[]).filter(n=>n.targetKind==='track'&&n.targetId===id),reports:index.data.reports.filter(r=>r.nodeIds.some(n=>ids.has(n)))};
}
export function queryReports(index,{q='',trackId='',topic=''}={}){
  const ids=trackId?descendants(index,trackId):null;
  return index.data.reports.filter(r=>(!ids||r.nodeIds.some(n=>ids.has(n)))&&(!topic||r.topics?.includes(topic))&&contains([r.title,r.summary],q)).sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
}
export async function exportCatalog(data){
  validateData(data);
  const revision=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(data))))).map(b=>b.toString(16).padStart(2,'0')).join('');
  const targets=[...data.nodes.map(n=>({kind:'track',id:n.id,title:n.label,path:'#/tracks/'+n.id})),...data.companies.map(c=>({kind:'company',id:c.id,title:c.name,path:'#/companies/'+c.id})),...data.reports.map(r=>({kind:'report',id:r.id,title:r.title,path:'#/reports/'+r.id}))];
  return {schemaVersion:1,revision,targets,instruments:data.instruments||[]};
}
