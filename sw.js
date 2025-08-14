
const CACHE_NAME = 'fl-standards-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Offline-first for our app shell
  if (ASSETS.some(a => url.pathname.endsWith(a.replace('./','/')))) {
    event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
    return;
  }
  // Network with cache fallback for everything else
  event.respondWith(
    fetch(event.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return resp;
    }).catch(() => caches.match(event.request))
  );
});
