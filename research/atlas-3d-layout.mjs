export const SECTOR_LAYOUT=[
 {sectorId:'ai',position:[-20,0,-13]},
 {sectorId:'semiconductors',position:[0,1,-13]},
 {sectorId:'robotics',position:[20,0,-13]},
 {sectorId:'new-energy',position:[-20,0,13]},
 {sectorId:'biotechnology',position:[0,-0.5,13]},
 {sectorId:'aerospace',position:[20,0.5,13]}
];
export function catalogLayout(nodes){
 const result=[];
 for(const root of SECTOR_LAYOUT){
  result.push({id:root.sectorId,rootId:root.sectorId,parentId:null,depth:0,position:root.position});
  const tracks=nodes.filter(n=>n.parentId===root.sectorId);
  for(const [i,track] of tracks.entries()){
   const [x,y,z]=root.position,position=[x+(i-(tracks.length-1)/2)*6.5,y,z+6.6];
   result.push({id:track.id,rootId:root.sectorId,parentId:root.sectorId,depth:1,position});
   for(const [j,tech] of nodes.filter(n=>n.parentId===track.id).entries())result.push({id:tech.id,rootId:root.sectorId,parentId:track.id,depth:2,position:[position[0]+j*2.5,y+.5,z+11.5]});
  }
 }
 return result;
}
