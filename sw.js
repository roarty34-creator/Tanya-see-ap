const CACHE="deepsea-v44";

self.addEventListener("install",e=>{
self.skipWaiting();
});

self.addEventListener("fetch",event=>{
event.respondWith(
caches.match(event.request)
.then(r=>r||fetch(event.request))
);
});
