import React, { createContext, useContext, useEffect, useState } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { syncPendingMutations, isSyncNeeded } from '@/lib/offlineSync';

export interface OfflineContextType {
  isOnline: boolean;
  isSupported: boolean;
  cacheSize: number;
  updateAvailable: boolean;
  clearCache: () => Promise<boolean>;
  updateServiceWorker: () => Promise<void>;
  syncData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { status, clearCache, updateServiceWorker } = useServiceWorker();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync data when coming online
  useEffect(() => {
    if (status.isOnline && !isSyncing) {
      syncData();
    }
  }, [status.isOnline]);

  const syncData = async () => {
    // Check if sync is needed
    const needsSync = await isSyncNeeded();
    if (!needsSync) {
      console.log('[OfflineContext] No pending mutations to sync');
      return;
    }

    setIsSyncing(true);
    try {
      console.log('[OfflineContext] Syncing pending mutations...');
      const result = await syncPendingMutations();
      console.log('[OfflineContext] Sync complete:', result);

      if (result.success > 0) {
        // Show success notification
        console.log(
          `[OfflineContext] ${result.success} mutations synced successfully`
        );
      }

      if (result.failed > 0) {
        // Show error notification
        console.warn(
          `[OfflineContext] ${result.failed} mutations failed to sync`
        );
      }
    } catch (error) {
      console.error('[OfflineContext] Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const value: OfflineContextType = {
    isOnline: status.isOnline,
    isSupported: status.isSupported,
    cacheSize: status.cacheSize,
    updateAvailable: status.updateAvailable,
    clearCache: async () => {
      const result = await clearCache();
      return result ?? false;
    },
    updateServiceWorker,
    syncData,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}
