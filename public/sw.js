// B'feastas Offline-First Service Worker (v2.0)
const CACHE_NAME = 'bfeastas-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/compay logo.jpeg',
  '/images/jollof_rice.png',
  '/images/fried_rice.png',
  '/images/fried_chicken.png',
  '/images/peppered_beef.png',
  '/images/egusi_soup.png',
  '/images/amala_ewedu.png',
  '/images/fried_plantain.png',
  '/images/coke.png',
  '/images/pepsi.png',
  '/images/zobo_drink.png',
  '/images/viju_milk.png',
  '/images/sosa_orange.png',
  '/images/shawarma.png',
  '/images/toasted_sandwich.png',
  '/images/eggs_sausages.png'
];

// 1. INSTALL: Pre-cache static shell assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache core shell; ignore individual asset errors so install doesn't fail
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn('PWA Pre-cache skipped:', url, err))
        )
      );
    })
  );
});

// 2. ACTIVATE: Clean up older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Stale-While-Revalidate / Cache-First with Offline Fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') {
    return;
  }

  // Handle API calls: Network-First with Cache Fallback for read requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes.ok && (url.pathname === '/api/dishes' || url.pathname === '/api/settings' || url.pathname.startsWith('/api/orders'))) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ offline: true, message: 'Offline mode active' }), {
              status: 503,
              statusText: 'Service Unavailable (Offline)',
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // For HTML navigations & Static Assets (JS, CSS, Images):
  // Cache-First with Background Revalidation
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached immediately; update cache in background
        fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache it
      return fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && req.url.startsWith(self.location.origin)) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          // If network failed and user is requesting an HTML page, return cached index.html
          if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
        });
    })
  );
});

// 4. NOTIFICATIONS: Push event handlers
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
