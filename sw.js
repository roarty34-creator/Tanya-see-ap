const CACHE_NAME = "tanya-deep-sea-v108-clean";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",

  "./fish-cape-cob.png",
  "./fish-yellowtail.png",
  "./fish-bonito.png",
  "./fish-red-roman.png",
  "./fish-snapper.png",
  "./fish-silverfish.png",
  "./fish-red-steenbras.png",
  "./fish-yellow-belly.png",
  "./fish-hottentot.png",
  "./fish-geelbek.png",
  "./fish-carpenter.png",
  "./fish-dageraad.png",
  "./fish-santer.png",
  "./fish-elf-shad.png",
  "./fish-miss-lucy.png",

  "./rig-cape-cob.png",
  "./rig-yellowtail.png",
  "./rig-red-roman.png",
  "./rig-snapper.png",
  "./rig-silverfish.png",
  "./rig-red-steenbras.png",
  "./rig-yellow-belly.png",
  "./rig-hottentot.png",
  "./rig-carpenter.png",
  "./rig-dageraad.png",
  "./rig-santer.png",
  "./rig-elf-shad.png",
  "./rig-miss-lucy.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
