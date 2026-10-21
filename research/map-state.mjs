import {validateSectorRelations} from './sector-relations.mjs';
export function visibleNodes(nodes, expanded) {
  const byId = new Map(nodes.map(n => [n.id,n]));
  return nodes.filter(node => {
    let parent=node.parentId;
    while (parent) {
      if (!expanded.has(parent)) return false;
      parent=byId.get(parent)?.parentId;
    }
    return true;
  });
}

export function reduceMap(nodes, state, action) {
  if (action.type==='reset') return {expanded:new Set(),selectedId:null};
  const byId=new Map(nodes.map(n=>[n.id,n]));
  if (!byId.has(action.id)) return state;
  const expanded=new Set(state.expanded);
  let selectedId=state.selectedId;
  if (action.type==='select') selectedId=action.id;
  if (action.type==='reveal'||action.type==='enter') {
    selectedId=action.id;
    if(action.type==='enter'&&nodes.some(n=>n.parentId===action.id))expanded.add(action.id);
    let parent=byId.get(action.id).parentId;
    while (parent) { expanded.add(parent); parent=byId.get(parent).parentId; }
  }
  if (action.type==='toggle') {
    if (expanded.has(action.id)) {
      const descendants=new Set([action.id]);
      let size;
      do {
        size=descendants.size;
        for (const n of nodes) if(descendants.has(n.parentId))descendants.add(n.id);
      } while(size!==descendants.size);
      for (const id of descendants) expanded.delete(id);
      if(descendants.has(selectedId))selectedId=action.id;
    } else if(nodes.some(n=>n.parentId===action.id)) expanded.add(action.id);
  }
  return {expanded,selectedId};
}

export function memberUrl(origin, reportId) {
  if(!origin)return null;
  const url=new URL(origin);
  if ((url.protocol!=='https:' && !(url.protocol==='http:' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname))) ||
      url.username || url.password || url.pathname!=='/' || url.search || url.hash || !/^[a-z0-9-]+$/.test(reportId)) {
    throw new Error('Invalid member link');
  }
  return new URL('/reports/'+encodeURIComponent(reportId),url.origin).href;
}

export function normalizeMarket(market) {
  return ({'上海证券交易所':'SSE','上海证券交易所科创板':'SSE','深圳证券交易所':'SZSE','北京证券交易所':'BSE','香港交易所':'HKEX','东京证券交易所':'TSE','Nasdaq':'NASDAQ','法兰克福证券交易所':'FWB'})[market]||market;
}

export function validateData(data) {
  const keys=(value,allowed)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!allowed.includes(k)))throw new Error('Unknown or private public field');};
  const textFields=(value,names)=>{for(const key of names)if(value[key]!==undefined&&typeof value[key]!=='string')throw new Error('Invalid public text');};
  keys(data,['nodes','reports','systems','components','companies','companyLinks','instruments','researchNotes','sectorRelations']);
  if(!Array.isArray(data.nodes)||!Array.isArray(data.reports))throw new Error('Invalid public data');
  const ids=new Set();
  for(const n of data.nodes) {
    keys(n,['id','parentId','label','labelEn','color','summary','sources']);textFields(n,['id','label','labelEn','color','summary']);
    if(n.parentId!==null&&typeof n.parentId!=='string')throw new Error('Invalid parent');
    if(n.sources!==undefined){if(!Array.isArray(n.sources))throw new Error('Invalid sources');for(const s of n.sources){keys(s,['title','url','checkedAt']);textFields(s,['title','url','checkedAt']);if(!s.title||!/^\d{4}-\d{2}-\d{2}$/.test(s.checkedAt)||new URL(s.url).protocol!=='https:')throw new Error('Invalid source');}}
    if(typeof n.id!=='string'||!/^[a-z0-9-]+$/.test(n.id)||ids.has(n.id))throw new Error('Duplicate or invalid node');
    ids.add(n.id);
  }
  const byId=new Map(data.nodes.map(n=>[n.id,n]));
  for(const n of data.nodes) {
    const visited=new Set([n.id]);
    let parent=n.parentId;
    while(parent) {
      if(!ids.has(parent)||visited.has(parent))throw new Error('Invalid parent graph');
      visited.add(parent); parent=byId.get(parent).parentId;
    }
  }
  const reports=new Set();
  for(const r of data.reports) {
    keys(r,['id','title','summary','nodeIds','author','publishedAt','version','demo','topics','companyIds']);textFields(r,['id','title','summary','author','publishedAt']);
    if(r.demo!==undefined&&typeof r.demo!=='boolean')throw new Error('Invalid report label');
    if(r.version!==undefined&&(!Number.isSafeInteger(r.version)||r.version<1))throw new Error('Invalid report version');
    if(typeof r.id!=='string'||!/^[a-z0-9-]+$/.test(r.id)||reports.has(r.id)||!Array.isArray(r.nodeIds)||r.nodeIds.some(id=>!ids.has(id)))throw new Error('Invalid report');
    reports.add(r.id);
  }
  const collections=['systems','components','companies','companyLinks'];
  if(collections.every(k=>data[k]===undefined)){
    if(data.instruments!==undefined||data.researchNotes!==undefined||data.reports.some(r=>r.companyIds!==undefined||r.topics!==undefined))throw new Error('Research collections require atlas');
    validateSectorRelations(data);return true;
  }
  if(collections.some(k=>!Array.isArray(data[k])))throw new Error('Incomplete atlas collections');
  const requiredText=(value,names)=>{for(const key of names)if(typeof value[key]!=='string'||!value[key].trim())throw new Error('Missing atlas text');};
  const date=value=>{
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw new Error('Invalid atlas date');
  };
  const sources=value=>{
    if(!Array.isArray(value)||!value.length)throw new Error('Missing atlas sources');
    for(const s of value){
      keys(s,['title','url','checkedAt','publishedAt']);requiredText(s,['title','url','checkedAt']);date(s.checkedAt);if(s.publishedAt!==undefined)date(s.publishedAt);
      const url=new URL(s.url);if(url.protocol!=='https:'||url.username||url.password)throw new Error('Invalid atlas source');
    }
  };
  const index=(items,fields)=>{
    const map=new Map();
    for(const item of items){keys(item,fields);if(typeof item.id!=='string'||!/^[a-z0-9-]+$/.test(item.id)||map.has(item.id))throw new Error('Duplicate or invalid atlas ID');map.set(item.id,item);}
    return map;
  };
  const systems=index(data.systems,['id','nodeId','title','scope','diagramAsset','sources']);
  const components=index(data.components,['id','systemId','title','kind','summary','role','nodeIds','sources']);
  const companies=index(data.companies,['id','name','region','countryOrRegion','parentCompanyId','listing','sources']);
  const sectors=new Set();
  for(const system of systems.values()){
    requiredText(system,['nodeId','title','scope','diagramAsset']);sources(system.sources);
    if(!byId.has(system.nodeId)||byId.get(system.nodeId).parentId!==null||sectors.has(system.nodeId)||!/^assets\/system-[a-z0-9-]+\.png$/.test(system.diagramAsset))throw new Error('Invalid system');
    sectors.add(system.nodeId);
  }
  for(const component of components.values()){
    requiredText(component,['systemId','title','summary','role']);sources(component.sources);
    if(!systems.has(component.systemId)||!['physical','functional'].includes(component.kind)||!Array.isArray(component.nodeIds)||component.nodeIds.some(id=>!ids.has(id))||new Set(component.nodeIds).size!==component.nodeIds.length)throw new Error('Invalid component');
  }
  for(const company of companies.values()){
    requiredText(company,['name','countryOrRegion']);sources(company.sources);
    if(!['china','overseas'].includes(company.region))throw new Error('Invalid company region');
    const visited=new Set([company.id]);let parent=company.parentCompanyId;
    while(parent!==undefined){if(typeof parent!=='string'||!companies.has(parent)||visited.has(parent))throw new Error('Invalid company parent');visited.add(parent);parent=companies.get(parent).parentCompanyId;}
    if(company.listing!==null){
      const listing=company.listing;keys(listing,['status','securities','asOf','sources']);date(listing.asOf);sources(listing.sources);
      if(!['listed','unlisted'].includes(listing.status)||!Array.isArray(listing.securities)||(listing.status==='listed'?listing.securities.length===0:listing.securities.length!==0))throw new Error('Invalid listing');
      for(const security of listing.securities){keys(security,['market','ticker']);requiredText(security,['market','ticker']);}
    }
  }
  const pairs=new Set();
  for(const link of data.companyLinks){
    keys(link,['componentId','companyId','role','products','sources','leadership']);requiredText(link,['componentId','companyId','role']);sources(link.sources);
    const pair=link.componentId+':'+link.companyId;
    if(!components.has(link.componentId)||!companies.has(link.companyId)||pairs.has(pair)||!Array.isArray(link.products)||!link.products.length||link.products.some(p=>typeof p!=='string'||!p.trim()))throw new Error('Invalid company association');
    pairs.add(pair);
    if(link.leadership!==undefined){
      keys(link.leadership,['type','statement','period','sources']);requiredText(link.leadership,['statement','period']);sources(link.leadership.sources);
      if(!['market-position','commercial-scale','technology'].includes(link.leadership.type))throw new Error('Invalid leadership evidence');
    }
  }
  for(const r of data.reports){
    if(r.publishedAt!==undefined)date(r.publishedAt);
    for(const field of ['topics','companyIds'])if(r[field]!==undefined&&(!Array.isArray(r[field])||r[field].some(x=>typeof x!=='string'||!x.trim())||new Set(r[field]).size!==r[field].length))throw new Error('Invalid report associations');
    if(r.companyIds?.some(id=>!companies.has(id)))throw new Error('Unknown report company');
  }
  if(data.instruments!==undefined){
    if(!Array.isArray(data.instruments))throw new Error('Invalid instruments');
    const seen=new Set();
    for(const instrument of data.instruments){
      keys(instrument,['id','kind','market','code','name','unit','companyId','sources']);requiredText(instrument,['id','kind','market','code','name','unit']);sources(instrument.sources);
      if(!['SSE','SZSE','BSE'].includes(instrument.market)||!['stock','index'].includes(instrument.kind)||!/^\d{6}$/.test(instrument.code)||instrument.id!==`${instrument.market}:${instrument.kind}:${instrument.code}`||seen.has(instrument.id))throw new Error('Invalid instrument identity');
      if(instrument.kind==='index'){
        if(instrument.unit!=='points'||instrument.companyId!==null)throw new Error('Invalid index');
      }else{
        const company=companies.get(instrument.companyId);
        if(instrument.unit!=='CNY'||company?.listing?.status!=='listed'||!company.listing.securities.some(s=>normalizeMarket(s.market)===instrument.market&&s.ticker===instrument.code))throw new Error('Instrument does not belong to company');
      }
      seen.add(instrument.id);
    }
  }
  if(data.researchNotes!==undefined){
    if(!Array.isArray(data.researchNotes))throw new Error('Invalid research notes');
    const notes=index(data.researchNotes,['id','targetKind','targetId','overview','questions','author','publishedAt','version','sources']);
    for(const note of notes.values()){
      requiredText(note,['targetKind','targetId','overview','author']);date(note.publishedAt);sources(note.sources);
      const target=note.targetKind==='track'?byId:note.targetKind==='company'?companies:null;
      if(!target?.has(note.targetId)||!Number.isSafeInteger(note.version)||note.version<1||!Array.isArray(note.questions)||note.questions.some(q=>typeof q!=='string'||!q.trim()))throw new Error('Invalid research note');
    }
  }
  validateSectorRelations(data);return true;
}
