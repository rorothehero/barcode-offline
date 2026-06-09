const CACHE = 'barcode-v';
const CACHE_NAME = CACHE + Date.now();
const urlsToCache = [
  '/barcode-offline/',
  '/barcode-offline/index.html',
  '/barcode-offline/scan.html',
  '/barcode-offline/style.css',
  '/barcode-offline/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((res) => {
        if (res) return res;
        const url = new URL(event.request.url);
        if (url.search) {
          url.search = '';
          return caches.match(url.toString());
        }
      })
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((names) =>
        Promise.all(names.filter((n) => !n.startsWith(CACHE)).map((n) => caches.delete(n)))
      )
    ])
  );
});
