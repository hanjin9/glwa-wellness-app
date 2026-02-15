/**
 * Offline Database (IndexedDB)
 * Manages local data storage for offline support
 */

const DB_NAME = 'glwa-offline-db';
const DB_VERSION = 1;

export interface OfflineStore {
  name: string;
  keyPath: string;
  indexes?: Array<{ name: string; keyPath: string; unique?: boolean }>;
}

export interface StoredData<T> {
  id: string;
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export interface PendingMutation {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data: any;
  timestamp: number;
  retries: number;
}

// Define object stores
const STORES: OfflineStore[] = [
  {
    name: 'dashboard-data',
    keyPath: 'id',
    indexes: [{ name: 'timestamp', keyPath: 'timestamp' }],
  },
  {
    name: 'missions',
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId' },
      { name: 'period', keyPath: 'period' },
    ],
  },
  {
    name: 'profiles',
    keyPath: 'id',
    indexes: [{ name: 'userId', keyPath: 'userId' }],
  },
  {
    name: 'health-records',
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId' },
      { name: 'date', keyPath: 'date' },
    ],
  },
  {
    name: 'pending-mutations',
    keyPath: 'id',
    indexes: [
      { name: 'timestamp', keyPath: 'timestamp' },
      { name: 'endpoint', keyPath: 'endpoint' },
    ],
  },
  {
    name: 'sync-metadata',
    keyPath: 'key',
  },
];

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize offline database
 */
export async function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[initOfflineDB] Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('[initOfflineDB] Database initialized');
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      STORES.forEach((store) => {
        if (!db.objectStoreNames.contains(store.name)) {
          const objectStore = db.createObjectStore(store.name, {
            keyPath: store.keyPath,
          });

          // Create indexes
          if (store.indexes) {
            store.indexes.forEach((index) => {
              objectStore.createIndex(index.name, index.keyPath, {
                unique: index.unique || false,
              });
            });
          }

          console.log('[initOfflineDB] Created object store:', store.name);
        }
      });
    };
  });
}

/**
 * Save data to offline store
 */
export async function saveOfflineData<T>(
  storeName: string,
  id: string,
  data: T,
  expiresAt?: number
): Promise<void> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    const storedData: StoredData<T> = {
      id,
      data,
      timestamp: Date.now(),
      expiresAt,
    };

    const request = store.put(storedData);

    request.onerror = () => {
      console.error('[saveOfflineData] Failed to save data:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[saveOfflineData] Data saved:', storeName, id);
      resolve();
    };
  });
}

/**
 * Get data from offline store
 */
export async function getOfflineData<T>(
  storeName: string,
  id: string
): Promise<T | null> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onerror = () => {
      console.error('[getOfflineData] Failed to get data:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const result = request.result as StoredData<T> | undefined;

      if (!result) {
        resolve(null);
        return;
      }

      // Check if data is expired
      if (result.expiresAt && Date.now() > result.expiresAt) {
        console.log('[getOfflineData] Data expired:', storeName, id);
        deleteOfflineData(storeName, id);
        resolve(null);
        return;
      }

      console.log('[getOfflineData] Data retrieved:', storeName, id);
      resolve(result.data);
    };
  });
}

/**
 * Query data from offline store
 */
export async function queryOfflineData<T>(
  storeName: string,
  indexName?: string,
  query?: IDBValidKey | IDBKeyRange
): Promise<T[]> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    let request: IDBRequest;

    if (indexName && query) {
      const index = store.index(indexName);
      request = index.getAll(query);
    } else {
      request = store.getAll();
    }

    request.onerror = () => {
      console.error('[queryOfflineData] Failed to query data:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const results = request.result as StoredData<T>[];
      const data = results
        .filter((result) => {
          // Filter out expired data
          if (result.expiresAt && Date.now() > result.expiresAt) {
            deleteOfflineData(storeName, result.id);
            return false;
          }
          return true;
        })
        .map((result) => result.data);

      console.log('[queryOfflineData] Data queried:', storeName, data.length);
      resolve(data);
    };
  });
}

/**
 * Delete data from offline store
 */
export async function deleteOfflineData(
  storeName: string,
  id: string
): Promise<void> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => {
      console.error('[deleteOfflineData] Failed to delete data:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[deleteOfflineData] Data deleted:', storeName, id);
      resolve();
    };
  });
}

/**
 * Clear entire store
 */
export async function clearOfflineStore(storeName: string): Promise<void> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => {
      console.error('[clearOfflineStore] Failed to clear store:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[clearOfflineStore] Store cleared:', storeName);
      resolve();
    };
  });
}

/**
 * Add pending mutation
 */
export async function addPendingMutation(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  data: any
): Promise<string> {
  const db = await initOfflineDB();
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-mutations'], 'readwrite');
    const store = transaction.objectStore('pending-mutations');

    const mutation: PendingMutation = {
      id,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    const request = store.add(mutation);

    request.onerror = () => {
      console.error('[addPendingMutation] Failed to add mutation:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[addPendingMutation] Mutation added:', id);
      resolve(id);
    };
  });
}

/**
 * Get pending mutations
 */
export async function getPendingMutations(): Promise<PendingMutation[]> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-mutations'], 'readonly');
    const store = transaction.objectStore('pending-mutations');
    const request = store.getAll();

    request.onerror = () => {
      console.error('[getPendingMutations] Failed to get mutations:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const mutations = request.result as PendingMutation[];
      console.log('[getPendingMutations] Mutations retrieved:', mutations.length);
      resolve(mutations);
    };
  });
}

/**
 * Remove pending mutation
 */
export async function removePendingMutation(id: string): Promise<void> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-mutations'], 'readwrite');
    const store = transaction.objectStore('pending-mutations');
    const request = store.delete(id);

    request.onerror = () => {
      console.error('[removePendingMutation] Failed to remove mutation:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[removePendingMutation] Mutation removed:', id);
      resolve();
    };
  });
}

/**
 * Update mutation retry count
 */
export async function updateMutationRetries(id: string, retries: number): Promise<void> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-mutations'], 'readwrite');
    const store = transaction.objectStore('pending-mutations');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const mutation = getRequest.result as PendingMutation;
      mutation.retries = retries;

      const updateRequest = store.put(mutation);

      updateRequest.onerror = () => {
        console.error('[updateMutationRetries] Failed to update mutation:', updateRequest.error);
        reject(updateRequest.error);
      };

      updateRequest.onsuccess = () => {
        console.log('[updateMutationRetries] Mutation updated:', id, retries);
        resolve();
      };
    };
  });
}

/**
 * Get sync metadata
 */
export async function getSyncMetadata(key: string): Promise<any> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sync-metadata'], 'readonly');
    const store = transaction.objectStore('sync-metadata');
    const request = store.get(key);

    request.onerror = () => {
      console.error('[getSyncMetadata] Failed to get metadata:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const result = request.result as StoredData<any> | undefined;
      resolve(result?.data || null);
    };
  });
}

/**
 * Set sync metadata
 */
export async function setSyncMetadata(key: string, data: any): Promise<void> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sync-metadata'], 'readwrite');
    const store = transaction.objectStore('sync-metadata');

    const storedData: StoredData<any> = {
      id: key,
      data,
      timestamp: Date.now(),
    };

    const request = store.put(storedData);

    request.onerror = () => {
      console.error('[setSyncMetadata] Failed to set metadata:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[setSyncMetadata] Metadata set:', key);
      resolve();
    };
  });
}

/**
 * Get database size
 */
export async function getOfflineDBSize(): Promise<number> {
  const db = await initOfflineDB();
  let totalSize = 0;

  for (const store of STORES) {
    try {
      const transaction = db.transaction([store.name], 'readonly');
      const objectStore = transaction.objectStore(store.name);
      const request = objectStore.getAll();

      await new Promise<void>((resolve) => {
        request.onsuccess = () => {
          const items = request.result as StoredData<any>[];
          items.forEach((item) => {
            totalSize += JSON.stringify(item).length;
          });
          resolve();
        };
      });
    } catch (error) {
      console.warn('[getOfflineDBSize] Failed to calculate size for store:', store.name);
    }
  }

  return totalSize;
}

/**
 * Clear entire database
 */
export async function clearOfflineDB(): Promise<void> {
  const db = await initOfflineDB();

  for (const store of STORES) {
    try {
      await clearOfflineStore(store.name);
    } catch (error) {
      console.error('[clearOfflineDB] Failed to clear store:', store.name);
    }
  }

  console.log('[clearOfflineDB] Database cleared');
}
