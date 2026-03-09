const CACHE_NAME="tanya-deep-sea-v75"

const FILES=[

"./",
"./index.html",
"./style.css",
"./app.js",
"./spots.js",
"./manifest.webmanifest"

]

self.addEventListener("install",e=>{

e.waitUntil(

caches.open(CACHE_NAME)

.then(c=>c.addAll(FILES))

)

})

self.addEventListener("fetch",e=>{

e.respondWith(

caches.match(e.request)

.then(r=>r||fetch(e.request))

)

})
