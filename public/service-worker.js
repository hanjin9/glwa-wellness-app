// Service Worker for GLWA Wellness App - Offline Support
// This service worker handles caching, offline support, and data synchronization

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `glwa-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `glwa-dynamic-${CACHE_VERSION}`;
const API_CACHE = `glwa-api-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// API endpoints to cache with Network First strategy
const API_ENDPOINTS = [
  '/api/trpc/dashboard.getHealthData',
  '/api/trpc/missions.getByPeriod',
  '/api/trpc/profile.getProfile',
  '/api/trpc/music.getByGenre',
  '/api/trpc/music.getSongOfTheDay',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[Service Worker] Failed to cache some assets:', err);
          // Continue even if some assets fail to cache
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and non-http(s) requests
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // API requests - Network First strategy
  if (url.pathname.startsWith('/api/trpc/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - Cache First strategy
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/) ||
    url.pathname === '/' ||
    url.pathname === '/index.html'
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // HTML pages - Stale While Revalidate strategy
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirstStrategy(request));
});

// Network First strategy - try network, fallback to cache
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Network request failed, using cache:', request.url);
    
    // Try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response
    return createOfflineResponse(request);
  }
}

// Cache First strategy - use cache, fallback to network
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Cache and network failed:', request.url);
    return createOfflineResponse(request);
  }
}

// Stale While Revalidate strategy - return cache immediately, update in background
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then((c) => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => {
      console.log('[Service Worker] Background fetch failed:', request.url);
    });

  return cachedResponse || fetchPromise;
}

// Create offline response
function createOfflineResponse(request) {
  // Return a simple offline page for HTML requests
  if (request.headers.get('accept')?.includes('text/html')) {
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>오프라인 모드</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #8B6F47 0%, #5D4E37 100%);
            color: #fff;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          h1 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1rem;
            margin-bottom: 2rem;
            opacity: 0.9;
          }
          .status {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 0.5rem;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>오프라인 모드</h1>
          <p>인터넷 연결이 없습니다.</p>
          <p>캐시된 데이터를 사용하여 앱을 계속 사용할 수 있습니다.</p>
          <div class="status">연결 복구 대기 중...</div>
        </div>
      </body>
      </html>
      `,
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  // Return error response for API requests
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: '오프라인 상태입니다. 인터넷 연결을 확인해주세요.',
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      ).then(() => {
        event.ports[0].postMessage({ success: true });
      });
    });
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    calculateCacheSize().then((size) => {
      event.ports[0].postMessage({ size });
    });
  }
});

// Calculate total cache size
async function calculateCacheSize() {
  let totalSize = 0;

  const cacheNames = await caches.keys();
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}
