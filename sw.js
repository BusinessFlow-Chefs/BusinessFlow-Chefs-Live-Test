const CACHE='businessflow-shell-v11';
const SHELL=['./','./index.html','./bf-core.js','./bf-platform.js','./bf-theme.css','./bf-menu.js','./bf-menu-themes.js','./bf-menu-structure.js','./bf-recipes.js','./bf-recipes-courses.js','./bf-stock.js','./bf-sourcing.js','./charter.html','./guests.html','./menu-builder.html','./dish-details.html','./inventory.html','./provisioning.html','./journey.html','./sourcing.html','./suppliers.html','./service-sequence.html','./chef-mode.html','./style.css'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(()=>{}));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.pathname.includes('working-preview-')) {
    event.respondWith(fetch(event.request,{cache:'no-store'}));
    return;
  }
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});return response;}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
});