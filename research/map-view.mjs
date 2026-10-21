import {visibleNodes} from './map-state.mjs';
import {createTechIcon} from './tech-icons.mjs';
import {sectorRegions} from './atlas-geometry.mjs';
const NS='http://www.w3.org/2000/svg',ART='assets/innovation-panorama.png',W=1536,H=1024;
const districts={ai:{x:280,y:245},semiconductors:{x:770,y:270},robotics:{x:1250,y:245},'new-energy':{x:280,y:645},biotechnology:{x:770,y:665},aerospace:{x:1250,y:645}};
function svg(tag,attrs={},text){const el=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;if(tag==='text')el.dataset.size=attrs['font-size'];return el;}
export function createMapView(nodes,onSelect,onToggle,{onPreviewSector=()=>{}}={}){
 const events=new AbortController();let active=true;const listen=(target,type,handler,options={})=>target.addEventListener(type,e=>{if(active)handler(e);},{...options,signal:events.signal});
 const scene=document.querySelector('#scene'),canvas=document.querySelector('#map-canvas'),mini=document.querySelector('#minimap'),byId=new Map(nodes.map(n=>[n.id,n])),roots=nodes.filter(n=>!n.parentId);
 const root=n=>n.parentId?root(byId.get(n.parentId)):n,children=id=>nodes.filter(n=>n.parentId===id);
 let state={expanded:new Set(),selectedId:null},activeRoot='ai',scale=.7,tx=0,ty=0,bounds={x:0,y:0,w:W,h:H},fitScale=.7,suppressUntil=0;
 let pointers=new Map(),gesture=null;
 let sectorState={hoveredSectorId:null,selectedSectorId:null},viewportWidth=canvas.clientWidth,viewportHeight=canvas.clientHeight;
 const positions=new Map();
 function button(node,attrs={}){
  const group=svg('g',{...attrs,role:'button',tabindex:0,'aria-label':'查看 '+node.label,'data-testid':'node-'+node.id});
  group.addEventListener('click',()=>{if(performance.now()>suppressUntil)onSelect(node.id);});
  group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onSelect(node.id);}});return group;
 }
 function label(node,p,rootNode){
  const compact=canvas.clientWidth<700,group=button(node,{class:rootNode?'map-node district-hotspot':'map-node branch-hotspot',transform:`translate(${p.x} ${p.y})`});
  const display=svg('g',{'data-label':rootNode?'root':'branch'}),selected=node.id===state.selectedId,w=rootNode?(compact?Math.max(62,Math.min(94,canvas.clientWidth*.18)):158):(compact?92:142),h=rootNode?(compact?36:42):36;
  display.append(svg('path',{d:'M0 12v22',stroke:node.color,'stroke-width':1.4}),svg('circle',{cx:0,cy:36,r:4,fill:node.color,stroke:'#e4f0f7','stroke-width':1}),svg('rect',{class:'hotspot-panel',x:-w/2,y:-h/2,width:w,height:h,rx:5,fill:selected?'#16364b':'#08131feb',stroke:node.color,'stroke-opacity':selected?1:.65}));
  if(rootNode){display.append(svg('text',{x:-w/2+8,y:4,fill:node.color,'font-size':compact?8:11,'font-weight':700},String(roots.indexOf(node)+1).padStart(2,'0')),svg('text',{x:compact?8:8,y:4,'text-anchor':'middle',fill:'#f0f5fa','font-size':compact?10:14,'font-weight':600},node.label));if(!compact)display.append(svg('text',{x:w/2-15,y:4,fill:node.color,'font-size':13},'↗'));}
  else{const icon=createTechIcon(node.id,node.color);icon.setAttribute('x',-w/2+4);icon.setAttribute('y',-15);icon.setAttribute('width',31);icon.setAttribute('height',27);display.append(icon,svg('text',{x:12,y:4,'text-anchor':'middle',fill:'#eaf3fb','font-size':compact?10:12},node.label));}
  group.append(display);return group;
 }
 function drawPanorama(){
  bounds={x:0,y:0,w:W,h:H};
  const defs=svg('defs'),gray=svg('filter',{id:'atlas-gray'});gray.append(svg('feColorMatrix',{type:'saturate',values:0}));defs.append(gray);
  scene.append(defs,svg('image',{id:'panorama-image',href:ART,x:0,y:0,width:W,height:H,filter:'url(#atlas-gray)',opacity:.48}));
  for(const region of sectorRegions){
   const clip=svg('clipPath',{id:'sector-clip-'+region.sectorId});clip.append(svg('path',{d:region.path}));defs.append(clip);
   const group=svg('g',{'data-sector':region.sectorId,class:'sector-region'}),colored=svg('image',{class:'sector-color',href:ART,width:W,height:H,'clip-path':`url(#sector-clip-${region.sectorId})`,opacity:0,'pointer-events':'none'});
   const hit=svg('path',{d:region.path,'data-region':region.sectorId,class:'sector-boundary',fill:'transparent',stroke:byId.get(region.sectorId).color,'stroke-opacity':0,'stroke-width':2,'vector-effect':'non-scaling-stroke',role:'button',tabindex:0,'aria-label':'进入 '+byId.get(region.sectorId).label});
   hit.addEventListener('pointerenter',()=>{if(!pointers.size)onPreviewSector(region.sectorId);});hit.addEventListener('pointerleave',()=>onPreviewSector(null));hit.addEventListener('focus',()=>onPreviewSector(region.sectorId));hit.addEventListener('blur',()=>onPreviewSector(null));
   hit.addEventListener('click',()=>{if(performance.now()>suppressUntil)onSelect(region.sectorId);});hit.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onSelect(region.sectorId);}});
   group.append(colored,hit);scene.append(group);
  }
  const visible=visibleNodes(nodes,state.expanded);positions.clear();
  for(const r of roots){const d=districts[r.id];positions.set(r.id,{x:d.x,y:d.y-155});children(r.id).forEach((n,i)=>{positions.set(n.id,{x:d.x+(i-1)*158,y:d.y+40+(i===1?47:0)});children(n.id).forEach(t=>positions.set(t.id,{x:d.x+(i-1)*158,y:d.y+168+(i===1?47:0)}));});}
  for(const n of visible.filter(n=>n.parentId)){const p=positions.get(n.id),a=positions.get(n.parentId);scene.append(svg('path',{d:`M${a.x} ${a.y+30} C${a.x} ${p.y-32} ${p.x} ${p.y-32} ${p.x} ${p.y}`,fill:'none',stroke:'#03131c','stroke-width':6,opacity:.75}),svg('path',{d:`M${a.x} ${a.y+30} C${a.x} ${p.y-32} ${p.x} ${p.y-32} ${p.x} ${p.y}`,fill:'none',stroke:n.color,'stroke-width':1.5,'stroke-dasharray':n.parentId===root(n).id?'none':'4 5',opacity:.9}));}
  for(const n of visible){const marker=label(n,positions.get(n.id),!n.parentId);if(!n.parentId){marker.addEventListener('pointerenter',()=>{if(!pointers.size)onPreviewSector(n.id);});marker.addEventListener('pointerleave',()=>onPreviewSector(null));marker.addEventListener('focus',()=>onPreviewSector(n.id));marker.addEventListener('blur',()=>onPreviewSector(null));}scene.append(marker);}
  setSectorState(sectorState);
  for(const r of roots.filter(r=>state.expanded.has(r.id))){const p=positions.get(r.id),g=svg('g',{class:'map-node collapse-node',role:'button',tabindex:0,'aria-label':'收起 '+r.label,transform:`translate(${p.x+116} ${p.y})`});g.append(svg('circle',{r:14,fill:'#0b1c2c',stroke:r.color}),svg('text',{x:0,y:5,'text-anchor':'middle',fill:'#edf4fc','font-size':19},'−'));g.onclick=()=>{if(performance.now()>suppressUntil)onToggle(r.id);};g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onToggle(r.id);}};scene.append(g);}
 }
 function transform(){
  scene.setAttribute('transform',`translate(${tx} ${ty}) scale(${scale})`);document.querySelector('#zoom-level').value=Math.round(scale*100)+'%';
  for(const g of scene.querySelectorAll('[data-label]'))g.setAttribute('transform',`scale(${1/scale})`);
  const r=document.querySelector('#minimap-window'),x=Math.max(0,-tx/scale),y=Math.max(0,-ty/scale);r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width',Math.max(0,Math.min(W-x,canvas.clientWidth/scale)));r.setAttribute('height',Math.max(0,Math.min(H-y,canvas.clientHeight/scale)));
 }
 function area(){return {w:canvas.clientWidth,h:canvas.clientHeight};}
 function center(box,available=area(),padding=90){scale=Math.min((available.w-padding)/box.w,(available.h-padding)/box.h,2);fitScale=scale;tx=available.w/2-(box.x+box.w/2)*scale;ty=available.h/2-(box.y+box.h/2)*scale+9;transform();}
 function fit(){viewportWidth=canvas.clientWidth;viewportHeight=canvas.clientHeight;center(bounds,area(true),canvas.clientWidth<700?22:62);}
 function focus(id){const n=byId.get(id);if(!n)return;activeRoot=root(n).id;const d=districts[activeRoot];center({x:d.x-310,y:d.y-245,w:620,h:540},area(true),canvas.clientWidth<=760?24:80);}
 function draw(next,refit=false){state=next;if(state.selectedId)activeRoot=root(byId.get(state.selectedId)).id;scene.replaceChildren();drawPanorama();if(refit)fit();else transform();}
 function zoom(factor,x=canvas.clientWidth/2,y=canvas.clientHeight/2){const next=Math.max(Math.max(.14,fitScale*.65),Math.min(3.5,scale*factor)),ratio=next/scale;tx=x-(x-tx)*ratio;ty=y-(y-ty)*ratio;scale=next;transform();}
 function midpoint(){const [a,b]=[...pointers.values()],rect=canvas.getBoundingClientRect();return {x:(a.x+b.x)/2-rect.left,y:(a.y+b.y)/2-rect.top,d:Math.hypot(a.x-b.x,a.y-b.y)};}
 function startGesture(){if(pointers.size>=2){const p=midpoint();gesture={kind:'pinch',...p,scale,tx,ty};suppressUntil=Infinity;}else if(pointers.size===1){const p=[...pointers.values()][0];gesture={kind:'pan',x:p.x,y:p.y,tx,ty};}else gesture=null;}
 listen(canvas,'wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();zoom(e.deltaY<0?1.12:1/1.12,e.clientX-r.left,e.clientY-r.top);},{passive:false});
 listen(canvas,'pointerdown',e=>{if(e.button!==0)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});startGesture();});
 listen(canvas,'pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(gesture?.kind==='pinch'&&pointers.size>=2){const p=midpoint();scale=Math.max(.14,Math.min(3.5,gesture.scale*p.d/Math.max(1,gesture.d)));const ratio=scale/gesture.scale;tx=p.x-(gesture.x-gesture.tx)*ratio;ty=p.y-(gesture.y-gesture.ty)*ratio;suppressUntil=Infinity;transform();}else if(gesture?.kind==='pan'){const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(Math.hypot(dx,dy)>5){suppressUntil=Infinity;canvas.setPointerCapture(e.pointerId);tx=gesture.tx+dx;ty=gesture.ty+dy;transform();}}});
 function endPointer(e){pointers.delete(e.pointerId);if(suppressUntil===Infinity)suppressUntil=performance.now()+250;startGesture();}
 listen(canvas,'pointerup',endPointer);listen(canvas,'pointercancel',endPointer);listen(canvas,'lostpointercapture',e=>{if(pointers.has(e.pointerId))endPointer(e);});
 listen(canvas,'keydown',e=>{if(e.target!==canvas)return;const moves={ArrowLeft:[65,0],ArrowRight:[-65,0],ArrowUp:[0,65],ArrowDown:[0,-65]};if(moves[e.key]){e.preventDefault();tx+=moves[e.key][0];ty+=moves[e.key][1];transform();}else if(['+','=','-'].includes(e.key)){e.preventDefault();zoom(e.key==='-'?1/1.2:1.2);}else if(e.key==='Home'){e.preventDefault();fit();}});
 listen(mini,'click',e=>{const b=mini.getBoundingClientRect();tx=canvas.clientWidth/2-(e.clientX-b.left)/b.width*W*scale;ty=canvas.clientHeight/2-(e.clientY-b.top)/b.height*H*scale;transform();});
 function getCamera(){return {scale,tx,ty,fitScale,viewportWidth,viewportHeight};}
 function restoreCamera(camera){
  const w=canvas.clientWidth,h=canvas.clientHeight;if(w<=0||h<=0)return;
  if(w===camera.viewportWidth&&h===camera.viewportHeight){({scale,tx,ty,fitScale}=camera);}
  else{fitScale=Math.max(.05,Math.min((w-22)/W,(h-22)/H));scale=Math.max(.14,Math.min(3.5,camera.scale));tx=w/2-(camera.viewportWidth/2-camera.tx)/camera.scale*scale;ty=h/2-(camera.viewportHeight/2-camera.ty)/camera.scale*scale;}
  viewportWidth=w;viewportHeight=h;transform();
 }
 function setSectorState(next){
  sectorState={hoveredSectorId:next.hoveredSectorId,selectedSectorId:next.selectedSectorId};
  for(const g of scene.querySelectorAll('[data-sector]')){const selected=g.dataset.sector===next.selectedSectorId,preview=g.dataset.sector===next.hoveredSectorId;g.classList.toggle('is-selected',selected);g.classList.toggle('is-preview',preview);g.querySelector('.sector-color').setAttribute('opacity',selected||preview?1:0);const path=g.querySelector('.sector-boundary');path.setAttribute('stroke-opacity',selected?1:preview?.65:0);path.setAttribute('stroke-width',selected?2.5:1.5);path.setAttribute('aria-pressed',selected);}
 }
 const observer=new ResizeObserver(()=>{if(!active||canvas.clientWidth<=0||canvas.clientHeight<=0)return;if(canvas.clientWidth!==viewportWidth||canvas.clientHeight!==viewportHeight){const camera=getCamera();draw(state,false);restoreCamera(camera);}});observer.observe(canvas);
 return {draw,fit,zoom,focus,getCamera,restoreCamera,setSectorState,getActiveRoot:()=>activeRoot,setActive(value){active=value;canvas.inert=!value;pointers.clear();gesture=null;},destroy(){events.abort();observer.disconnect();scene.replaceChildren();}};
}
