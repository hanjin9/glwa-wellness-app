import { useEffect, useState } from 'react';

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  cacheSize: number;
  updateAvailable: boolean;
}

export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: false,
    isRegistered: false,
    isOnline: navigator.onLine,
    cacheSize: 0,
    updateAvailable: false,
  });

  useEffect(() => {
    // Check if Service Worker is supported
    if (!('serviceWorker' in navigator)) {
      console.log('[useServiceWorker] Service Worker not supported');
      return;
    }

    setStatus((prev) => ({ ...prev, isSupported: true }));

    // Register Service Worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          '/service-worker.js',
          { scope: '/' }
        );

        console.log('[useServiceWorker] Service Worker registered:', registration);
        setStatus((prev) => ({ ...prev, isRegistered: true }));

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[useServiceWorker] New Service Worker available');
                setStatus((prev) => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });

        // Get initial cache size
        getCacheSize();
      } catch (error) {
        console.error('[useServiceWorker] Registration failed:', error);
      }
    };

    registerServiceWorker();

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('[useServiceWorker] Online');
      setStatus((prev) => ({ ...prev, isOnline: true }));
      // Trigger data synchronization
      syncOfflineData();
    };

    const handleOffline = () => {
      console.log('[useServiceWorker] Offline');
      setStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get cache size
  const getCacheSize = async () => {
    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) return;

    const channel = new MessageChannel();
    registration.active.postMessage(
      { type: 'GET_CACHE_SIZE' },
      [channel.port2]
    );

    channel.port1.onmessage = (event) => {
      const sizeInMB = (event.data.size / (1024 * 1024)).toFixed(2);
      console.log(`[useServiceWorker] Cache size: ${sizeInMB} MB`);
      setStatus((prev) => ({ ...prev, cacheSize: parseFloat(sizeInMB) }));
    };
  };

  // Clear cache
  const clearCache = async () => {
    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) return;

    const channel = new MessageChannel();
    registration.active.postMessage({ type: 'CLEAR_CACHE' }, [channel.port2]);

    return new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);
      channel.port1.onmessage = (event) => {
        clearTimeout(timeout);
        if (event.data.success) {
          console.log('[useServiceWorker] Cache cleared');
          setStatus((prev) => ({ ...prev, cacheSize: 0 }));
          resolve(true);
        }
      };
    });
  };

  // Update Service Worker
  const updateServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      console.log('[useServiceWorker] Service Worker update initiated');
      setStatus((prev) => ({ ...prev, updateAvailable: false }));
      // Reload page to activate new Service Worker
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return {
    status,
    getCacheSize,
    clearCache,
    updateServiceWorker,
  };
}

// Sync offline data when coming back online
async function syncOfflineData() {
  try {
    // Get pending mutations from IndexedDB
    const db = await openOfflineDB();
    const pendingMutations = await getPendingMutations(db);

    console.log('[useServiceWorker] Syncing pending mutations:', pendingMutations.length);

    // Send pending mutations to server
    for (const mutation of pendingMutations) {
      try {
        const response = await fetch(mutation.endpoint, {
          method: mutation.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mutation.data),
        });

      if (response.ok) {
        // Remove from pending mutations
        await removePendingMutation(db, mutation.id);
        console.log('[useServiceWorker] Mutation synced:', mutation.id);
      } else {
        console.warn('[useServiceWorker] Mutation sync failed with status:', response.status);
      }
    } catch (error) {
      console.error('[useServiceWorker] Failed to sync mutation:', mutation.id, error);
    }
    }
  } catch (error) {
    console.error('[useServiceWorker] Sync failed:', error);
  }
}

// IndexedDB operations
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('glwa-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!db.objectStoreNames.contains('pending-mutations')) {
        db.createObjectStore('pending-mutations', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('cached-data')) {
        db.createObjectStore('cached-data', { keyPath: 'key' });
      }
    };
  });
}

async function getPendingMutations(db: IDBDatabase): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-mutations'], 'readonly');
    const store = transaction.objectStore('pending-mutations');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removePendingMutation(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-mutations'], 'readwrite');
    const store = transaction.objectStore('pending-mutations');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function saveCachedData(key: string, data: any): Promise<void> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cached-data'], 'readwrite');
      const store = transaction.objectStore('cached-data');
      const request = store.put({ key, data, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('[saveCachedData] Failed:', error);
  }
}

export async function getCachedData(key: string): Promise<any> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cached-data'], 'readonly');
      const store = transaction.objectStore('cached-data');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.data);
    });
  } catch (error) {
    console.error('[getCachedData] Failed:', error);
    return null;
  }
}

export async function addPendingMutation(
  endpoint: string,
  method: string,
  data: any
): Promise<void> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending-mutations'], 'readwrite');
      const store = transaction.objectStore('pending-mutations');
      const request = store.add({
        id: `${Date.now()}-${Math.random()}`,
        endpoint,
        method,
        data,
        timestamp: Date.now(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('[addPendingMutation] Failed:', error);
  }
}
