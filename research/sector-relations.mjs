export function getSectorRelation(data,id){return data.sectorRelations?.find(r=>r.id===id)||null;}
export function relationsForSector(data,sectorId){return (data.sectorRelations||[]).filter(r=>r.fromSectorId===sectorId||r.toSectorId===sectorId);}
export function validateSectorRelations(data,{required=false}={}){
 const relations=data.sectorRelations;
 if(relations===undefined&&!required)return true;
 if(!Array.isArray(relations))throw Error('Missing sector relationships');
 const sectors=new Set((data.systems||[]).map(s=>s.nodeId)),systems=new Map((data.systems||[]).map(s=>[s.id,s.nodeId])),components=new Map((data.components||[]).map(c=>[c.id,systems.get(c.systemId)])),ids=new Set();
 const fields=(value,names)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==names.length||names.some(k=>!Object.hasOwn(value,k)))throw Error('Invalid relationship fields');};
 const text=value=>typeof value==='string'&&!!value.trim();
 for(const r of relations){
  fields(r,['id','fromSectorId','toSectorId','type','title','summary','componentIds','sources']);
  if(!text(r.id)||!/^[a-z0-9-]+$/.test(r.id)||ids.has(r.id))throw Error('Invalid relationship ID');ids.add(r.id);
  if(!sectors.has(r.fromSectorId)||!sectors.has(r.toSectorId)||r.fromSectorId===r.toSectorId)throw Error('Invalid relationship endpoint');
  if(!['technology-supply','application-support','infrastructure-support'].includes(r.type)||!text(r.title)||[...r.title].length>30||!text(r.summary)||[...r.summary].length>500)throw Error('Invalid relationship description');
  if(!Array.isArray(r.componentIds)||new Set(r.componentIds).size!==r.componentIds.length||r.componentIds.some(id=>![r.fromSectorId,r.toSectorId].includes(components.get(id))))throw Error('Invalid relationship component');
  if(!Array.isArray(r.sources)||!r.sources.length)throw Error('Missing relationship evidence');
  for(const s of r.sources){
   fields(s,['title','url','checkedAt','locator','evidenceNote']);
   if(!Object.values(s).every(text)||!/^\d{4}-\d{2}-\d{2}$/.test(s.checkedAt)||!Number.isFinite(Date.parse(s.checkedAt))||new Date(s.checkedAt).toISOString().slice(0,10)!==s.checkedAt)throw Error('Invalid relationship source');
   const url=new URL(s.url);if(url.protocol!=='https:'||url.username||url.password)throw Error('Invalid relationship source URL');
  }
 }
 return true;
}
