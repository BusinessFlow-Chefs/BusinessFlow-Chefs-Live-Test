(function(global){
'use strict';
const STORAGE_KEY='bf.core.v3';
const LEGACY_KEYS=['bf.core.v2','bf.core.v1'];
const HISTORY_KEY='bf.core.history.v3';
const CURRENT_SCHEMA=3;
const MAX_HISTORY=30;
const MAX_PENDING=200;
const listeners=new Set();
const clone=v=>JSON.parse(JSON.stringify(v));
const nowIso=()=>new Date().toISOString();
const uid=p=>`${p}_${Math.random().toString(36).slice(2,9)}_${Date.now().toString(36)}`;
const platform=global.BusinessFlowPlatform||null;
const deviceId=()=>platform?.deviceId||'device_browser';
const defaultTimeZone=()=>platform?.systemTimeZone||(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';}catch(e){return'UTC';}})();

const defaultSteps=[
  {id:'mise',offsetMin:60,label:'Beurre blanc mise en place',status:'pending'},
  {id:'veg',offsetMin:50,label:'Prepare vegetables',status:'pending'},
  {id:'station',offsetMin:40,label:'Set fish station',status:'pending'},
  {id:'pass',offsetMin:30,label:'Check pass / sauces',status:'pending'},
  {id:'lead',offsetMin:20,label:'Long-lead components',status:'pending'},
  {id:'fireVeg',offsetMin:12,label:'Fire vegetables',status:'pending'},
  {id:'fireProtein',offsetMin:8,label:'Fire proteins',status:'pending'},
  {id:'finishSauce',offsetMin:3,label:'Finish sauces',status:'pending'},
  {id:'finalPass',offsetMin:1,label:'Final pass',status:'pending'},
  {id:'serve',offsetMin:0,label:'SERVE',status:'pending'}
];

function seed(){
  return {
    meta:{schemaVersion:CURRENT_SCHEMA,revision:0,createdAt:nowIso(),updatedAt:nowIso(),lastMutationId:null},
    charter:{
      id:'charter_demo',name:'Richardson Charter',status:'active',guestCount:8,budget:2000,currency:'EUR',
      departure:'',destination:'',startDate:'',endDate:'',timeZone:defaultTimeZone(),notes:''
    },
    guests:{items:[],allergySummary:[]},
    menu:{status:'draft',theme:'',days:[],lockedDishIds:[]},
    recipes:{items:{}},
    services:{
      breakfast:{id:'breakfast',label:'Breakfast',date:'',time:'08:30',status:'served',steps:[],stockReserved:false},
      lunch:{id:'lunch',label:'Lunch',date:'',time:'13:00',status:'served',steps:[],stockReserved:false},
      snack:{id:'snack',label:'Snack',date:'',time:'16:00',status:'planned',steps:[{id:'snackPrep',offsetMin:30,label:'Prepare snack service',status:'pending'},{id:'snackServe',offsetMin:0,label:'SERVE SNACK',status:'pending'}],stockReserved:false},
      dinner:{id:'dinner',label:'Dinner',date:'',time:'19:30',status:'planned',steps:clone(defaultSteps),inventoryPlan:[{itemId:'seaBass',qty:8,unit:'portions'}],stockReserved:true}
    },
    inventory:{items:{seaBass:{id:'seaBass',name:'Sea bass',unit:'portions',onHand:12,reserved:8,location:'fridge'}}},
    provisioning:{items:[]},
    notifications:{items:[]},
    preferences:{alarmEnabled:true},
    featureFlags:{voice:true,offline:true,guestMemory:true,provisioning:true,inventory:true,analytics:false},
    sync:{deviceId:deviceId(),status:'local',lastSyncedAt:null,pendingMutations:[],conflicts:[]},
    audit:[]
  };
}

function normalizeGuest(g){
  g=g&&typeof g==='object'?g:{};
  return {
    id:g.id||uid('guest'),name:String(g.name||'').trim(),active:g.active!==false,
    allergies:Array.isArray(g.allergies)?g.allergies.filter(Boolean).map(v=>String(v).trim()).filter(Boolean):[],
    dietary:Array.isArray(g.dietary)?g.dietary.filter(Boolean).map(v=>String(v).trim()).filter(Boolean):[],
    likes:Array.isArray(g.likes)?g.likes.filter(Boolean).map(v=>String(v).trim()).filter(Boolean):[],
    dislikes:Array.isArray(g.dislikes)?g.dislikes.filter(Boolean).map(v=>String(v).trim()).filter(Boolean):[],
    notes:String(g.notes||'').trim()
  };
}
function allergySummary(items){
  const map=new Map();
  (items||[]).filter(g=>g.active!==false).forEach(g=>(g.allergies||[]).forEach(a=>{
    const key=a.trim().toLowerCase(); if(!key)return;
    const prev=map.get(key)||{label:a.trim(),count:0}; prev.count++; map.set(key,prev);
  }));
  return [...map.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));
}
function normalize(s){
  const d=seed(); s=s&&typeof s==='object'?s:{};
  const out={...d,...s};
  out.meta={...d.meta,...(s.meta||{}),schemaVersion:CURRENT_SCHEMA};
  out.charter={...d.charter,...(s.charter||{})};
  const guestItems=Array.isArray((s.guests||{}).items)?s.guests.items.map(normalizeGuest):[];
  out.guests={...d.guests,...(s.guests||{}),items:guestItems,allergySummary:allergySummary(guestItems)};
  out.menu={...d.menu,...(s.menu||{}),days:Array.isArray((s.menu||{}).days)?s.menu.days:[],lockedDishIds:Array.isArray((s.menu||{}).lockedDishIds)?s.menu.lockedDishIds:[]};
  out.recipes={...d.recipes,...(s.recipes||{}),items:{...d.recipes.items,...((s.recipes||{}).items||{})}};
  out.services={...d.services,...(s.services||{})};
  Object.keys(out.services).forEach(k=>{out.services[k]={...d.services[k],...(out.services[k]||{})};if(!out.services[k].id)out.services[k].id=k;});
  out.inventory={...d.inventory,...(s.inventory||{}),items:{...d.inventory.items,...((s.inventory||{}).items||{})}};
  out.provisioning={...d.provisioning,...(s.provisioning||{}),items:Array.isArray((s.provisioning||{}).items)?s.provisioning.items:[]};
  out.notifications={...d.notifications,...(s.notifications||{}),items:Array.isArray((s.notifications||{}).items)?s.notifications.items:[]};
  out.preferences={...d.preferences,...(s.preferences||{})};
  out.featureFlags={...d.featureFlags,...(s.featureFlags||{})};
  out.sync={...d.sync,...(s.sync||{}),deviceId:(s.sync||{}).deviceId||deviceId(),pendingMutations:Array.isArray((s.sync||{}).pendingMutations)?s.sync.pendingMutations:[],conflicts:Array.isArray((s.sync||{}).conflicts)?s.sync.conflicts:[]};
  out.audit=Array.isArray(s.audit)?s.audit:[];
  return out;
}
function migrate(raw){
  let s=raw&&typeof raw==='object'?clone(raw):seed();
  const version=Number(s?.meta?.schemaVersion||1);
  if(version<2){
    s.meta={...(s.meta||{}),schemaVersion:2,revision:Number(s?.meta?.revision||0),lastMutationId:null};
    s.charter={...(s.charter||{}),currency:s?.charter?.currency||'EUR',timeZone:s?.charter?.timeZone||defaultTimeZone()};
    s.sync={deviceId:deviceId(),status:'local',lastSyncedAt:null,pendingMutations:[],conflicts:[]};
    Object.keys(s.services||{}).forEach(k=>{s.services[k]={id:s.services[k].id||k,date:s.services[k].date||'',stockReserved:!!s.services[k].stockReserved,...s.services[k]};});
  }
  if(version<3){
    s.meta={...(s.meta||{}),schemaVersion:3};
    s.charter={...(s.charter||{}),notes:s?.charter?.notes||''};
    s.menu=s.menu||{status:'draft',theme:'',days:[],lockedDishIds:[]};
    s.recipes=s.recipes||{items:{}};
    s.guests={...(s.guests||{}),items:Array.isArray(s?.guests?.items)?s.guests.items:[]};
  }
  return normalize(s);
}
function migrateLegacyKeys(s){
  try{
    const dinner=localStorage.getItem('bfDinnerTime');
    const guests=Number(localStorage.getItem('bfGuests'));
    const alarm=localStorage.getItem('bfHomeAlarm');
    if(dinner&&/^\d{1,2}:\d{2}$/.test(dinner))s.services.dinner.time=dinner;
    if(Number.isFinite(guests)&&guests>0)s.charter.guestCount=Math.round(guests);
    if(alarm==='off')s.preferences.alarmEnabled=false;
  }catch(e){}
  return s;
}
function load(){
  try{
    let raw=localStorage.getItem(STORAGE_KEY);
    if(!raw){for(const key of LEGACY_KEYS){raw=localStorage.getItem(key);if(raw)break;}}
    return migrateLegacyKeys(migrate(raw?JSON.parse(raw):seed()));
  }catch(e){return seed();}
}
let state=load();
function persist(){state.meta.updatedAt=nowIso();localStorage.setItem(STORAGE_KEY,JSON.stringify(state));listeners.forEach(fn=>{try{fn(clone(state));}catch(e){}});}
function history(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch(e){return[]}}
function pushHistory(){const h=history();h.unshift(clone(state));localStorage.setItem(HISTORY_KEY,JSON.stringify(h.slice(0,MAX_HISTORY)));}
function audit(action,detail){state.audit.unshift({id:uid('audit'),at:nowIso(),deviceId:deviceId(),action,detail:detail||{}});state.audit=state.audit.slice(0,300);}
function queueMutation(action,detail,baseRevision){const mutation={id:uid('mut'),deviceId:deviceId(),at:nowIso(),baseRevision,revision:state.meta.revision,action,detail:detail||{}};state.meta.lastMutationId=mutation.id;state.sync.pendingMutations.push(mutation);state.sync.pendingMutations=state.sync.pendingMutations.slice(-MAX_PENDING);state.sync.status=navigator.onLine?'pending':'offline';return mutation;}
function transact(action,mutator,detail){pushHistory();const baseRevision=Number(state.meta.revision||0);mutator(state);state.meta.revision=baseRevision+1;audit(action,detail);queueMutation(action,detail,baseRevision);persist();return clone(state);}

function validDate(v){return !v||/^\d{4}-\d{2}-\d{2}$/.test(v);}
function validCurrency(v){return /^[A-Z]{3}$/.test(v||'');}
function dateString(baseDate){if(typeof baseDate==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(baseDate))return baseDate;const d=baseDate instanceof Date?baseDate:new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function charterDays(){const {startDate,endDate}=state.charter;if(!startDate||!endDate)return 0;const a=new Date(`${startDate}T00:00:00Z`),b=new Date(`${endDate}T00:00:00Z`);const diff=Math.floor((b-a)/86400000);return Number.isFinite(diff)&&diff>=0?diff+1:0;}
function wallTimeToEpoch(date,time,timeZone){
  const m=/^(\d{1,2}):(\d{2})$/.exec(time||'00:00');const dm=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date||'');
  if(!m||!dm){const d=new Date();d.setHours(m?+m[1]:0,m?+m[2]:0,0,0);return d.getTime();}
  const desired={y:+dm[1],mo:+dm[2],d:+dm[3],h:+m[1],mi:+m[2]};let guess=Date.UTC(desired.y,desired.mo-1,desired.d,desired.h,desired.mi,0,0);
  try{const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:timeZone||'UTC',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});for(let i=0;i<3;i++){const parts=Object.fromEntries(fmt.formatToParts(new Date(guess)).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));const seen=Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute);const wanted=Date.UTC(desired.y,desired.mo-1,desired.d,desired.h,desired.mi);guess+=wanted-seen;}return guess;}catch(e){return new Date(`${date}T${String(desired.h).padStart(2,'0')}:${String(desired.mi).padStart(2,'0')}:00`).getTime();}
}
function serviceEpoch(svc,baseDate){const date=svc.date||dateString(baseDate||state.charter.startDate||new Date());return wallTimeToEpoch(date,svc.time,state.charter.timeZone);}
function getTimeline(serviceId,baseDate){const svc=state.services[serviceId];if(!svc)return[];const serviceAt=serviceEpoch(svc,baseDate);return (svc.steps||[]).map(step=>({...clone(step),serviceId,serviceLabel:svc.label,serviceTime:svc.time,timeZone:state.charter.timeZone,at:serviceAt-(step.offsetMin||0)*60000})).sort((a,b)=>a.at-b.at);}
function getNextAction(at){const now=at instanceof Date?at.getTime():(typeof at==='number'?at:Date.now());let upcoming=[],overdue=[];Object.values(state.services).forEach(svc=>{if(['served','notServed','cancelled'].includes(svc.status))return;getTimeline(svc.id).forEach(step=>{if(step.status==='done')return;(step.at>=now?upcoming:overdue).push(step);});});if(overdue.length){overdue.sort((a,b)=>b.at-a.at);return {...overdue[0],due:true,remainingMs:0};}if(upcoming.length){upcoming.sort((a,b)=>a.at-b.at);return {...upcoming[0],due:false,remainingMs:upcoming[0].at-now};}return null;}

function updateCharter(patch){
  patch=patch&&typeof patch==='object'?patch:{};
  const allowed=['name','status','budget','currency','departure','destination','startDate','endDate','timeZone','notes'];
  const next={};allowed.forEach(k=>{if(Object.prototype.hasOwnProperty.call(patch,k))next[k]=patch[k];});
  if('name'in next&&!String(next.name).trim())throw new Error('Charter name is required');
  if('budget'in next){next.budget=Number(next.budget);if(!Number.isFinite(next.budget)||next.budget<0)throw new Error('Invalid budget');}
  if('currency'in next){next.currency=String(next.currency).toUpperCase();if(!validCurrency(next.currency))throw new Error('Invalid currency');}
  if('startDate'in next&&!validDate(next.startDate))throw new Error('Invalid start date');
  if('endDate'in next&&!validDate(next.endDate))throw new Error('Invalid end date');
  if('timeZone'in next){try{new Intl.DateTimeFormat('en-GB',{timeZone:next.timeZone}).format(new Date());}catch(e){throw new Error('Invalid time zone');}}
  const merged={...state.charter,...next};if(merged.startDate&&merged.endDate&&merged.endDate<merged.startDate)throw new Error('End date cannot be before start date');
  return transact('charter.updated',s=>{Object.assign(s.charter,next);},{fields:Object.keys(next)});
}
function setCharterTimeZone(timeZone){return updateCharter({timeZone});}
function setGuestCount(count){count=Math.round(Number(count));if(!Number.isFinite(count)||count<1||count>100)throw new Error('Invalid guest count');if(count<state.guests.items.filter(g=>g.active!==false).length)throw new Error('Guest count cannot be lower than detailed guest profiles');return transact('charter.guests.changed',s=>{s.charter.guestCount=count;},{count});}
function addGuest(input){
  const guest=normalizeGuest(input);if(!guest.name)throw new Error('Guest name is required');
  return transact('guest.added',s=>{s.guests.items.push(guest);s.guests.allergySummary=allergySummary(s.guests.items);const active=s.guests.items.filter(g=>g.active!==false).length;if(active>s.charter.guestCount)s.charter.guestCount=active;},{guestId:guest.id,name:guest.name});
}
function updateGuest(id,patch){
  if(!id)throw new Error('Guest id is required');patch=patch&&typeof patch==='object'?patch:{};
  return transact('guest.updated',s=>{const i=s.guests.items.findIndex(g=>g.id===id);if(i<0)throw new Error('Unknown guest');const merged=normalizeGuest({...s.guests.items[i],...patch,id});if(!merged.name)throw new Error('Guest name is required');s.guests.items[i]=merged;s.guests.allergySummary=allergySummary(s.guests.items);},{guestId:id,fields:Object.keys(patch)});
}
function removeGuest(id){if(!id)throw new Error('Guest id is required');return transact('guest.removed',s=>{const before=s.guests.items.length;s.guests.items=s.guests.items.filter(g=>g.id!==id);if(s.guests.items.length===before)throw new Error('Unknown guest');s.guests.allergySummary=allergySummary(s.guests.items);},{guestId:id});}
function changeServiceTime(serviceId,time){if(!/^([01]?\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Invalid time');return transact('service.time.changed',s=>{if(!s.services[serviceId])throw new Error('Unknown service');s.services[serviceId].time=time;s.services[serviceId].status=s.services[serviceId].status==='served'?'served':'planned';},{serviceId,time,timeZone:state.charter.timeZone});}
function setServiceDate(serviceId,date){if(date&&!validDate(date))throw new Error('Invalid date');return transact('service.date.changed',s=>{if(!s.services[serviceId])throw new Error('Unknown service');s.services[serviceId].date=date;},{serviceId,date});}
function markStepDone(serviceId,stepId){return transact('service.step.completed',s=>{const svc=s.services[serviceId];if(!svc)throw new Error('Unknown service');const step=(svc.steps||[]).find(x=>x.id===stepId);if(!step)throw new Error('Unknown step');step.status='done';if(svc.status==='planned')svc.status='prepping';},{serviceId,stepId});}
function reserveServiceStock(serviceId){return transact('inventory.reserved',s=>{const svc=s.services[serviceId];if(!svc)throw new Error('Unknown service');if(svc.stockReserved)return;(svc.inventoryPlan||[]).forEach(p=>{const item=s.inventory.items[p.itemId];if(item)item.reserved=Math.min(item.onHand,(item.reserved||0)+p.qty);});svc.stockReserved=true;},{serviceId});}
function completeService(serviceId,outcome){if(!['served','notServed'].includes(outcome))throw new Error('Invalid outcome');return transact('service.completed',s=>{const svc=s.services[serviceId];if(!svc)throw new Error('Unknown service');(svc.steps||[]).forEach(x=>x.status='done');(svc.inventoryPlan||[]).forEach(p=>{const item=s.inventory.items[p.itemId];if(!item)return;const qty=svc.stockReserved?Math.min(p.qty,item.reserved||0):0;if(outcome==='served')item.onHand=Math.max(0,item.onHand-qty);item.reserved=Math.max(0,(item.reserved||0)-qty);});svc.stockReserved=false;svc.status=outcome;},{serviceId,outcome});}
function addNotification(type,title,message,priority){return transact('notification.added',s=>{s.notifications.items.unshift({id:uid('note'),type:type||'info',title:String(title||''),message:String(message||''),priority:priority||'normal',createdAt:nowIso(),read:false});s.notifications.items=s.notifications.items.slice(0,100);},{type,title});}
function markNotificationRead(id){return transact('notification.read',s=>{const n=s.notifications.items.find(x=>x.id===id);if(n)n.read=true;},{id});}
function setAlarmEnabled(enabled){return transact('preference.alarm.changed',s=>{s.preferences.alarmEnabled=!!enabled;},{enabled:!!enabled});}
function recordConflict(remoteMutation,reason){return transact('sync.conflict.recorded',s=>{s.sync.conflicts.unshift({id:uid('conflict'),at:nowIso(),reason:reason||'revision-mismatch',remoteMutation:clone(remoteMutation||{})});s.sync.conflicts=s.sync.conflicts.slice(0,100);},{reason});}
function markSynced(mutationIds){const ids=new Set(mutationIds||state.sync.pendingMutations.map(m=>m.id));state.sync.pendingMutations=state.sync.pendingMutations.filter(m=>!ids.has(m.id));state.sync.lastSyncedAt=nowIso();state.sync.status=state.sync.pendingMutations.length?'pending':'synced';persist();return clone(state);}
function exportData(){return JSON.stringify({exportedAt:nowIso(),schemaVersion:CURRENT_SCHEMA,state:clone(state)},null,2);}
function importData(payload){const parsed=typeof payload==='string'?JSON.parse(payload):payload;const incoming=parsed?.state||parsed;if(!incoming||typeof incoming!=='object')throw new Error('Invalid backup');pushHistory();state=migrate(incoming);state.meta.revision=Number(state.meta.revision||0)+1;audit('backup.imported',{});queueMutation('backup.imported',{},state.meta.revision-1);persist();return clone(state);}
function undo(){const h=history();if(!h.length)return clone(state);const previous=h.shift();localStorage.setItem(HISTORY_KEY,JSON.stringify(h));state=normalize(previous);state.meta.revision=Number(state.meta.revision||0)+1;audit('undo.applied',{});queueMutation('undo.applied',{},state.meta.revision-1);persist();return clone(state);}
function resetDemo(){pushHistory();state=seed();state.meta.revision=1;audit('demo.reset',{});queueMutation('demo.reset',{},0);persist();return clone(state);}
function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
function getState(){return clone(state);}

const api={getState,subscribe,getTimeline,getNextAction,charterDays,updateCharter,setCharterTimeZone,setGuestCount,addGuest,updateGuest,removeGuest,changeServiceTime,setServiceDate,markStepDone,reserveServiceStock,completeService,addNotification,markNotificationRead,setAlarmEnabled,recordConflict,markSynced,exportData,importData,undo,resetDemo,storageKey:STORAGE_KEY,schemaVersion:CURRENT_SCHEMA};
global.BusinessFlowCore=Object.freeze(api);
persist();
})(window);