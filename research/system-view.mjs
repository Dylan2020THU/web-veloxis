import {systemLayouts} from './atlas-geometry.mjs';
const NS='http://www.w3.org/2000/svg';
function svg(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;}
export function createSystemView(host,onSelectComponent){
 let sequence=0,selected=null;
 function setSelection(id){selected=id;host.classList.toggle('has-selection',!!id);for(const g of host.querySelectorAll('[data-component]')){const active=g.dataset.component===id;g.classList.toggle('is-selected',active);g.setAttribute('aria-pressed',active);}}
 function clear(){sequence++;selected=null;host.replaceChildren();host.dataset.status='empty';}
 async function show(system,components){
  const request=++sequence;host.replaceChildren();host.dataset.status='loading';const status=document.createElement('p');status.className='diagram-status';status.textContent='正在展开系统…';status.setAttribute('role','status');host.append(status);
  const image=new Image();image.src=system.diagramAsset;
  try{await image.decode();}catch{
   if(request!==sequence)return 'stale';host.dataset.status='failed';status.textContent='拆解图暂时无法显示，仍可选择下方元素。';
   const retry=document.createElement('button');retry.textContent='重新加载拆解图';retry.className='diagram-retry';retry.onclick=()=>show(system,components);host.append(retry);return 'failed';
  }
  if(request!==sequence)return 'stale';
  const layout=systemLayouts[system.id],art=svg('svg',{viewBox:`0 0 ${layout.width} ${layout.height}`,'data-system':system.id,'aria-label':system.title+'组成元素图'}),defs=svg('defs');
  art.append(defs,svg('image',{class:'system-base',href:system.diagramAsset,width:layout.width,height:layout.height}));
  for(const region of layout.regions){
   const i=components.findIndex(c=>c.id===region.componentId),component=components[i],clipId=`component-${request}-${component.id}`,clip=svg('clipPath',{id:clipId});clip.append(svg('path',{d:region.path}));defs.append(clip);
   const g=svg('g',{'data-component':component.id,class:'component-region',role:'button',tabindex:0,'aria-label':'选择 '+component.title,'aria-pressed':false});
   g.append(svg('title',{},component.title),svg('image',{class:'component-color',href:system.diagramAsset,width:layout.width,height:layout.height,'clip-path':`url(#${clipId})`,'pointer-events':'none'}),svg('path',{class:'component-outline',d:region.path,'vector-effect':'non-scaling-stroke'}));
   const badge=svg('g',{class:'component-badge',transform:`translate(${region.label.x} ${region.label.y})`});badge.append(svg('circle',{r:23}),svg('text',{'text-anchor':'middle',y:8},String(i+1).padStart(2,'0')));g.append(badge);
   g.addEventListener('click',()=>onSelectComponent(component.id));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelectComponent(component.id);}});art.append(g);
  }
  host.replaceChildren(art);host.dataset.status='ready';setSelection(selected);return 'ready';
 }
 return {show,setSelection,clear};
}
