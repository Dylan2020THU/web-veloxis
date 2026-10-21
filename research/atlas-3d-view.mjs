import * as THREE from './assets/three.module.js';
import {OrbitControls} from './assets/OrbitControls.js';
import {buildAtlasScene} from './atlas-3d-scene.mjs';
export function createAtlas3DView({host,data,onSelectNode=()=>{},onPreviewSector=()=>{},onSelectRelation=()=>{},onPreviewRelation=()=>{},onClearRelation=()=>{},onUnavailable=()=>{}}){
 const canvas=host.querySelector('#atlas-3d-canvas')||document.createElement('canvas'),labels=host.querySelector('#atlas-labels')||document.createElement('div');
 canvas.id='atlas-3d-canvas';canvas.tabIndex=0;canvas.setAttribute('aria-label','三维产业地图，方向键旋转，Shift 加方向键平移，加减号缩放，Home 返回总览');
 labels.id='atlas-labels';labels.className='atlas-labels';host.append(canvas,labels);host.dataset.mode='3d';
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 const model=buildAtlasScene({nodes:data.nodes,relations:data.sectorRelations}),camera=new THREE.PerspectiveCamera(45,1,.1,500),controls=new OrbitControls(camera,canvas),abort=new AbortController(),signal=abort.signal;
 controls.minPolarAngle=THREE.MathUtils.degToRad(15);controls.maxPolarAngle=THREE.MathUtils.degToRad(70);controls.enableDamping=false;controls.enablePan=true;controls.screenSpacePanning=false;controls.rotateSpeed=.65;controls.zoomSpeed=.8;
 const center=model.bounds.getCenter(new THREE.Vector3()),size=model.bounds.getSize(new THREE.Vector3()),ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
 let active=true,destroyed=false,unavailable=false,frame=0,fitDistance=50,animation=null,activeRoot='ai',hoveredSector=null,hoveredRelation=null,selectedRelation=null,selectedSector=null,hasSize=false,hoveredNode=null,selectedNode=null,expanded=new Set(),showTechnologies=false;
 const buttons=new Map(),relationButtons=new Map(),nodes=new Map(data.nodes.map(n=>[n.id,n]));
 const listen=(target,type,fn,options={})=>target.addEventListener(type,fn,{...options,signal});
 const layerControls=document.createElement('div');layerControls.className='atlas-layer-controls';
 const layerNote=document.createElement('span');layerNote.textContent='6 领域 · 18 赛道 · 18 技术';
 const layerToggle=document.createElement('button');layerToggle.id='atlas-depth-toggle';layerToggle.textContent='展开关键技术';layerToggle.setAttribute('aria-pressed','false');
 const legend=document.createElement('small');legend.textContent='虚线：目录归属　管道：产业关系';layerControls.append(layerNote,layerToggle,legend);host.append(layerControls);
 function setTechnologyLayer(value){showTechnologies=value;layerToggle.setAttribute('aria-pressed',String(value));layerToggle.textContent=value?'收起关键技术':'展开关键技术';}
 listen(layerToggle,'click',()=>{setTechnologyLayer(!showTechnologies);requestDraw();});
 function rootId(id){return model.nodeMeshes.get(id)?.userData.rootId||null;}
 function updateVisibility(){
  const close=fitDistance/camera.position.distanceTo(controls.target)>1.65;
  for(const [id,g]of model.nodeMeshes){if(g.userData.depth===2){g.visible=showTechnologies||close||expanded.has(g.userData.parentId)||selectedNode===id;model.hierarchyLinks.get(id).visible=g.visible;}}
 }
 function requestDraw(){if(!frame&&active&&!destroyed&&!unavailable&&!document.hidden)frame=requestAnimationFrame(drawFrame);}
 function clampTarget(){const old=controls.target.clone();controls.target.x=THREE.MathUtils.clamp(old.x,model.bounds.min.x,model.bounds.max.x);controls.target.z=THREE.MathUtils.clamp(old.z,model.bounds.min.z,model.bounds.max.z);controls.target.y=THREE.MathUtils.clamp(old.y,0,6);camera.position.add(controls.target.clone().sub(old));}
 function project(point){return point.clone().project(camera);}
 function positionLabels(){
  camera.updateMatrixWorld();
  const compact=host.clientWidth<700;host.classList.toggle('atlas-compact',compact);
  const fixed=[...(host.closest('.map-shell')||host).querySelectorAll('#minimap-panel,.map-top,.map-bottom,.atlas-layer-controls,.scene-caption')].filter(e=>e.getClientRects().length).map(e=>e.getBoundingClientRect()),occupied=[...fixed],bounds=host.getBoundingClientRect();
  const relationDock=compact?{left:bounds.left,right:bounds.right,top:bounds.bottom-237,bottom:bounds.bottom-193}:null;if(relationDock)occupied.push(relationDock);
  const overlaps=(a,b)=>a.left<b.right+6&&a.right+6>b.left&&a.top<b.bottom+4&&a.bottom+4>b.top;
  const ratio=fitDistance/camera.position.distanceTo(controls.target),ordered=[...buttons].sort(([a],[b])=>model.nodeMeshes.get(a).userData.depth-model.nodeMeshes.get(b).userData.depth||(b===selectedNode||b===hoveredNode?1:0)-(a===selectedNode||a===hoveredNode?1:0));let relationsPlaced=false;
  for(const [id,b]of ordered){
   const g=model.nodeMeshes.get(id),depth=g.userData.depth,p=project(g.userData.labelAnchor),priority=id===selectedNode||id===hoveredNode;
   if(depth&&!relationsPlaced){placeRelations();relationsPlaced=true;}
   const rootIndex=[...model.sectorMeshes.keys()].indexOf(id),docked=compact&&!depth;
   const available=g.visible&&(!depth||priority||ratio>1.15||showTechnologies||expanded.has(g.userData.parentId));
   b.hidden=!available||(!docked&&(p.z<-1||p.z>1||Math.abs(p.x)>.94||Math.abs(p.y)>.92));if(b.hidden)continue;
   const x=docked?(rootIndex%3+.5)/3*host.clientWidth:(p.x+1)/2*host.clientWidth,y=docked?host.clientHeight-62+Math.floor(rootIndex/3)*48:(1-p.y)/2*host.clientHeight;
   b.style.left=x+'px';b.style.top=y+'px';let box=b.getBoundingClientRect();
   if(priority&&occupied.some(r=>overlaps(box,r))){for(const dy of [-48,48,-96,96]){b.style.top=y+dy+'px';box=b.getBoundingClientRect();if(box.top>=bounds.top&&box.bottom<=bounds.bottom&&!occupied.some(r=>overlaps(box,r)))break;}}
   if(depth&&!priority&&occupied.some(r=>overlaps(box,r)))b.hidden=true;else occupied.push(box);
  }
  if(!relationsPlaced)placeRelations();
  function placeRelations(){let relationIndex=0;
  for(const [id,b] of relationButtons){
   b.hidden=false;b.textContent=compact?String(relationIndex+1).padStart(2,'0'):'↗';
   const curve=model.relationMeshes.get(id).userData.curve,positions=compact?[.5]:[.32+(relationIndex%3)*.18,.1,.2,.3,.4,.5,.6,.7,.8,.9];let placed=false;
   for(const t of positions){const p=project(curve.getPoint(t));if(!compact&&(p.z<-1||p.z>1||Math.abs(p.x)>.96||Math.abs(p.y)>.96))continue;
    b.style.left=compact?((relationIndex+.5)/relationButtons.size*100)+'%':((p.x+1)*50)+'%';b.style.top=compact?(host.clientHeight-150)+'px':((1-p.y)*50)+'%';
    const box=b.getBoundingClientRect();if(!occupied.some(r=>r!==relationDock&&overlaps(box,r))){occupied.push(box);placed=true;break;}
   }
   b.hidden=!placed;relationIndex++;
  }
  }
 }
 function drawFrame(now){
  frame=0;if(!active||destroyed||unavailable||document.hidden||!host.clientWidth||!host.clientHeight)return;
  if(animation){const t=Math.min(1,(now-animation.start)/300),ease=1-(1-t)**3;camera.position.lerpVectors(animation.position,animation.endPosition,ease);controls.target.lerpVectors(animation.target,animation.endTarget,ease);controls.update();if(t===1){const done=animation;animation=null;done.resolve(true);done.cleanup();}else requestDraw();}
  clampTarget();camera.lookAt(controls.target);updateVisibility();positionLabels();renderer.render(model.scene,camera);
  const zoom=host.closest('.map-shell')?.querySelector('#zoom-level');if(zoom)zoom.textContent=Math.round(fitDistance/camera.position.distanceTo(controls.target)*100)+'%';
 }
 function cancelFocus(){if(animation){const old=animation;animation=null;old.cleanup();old.resolve(false);}}
 function fit(){
  cancelFocus();const aspect=host.clientWidth/host.clientHeight;if(!Number.isFinite(aspect)||aspect<=0)return;
  const e=THREE.MathUtils.degToRad(40),tan=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);
  fitDistance=Math.max(size.x/(2*tan*aspect),(size.z*Math.sin(e)+size.y*Math.cos(e))/(2*tan))*1.2+size.z*Math.cos(e)/2;
  controls.minDistance=fitDistance*.18;controls.maxDistance=fitDistance*1.8;controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(0,Math.sin(e)*fitDistance,Math.cos(e)*fitDistance));camera.zoom=1;camera.updateProjectionMatrix();controls.update();requestDraw();
 }
 function resize(){
  if(destroyed||!host.clientWidth||!host.clientHeight)return;
  camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight,false);
  if(!hasSize){hasSize=true;fit();}requestDraw();
 }
 function highlight(){
  for(const [id,g] of model.nodeMeshes){const involved=id===hoveredNode||id===selectedNode||id===(hoveredSector||selectedSector)||(hoveredRelation&&[data.sectorRelations?.find(r=>r.id===hoveredRelation)?.fromSectorId,data.sectorRelations?.find(r=>r.id===hoveredRelation)?.toSectorId].includes(id)),b=buttons.get(id);b?.classList.toggle('is-active',!!involved);
   for(const m of g.userData.accentMaterials){m.color.copy(g.userData.color);if(!involved){const gray=(m.color.r+m.color.g+m.color.b)/3;m.color.lerp(new THREE.Color(gray,gray,gray),.82).multiplyScalar(.65);}if(m.emissive)m.emissive.copy(m.color);}
  }
  for(const [id,g] of model.relationMeshes){const r=data.sectorRelations.find(r=>r.id===id),lit=id===hoveredRelation||id===selectedRelation||[r.fromSectorId,r.toSectorId].includes(hoveredSector);g.userData.material.color.set(lit?'#9cdfff':'#6196b8');g.userData.material.opacity=lit?.95:.32;relationButtons.get(id)?.classList.toggle('is-active',lit);relationButtons.get(id)?.setAttribute('aria-pressed',id===selectedRelation);}
  requestDraw();
 }
 function preview(kind,id){const node=kind==='sector'||kind==='node'?id:null,sector=rootId(node),relation=kind==='relation'?id:null;if(node===hoveredNode&&relation===hoveredRelation)return;hoveredNode=node;hoveredSector=sector;hoveredRelation=relation;onPreviewSector(sector);onPreviewRelation(relation);highlight();}
 for(const [id,g] of model.nodeMeshes){
  const depth=g.userData.depth,b=document.createElement('button');b.className=depth?'atlas-node-label':'atlas-sector-label';b.dataset.testid='node-'+id;b.dataset.sectorId=g.userData.rootId;b.dataset.depth=depth;b.style.setProperty('--sector',nodes.get(g.userData.rootId).color);
  const number=document.createElement('small');number.textContent=depth===2?'◇':depth===1?'◈':String(buttons.size+1).padStart(2,'0');const title=document.createElement('strong');title.textContent=nodes.get(id).label;b.append(number,title);labels.append(b);buttons.set(id,b);
  listen(b,'pointerenter',()=>preview(g.userData.kind,id));listen(b,'pointerleave',()=>preview(null,null));listen(b,'focus',()=>preview(g.userData.kind,id));listen(b,'blur',()=>preview(null,null));listen(b,'click',()=>{if(active){activeRoot=g.userData.rootId;onSelectNode(id);}});
 }
 for(const r of data.sectorRelations||[]){
  const b=document.createElement('button');b.className='atlas-relation-label';b.dataset.relationId=r.id;b.setAttribute('aria-label',r.title);b.title=r.title;b.textContent='↗';labels.append(b);relationButtons.set(r.id,b);
  listen(b,'pointerenter',()=>preview('relation',r.id));listen(b,'pointerleave',()=>preview(null,null));listen(b,'focus',()=>preview('relation',r.id));listen(b,'blur',()=>preview(null,null));listen(b,'click',()=>{if(active)onSelectRelation(r.id);});
 }
 function pick(e){
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return null;
  mouse.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);camera.updateMatrixWorld();ray.setFromCamera(mouse,camera);
  const hits=ray.intersectObjects([...model.nodeMeshes.values(),...model.relationMeshes.values()].filter(g=>g.visible),true);
  for(const hit of hits){let o=hit.object;while(o&&!o.userData.kind)o=o.parent;if(o)return {kind:o.userData.kind,id:o.userData.id};}return null;
 }
 const pointers=new Map();let moved=false,multiple=false;
 listen(canvas,'pointerdown',e=>{cancelFocus();if(!pointers.size){moved=false;multiple=false;}pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size>1)multiple=true;}, {capture:true});
 listen(canvas,'pointermove',e=>{const start=pointers.get(e.pointerId);if(start){if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)moved=true;}else if(active&&!unavailable){const hit=pick(e);preview(hit?.kind,hit?.id||null);canvas.style.cursor=hit?'pointer':'grab';}}, {capture:true});
 listen(canvas,'pointerup',e=>{
  const start=pointers.get(e.pointerId),rect=canvas.getBoundingClientRect();pointers.delete(e.pointerId);
  const inside=e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;
  if(!start||!inside||moved||multiple||!active||unavailable||e.button!==0)return;
  const hit=pick(e);if(hit?.kind==='sector'||hit?.kind==='node'){activeRoot=rootId(hit.id);onSelectNode(hit.id);}else if(hit?.kind==='relation')onSelectRelation(hit.id);else onClearRelation();
 },{capture:true});
 listen(canvas,'pointercancel',e=>{multiple=true;pointers.delete(e.pointerId);});
 listen(canvas,'lostpointercapture',e=>pointers.delete(e.pointerId));
 listen(canvas,'pointerleave',()=>preview(null,null));
 listen(canvas,'contextmenu',e=>e.preventDefault());
 function shift(dx,dz){const offset=new THREE.Vector3(dx,0,dz);camera.position.add(offset);controls.target.add(offset);clampTarget();controls.update();requestDraw();}
 listen(canvas,'keydown',e=>{
  if(!active||e.target!==canvas||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key))return;e.preventDefault();cancelFocus();
  if(e.key==='Home'){onClearRelation();fit();return;}if(['+','=','-'].includes(e.key)){zoom(e.key==='-'?1/1.2:1.2);return;}
  const sign=['ArrowLeft','ArrowUp'].includes(e.key)?-1:1;
  if(e.shiftKey){shift(e.key.includes('Left')||e.key.includes('Right')?sign:0,e.key.includes('Up')||e.key.includes('Down')?sign:0);return;}
  const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));if(e.key==='ArrowLeft'||e.key==='ArrowRight')s.theta+=sign*.08;else s.phi=THREE.MathUtils.clamp(s.phi+sign*.08,controls.minPolarAngle,controls.maxPolarAngle);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();requestDraw();
 });
 function zoom(factor){cancelFocus();const offset=camera.position.clone().sub(controls.target),distance=THREE.MathUtils.clamp(offset.length()/factor,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(offset.setLength(distance));controls.update();requestDraw();}
 function getCamera(){return {kind:'3d',position:camera.position.toArray(),target:controls.target.toArray(),fov:camera.fov,near:camera.near,far:camera.far,zoom:camera.zoom};}
 function restoreCamera(c){
  if(c?.kind!=='3d'||![c.position,c.target].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite))||!['fov','near','far','zoom'].every(k=>Number.isFinite(c[k]))||c.fov<=0||c.fov>=120||c.near<=0||c.far<=c.near||c.zoom<=0||c.position.every((v,i)=>v===c.target[i]))return false;
  cancelFocus();camera.position.set(...c.position);controls.target.set(...c.target);camera.fov=c.fov;camera.near=c.near;camera.far=c.far;camera.zoom=c.zoom;camera.updateProjectionMatrix();controls.update();requestDraw();return true;
 }
 function focus(nodeId,{animate=false,signal:focusSignal}={}){
  cancelFocus();if(destroyed||focusSignal?.aborted)return Promise.resolve(false);
  const node=nodes.get(nodeId);if(!node)return Promise.resolve(true);activeRoot=rootId(nodeId);if(node.parentId)expanded.add(node.parentId);
  const target=model.nodeMeshes.get(node.id).position.clone().add(new THREE.Vector3(0,1.2,0)),offset=camera.position.clone().sub(controls.target).setLength(fitDistance*(node.parentId ? .28 : .68)),endPosition=target.clone().add(offset);
  if(!animate||!active||!hasSize||matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(endPosition);controls.target.copy(target);controls.update();requestDraw();return Promise.resolve(true);}
  return new Promise(resolve=>{const cancel=()=>cancelFocus();focusSignal?.addEventListener('abort',cancel,{once:true});animation={start:performance.now(),position:camera.position.clone(),target:controls.target.clone(),endPosition,endTarget:target,resolve,cleanup:()=>focusSignal?.removeEventListener('abort',cancel)};requestDraw();});
 }
 controls.addEventListener('change',requestDraw);
 listen(canvas,'webglcontextlost',e=>{e.preventDefault();unavailable=true;cancelFocus();cancelAnimationFrame(frame);frame=0;controls.enabled=false;onUnavailable();});
 listen(document,'visibilitychange',()=>{if(document.hidden){cancelFocus();cancelAnimationFrame(frame);frame=0;}else requestDraw();});
 const observer=new ResizeObserver(resize);observer.observe(host);resize();highlight();
 return {draw(state,refit=false){expanded=new Set(state.expanded||[]);selectedNode=state.selectedId;if(refit)setTechnologyLayer(false);highlight();if(refit)fit();else requestDraw();},fit,zoom,focus,getCamera,restoreCamera,
  setSectorState(state){selectedSector=state.selectedSectorId;hoveredSector=state.hoveredSectorId;highlight();},
  setRelationState(state){hoveredRelation=state.hoveredRelationId;selectedRelation=state.selectedRelationId;highlight();},
  getActiveRoot:()=>activeRoot,getMode:()=>'3d',
  setActive(value){active=value;controls.enabled=value&&!unavailable;canvas.inert=!value;labels.inert=!value;layerControls.hidden=!value;if(!value){cancelFocus();cancelAnimationFrame(frame);frame=0;pointers.clear();}else{resize();requestDraw();}},
  destroy(){if(destroyed)return;destroyed=true;cancelFocus();cancelAnimationFrame(frame);abort.abort();observer.disconnect();controls.removeEventListener('change',requestDraw);controls.dispose();model.dispose();renderer.dispose();labels.replaceChildren();layerControls.remove();}
 };
}
