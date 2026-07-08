const CACHE_NAME = 'aios-v5.16'; // वर्ज़न चेंज ताकि पुराना कैशे क्लियर हो जाए
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
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // क्रिटिकल फिक्स: अगर रिक्वेस्ट http या https से शुरू नहीं होती (जैसे chrome-extension://), तो उसे इग्नोर करें
  if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) {
    return;
  }

  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/modules/') || url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

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