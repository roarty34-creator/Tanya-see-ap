const CACHE="tanya-v36"

self.addEventListener("install",e=>{
self.skipWaiting()
})

self.addEventListener("fetch",e=>{
e.respondWith(fetch(e.request))
})
