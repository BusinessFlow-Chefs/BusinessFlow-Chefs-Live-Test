(function(global){
'use strict';

const DEVICE_KEY='bf.device.id.v1';
const NOTIFY_KEY='bf.notifications.enabled.v1';

function uid(prefix){return `${prefix}_${Math.random().toString(36).slice(2,10)}_${Date.now().toString(36)}`;}
function safeStorageGet(key){try{return localStorage.getItem(key);}catch(e){return null;}}
function safeStorageSet(key,value){try{localStorage.setItem(key,value);return true;}catch(e){return false;}}

function getDeviceId(){
  let id=safeStorageGet(DEVICE_KEY);
  if(!id){id=uid('device');safeStorageSet(DEVICE_KEY,id);}
  return id;
}

function detectEnvironment(){
  const h=location.hostname;
  if(h==='localhost'||h==='127.0.0.1'||h.endsWith('.local'))return 'development';
  if(h.includes('github.io')||h.includes('Live-Test'))return 'test';
  return 'production';
}

function systemTimeZone(){
  try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';}catch(e){return 'UTC';}
}

const ROLE_PERMISSIONS={
  chef:new Set(['charter:read','charter:write','guest:read','guest:write','menu:read','menu:write','recipe:read','recipe:write','service:read','service:write','inventory:read','inventory:write','provisioning:read','provisioning:write','notifications:read','notifications:write']),
  captain:new Set(['charter:read','guest:read','menu:read','service:read','inventory:read','provisioning:read','notifications:read']),
  crew:new Set(['service:read','menu:read','notifications:read']),
  owner:new Set(['charter:read','guest:read','menu:read','service:read','inventory:read','provisioning:read','notifications:read']),
  admin:new Set(['*'])
};

function can(role,permission){
  const set=ROLE_PERMISSIONS[role]||new Set();
  return set.has('*')||set.has(permission);
}

function notificationSupported(){return 'Notification' in global;}
function notificationEnabled(){return safeStorageGet(NOTIFY_KEY)!=='off';}
function setNotificationEnabled(enabled){safeStorageSet(NOTIFY_KEY,enabled?'on':'off');return !!enabled;}
async function requestNotificationPermission(){
  if(!notificationSupported())return 'unsupported';
  try{return await Notification.requestPermission();}catch(e){return 'error';}
}
function notify(title,options){
  if(!notificationEnabled()||!notificationSupported()||Notification.permission!=='granted')return false;
  try{new Notification(title,options||{});return true;}catch(e){return false;}
}

function connectivity(){return navigator.onLine?'online':'offline';}
function onConnectivityChange(fn){
  const handler=()=>fn(connectivity());
  addEventListener('online',handler);addEventListener('offline',handler);
  return()=>{removeEventListener('online',handler);removeEventListener('offline',handler);};
}

async function registerServiceWorker(){
  if(!('serviceWorker' in navigator))return {ok:false,reason:'unsupported'};
  if(location.protocol!=='https:'&&location.hostname!=='localhost')return {ok:false,reason:'insecure-context'};
  try{const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});return {ok:true,registration};}
  catch(error){console.warn('BusinessFlow service worker registration failed',error);return {ok:false,reason:'registration-failed',error};}
}

function safeArea(){
  return {touch:matchMedia('(pointer:coarse)').matches,orientation:matchMedia('(orientation:portrait)').matches?'portrait':'landscape',width:innerWidth,height:innerHeight};
}

const api={
  environment:detectEnvironment(),
  deviceId:getDeviceId(),
  systemTimeZone:systemTimeZone(),
  roles:Object.freeze(Object.keys(ROLE_PERMISSIONS)),
  can,
  notifications:Object.freeze({supported:notificationSupported,enabled:notificationEnabled,setEnabled:setNotificationEnabled,requestPermission:requestNotificationPermission,send:notify}),
  connectivity,
  onConnectivityChange,
  registerServiceWorker,
  deviceProfile:safeArea
};

global.BusinessFlowPlatform=Object.freeze(api);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>registerServiceWorker());
else registerServiceWorker();
})(window);
