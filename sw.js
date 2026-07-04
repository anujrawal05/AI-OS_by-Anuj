const CACHE_NAME = 'aios-v5.12';
const ASSETS = [
  '/',
  '/index.html',
  '/aios_buisness.html',
  '/style.css',
  '/business.css',
  '/mobile.css',
  '/app.js',
  '/business.js',
  '/aios_logo.png',
  '/business_hero.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Exclude API requests and stateful operations from offline caching
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  // Network-first: always prefer the freshest JS/HTML from the server so
  // deployed bugfixes reach clients immediately. Cache is only a fallback
  // for offline access, never a source of truth while the network is up.
  event.respondWith(
    fetch(event.request).then(networkResponse => {
      if (!networkResponse || networkResponse.status !== 200) {
        return networkResponse;
      }

      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, responseToCache);
      });
      return networkResponse;
    }).catch(() => {
      return caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
