(function(global){
'use strict';
const STORAGE_KEY='bf.core.v2';
const LEGACY_STORAGE_KEY='bf.core.v1';
const HISTORY_KEY='bf.core.history.v2';
const CURRENT_SCHEMA=2;
const MAX_HISTORY=30;
const MAX_PENDING=200;
const listeners=new Set();
const clone=v=>JSON.parse(JSON.stringify(v));
const nowIso=()=>new Date().toISOString();
const uid=p=>p+'_'+Math.random().toString(36).slice(2,9)+'_'+Date.now().toString(36);
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
    charter:{id:'charter_demo',name:'Richardson Charter',status:'active',guestCount:8,budget:2000,currency:'EUR',departure:'',destination:'',startDate:'',endDate:'',timeZone:defaultTimeZone()},
    guests:{items:[],allergySummary:[]},
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

function normalize(s){
  const d=seed();
  s=s&&typeof s==='object'?s:{};
  const out={...d,...s};
  out.meta={...d.meta,...(s.meta||{}),schemaVersion:CURRENT_SCHEMA};
  out.charter={...d.charter,...(s.charter||{})};
  out.guests={...d.guests,...(s.guests||{})};
  out.services={...d.services,...(s.services||{})};
  Object.keys(out.services).forEach(k=>{out.services[k]={...d.services[k],...(out.services[k]||{})};if(!out.services[k].id)out.services[k].id=k;});
  out.inventory={...d.inventory,...(s.inventory||{}),items:{...d.inventory.items,...((s.inventory||{}).items||{})}};
  out.provisioning={...d.provisioning,...(s.provisioning||{})};
  out.notifications={...d.notifications,...(s.notifications||{})};
  out.preferences={...d.preferences,...(s.preferences||{})};
  out.featureFlags={...d.featureFlags,...(s.featureFlags||{})};
  out.sync={...d.sync,...(s.sync||{}),deviceId:(s.sync||{}).deviceId||deviceId(),pendingMutations:Array.isArray((s.sync||{}).pendingMutations)?s.sync.pendingMutations:[],conflicts:Array.isArray((s.sync||{}).conflicts)?s.sync.conflicts:[]};
  out.audit=Array.isArray(s.audit)?s.audit:[];
  return out;
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

function migrate(raw){
  let s=raw&&typeof raw==='object'?clone(raw):seed();
  const version=Number(s?.meta?.schemaVersion||1);
  if(version<2){
    s.meta={...(s.meta||{}),schemaVersion:2,revision:Number(s?.meta?.revision||0),lastMutationId:null};
    s.charter={...(s.charter||{}),currency:s?.charter?.currency||'EUR',timeZone:s?.charter?.timeZone||defaultTimeZone()};
    s.sync={deviceId:deviceId(),status:'local',lastSyncedAt:null,pendingMutations:[],conflicts:[]};
    Object.keys(s.services||{}).forEach(k=>{s.services[k]={id:s.services[k].id||k,date:s.services[k].date||'',stockReserved:!!s.services[k].stockReserved,...s.services[k]};});
    if(s.services?.dinner&&s.inventory?.items?.seaBass?.reserved>0)s.services.dinner.stockReserved=true;
  }
  return normalize(s);
}

function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem(LEGACY_STORAGE_KEY);
    return migrateLegacyKeys(migrate(raw?JSON.parse(raw):seed()));
  }catch(e){return seed();}
}
let state=load();

function persist(){
  state.meta.updatedAt=nowIso();
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  listeners.forEach(fn=>{try{fn(clone(state));}catch(e){}});
}
function history(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch(e){return[]}}
function pushHistory(){const h=history();h.unshift(clone(state));localStorage.setItem(HISTORY_KEY,JSON.stringify(h.slice(0,MAX_HISTORY)));}
function audit(action,detail){state.audit.unshift({id:uid('audit'),at:nowIso(),deviceId:deviceId(),action,detail:detail||{}});state.audit=state.audit.slice(0,300);}
function queueMutation(action,detail,baseRevision){
  const mutation={id:uid('mut'),deviceId:deviceId(),at:nowIso(),baseRevision,revision:state.meta.revision,action,detail:detail||{}};
  state.meta.lastMutationId=mutation.id;
  state.sync.pendingMutations.push(mutation);
  state.sync.pendingMutations=state.sync.pendingMutations.slice(-MAX_PENDING);
  state.sync.status=navigator.onLine?'pending':'offline';
  return mutation;
}
function transact(action,mutator,detail){
  pushHistory();
  const baseRevision=Number(state.meta.revision||0);
  mutator(state);
  state.meta.revision=baseRevision+1;
  audit(action,detail);
  queueMutation(action,detail,baseRevision);
  persist();
  return clone(state);
}

function dateString(baseDate){
  if(typeof baseDate==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(baseDate))return baseDate;
  const d=baseDate instanceof Date?baseDate:new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function wallTimeToEpoch(date,time,timeZone){
  const m=/^(\d{1,2}):(\d{2})$/.exec(time||'00:00');
  const dm=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date||'');
  if(!m||!dm){const d=new Date();d.setHours(m?+m[1]:0,m?+m[2]:0,0,0);return d.getTime();}
  const desired={y:+dm[1],mo:+dm[2],d:+dm[3],h:+m[1],mi:+m[2]};
  let guess=Date.UTC(desired.y,desired.mo-1,desired.d,desired.h,desired.mi,0,0);
  try{
    const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:timeZone||'UTC',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
    for(let i=0;i<3;i++){
      const parts=Object.fromEntries(fmt.formatToParts(new Date(guess)).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
      const seen=Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute);
      const wanted=Date.UTC(desired.y,desired.mo-1,desired.d,desired.h,desired.mi);
      guess+=wanted-seen;
    }
    return guess;
  }catch(e){return new Date(`${date}T${String(desired.h).padStart(2,'0')}:${String(desired.mi).padStart(2,'0')}:00`).getTime();}
}
function serviceEpoch(svc,baseDate){
  const date=svc.date||dateString(baseDate||state.charter.startDate||new Date());
  return wallTimeToEpoch(date,svc.time,state.charter.timeZone);
}
function getTimeline(serviceId,baseDate){
  const svc=state.services[serviceId];if(!svc)return[];
  const serviceAt=serviceEpoch(svc,baseDate);
  return (svc.steps||[]).map(step=>({...clone(step),serviceId,serviceLabel:svc.label,serviceTime:svc.time,timeZone:state.charter.timeZone,at:serviceAt-(step.offsetMin||0)*60000})).sort((a,b)=>a.at-b.at);
}
function getNextAction(at){
  const now=at instanceof Date?at.getTime():(typeof at==='number'?at:Date.now());let upcoming=[],overdue=[];
  Object.values(state.services).forEach(svc=>{if(['served','notServed','cancelled'].includes(svc.status))return;getTimeline(svc.id).forEach(step=>{if(step.status==='done')return;(step.at>=now?upcoming:overdue).push(step);});});
  if(overdue.length){overdue.sort((a,b)=>b.at-a.at);return {...overdue[0],due:true,remainingMs:0};}
  if(upcoming.length){upcoming.sort((a,b)=>a.at-b.at);return {...upcoming[0],due:false,remainingMs:upcoming[0].at-now};}
  return null;
}
function changeServiceTime(serviceId,time){if(!/^([01]?\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Invalid time');return transact('service.time.changed',s=>{if(!s.services[serviceId])throw new Error('Unknown service');s.services[serviceId].time=time;s.services[serviceId].status=s.services[serviceId].status==='served'?'served':'planned';}, {serviceId,time,timeZone:state.charter.timeZone});}
function setServiceDate(serviceId,date){if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Invalid date');return transact('service.date.changed',s=>{if(!s.services[serviceId])throw new Error('Unknown service');s.services[serviceId].date=date;},{serviceId,date});}
function setCharterTimeZone(timeZone){try{new Intl.DateTimeFormat('en-GB',{timeZone}).format(new Date());}catch(e){throw new Error('Invalid time zone');}return transact('charter.timezone.changed',s=>{s.charter.timeZone=timeZone;},{timeZone});}
function setGuestCount(count){count=Math.round(Number(count));if(!Number.isFinite(count)||count<1||count>100)throw new Error('Invalid guest count');return transact('charter.guests.changed',s=>{s.charter.guestCount=count;},{count});}
function markStepDone(serviceId,stepId){return transact('service.step.completed',s=>{const svc=s.services[serviceId];if(!svc)throw new Error('Unknown service');const step=(svc.steps||[]).find(x=>x.id===stepId);if(!step)throw new Error('Unknown step');step.status='done';if(svc.status==='planned')svc.status='prepping';},{serviceId,stepId});}
function reserveServiceStock(serviceId){return transact('inventory.reserved',s=>{const svc=s.services[serviceId];if(!svc)throw new Error('Unknown service');if(svc.stockReserved)return;(svc.inventoryPlan||[]).forEach(p=>{const item=s.inventory.items[p.itemId];if(item)item.reserved=Math.min(item.onHand,(item.reserved||0)+p.qty);});svc.stockReserved=true;},{serviceId});}
function completeService(serviceId,outcome){if(!['served','notServed'].includes(outcome))throw new Error('Invalid outcome');return transact('service.completed',s=>{const svc=s.services[serviceId];if(!svc)throw new Error('Unknown service');(svc.steps||[]).forEach(x=>x.status='done');(svc.inventoryPlan||[]).forEach(p=>{const item=s.inventory.items[p.itemId];if(!item)return;const qty=svc.stockReserved?Math.min(p.qty,item.reserved||0):0;if(outcome==='served')item.onHand=Math.max(0,item.onHand-qty);item.reserved=Math.max(0,(item.reserved||0)-qty);});svc.stockReserved=false;svc.status=outcome;},{serviceId,outcome});}
function addNotification(type,title,message,priority){return transact('notification.added',s=>{s.notifications.items.unshift({id:uid('note'),type:type||'info',title,message,priority:priority||'normal',createdAt:nowIso(),read:false});s.notifications.items=s.notifications.items.slice(0,100);},{type,title});}
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

const api={getState,subscribe,getTimeline,getNextAction,changeServiceTime,setServiceDate,setCharterTimeZone,setGuestCount,markStepDone,reserveServiceStock,completeService,addNotification,markNotificationRead,setAlarmEnabled,recordConflict,markSynced,exportData,importData,undo,resetDemo,storageKey:STORAGE_KEY,schemaVersion:CURRENT_SCHEMA};
global.BusinessFlowCore=Object.freeze(api);
persist();
})(window);
