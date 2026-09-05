(function(global){
'use strict';
const core=global.BusinessFlowCore;
if(!core)return;
const clone=v=>JSON.parse(JSON.stringify(v));
const nowIso=()=>new Date().toISOString();
const uid=p=>`${p}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`;
const text=v=>String(v||'').trim();
const num=(v,fallback=0)=>{const n=Number(v);return Number.isFinite(n)?n:fallback;};
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const slug=v=>text(v).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'item';

function ensure(state){
  state=state&&typeof state==='object'?state:{};
  state.journey=state.journey&&typeof state.journey==='object'?state.journey:{};
  state.journey.currentLocation=text(state.journey.currentLocation);
  state.journey.stops=Array.isArray(state.journey.stops)?state.journey.stops:[];
  state.sourcing=state.sourcing&&typeof state.sourcing==='object'?state.sourcing:{};
  state.sourcing.preferences={
    radiusKm:5,
    recommendationCount:5,
    preferLocal:true,
    preferQuality:true,
    preferValue:true,
    preferRouteFit:true,
    ...(state.sourcing.preferences||{})
  };
  state.sourcing.suppliers=Array.isArray(state.sourcing.suppliers)?state.sourcing.suppliers:[];
  state.sourcing.selections=state.sourcing.selections&&typeof state.sourcing.selections==='object'?state.sourcing.selections:{};
  return state;
}
function save(state,action,detail){
  state=ensure(state);
  state.audit=Array.isArray(state.audit)?state.audit:[];
  state.audit.unshift({id:uid('audit'),at:nowIso(),deviceId:state.sync?.deviceId||'device_browser',action,detail:detail||{}});
  return core.importData({state});
}
function getJourney(){return clone(ensure(core.getState()).journey);}
function routeLocations(){
  const s=ensure(core.getState()),out=[];
  const add=(id,label,type,meta={})=>{label=text(label);if(!label)return;if(out.some(x=>x.label.toLowerCase()===label.toLowerCase()&&x.type===type))return;out.push({id,label,type,...meta});};
  add('current',s.journey.currentLocation,'current',{rank:0});
  add('departure',s.charter?.departure,'departure',{rank:1,date:s.charter?.startDate||''});
  s.journey.stops.forEach((stop,i)=>add(stop.id||`stop_${i+1}`,stop.location,'route',{rank:10+i,arrivalDate:stop.arrivalDate||'',arrivalTime:stop.arrivalTime||'',departureDate:stop.departureDate||'',departureTime:stop.departureTime||''}));
  add('destination',s.charter?.destination,'destination',{rank:999,date:s.charter?.endDate||''});
  return out;
}
function setCurrentLocation(location){const s=ensure(core.getState());s.journey.currentLocation=text(location);save(s,'journey.current-location.changed',{location:s.journey.currentLocation});return getJourney();}
function normalizeStop(data){data=data&&typeof data==='object'?data:{};return{id:data.id||uid('stop'),location:text(data.location),arrivalDate:text(data.arrivalDate),arrivalTime:text(data.arrivalTime),departureDate:text(data.departureDate),departureTime:text(data.departureTime),notes:text(data.notes)};}
function addStop(data){const s=ensure(core.getState()),stop=normalizeStop(data);if(!stop.location)throw new Error('Stop location is required');s.journey.stops.push(stop);save(s,'journey.stop.added',{stopId:stop.id,location:stop.location});return clone(stop);}
function updateStop(id,data){const s=ensure(core.getState()),i=s.journey.stops.findIndex(x=>x.id===id);if(i<0)throw new Error('Route stop not found');const next=normalizeStop({...s.journey.stops[i],...(data||{}),id});if(!next.location)throw new Error('Stop location is required');s.journey.stops[i]=next;save(s,'journey.stop.updated',{stopId:id,location:next.location});return clone(next);}
function removeStop(id){const s=ensure(core.getState()),before=s.journey.stops.length;s.journey.stops=s.journey.stops.filter(x=>x.id!==id);if(s.journey.stops.length===before)throw new Error('Route stop not found');save(s,'journey.stop.removed',{stopId:id});}

function normalizeSupplier(data){
  data=data&&typeof data==='object'?data:{};
  const discount=clamp(num(data.discountPercent,0),0,100);
  const categories=Array.isArray(data.categories)?data.categories.map(text).filter(Boolean):[];
  const locations=Array.isArray(data.locations)?data.locations.map(text).filter(Boolean):text(data.location)?[text(data.location)]:[];
  return {
    id:data.id||uid('supplier'),
    name:text(data.name),
    locations,
    categories,
    preferred:!!data.preferred,
    discountPercent:discount,
    discountNote:text(data.discountNote),
    minimumOrder:Math.max(0,num(data.minimumOrder,0)),
    currency:text(data.currency||'EUR').toUpperCase(),
    delivery:!!data.delivery,
    leadTimeHours:Math.max(0,num(data.leadTimeHours,0)),
    rating:clamp(num(data.rating,0),0,5),
    localProducer:!!data.localProducer,
    yachtFriendly:data.yachtFriendly!==false,
    phone:text(data.phone),email:text(data.email),website:text(data.website),
    notes:text(data.notes),active:data.active!==false,
    updatedAt:data.updatedAt||nowIso()
  };
}
function getSuppliers(){return ensure(core.getState()).sourcing.suppliers.map(normalizeSupplier).filter(x=>x.active!==false).sort((a,b)=>(b.preferred-a.preferred)||(b.discountPercent-a.discountPercent)||a.name.localeCompare(b.name));}
function upsertSupplier(data){const s=ensure(core.getState()),supplier=normalizeSupplier(data);if(!supplier.name)throw new Error('Supplier name is required');const i=s.sourcing.suppliers.findIndex(x=>x.id===supplier.id);supplier.updatedAt=nowIso();if(i>=0)s.sourcing.suppliers[i]=supplier;else s.sourcing.suppliers.push(supplier);save(s,i>=0?'supplier.updated':'supplier.added',{supplierId:supplier.id,name:supplier.name,preferred:supplier.preferred,discountPercent:supplier.discountPercent});return clone(supplier);}
function removeSupplier(id){const s=ensure(core.getState()),before=s.sourcing.suppliers.length;s.sourcing.suppliers=s.sourcing.suppliers.filter(x=>x.id!==id);if(s.sourcing.suppliers.length===before)throw new Error('Supplier not found');Object.keys(s.sourcing.selections).forEach(k=>{if(s.sourcing.selections[k]?.supplierId===id)delete s.sourcing.selections[k];});save(s,'supplier.removed',{supplierId:id});}
function setPreferredSupplier(id,preferred=true,discountPercent){const s=ensure(core.getState()),i=s.sourcing.suppliers.findIndex(x=>x.id===id);if(i<0)throw new Error('Supplier not found');s.sourcing.suppliers[i]={...normalizeSupplier(s.sourcing.suppliers[i]),preferred:!!preferred,discountPercent:discountPercent===undefined?clamp(num(s.sourcing.suppliers[i].discountPercent,0),0,100):clamp(num(discountPercent,0),0,100),updatedAt:nowIso()};save(s,'supplier.preferred.changed',{supplierId:id,preferred:!!preferred,discountPercent:s.sourcing.suppliers[i].discountPercent});return clone(s.sourcing.suppliers[i]);}
function updatePreferences(patch){const s=ensure(core.getState());s.sourcing.preferences={...s.sourcing.preferences,...(patch||{})};s.sourcing.preferences.radiusKm=clamp(num(s.sourcing.preferences.radiusKm,5),1,100);s.sourcing.preferences.recommendationCount=clamp(Math.round(num(s.sourcing.preferences.recommendationCount,5)),3,8);save(s,'sourcing.preferences.updated',{fields:Object.keys(patch||{})});return clone(s.sourcing.preferences);}
function getPreferences(){return clone(ensure(core.getState()).sourcing.preferences);}

function locationMatches(supplier,location){if(!location)return true;const wanted=text(location.label||location).toLowerCase();return supplier.locations.some(x=>wanted.includes(x.toLowerCase())||x.toLowerCase().includes(wanted));}
function categoryMatches(supplier,category){if(!supplier.categories.length)return true;const wanted=text(category).toLowerCase();return supplier.categories.some(x=>x.toLowerCase()===wanted||wanted.includes(x.toLowerCase())||x.toLowerCase().includes(wanted));}
function discountedPrice(basePrice,discountPercent){const p=num(basePrice,NaN);if(!Number.isFinite(p))return null;return Math.max(0,Math.round((p*(1-clamp(num(discountPercent,0),0,100)/100))*100)/100);}
function scoreSupplier(supplier,context){
  const p=getPreferences();let score=0,reasons=[];
  if(supplier.preferred){score+=34;reasons.push('Preferred supplier');}
  if(supplier.discountPercent>0){score+=Math.min(18,supplier.discountPercent*.8);reasons.push(`${supplier.discountPercent}% discount`);}
  if(categoryMatches(supplier,context.category)){score+=18;reasons.push('Stocks this category');}else score-=30;
  if(locationMatches(supplier,context.location)){score+=22;reasons.push('Fits selected location');}else if(supplier.locations.length)score-=8;
  if(p.preferLocal&&supplier.localProducer){score+=12;reasons.push('Local producer');}
  if(p.preferQuality&&supplier.rating){score+=supplier.rating*2.5;if(supplier.rating>=4.5)reasons.push('High rated');}
  if(supplier.yachtFriendly){score+=5;reasons.push('Yacht friendly');}
  if(supplier.delivery){score+=4;reasons.push('Delivery available');}
  if(p.preferRouteFit&&context.location?.type==='route'&&locationMatches(supplier,context.location)){score+=6;reasons.push('On route');}
  const price=discountedPrice(context.basePrice,supplier.discountPercent);return{score:Math.round(score*10)/10,reasons,discountedPrice:price,saving:price===null?null:Math.round((num(context.basePrice)-price)*100)/100};
}
function normalizeCandidate(raw){const s=normalizeSupplier(raw);return{...s,source:raw?.source||'candidate',basePrice:Number.isFinite(Number(raw?.basePrice))?Number(raw.basePrice):null,distanceKm:Number.isFinite(Number(raw?.distanceKm))?Number(raw.distanceKm):null,availability:text(raw?.availability||'unknown')};}
function recommend(line,locationId,candidates=[]){
  const locations=routeLocations(),location=locations.find(x=>x.id===locationId)||locations[0]||null,p=getPreferences();
  const saved=getSuppliers().map(x=>({...x,source:'saved'}));
  const external=(Array.isArray(candidates)?candidates:[]).map(normalizeCandidate);
  const merged=new Map();[...saved,...external].forEach(x=>{const key=(x.id||slug(`${x.name}-${(x.locations||[]).join('-')}`));if(!merged.has(key)||x.source==='saved')merged.set(key,x);});
  return [...merged.values()].filter(x=>x.active!==false).map(s=>{const evald=scoreSupplier(s,{category:line?.category||'',location,basePrice:s.basePrice});return{...clone(s),location,ingredientKey:line?.ingredientKey||line?.key||'',ingredient:line?.name||line?.displayName||'',...evald};}).sort((a,b)=>b.score-a.score||(a.distanceKm??999)-(b.distanceKm??999)||b.discountPercent-a.discountPercent).slice(0,p.recommendationCount);
}
function selectionKey(ingredientKey,locationId){return`${ingredientKey||'item'}@@${locationId||'any'}`;}
function selectSupplier(ingredientKey,locationId,supplierId){const s=ensure(core.getState()),supplier=s.sourcing.suppliers.map(normalizeSupplier).find(x=>x.id===supplierId)||null;if(!supplier)throw new Error('Supplier not found');const key=selectionKey(ingredientKey,locationId);s.sourcing.selections[key]={ingredientKey,locationId,supplierId,selectedAt:nowIso()};save(s,'sourcing.supplier.selected',{ingredientKey,locationId,supplierId});return clone(s.sourcing.selections[key]);}
function getSelection(ingredientKey,locationId){return clone(ensure(core.getState()).sourcing.selections[selectionKey(ingredientKey,locationId)]||null);}

global.BusinessFlowSourcing=Object.freeze({getJourney,routeLocations,setCurrentLocation,addStop,updateStop,removeStop,getSuppliers,upsertSupplier,removeSupplier,setPreferredSupplier,updatePreferences,getPreferences,recommend,selectSupplier,getSelection,discountedPrice});
})(window);