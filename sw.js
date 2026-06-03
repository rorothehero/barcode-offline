const CACHE_NAME = 'barcode-offline-v1';
const urlsToCache = [
  '/barcode-offline/',
  '/barcode-offline/index.html',
  '/barcode-offline/scan.html',
  '/barcode-offline/style.css',
  '/barcode-offline/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      // جرب بدون query string (مثل ?mode=scanner)
      const url = new URL(event.request.url);
      if (url.search) {
        url.search = '';
        return caches.match(url.toString()).then((res) => res || fetch(event.request));
      }
      return fetch(event.request);
    }).then((response) => {
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
      }
      return response;
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
