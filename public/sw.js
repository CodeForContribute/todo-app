const CACHE_VERSION = 'v2';
const STATIC_CACHE = `flowly-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `flowly-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `flowly-images-${CACHE_VERSION}`;

// Static assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/favicon.svg',
  '/manifest.json',
];

// Cache size limits
const DYNAMIC_CACHE_LIMIT = 50;
const IMAGE_CACHE_LIMIT = 30;

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('flowly-') &&
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE &&
              name !== IMAGE_CACHE;
          })
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    limitCacheSize(cacheName, maxItems);
  }
}

// Helper: Is static asset (JS, CSS, fonts)
function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|eot)(\?.*)?$/i.test(url.pathname);
}

// Helper: Is image
function isImage(url) {
  return /\.(png|jpg|jpeg|gif|svg|webp|ico)(\?.*)?$/i.test(url.pathname);
}

// Helper: Should skip caching
function shouldSkip(url) {
  return (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('firebaseio') ||
    url.protocol === 'chrome-extension:'
  );
}

// Fetch strategies
const strategies = {
  // Cache first, fallback to network (for static assets)
  cacheFirst: async (request, cacheName) => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response('Offline', { status: 503 });
    }
  },

  // Network first, fallback to cache (for HTML/API)
  networkFirst: async (request, cacheName) => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
        limitCacheSize(cacheName, DYNAMIC_CACHE_LIMIT);
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;

      // Return index for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('/');
      }
      return new Response('Offline', { status: 503 });
    }
  },

  // Stale while revalidate (best for frequently updated assets)
  staleWhileRevalidate: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        limitCacheSize(cacheName, DYNAMIC_CACHE_LIMIT);
      }
      return response;
    }).catch(() => cached);

    return cached || fetchPromise;
  },
};

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip external/API requests
  if (shouldSkip(url)) return;

  // Choose strategy based on request type
  if (isStaticAsset(url)) {
    // Cache first for JS/CSS/fonts
    event.respondWith(strategies.cacheFirst(request, STATIC_CACHE));
  } else if (isImage(url)) {
    // Cache first for images with separate cache
    event.respondWith(strategies.cacheFirst(request, IMAGE_CACHE));
    limitCacheSize(IMAGE_CACHE, IMAGE_CACHE_LIMIT);
  } else if (request.mode === 'navigate') {
    // Network first for navigation (HTML pages)
    event.respondWith(strategies.networkFirst(request, DYNAMIC_CACHE));
  } else {
    // Stale while revalidate for everything else
    event.respondWith(strategies.staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
