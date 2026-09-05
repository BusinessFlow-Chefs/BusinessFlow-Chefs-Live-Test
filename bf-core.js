(function(global){
'use strict';
const STORAGE_KEY='bf.core.v1';
const HISTORY_KEY='bf.core.history.v1';
const MAX_HISTORY=30;
const listeners=new Set();
const clone=v=>JSON.parse(JSON.stringify(v));
const nowIso=()=>new Date().toISOString();
const uid=p=>p+'_'+Math.random().toString(36).slice(2,9);

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
    meta:{schemaVersion:1,createdAt:nowIso(),updatedAt:nowIso()},
    charter:{id:'charter_demo',name:'Richardson Charter',status:'active',guestCount:8,budget:2000,departure:'',destination:'',startDate:'',endDate:''},
    guests:{items:[],allergySummary:[]},
    services:{
      breakfast:{id:'breakfast',label:'Breakfast',time:'08:30',status:'served',steps:[]},
      lunch:{id:'lunch',label:'Lunch',time:'13:00',status:'served',steps:[]},
      snack:{id:'snack',label:'Snack',time:'16:00',status:'planned',steps:[{id:'snackPrep',offsetMin:30,label:'Prepare snack service',status:'pending'},{id:'snackServe',offsetMin:0,label:'SERVE SNACK',status:'pending'}]},
      dinner:{id:'dinner',label:'Dinner',time:'19:30',status:'planned',steps:clone(defaultSteps),inventoryPlan:[{itemId:'seaBass',qty:8,unit:'portions'}]}
    },
    inventory:{items:{seaBass:{id:'seaBass',name:'Sea bass',unit:'portions',onHand:12,reserved:8,location:'fridge'}}},
    provisioning:{items:[]},
    notifications:{items:[]},
    preferences:{alarmEnabled:true},
    featureFlags:{voice:true,offline:true,guestMemory:true,provisioning:true,inventory:true,analytics:false},
    audit:[]
  };
}

function normalize(s){
  const d=seed();
  s=s&&typeof s==='object'?s:{};
  const out={...d,...s};
  out.meta={...d.meta,...(s.meta||{}),schemaVersion:1};
  out.charter={...d.charter,...(s.charter||{})};
  out.guests={...d.guests,...(s.guests||{})};
  out.services={...d.services,...(s.services||{})};
  Object.keys(out.services).forEach(k=>{out.services[k]={...d.services[k],...(out.services[k]||{})};});
  out.inventory={...d.inventory,...(s.inventory||{}),items:{...d.inventory.items,...((s.inventory||{}).items||{})}};
  out.provisioning={...d.provisioning,...(s.provisioning||{})};
  out.notifications={...d.notifications,...(s.notifications||{})};
  out.preferences={...d.preferences,...(s.preferences||{})};
  out.featureFlags={...d.featureFlags,...(s.featureFlags||{})};
  out.audit=Array.isArray(s.audit)?s.audit:[];
  return out;
}

function migrateLegacy(s){
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
    const raw=localStorage.getItem(STORAGE_KEY);
    return migrateLegacy(normalize(raw?JSON.parse(raw):seed()));
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
function audit(action,detail){state.audit.unshift({id:uid('audit'),at:nowIso(),action,detail:detail||{}});state.audit=state.audit.slice(0,200);}
function transact(action,mutator,detail){pushHistory();mutator(state);audit(action,detail);persist();return clone(state);}
function toDate(time,baseDate){const d=baseDate?new Date(baseDate):new Date();const m=/^(\d{1,2}):(\d{2})$/.exec(time||'00:00');d.setHours(m?+m[1]:0,m?+m[2]:0,0,0);return d;}
function getTimeline(serviceId,baseDate){const svc=state.services[serviceId];if(!svc)return[];const serviceAt=toDate(svc.time,baseDate).getTime();return (svc.steps||[]).map(step=>({...clone(step),serviceId,serviceLabel:svc.label,serviceTime:svc.time,at:serviceAt-(step.offsetMin||0)*60000})).sort((a,b)=>a.at-b.at);}
function getNextAction(at){const now=at instanceof Date?at.getTime():(typeof at==='number'?at:Date.now());let upcoming=[],overdue=[];Object.values(state.services).forEach(svc=>{if(['served','notServed','cancelled'].includes(svc.status))return;getTimeline(svc.id).forEach(step=>{if(step.status==='done')return;(step.at>=now?upcoming:overdue).push(step);});});if(overdue.length){overdue.sort((a,b)=>a.at-b.at);return {...overdue[0],due:true,remainingMs:0};}if(upcoming.length){upcoming.sort((a,b)=>a.at-b.at);return {...upcoming[0],due:false,remainingMs:upcoming[0].at-now};}return null;}
function changeServiceTime(serviceId,time){if(!/^([01]?\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Invalid time');return transact('service.time.changed',s=>{if(!s.services[serviceId])throw new Error('Unknown service');s.services[serviceId].time=time;s.services[serviceId].status=s.services[serviceId].status==='served'?'served':'planned';}, {serviceId,time});}
function setGuestCount(count){count=Math.round(Number(count));if(!Number.isFinite(count)||count<1||count>100)throw new Error('Invalid guest count');return transact('charter.guests.changed',s=>{s.charter.guestCount=count;},{count});}
function markStepDone(serviceId,stepId){return transact('service.step.completed',s=>{const svc=s.services[serviceId];if(!svc)throw new Error('Unknown service');const step=(svc.steps||[]).find(x=>x.id===stepId);if(!step)throw new Error('Unknown step');step.status='done';if(svc.status==='planned')svc.status='prepping';},{serviceId,stepId});}
function reserveServiceStock(serviceId){return transact('inventory.reserved',s=>{const svc=s.services[serviceId];(svc.inventoryPlan||[]).forEach(p=>{const item=s.inventory.items[p.itemId];if(item)item.reserved=Math.min(item.onHand,(item.reserved||0)+p.qty);});},{serviceId});}
function completeService(serviceId,outcome){if(!['served','notServed'].includes(outcome))throw new Error('Invalid outcome');return transact('service.completed',s=>{const svc=s.services[serviceId];if(!svc)throw new Error('Unknown service');(svc.steps||[]).forEach(x=>x.status='done');(svc.inventoryPlan||[]).forEach(p=>{const item=s.inventory.items[p.itemId];if(!item)return;const qty=Math.min(p.qty,item.reserved||0);if(outcome==='served')item.onHand=Math.max(0,item.onHand-qty);item.reserved=Math.max(0,(item.reserved||0)-qty);});svc.status=outcome;},{serviceId,outcome});}
function addNotification(type,title,message,priority){return transact('notification.added',s=>{s.notifications.items.unshift({id:uid('note'),type:type||'info',title,message,priority:priority||'normal',createdAt:nowIso(),read:false});s.notifications.items=s.notifications.items.slice(0,100);},{type,title});}
function markNotificationRead(id){return transact('notification.read',s=>{const n=s.notifications.items.find(x=>x.id===id);if(n)n.read=true;},{id});}
function setAlarmEnabled(enabled){return transact('preference.alarm.changed',s=>{s.preferences.alarmEnabled=!!enabled;},{enabled:!!enabled});}
function undo(){const h=history();if(!h.length)return clone(state);const previous=h.shift();localStorage.setItem(HISTORY_KEY,JSON.stringify(h));state=normalize(previous);audit('undo.applied',{});persist();return clone(state);}
function resetDemo(){pushHistory();state=seed();audit('demo.reset',{});persist();return clone(state);}
function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
function getState(){return clone(state);}

const api={getState,subscribe,getTimeline,getNextAction,changeServiceTime,setGuestCount,markStepDone,reserveServiceStock,completeService,addNotification,markNotificationRead,setAlarmEnabled,undo,resetDemo,storageKey:STORAGE_KEY};
global.BusinessFlowCore=Object.freeze(api);
persist();
})(window);
