/**
 * Service Worker for Blog Optimization
 * Implements caching strategies for static assets and dynamic content
 * Provides offline functionality and performance improvements
 */

const CACHE_VERSION = 'blog-cache-v1.3.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const OFFLINE_CACHE = `${CACHE_VERSION}-offline`;

// Cache configuration
const CACHE_CONFIG = {
  // Static assets - cache first strategy
  staticAssets: [
    '/style.css',
    '/assets/css/animations.css',
    '/assets/css/custom.css',
    '/js/performance-utils.js',
    '/js/css-optimizer.js',
    '/js/security-utils.js',
    '/js/modern-enhancements.js',
    '/js/theme-switcher.js',
    '/js/search-enhancements.js',
    '/assets/fonts/JetBrainsMono-2.304/webfonts/JetBrainsMono-Regular.woff2',
    '/assets/fonts/JetBrainsMono-2.304/webfonts/JetBrainsMono-Bold.woff2',
    '/images/404.jpg',
    '/images/blog.jpg'
  ],
  
  // Dynamic content patterns - network first strategy
  dynamicPatterns: [
    /\/page\d+\//,
    /\/tags\//,
    /\/archive\//,
    /\/.+\/$/ // Blog posts
  ],
  
  // Cache duration settings (in milliseconds)
  maxAge: {
    static: 7 * 24 * 60 * 60 * 1000, // 7 days
    dynamic: 24 * 60 * 60 * 1000,     // 1 day
    images: 30 * 24 * 60 * 60 * 1000  // 30 days
  },
  
  // Maximum cache sizes
  maxEntries: {
    static: 50,
    dynamic: 100,
    images: 200
  }
};

// Offline fallback pages
const OFFLINE_FALLBACKS = {
  document: '/offline.html',
  image: '/images/offline-image.svg',
  font: null
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      cacheStaticAssets(),
      createOfflineFallbacks()
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      // Force activation of new service worker
      return self.skipWaiting();
    }).catch(error => {
      console.error('Service Worker: Installation failed', error);
    })
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Activation complete');
    }).catch(error => {
      console.error('Service Worker: Activation failed', error);
    })
  );
});

/**
 * Fetch Event Handler - Main caching logic
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests (except for fonts and images)
  if (!url.origin.includes(self.location.origin) && 
      !isAllowedExternalResource(url)) {
    return;
  }
  
  // Route to appropriate caching strategy
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isDynamicContent(request)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isImage(request)) {
    event.respondWith(cacheFirstWithFallback(request, 'image'));
  } else if (isDocument(request)) {
    event.respondWith(networkFirstWithFallback(request, 'document'));
  } else {
    // Default to network first for other requests
    event.respondWith(networkFirstStrategy(request));
  }
});

/**
 * Cache static assets during installation
 */
async function cacheStaticAssets() {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const assetsToCache = CACHE_CONFIG.staticAssets.map(asset => {
      // Add version parameter to prevent stale cache
      const url = new URL(asset, self.location.origin);
      url.searchParams.set('v', CACHE_VERSION);
      return url.toString();
    });
    
    await cache.addAll(assetsToCache);
    console.log('Service Worker: Static assets cached');
  } catch (error) {
    console.error('Service Worker: Failed to cache static assets', error);
  }
}

/**
 * Create offline fallback content
 */
async function createOfflineFallbacks() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    
    // Create offline page content
    const offlinePageContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>离线模式 - zempty 笔记</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            text-align: center; 
            padding: 50px; 
            background: #f8f9fa;
            color: #333;
          }
          .offline-container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .offline-icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #2c3e50; margin-bottom: 20px; }
          p { line-height: 1.6; margin-bottom: 20px; }
          .retry-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          .retry-btn:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">📱</div>
          <h1>您当前处于离线状态</h1>
          <p>看起来您的网络连接出现了问题。不过别担心，我们已经为您缓存了一些内容。</p>
          <p>请检查您的网络连接，然后点击下面的按钮重试。</p>
          <button class="retry-btn" onclick="window.location.reload()">重新加载</button>
        </div>
        <script>
          // Auto-retry when online
          window.addEventListener('online', () => {
            window.location.reload();
          });
        </script>
      </body>
      </html>
    `;
    
    const offlineResponse = new Response(offlinePageContent, {
      headers: { 'Content-Type': 'text/html' }
    });
    
    await cache.put('/offline.html', offlineResponse);
    console.log('Service Worker: Offline fallbacks created');
  } catch (error) {
    console.error('Service Worker: Failed to create offline fallbacks', error);
  }
}

/**
 * Cache-first strategy for static assets
 */
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still fresh
      if (isCacheFresh(cachedResponse, CACHE_CONFIG.maxAge.static)) {
        return cachedResponse;
      }
    }
    
    // Fetch from network and update cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Service Worker: Cache-first strategy failed', error);
    
    // Return cached version even if stale
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Network-first strategy for dynamic content
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
      
      // Cleanup old entries
      await cleanupCache(DYNAMIC_CACHE, CACHE_CONFIG.maxEntries.dynamic);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Service Worker: Network request failed, trying cache', error);
    
    // Fallback to cache
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Cache-first strategy with offline fallback
 */
async function cacheFirstWithFallback(request, fallbackType) {
  try {
    return await cacheFirstStrategy(request);
  } catch (error) {
    console.warn('Service Worker: Cache-first with fallback failed', error);
    
    // Return offline fallback
    const fallbackUrl = OFFLINE_FALLBACKS[fallbackType];
    if (fallbackUrl) {
      const cache = await caches.open(OFFLINE_CACHE);
      const fallbackResponse = await cache.match(fallbackUrl);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    throw error;
  }
}

/**
 * Network-first strategy with offline fallback
 */
async function networkFirstWithFallback(request, fallbackType) {
  try {
    return await networkFirstStrategy(request);
  } catch (error) {
    console.warn('Service Worker: Network-first with fallback failed', error);
    
    // Return offline fallback
    const fallbackUrl = OFFLINE_FALLBACKS[fallbackType];
    if (fallbackUrl) {
      const cache = await caches.open(OFFLINE_CACHE);
      const fallbackResponse = await cache.match(fallbackUrl);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    throw error;
  }
}

/**
 * Clean up old caches
 */
async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      name.startsWith('blog-cache-') && !name.includes(CACHE_VERSION)
    );
    
    await Promise.all(
      oldCaches.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('Service Worker: Old caches cleaned up', oldCaches);
  } catch (error) {
    console.error('Service Worker: Failed to cleanup old caches', error);
  }
}

/**
 * Clean up cache entries to maintain size limits
 */
async function cleanupCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxEntries) {
      // Remove oldest entries (FIFO)
      const entriesToDelete = keys.slice(0, keys.length - maxEntries);
      await Promise.all(
        entriesToDelete.map(key => cache.delete(key))
      );
    }
  } catch (error) {
    console.error('Service Worker: Failed to cleanup cache', error);
  }
}

/**
 * Check if cached response is still fresh
 */
function isCacheFresh(response, maxAge) {
  const cachedDate = response.headers.get('date');
  if (!cachedDate) return false;
  
  const cacheTime = new Date(cachedDate).getTime();
  const now = Date.now();
  
  return (now - cacheTime) < maxAge;
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return CACHE_CONFIG.staticAssets.some(asset => 
    pathname === asset || pathname.startsWith(asset)
  ) || 
  pathname.match(/\.(css|js|woff2?|ttf|eot)$/i);
}

/**
 * Check if request is for dynamic content
 */
function isDynamicContent(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return CACHE_CONFIG.dynamicPatterns.some(pattern => 
    pattern.test(pathname)
  );
}

/**
 * Check if request is for an image
 */
function isImage(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i);
}

/**
 * Check if request is for a document
 */
function isDocument(request) {
  const acceptHeader = request.headers.get('accept');
  return acceptHeader && acceptHeader.includes('text/html');
}

/**
 * Check if external resource is allowed to be cached
 */
function isAllowedExternalResource(url) {
  const allowedDomains = [
    'cdn.jsdelivr.net',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ];
  
  return allowedDomains.some(domain => url.hostname.includes(domain));
}

/**
 * Handle messages from main thread
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * Handle background sync for offline actions
 */
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

/**
 * Handle background sync operations
 */
async function handleBackgroundSync() {
  try {
    // Implement background sync logic here
    // For example: sync analytics data, form submissions, etc.
    console.log('Service Worker: Background sync completed');
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

/**
 * Handle push notifications (if needed in the future)
 */
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/images/blog.jpg',
      badge: '/images/blog.jpg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log('Service Worker: Script loaded successfully');