import {memberUrl} from './map-state.mjs';
export function makeResearchLink(origin,target=null){
 if(!origin)return null;memberUrl(origin,'validation');
 const url=new URL('/account/research',origin);
 if(target){if(!['track','company','report'].includes(target.kind)||typeof target.id!=='string'||!/^[a-z0-9-]{1,100}$/.test(target.id))throw Error('Invalid research target');url.searchParams.set('kind',target.kind);url.searchParams.set('id',target.id);}
 return url.href;
}
