const CACHE = "tanya-sea-v19";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js",
  "./icon-192.png",
  "./icon-512.png"
];

// Installeer en cache assets
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

// Maak ou caches skoon
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Network-first vir index, cache-first vir res
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Net vir jou GitHub Pages scope
  if (url.origin !== location.origin) return;

  // Index: always try network first
  if (url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Ander files: cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
