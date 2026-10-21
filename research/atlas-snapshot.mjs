export function validAtlasCamera(c){
 if(!c||typeof c!=='object')return false;
 if(c.kind==='2d')return ['scale','tx','ty','fitScale','viewportWidth','viewportHeight'].every(k=>Number.isFinite(c[k]))&&c.scale>0&&c.scale<=3.5&&c.fitScale>0&&c.viewportWidth>0&&c.viewportHeight>0;
 if(c.kind!=='3d'||![c.position,c.target].every(a=>Array.isArray(a)&&a.length===3&&a.every(x=>Number.isFinite(x)&&Math.abs(x)<1000))||!['fov','near','far','zoom'].every(k=>Number.isFinite(c[k]))||c.fov<=0||c.fov>=120||c.near<=0||c.far<=c.near||c.zoom<=0||c.zoom>10)return false;
 const [x,y,z]=c.position.map((v,i)=>v-c.target[i]),distance=Math.hypot(x,y,z),elevation=Math.atan2(y,Math.hypot(x,z))*180/Math.PI;
 return distance>.1&&distance<1000&&elevation>=20-1e-6&&elevation<=75+1e-6;
}
export function normalizeAtlasSnapshot(data,value,{mode,defaultCamera}){
 if(!value||![1,2].includes(value.version)||!value.state||!value.atlas)return null;
 const nodeIds=new Set(data.nodes.map(n=>n.id)),systems=data.systems,relations=new Set((data.sectorRelations||[]).map(r=>r.id));
 const sector=systems.some(s=>s.nodeId===value.atlas.selectedSectorId)?value.atlas.selectedSectorId:null;
 const component=data.components.find(c=>c.id===value.atlas.selectedComponentId&&systems.find(s=>s.id===c.systemId)?.nodeId===sector)?.id||null;
 const company=component&&data.companyLinks.some(l=>l.componentId===component&&l.companyId===value.atlas.selectedCompanyId)?value.atlas.selectedCompanyId:null;
 function overview(o){
  const c=o?.camera,compatible=o?.mode===mode&&c?.kind===mode&&validAtlasCamera(c);
  return {mode,camera:structuredClone(compatible?c:defaultCamera),selectedRelationId:relations.has(o?.selectedRelationId)?o.selectedRelationId:null};
 }
 const current=value.version===1?{mode:'2d',camera:{...value.camera,kind:'2d'}}:value.overview;
 const returned=value.version===1?{mode:'2d',camera:{...value.atlas.returnCamera,kind:'2d'}}:value.returnOverview;
 const identity=v=>typeof v==='string'&&/^[a-z0-9_-]+$/i.test(v)?v:null;
 let trigger=null;if(value.returnTrigger&&typeof value.returnTrigger==='object'&&!Array.isArray(value.returnTrigger)){
  const entries=Object.entries(value.returnTrigger).filter(([,v])=>v!=null&&v!=='');
  if(entries.length&&entries.every(([k,v])=>['id','testid','region'].includes(k)&&identity(v)))trigger=Object.fromEntries(entries);
 }
 return {version:2,state:{expanded:[...new Set((Array.isArray(value.state.expanded)?value.state.expanded:[]).filter(id=>nodeIds.has(id)))],selectedId:nodeIds.has(value.state.selectedId)?value.state.selectedId:null},
  atlas:{selectedSectorId:sector,selectedComponentId:component,selectedCompanyId:company},overview:overview(current),returnOverview:sector?overview(returned):null,lastFocus:identity(value.lastFocus),returnTrigger:trigger};
}
