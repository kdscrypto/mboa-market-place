
const CACHE_NAME = 'mboa-market-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const FONT_CACHE = 'fonts-v1';
const API_CACHE = 'api-v1';

// Cache versioning and management
const CACHE_VERSION = '2.0.0';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Assets to cache on install with priorities
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/placeholder.svg'
];

const PREFETCH_ASSETS = [
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/components/Header.tsx',
  '/src/components/Footer.tsx'
];

// Advanced cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log(`Service Worker ${CACHE_VERSION} installing...`);
  
  event.waitUntil(
    Promise.all([
      // Cache critical assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      // Prefetch non-critical assets
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('Prefetching assets');
        return Promise.allSettled(
          PREFETCH_ASSETS.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(() => {
              // Ignore prefetch failures
            })
          )
        );
      })
    ]).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`Service Worker ${CACHE_VERSION} activating...`);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes('v2') && !cacheName.includes('v1')) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Clear expired cache entries
      clearExpiredCacheEntries()
    ]).then(() => {
      return self.clients.claim();
    })
  );
});

// Advanced fetch handler with multiple strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external domains (except allowed CDNs)
  if (url.origin !== self.location.origin && !isAllowedExternalDomain(url.hostname)) {
    return;
  }

  // Route to appropriate strategy
  if (request.destination === 'font') {
    event.respondWith(handleFontRequest(request));
  } else if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request, CACHE_STRATEGIES.CACHE_FIRST));
  } else if (url.pathname.includes('/api/')) {
    event.respondWith(handleApiRequest(request, CACHE_STRATEGIES.NETWORK_FIRST));
  } else if (isCriticalResource(url.pathname)) {
    event.respondWith(handleStaticRequest(request, CACHE_STRATEGIES.CACHE_FIRST));
  } else {
    event.respondWith(handleStaticRequest(request, CACHE_STRATEGIES.STALE_WHILE_REVALIDATE));
  }
});

// Font handling with dedicated cache
function handleFontRequest(request) {
  return caches.open(FONT_CACHE)
    .then((cache) => {
      return cache.match(request)
        .then((response) => {
          if (response && !isExpired(response)) {
            return response;
          }
          
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                // Add cache headers for fonts
                const responseClone = networkResponse.clone();
                const headers = new Headers(responseClone.headers);
                headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year
                
                const cachedResponse = new Response(responseClone.body, {
                  status: responseClone.status,
                  statusText: responseClone.statusText,
                  headers: headers
                });
                
                cache.put(request, cachedResponse.clone());
                return cachedResponse;
              }
              return networkResponse;
            })
            .catch(() => {
              // Return cached version even if expired as fallback
              return response || new Response('Font not available', { status: 404 });
            });
        });
    });
}

// Enhanced image handling with compression hints
function handleImageRequest(request, strategy = CACHE_STRATEGIES.CACHE_FIRST) {
  return caches.open(DYNAMIC_CACHE)
    .then((cache) => {
      if (strategy === CACHE_STRATEGIES.CACHE_FIRST) {
        return cache.match(request)
          .then((response) => {
            if (response && !isExpired(response)) {
              return response;
            }
            
            return fetchAndCacheImage(request, cache);
          });
      }
      
      // Network first for fresh images
      return fetchAndCacheImage(request, cache)
        .catch(() => cache.match(request));
    });
}

// Enhanced API handling with smart caching
function handleApiRequest(request, strategy = CACHE_STRATEGIES.NETWORK_FIRST) {
  const url = new URL(request.url);
  const isCacheable = isCacheableApiRequest(url.pathname);
  
  if (!isCacheable) {
    return fetch(request);
  }
  
  return caches.open(API_CACHE)
    .then((cache) => {
      if (strategy === CACHE_STRATEGIES.NETWORK_FIRST) {
        return fetch(request)
          .then((response) => {
            if (response.ok && request.method === 'GET') {
              // Add timestamp for API cache management
              const responseClone = response.clone();
              const headers = new Headers(responseClone.headers);
              headers.set('sw-cached-at', Date.now().toString());
              
              const cachedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
              });
              
              cache.put(request, cachedResponse.clone());
              return cachedResponse;
            }
            return response;
          })
          .catch(() => {
            // Fallback to cache
            return cache.match(request);
          });
      }
      
      return cache.match(request)
        .then((response) => {
          if (response && !isApiCacheExpired(response)) {
            return response;
          }
          return fetch(request);
        });
    });
}

// Enhanced static resource handling
function handleStaticRequest(request, strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE) {
  return caches.open(STATIC_CACHE)
    .then((cache) => {
      if (strategy === CACHE_STRATEGIES.STALE_WHILE_REVALIDATE) {
        const cachedResponse = cache.match(request);
        const fetchResponse = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        
        return cachedResponse.then((response) => {
          return response || fetchResponse;
        });
      }
      
      return cache.match(request)
        .then((response) => {
          if (response) return response;
          return fetch(request);
        });
    });
}

// Utility functions
function isAllowedExternalDomain(hostname) {
  const allowedDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
    'unpkg.com'
  ];
  return allowedDomains.some(domain => hostname.includes(domain));
}

function isCriticalResource(pathname) {
  const criticalPaths = ['/', '/src/main.tsx', '/src/App.tsx'];
  return criticalPaths.includes(pathname);
}

function isCacheableApiRequest(pathname) {
  const cacheablePatterns = ['/api/ads', '/api/categories', '/api/regions'];
  return cacheablePatterns.some(pattern => pathname.includes(pattern));
}

function isExpired(response) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;
  
  const age = Date.now() - parseInt(cachedAt);
  return age > MAX_CACHE_AGE;
}

function isApiCacheExpired(response) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;
  
  const age = Date.now() - parseInt(cachedAt);
  return age > (5 * 60 * 1000); // 5 minutes for API cache
}

function fetchAndCacheImage(request, cache) {
  return fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        const headers = new Headers(responseClone.headers);
        headers.set('sw-cached-at', Date.now().toString());
        
        const cachedResponse = new Response(responseClone.body, {
          status: responseClone.status,
          statusText: responseClone.statusText,
          headers: headers
        });
        
        cache.put(request, cachedResponse.clone());
        return cachedResponse;
      }
      return networkResponse;
    })
    .catch(() => {
      return caches.match('/placeholder.svg');
    });
}

function clearExpiredCacheEntries() {
  return caches.keys()
    .then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.open(cacheName)
            .then((cache) => {
              return cache.keys()
                .then((requests) => {
                  return Promise.all(
                    requests.map((request) => {
                      return cache.match(request)
                        .then((response) => {
                          if (response && isExpired(response)) {
                            return cache.delete(request);
                          }
                        });
                    })
                  );
                });
            });
        })
      );
    });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(handleBackgroundSync());
  }
});

function handleBackgroundSync() {
  // Handle offline actions when connection is restored
  return Promise.resolve();
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    getCacheInfo().then((info) => {
      event.ports[0].postMessage(info);
    });
  }
});

function getCacheInfo() {
  return caches.keys()
    .then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.open(cacheName)
            .then((cache) => {
              return cache.keys()
                .then((requests) => ({
                  name: cacheName,
                  size: requests.length
                }));
            });
        })
      );
    });
}
