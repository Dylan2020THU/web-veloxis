import {createMapView} from './map-view.mjs';
import {validAtlasCamera} from './atlas-snapshot.mjs';
export function createPanoramaView({root,data,onSelectNode,onToggleNode,onPreviewSector,onSelectRelation,onPreviewRelation,onClearRelation,onModeChange=()=>{}}){
 const host=root.querySelector('#map-canvas'),svg=root.querySelector('#map'),mini=root.querySelector('#minimap'),miniHost=root.querySelector('#minimap-panel'),loading=root.querySelector('#atlas-loading');
 const notice=document.createElement('div');notice.className='atlas-fallback';notice.hidden=true;
 const text=document.createElement('p');text.textContent='三维视图暂不可用，仍可继续浏览全部研究内容。';
 const fallback=document.createElement('button');fallback.id='use-2d-map';fallback.textContent='使用二维地图';notice.append(text,fallback);host.append(notice);
 const navigator=document.createElement('div');navigator.id='island-navigator';navigator.setAttribute('aria-label','六岛视角定位');miniHost.append(navigator);
 let view=null,mode='3d',active=false,started=false,destroyed=false,timer=null,pendingCamera=null,state={expanded:new Set(),selectedId:null},sectorState={},relationState={},refit=true;
 const default3d={kind:'3d',position:[0,30,40],target:[0,2,0],fov:45,near:.1,far:500,zoom:1};
 svg.setAttribute('hidden','');mini.setAttribute('hidden','');host.dataset.mode='loading';host.tabIndex=-1;
 host.setAttribute('aria-label','交互式三维产业全景');
 root.querySelector('.interaction-hint span:last-child').textContent='拖动旋转 · Shift 拖动平移 · 滚轮缩放';
 for(const n of data.nodes.filter(n=>!n.parentId)){const b=document.createElement('button');b.textContent=n.label;b.setAttribute('aria-label','定位'+n.label+'视角');b.dataset.locateSector=n.id;b.style.setProperty('--sector',n.color);b.onclick=()=>view?.focus(n.id);navigator.append(b);}
 function finishLoading(){if(loading)loading.hidden=true;host.setAttribute('aria-busy','false');}
 function fail(){if(destroyed||mode==='2d')return;clearTimeout(timer);view?.setActive(false);finishLoading();miniHost.hidden=true;notice.hidden=false;}
 async function start(){
  if(started||destroyed)return;started=true;timer=setTimeout(fail,8000);
  try{const {createAtlas3DView}=await import('./atlas-3d-view.mjs');if(destroyed||mode==='2d')return;
   view=createAtlas3DView({host,data,onSelectNode,onPreviewSector,onSelectRelation,onPreviewRelation,onClearRelation,onUnavailable:fail});clearTimeout(timer);notice.hidden=true;
   view.setActive(active);view.draw(state,refit);view.setSectorState(sectorState);view.setRelationState(relationState);if(pendingCamera?.kind==='3d')view.restoreCamera(pendingCamera);pendingCamera=null;
   finishLoading();miniHost.hidden=false;
  }catch{fail();}
 }
 fallback.onclick=()=>{
  if(mode==='2d'||destroyed)return;clearTimeout(timer);view?.destroy();view=null;mode='2d';pendingCamera=null;host.dataset.mode='2d';host.tabIndex=0;notice.hidden=true;
  host.querySelector('#atlas-3d-canvas')?.setAttribute('hidden','');host.querySelector('#atlas-labels')?.setAttribute('hidden','');svg.removeAttribute('hidden');mini.removeAttribute('hidden');navigator.hidden=true;
  const image=mini.querySelector('image');if(image?.dataset.src)image.setAttribute('href',image.dataset.src);finishLoading();miniHost.hidden=false;
  host.setAttribute('aria-label','二维产业全景，方向键平移，加减号缩放');root.querySelector('.interaction-hint span:last-child').textContent='拖动平移 · 滚轮 / 双指缩放 · 点击探索';
  view=createMapView(data.nodes,onSelectNode,onToggleNode,{onPreviewSector});view.draw(state,true);view.setSectorState(sectorState);view.setActive(active);onModeChange('2d');host.focus({preventScroll:true});
 };
 return {
  draw(next,fit=false){state=next;refit=fit;if(view)view.draw(next,fit);},
  fit(){pendingCamera=null;onClearRelation();view?.fit();},zoom(factor){view?.zoom(factor);},
  focus(id,options={}){if(destroyed||options.signal?.aborted)return Promise.resolve(false);return mode==='3d'&&view?view.focus(id,options):(view?.focus(id),Promise.resolve(true));},
  getCamera(){return view?{kind:mode,...view.getCamera()}:structuredClone(pendingCamera||default3d);},
  restoreCamera(camera){if(!validAtlasCamera(camera)||camera.kind!==mode)return false;if(!view){pendingCamera=structuredClone(camera);return true;}view.restoreCamera(camera);return true;},
  setSectorState(value){sectorState=value;view?.setSectorState(value);},setRelationState(value){relationState=value;view?.setRelationState?.(value);},
  getActiveRoot(){return view?.getActiveRoot()||'ai';},getMode:()=>mode,
  setActive(value){active=value;if(value)start();view?.setActive(value);},
  destroy(){if(destroyed)return;destroyed=true;clearTimeout(timer);view?.destroy();fallback.onclick=null;for(const b of navigator.children)b.onclick=null;}
 };
}
