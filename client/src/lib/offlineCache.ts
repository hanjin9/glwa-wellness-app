/**
 * Offline Cache Utilities
 * Manages caching strategies for offline support
 */

export interface CacheConfig {
  cacheName: string;
  maxAge?: number; // in milliseconds
  maxSize?: number; // in bytes
}

export interface CachedResponse {
  data: any;
  timestamp: number;
  etag?: string;
}

/**
 * Network First Strategy
 * Try network first, fallback to cache if offline
 */
export async function networkFirstFetch<T>(
  url: string,
  options?: RequestInit & { cacheName?: string; maxAge?: number }
): Promise<T | null> {
  const cacheName = options?.cacheName || 'glwa-api-cache';
  const maxAge = options?.maxAge || 5 * 60 * 1000; // 5 minutes default

  try {
    // Try network first
    const response = await fetch(url, {
      ...options,
      method: options?.method || 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Cache successful response
    if ('caches' in window) {
      try {
        const cache = await caches.open(cacheName);
        const cacheData: CachedResponse = {
          data,
          timestamp: Date.now(),
          etag: response.headers.get('etag') || undefined,
        };
        await cache.put(
          url,
          new Response(JSON.stringify(cacheData), {
            headers: { 'Content-Type': 'application/json' },
          })
        );
      } catch (error) {
        console.warn('[networkFirstFetch] Failed to cache response:', error);
      }
    }

    return data;
  } catch (error) {
    console.log('[networkFirstFetch] Network failed, trying cache:', url);

    // Fallback to cache
    if ('caches' in window) {
      try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(url);

        if (cachedResponse) {
          const cachedData: CachedResponse = await cachedResponse.json();

          // Check if cache is still valid
          if (Date.now() - cachedData.timestamp < maxAge) {
            console.log('[networkFirstFetch] Using cached data:', url);
            return cachedData.data;
          }
        }
      } catch (error) {
        console.error('[networkFirstFetch] Cache retrieval failed:', error);
      }
    }

    return null;
  }
}

/**
 * Cache First Strategy
 * Use cache first, fallback to network
 */
export async function cacheFirstFetch<T>(
  url: string,
  options?: RequestInit & { cacheName?: string; maxAge?: number }
): Promise<T | null> {
  const cacheName = options?.cacheName || 'glwa-static-cache';
  const maxAge = options?.maxAge || 24 * 60 * 60 * 1000; // 24 hours default

  // Try cache first
  if ('caches' in window) {
    try {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        const cachedData: CachedResponse = await cachedResponse.json();

        // Check if cache is still valid
        if (Date.now() - cachedData.timestamp < maxAge) {
          console.log('[cacheFirstFetch] Using cached data:', url);
          return cachedData.data;
        }
      }
    } catch (error) {
      console.warn('[cacheFirstFetch] Cache retrieval failed:', error);
    }
  }

  try {
    // Try network
    const response = await fetch(url, {
      ...options,
      method: options?.method || 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Update cache
    if ('caches' in window) {
      try {
        const cache = await caches.open(cacheName);
        const cacheData: CachedResponse = {
          data,
          timestamp: Date.now(),
          etag: response.headers.get('etag') || undefined,
        };
        await cache.put(
          url,
          new Response(JSON.stringify(cacheData), {
            headers: { 'Content-Type': 'application/json' },
          })
        );
      } catch (error) {
        console.warn('[cacheFirstFetch] Failed to cache response:', error);
      }
    }

    return data;
  } catch (error) {
    console.error('[cacheFirstFetch] Network failed:', error);
    return null;
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cache immediately, update in background
 */
export async function staleWhileRevalidateFetch<T>(
  url: string,
  options?: RequestInit & { cacheName?: string; maxAge?: number }
): Promise<T | null> {
  const cacheName = options?.cacheName || 'glwa-dynamic-cache';
  const maxAge = options?.maxAge || 10 * 60 * 1000; // 10 minutes default

  let cachedData: T | null = null;

  // Try cache first
  if ('caches' in window) {
    try {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        const cached: CachedResponse = await cachedResponse.json();
        cachedData = cached.data;
        console.log('[staleWhileRevalidateFetch] Using cached data:', url);
      }
    } catch (error) {
      console.warn('[staleWhileRevalidateFetch] Cache retrieval failed:', error);
    }
  }

  // Update cache in background
  fetch(url, {
    ...options,
    method: options?.method || 'GET',
  })
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json();

        if ('caches' in window) {
          try {
            const cache = await caches.open(cacheName);
            const cacheData: CachedResponse = {
              data,
              timestamp: Date.now(),
              etag: response.headers.get('etag') || undefined,
            };
            await cache.put(
              url,
              new Response(JSON.stringify(cacheData), {
                headers: { 'Content-Type': 'application/json' },
              })
            );
            console.log('[staleWhileRevalidateFetch] Cache updated:', url);
          } catch (error) {
            console.warn('[staleWhileRevalidateFetch] Failed to cache response:', error);
          }
        }
      }
    })
    .catch((error) => {
      console.warn('[staleWhileRevalidateFetch] Background fetch failed:', error);
    });

  return cachedData;
}

/**
 * Clear cache by name
 */
export async function clearCache(cacheName: string): Promise<void> {
  if ('caches' in window) {
    try {
      await caches.delete(cacheName);
      console.log('[clearCache] Cache cleared:', cacheName);
    } catch (error) {
      console.error('[clearCache] Failed to clear cache:', error);
    }
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log('[clearAllCaches] All caches cleared');
    } catch (error) {
      console.error('[clearAllCaches] Failed to clear caches:', error);
    }
  }
}

/**
 * Get cache size
 */
export async function getCacheSize(cacheName?: string): Promise<number> {
  if (!('caches' in window)) return 0;

  try {
    const cacheNames = cacheName ? [cacheName] : await caches.keys();
    let totalSize = 0;

    for (const name of cacheNames) {
      const cache = await caches.open(name);
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
  } catch (error) {
    console.error('[getCacheSize] Failed to calculate cache size:', error);
    return 0;
  }
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
