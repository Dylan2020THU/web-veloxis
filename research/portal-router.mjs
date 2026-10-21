const pages=new Set(['home','tracks','companies','reports','workspace']);
const queryKeys=new Set(['q','trackId','country','listingStatus','market','topic','sectorId','componentId']);
export function parseRoute(hash){
 if(!hash||hash==='#'||hash==='#atlas'||hash==='#/')return {page:'home',id:null,query:{}};
 try{
  if(!hash.startsWith('#/'))return {page:'not-found'};
  const [path,search='']=hash.slice(2).split('?');const parts=path.split('/').map(decodeURIComponent),page=parts[0]||'home',id=parts[1]||null;
  if(!pages.has(page)||parts.length>2||(id&&(!['tracks','companies','reports'].includes(page)||!/^[a-z0-9-]{1,100}$/.test(id))))return {page:'not-found'};
  const query={};for(const [key,value]of new URLSearchParams(search)){if(!queryKeys.has(key)||Object.hasOwn(query,key)||value.length>200)return {page:'not-found'};query[key]=value;}
  return {page,id,query};
 }catch{return {page:'not-found'};}
}
export function formatRoute({page='home',id=null,query={}}){
 const hash='#/'+(page==='home'?'':page)+(id?'/'+encodeURIComponent(id):''),search=new URLSearchParams(Object.entries(query).filter(([,v])=>v!==''&&v!=null)).toString();
 const result=hash+(search?'?'+search:'');if(parseRoute(result).page==='not-found')throw Error('Invalid research route');return result;
}
export function createPortalRouter({onChange}){
 const changed=()=>{let entryKey=history.state?.veloxisEntry;if(typeof entryKey!=='string'){entryKey=crypto.randomUUID();history.replaceState({...history.state,veloxisEntry:entryKey},'',location.href);}onChange(parseRoute(location.hash),{entryKey});};window.addEventListener('hashchange',changed);queueMicrotask(changed);
 return {navigate(route){const next=formatRoute(route);if(location.hash===next)changed();else location.hash=next;},destroy(){window.removeEventListener('hashchange',changed);}};
}
