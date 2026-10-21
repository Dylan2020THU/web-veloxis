import * as THREE from './assets/three.module.js';
import {SECTOR_LAYOUT,catalogLayout} from './atlas-3d-layout.mjs';
export function buildAtlasScene({nodes,relations=[]}){
 const scene=new THREE.Scene(),sectorMeshes=new Map(),nodeMeshes=new Map(),hierarchyLinks=new Map(),relationMeshes=new Map(),geometries=new Set(),materials=new Set();
 scene.background=new THREE.Color('#081521');scene.fog=new THREE.Fog('#081521',160,350);
 scene.add(new THREE.HemisphereLight('#c9e8ff','#24333e',2.7));
 const key=new THREE.DirectionalLight('#eef5ff',3.4);key.position.set(-15,35,20);scene.add(key);
 const rim=new THREE.DirectionalLight('#5f9ec5',2.2);rim.position.set(20,12,-20);scene.add(rim);
 const ownGeo=g=>(geometries.add(g),g),ownMat=m=>(materials.add(m),m);
 const cube=ownGeo(new THREE.BoxGeometry(1,1,1)),cylinder=ownGeo(new THREE.CylinderGeometry(1,1,1,24)),sphere=ownGeo(new THREE.SphereGeometry(1,16,12));
 const mat=(color,metalness=.45,roughness=.45)=>ownMat(new THREE.MeshStandardMaterial({color,metalness,roughness}));
 const dark=mat('#152c3c'),silver=mat('#a6bbc9',.7,.28),white=mat('#dae5e9',.25,.45),glass=mat('#254c66',.65,.22);
 const add=(group,geo,material,position,scale=[1,1,1])=>{const m=new THREE.Mesh(geo,material);m.position.set(...position);m.scale.set(...scale);group.add(m);return m;};
 const box=(g,m,p,s)=>add(g,cube,m,p,s),column=(g,m,p,r,h)=>add(g,cylinder,m,p,[r,h,r]);
 function beam(g,m,a,b,r=.16){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start),o=column(g,m,start.clone().add(end).multiplyScalar(.5).toArray(),r,v.length());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 for(const layout of SECTOR_LAYOUT){
  const node=nodes.find(n=>n.id===layout.sectorId),g=new THREE.Group();g.position.set(...layout.position);g.userData={kind:'sector',id:layout.sectorId};
  const color=new THREE.Color(node.color),accent=mat(color),glow=ownMat(new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.45,metalness:.45,roughness:.3}));
  g.userData.accentMaterials=[accent,glow];g.userData.color=color;scene.add(g);sectorMeshes.set(layout.sectorId,g);
  box(g,dark,[0,-.6,0],[8,1.2,6]);box(g,silver,[0,.03,0],[7.9,.13,5.9]);box(g,glass,[0,.14,0],[7.65,.1,5.65]);
  box(g,glow,[0,-.33,3.02],[6.6,.035,.025]);box(g,glow,[-4.01,-.33,0],[.025,.035,4.6]);
  for(const x of [-3.2,3.2])for(const z of [-2.2,2.2])column(g,silver,[x,-1.35,z],.25,.45);
  if(layout.sectorId==='ai'){
   for(const x of [-2.3,0,2.3]){box(g,dark,[x,1.7,-.4],[1.5,3,2.2]);box(g,silver,[x,3.22,-.4],[1.55,.12,2.25]);for(let y=.65;y<3;y+=.44){box(g,glass,[x,y,.73],[1.22,.26,.08]);box(g,glow,[x-.45,y,.79],[.08,.09,.035]);}}
   for(const x of [-2,0,2]){box(g,accent,[x,.26,2],[1.3,.1,.13]);beam(g,accent,[x,.26,2],[x,.26,.9],.035);}
  }else if(layout.sectorId==='semiconductors'){
   box(g,dark,[0,.55,0],[4.6,.6,3.5]);box(g,accent,[0,1,0],[3.4,.3,2.6]);box(g,silver,[0,1.25,0],[2.6,.2,2]);
   for(let i=-3;i<=3;i++){box(g,silver,[i*.6,.48,2],[.16,.15,.7]);box(g,silver,[i*.6,.48,-2],[.16,.15,.7]);}
   const wafer=column(g,glass,[-2.5,2.5,-1.1],1.45,.12);wafer.rotation.z=Math.PI/2.6;
   const halo=add(g,ownGeo(new THREE.TorusGeometry(1.46,.035,8,48)),glow,wafer.position.toArray());halo.quaternion.copy(wafer.quaternion);halo.rotateX(Math.PI/2);
   for(const x of [-.7,.7])for(const z of [-.5,.5])box(g,glow,[x,1.38,z],[.7,.04,.45]);
  }else if(layout.sectorId==='robotics'){
   column(g,silver,[0,.55,0],1.2,.7);column(g,accent,[0,1,0],.8,.3);
   beam(g,white,[0,1,0],[.1,2.9,.2],.48);beam(g,white,[.1,2.9,.2],[1.8,4.15,.1],.4);beam(g,white,[1.8,4.15,.1],[2.5,3.1,1],.27);
   for(const p of [[0,1.1,0],[.1,2.9,.2],[1.8,4.15,.1],[2.5,3.1,1]])add(g,sphere,accent,p,[.44,.44,.44]);
   beam(g,silver,[2.5,3.1,1],[2.7,2.5,1],.15);for(const x of [2.4,3])beam(g,dark,[2.7,2.5,1],[x,2.2,1],.08);
   box(g,dark,[-2.4,.75,1.4],[1.3,1,1]);box(g,glow,[-2.4,1.28,1.4],[1.1,.04,.8]);
  }else if(layout.sectorId==='new-energy'){
   for(const x of [-2.4,-.6,1.2])for(const z of [.2,1.8]){const panel=box(g,glass,[x,.85,z],[1.45,.12,1.1]);panel.rotation.x=-.28;for(const dx of [-.4,0,.4])box(g,silver,[x+dx,.94,z],[.012,.02,.95]);beam(g,silver,[x,.25,z],[x,.8,z],.07);}
   for(const x of [-1.5,2.2]){beam(g,white,[x,.2,-1.7],[x,4.1,-1.7],.13);add(g,sphere,accent,[x,4.1,-1.7],[.23,.23,.23]);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;beam(g,white,[x,4.1,-1.6],[x+Math.sin(a)*1.35,4.1+Math.cos(a)*1.35,-1.6],.065);}}
  }else if(layout.sectorId==='biotechnology'){
   box(g,white,[-1.8,1.3,-.3],[2.1,2.1,3]);box(g,glass,[-1.8,1.5,1.23],[1.6,1.3,.05]);
   for(const x of [.5,2.3]){column(g,silver,[x,1.5,-.7],.65,2.4);add(g,sphere,white,[x,2.7,-.7],[.65,.35,.65]);beam(g,accent,[x,2.8,-.7],[x,3.1,.8],.06);}
   for(let i=0;i<9;i++){const a=i*.7,y=.6+i*.36,p=[Math.sin(a)*.6,y,Math.cos(a)*.6];add(g,sphere,glow,[p[0]+1.1,y,p[2]+1.65],[.13,.13,.13]);add(g,sphere,white,[-p[0]+1.1,y,-p[2]+1.65],[.13,.13,.13]);beam(g,silver,[p[0]+1.1,y,p[2]+1.65],[-p[0]+1.1,y,-p[2]+1.65],.025);}
  }else{
   column(g,dark,[-.7,.45,0],1.25,.4);column(g,white,[-.7,2.8,0],.55,4.4);
   add(g,ownGeo(new THREE.ConeGeometry(.55,1.2,24)),silver,[-.7,5.6,0]);
   column(g,accent,[-.7,4.4,0],.56,.32);
   for(const x of [-1.35,-.05])box(g,silver,[x,1.1,0],[.18,1.2,.9]);
   beam(g,silver,[2,.25,1],[2,1.65,1],.16);
   const dish=add(g,ownGeo(new THREE.SphereGeometry(1.05,24,12,0,Math.PI*2,0,Math.PI*.4)),glass,[2,1.65,1]);dish.rotation.z=-.5;
   beam(g,white,[2,1.65,1],[2.4,2.8,1],.045);
   box(g,dark,[-2.5,2,-1.6],[.25,3.5,.25]);for(let y=.8;y<3.8;y+=.5)beam(g,silver,[-2.5,y,-1.6],[-1.1,y,-1.6],.025);
  }
  g.userData.anchor=g.position.clone().add(new THREE.Vector3(0,.35,2.6));
  g.userData.labelAnchor=new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());g.userData.labelAnchor.y=new THREE.Box3().setFromObject(g).max.y+1;
  Object.assign(g.userData,{depth:0,rootId:layout.sectorId});nodeMeshes.set(layout.sectorId,g);
 }
 const gem=ownGeo(new THREE.OctahedronGeometry(.55)),lineMat=ownMat(new THREE.LineDashedMaterial({color:'#6992a6',transparent:true,opacity:.48,dashSize:.22,gapSize:.2}));
 for(const item of catalogLayout(nodes).filter(n=>n.depth)){
  const g=new THREE.Group(),root=sectorMeshes.get(item.rootId),color=root.userData.color,accent=mat(color),glow=ownMat(new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.35}));
  g.position.set(...item.position);g.userData={kind:'node',...item,accentMaterials:[accent,glow],color};nodeMeshes.set(item.id,g);scene.add(g);
  if(item.depth===2){column(g,dark,[0,-.15,0],.9,.3);add(g,gem,glow,[0,.65,0]);g.visible=false;}
  else{
   box(g,dark,[0,-.3,0],[4.4,.6,3]);box(g,silver,[0,.03,0],[4.3,.08,2.9]);box(g,glass,[0,.1,0],[4.15,.08,2.75]);box(g,glow,[0,-.15,1.51],[3.7,.035,.025]);
   if(item.id==='ai-models'){for(let i=0;i<3;i++)box(g,i===2?accent:silver,[0,.45+i*.45,0],[2.4,.2,1.7]);}
   else if(item.id==='ai-vision'){box(g,white,[0,1,0],[2.4,1.5,1.2]);const lens=column(g,accent,[0,1,.8],.5,.7);lens.rotation.x=Math.PI/2;}
   else if(item.id==='ai-agents'||item.id==='bio-synthetic'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5,p=[Math.sin(a)*1.2,1.1,Math.cos(a)*.9];add(g,sphere,accent,p,[.26,.26,.26]);beam(g,silver,p,[0,1.7,0],.055);}add(g,sphere,glow,[0,1.7,0],[.38,.38,.38]);}
   else if(item.id==='semi-logic'){box(g,accent,[0,.65,0],[2.2,.6,1.7]);for(let i=-2;i<=2;i++)for(const z of [-1,1])box(g,silver,[i*.4,.45,z],[.12,.12,.5]);box(g,glow,[0,1,0],[1.4,.06,1]);}
   else if(item.id==='semi-memory'){for(const x of [-1.2,0,1.2]){box(g,accent,[x,.8,0],[.8,1.2,1.7]);for(const z of [-.5,0,.5])box(g,silver,[x,1.45,z],[.6,.1,.2]);}}
   else if(item.id==='semi-manufacturing'||item.id==='bio-sequencing'){box(g,white,[-.4,1,0],[2.1,1.6,1.8]);box(g,accent,[-.4,1.2,.92],[1.4,.7,.06]);for(const z of [-.5,.5])column(g,silver,[1.25,.9,z],.3,1.4);}
   else if(item.id==='robot-industrial'||item.id==='robot-medical'){column(g,accent,[0,.4,0],.65,.5);beam(g,white,[0,.6,0],[-.4,1.7,0],.22);beam(g,white,[-.4,1.7,0],[.9,2,.1],.2);beam(g,silver,[.9,2,.1],[1.2,1.2,.4],.11);if(item.id==='robot-medical'){box(g,glow,[-1.3,.8,.6],[.7,.16,.16]);box(g,glow,[-1.3,.8,.6],[.16,.7,.16]);}}
   else if(item.id==='robot-service'){column(g,white,[0,1,0],.7,1.4);add(g,sphere,accent,[0,1.8,0],[.65,.45,.55]);for(const x of [-.6,.6])add(g,sphere,dark,[x,.3,0],[.3,.3,.3]);}
   else if(item.id==='energy-solar'){for(const x of [-1,1]){const panel=box(g,accent,[x,.7,0],[1.6,.12,2]);panel.rotation.x=-.25;beam(g,silver,[x,.2,0],[x,.7,0],.08);for(const dx of [-.4,0,.4])box(g,silver,[x+dx,.8,0],[.02,.02,1.8]);}}
   else if(item.id==='energy-wind'){beam(g,white,[0,.2,0],[0,2.1,0],.12);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;beam(g,white,[0,2.1,.1],[Math.sin(a)*1.1,2.1+Math.cos(a)*1.1,.1],.06);}add(g,sphere,glow,[0,2.1,.1],[.17,.17,.17]);}
   else if(item.id==='energy-storage'){for(const x of [-1,0,1]){column(g,accent,[x,1,0],.4,1.5);column(g,silver,[x,1.8,0],.18,.12);}}
   else if(item.id==='bio-editing'){for(let i=0;i<7;i++){const a=i*.9,y=.4+i*.28,p=[Math.sin(a)*.7,y,Math.cos(a)*.5];add(g,sphere,accent,p,[.16,.16,.16]);add(g,sphere,white,[-p[0],y,-p[2]],[.16,.16,.16]);beam(g,silver,p,[-p[0],y,-p[2]],.025);}}
   else if(item.id==='aero-aviation'){const body=column(g,white,[0,1,0],.2,2.4);body.rotation.x=Math.PI/2;box(g,accent,[0,1,0],[3,.12,.65]);box(g,silver,[0,1.25,-.9],[.12,.6,.6]);}
   else if(item.id==='aero-observation'){box(g,white,[0,1,0],[.8,1.1,.8]);for(const x of [-1.25,1.25])box(g,accent,[x,1,0],[1.2,.08,1.6]);beam(g,silver,[-1.6,1,0],[1.6,1,0],.05);}
   else{column(g,white,[0,1.2,0],.3,1.9);add(g,ownGeo(new THREE.ConeGeometry(.3,.6,12)),accent,[0,2.45,0]);for(const x of [-.4,.4])box(g,silver,[x,.5,0],[.16,.7,.6]);}
  }
  g.userData.anchor=g.position.clone().add(new THREE.Vector3(0,.3,item.depth===1?1.2:.4));
  g.userData.labelAnchor=g.position.clone().add(new THREE.Vector3(0,item.depth===1?3.6:1.7,0));
  const parent=nodeMeshes.get(item.parentId),a=parent.position.clone().add(new THREE.Vector3(0,.2,item.depth===1?3:1.5)),b=g.position.clone().add(new THREE.Vector3(0,.2,item.depth===1?-1.5:-.9));
  const link=new THREE.Line(ownGeo(new THREE.BufferGeometry().setFromPoints([a,b])),lineMat);link.computeLineDistances();link.userData={kind:'hierarchy',parentId:item.parentId,id:item.id};link.visible=g.visible;scene.add(link);hierarchyLinks.set(item.id,link);
 }
 for(const r of relations){
  const from=sectorMeshes.get(r.fromSectorId),to=sectorMeshes.get(r.toSectorId);if(!from||!to)continue;
  const direction=to.position.clone().sub(from.position);direction.y=0;direction.normalize();
  const edge=1/Math.max(Math.abs(direction.x)/4.2,Math.abs(direction.z)/3.2);
  const a=from.position.clone().addScaledVector(direction,edge),b=to.position.clone().addScaledVector(direction,-edge);a.y+=.15;b.y+=.15;
  const c=a.clone().lerp(b,.33),d=a.clone().lerp(b,.67);c.y+=2.2;d.y+=2.2;
  if(Math.abs(a.z-b.z)<3){c.z-=10;d.z-=10;}
  let curve=new THREE.CubicBezierCurve3(a,c,d,b);
  if(Math.abs(from.position.z-to.position.z)>10){
   const sign=Math.sign(to.position.x-from.position.x),corridor=(from.position.x+to.position.x)/2-sign*.75,y=Math.max(from.position.y,to.position.y)+1.7;
   a.copy(from.position).add(new THREE.Vector3(sign*4.25,.15,0));b.copy(to.position).add(new THREE.Vector3(-sign*4.25,.15,0));
   curve=new THREE.CatmullRomCurve3([a,new THREE.Vector3(corridor,y,a.z),new THREE.Vector3(corridor,y,b.z),b]);
  }
  const g=new THREE.Group();g.userData={kind:'relation',id:r.id,curve};scene.add(g);relationMeshes.set(r.id,g);
  const material=ownMat(new THREE.MeshBasicMaterial({color:'#6196b8',transparent:true,opacity:.46}));g.userData.material=material;
  add(g,ownGeo(new THREE.TubeGeometry(curve,48,.045,6,false)),material,[0,0,0]);
  const hit=ownMat(new THREE.MeshBasicMaterial({visible:false}));add(g,ownGeo(new THREE.TubeGeometry(curve,32,.32,6,false)),hit,[0,0,0]).userData.pick=true;
  const ringGeo=ownGeo(new THREE.TorusGeometry(.28,.018,5,16));
  for(let i=1;i<11;i++){const t=i/11,p=curve.getPoint(t),ring=add(g,ringGeo,material,p.toArray());ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),curve.getTangent(t));}
  const arrow=add(g,ownGeo(new THREE.ConeGeometry(.19,.55,12)),material,curve.getPoint(.74).toArray());arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),curve.getTangent(.74));
 }
 const bounds=new THREE.Box3();for(const g of nodeMeshes.values())bounds.expandByObject(g);
 const grid=new THREE.GridHelper(100,50,'#31556a','#213747');grid.position.y=-2;grid.material.transparent=true;grid.material.opacity=.23;scene.add(grid);geometries.add(grid.geometry);materials.add(grid.material);
 let disposed=false;function dispose(){if(disposed)return;disposed=true;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 return {scene,sectorMeshes,nodeMeshes,hierarchyLinks,relationMeshes,bounds,dispose};
}
