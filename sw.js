const CACHE_NAME = 'aios-v3.2.0'; // Bumped for premium navbar, popup and modal updates
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
  self.skipWaiting(); // Take over immediately, evicting old SW
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Claim all open tabs immediately
});

self.addEventListener('fetch', event => {
  // Exclude API requests, POST/PUT/DELETE operations from offline caching
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  // Exclude module files from caching — they must always be fresh
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/modules/') || url.pathname.endsWith('.js')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first: always prefer the freshest HTML/CSS from the server.
  // Cache is only a fallback for offline access, never a source of truth while network is up.
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
