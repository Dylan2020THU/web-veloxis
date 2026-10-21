export function initialAtlasState(){return {hoveredSectorId:null,selectedSectorId:null,selectedComponentId:null,selectedCompanyId:null,returnOverview:null};}
export function reduceAtlas(data,state,action){
 if(action.type==='close'||action.type==='reset')return initialAtlasState();
 if(action.type==='hover')return action.sectorId===null||data.systems.some(s=>s.nodeId===action.sectorId)?{...state,hoveredSectorId:action.sectorId}:state;
 if(action.type==='open'){
  if(!data.systems.some(s=>s.nodeId===action.sectorId))return state;
  return {...state,selectedSectorId:action.sectorId,hoveredSectorId:null,selectedComponentId:null,selectedCompanyId:null,returnOverview:state.returnOverview||structuredClone(action.overview)};
 }
 if(action.type==='component'){
  const system=data.systems.find(s=>s.nodeId===state.selectedSectorId);
  if(!data.components.some(c=>c.id===action.componentId&&c.systemId===system?.id))return state;
  return {...state,selectedComponentId:action.componentId,selectedCompanyId:null};
 }
 if(action.type==='company'&&data.companyLinks.some(l=>l.componentId===state.selectedComponentId&&l.companyId===action.companyId))return {...state,selectedCompanyId:action.companyId};
 return state;
}
