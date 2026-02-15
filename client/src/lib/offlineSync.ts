/**
 * Offline Data Synchronization
 * Handles syncing pending mutations when coming back online
 */

import {
  getPendingMutations,
  removePendingMutation,
  updateMutationRetries,
  type PendingMutation,
} from '@/lib/offlineDB';

export interface SyncResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{ id: string; error: string }>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Sync all pending mutations
 */
export async function syncPendingMutations(): Promise<SyncResult> {
  console.log('[offlineSync] Starting sync...');

  const mutations = await getPendingMutations();
  const result: SyncResult = {
    success: 0,
    failed: 0,
    total: mutations.length,
    errors: [],
  };

  if (mutations.length === 0) {
    console.log('[offlineSync] No pending mutations to sync');
    return result;
  }

  console.log(`[offlineSync] Found ${mutations.length} pending mutations`);

  // Sync mutations sequentially to maintain order
  for (const mutation of mutations) {
    try {
      const success = await syncMutation(mutation);

      if (success) {
        result.success++;
        await removePendingMutation(mutation.id);
        console.log('[offlineSync] Mutation synced:', mutation.id);
      } else {
        result.failed++;
        result.errors.push({
          id: mutation.id,
          error: 'Sync failed',
        });
        console.warn('[offlineSync] Mutation sync failed:', mutation.id);
      }
    } catch (error) {
      result.failed++;
      result.errors.push({
        id: mutation.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('[offlineSync] Error syncing mutation:', mutation.id, error);
    }
  }

  console.log('[offlineSync] Sync complete:', result);
  return result;
}

/**
 * Sync a single mutation with retry logic
 */
async function syncMutation(mutation: PendingMutation): Promise<boolean> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(mutation.endpoint, {
        method: mutation.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mutation.data),
      });

      if (response.ok) {
        console.log(`[offlineSync] Mutation synced on attempt ${attempt + 1}:`, mutation.id);
        return true;
      }

      if (response.status === 401 || response.status === 403) {
        // Authentication error - don't retry
        throw new Error(`Authentication error: ${response.status}`);
      }

      if (response.status >= 500) {
        // Server error - retry
        lastError = new Error(`Server error: ${response.status}`);
      } else {
        // Client error - don't retry
        throw new Error(`Client error: ${response.status}`);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < MAX_RETRIES) {
        // Wait before retrying
        await delay(RETRY_DELAY * (attempt + 1));
        console.log(
          `[offlineSync] Retrying mutation ${attempt + 1}/${MAX_RETRIES}:`,
          mutation.id
        );
      }
    }
  }

  // Update retry count
  await updateMutationRetries(mutation.id, MAX_RETRIES);

  console.error('[offlineSync] Mutation sync failed after retries:', mutation.id, lastError);
  return false;
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if sync is needed
 */
export async function isSyncNeeded(): Promise<boolean> {
  const mutations = await getPendingMutations();
  return mutations.length > 0;
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  pending: number;
  syncing: boolean;
  lastSyncTime?: number;
}> {
  const mutations = await getPendingMutations();
  return {
    pending: mutations.length,
    syncing: false,
    lastSyncTime: undefined,
  };
}
