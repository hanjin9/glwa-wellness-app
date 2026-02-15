import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initOfflineDB,
  saveOfflineData,
  getOfflineData,
  deleteOfflineData,
  clearOfflineStore,
  addPendingMutation,
  getPendingMutations,
  removePendingMutation,
  clearOfflineDB,
} from './offlineDB';

describe('Offline Database', () => {
  beforeEach(async () => {
    // Clear database before each test
    try {
      await clearOfflineDB();
    } catch (error) {
      console.warn('Failed to clear database:', error);
    }
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      await clearOfflineDB();
    } catch (error) {
      console.warn('Failed to cleanup:', error);
    }
  });

  describe('Data Storage', () => {
    it('should save and retrieve data', async () => {
      const testData = { id: 1, name: 'Test', value: 123 };
      await saveOfflineData('dashboard-data', 'test-1', testData);

      const retrieved = await getOfflineData('dashboard-data', 'test-1');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent data', async () => {
      const retrieved = await getOfflineData('dashboard-data', 'non-existent');
      expect(retrieved).toBeNull();
    });

    it('should delete data', async () => {
      const testData = { id: 1, name: 'Test' };
      await saveOfflineData('dashboard-data', 'test-1', testData);

      await deleteOfflineData('dashboard-data', 'test-1');
      const retrieved = await getOfflineData('dashboard-data', 'test-1');
      expect(retrieved).toBeNull();
    });

    it('should clear entire store', async () => {
      await saveOfflineData('dashboard-data', 'test-1', { id: 1 });
      await saveOfflineData('dashboard-data', 'test-2', { id: 2 });

      await clearOfflineStore('dashboard-data');

      const data1 = await getOfflineData('dashboard-data', 'test-1');
      const data2 = await getOfflineData('dashboard-data', 'test-2');

      expect(data1).toBeNull();
      expect(data2).toBeNull();
    });

    it('should handle expiration', async () => {
      const testData = { id: 1, name: 'Test' };
      const expiresAt = Date.now() - 1000; // Already expired

      await saveOfflineData('dashboard-data', 'test-1', testData, expiresAt);
      const retrieved = await getOfflineData('dashboard-data', 'test-1');

      expect(retrieved).toBeNull();
    });
  });

  describe('Pending Mutations', () => {
    it('should add pending mutation', async () => {
      const id = await addPendingMutation(
        '/api/test',
        'POST',
        { data: 'test' }
      );

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should retrieve pending mutations', async () => {
      await addPendingMutation('/api/test-1', 'POST', { data: 'test1' });
      await addPendingMutation('/api/test-2', 'PUT', { data: 'test2' });

      const mutations = await getPendingMutations();

      expect(mutations.length).toBe(2);
      expect(mutations[0].endpoint).toBe('/api/test-1');
      expect(mutations[1].endpoint).toBe('/api/test-2');
    });

    it('should remove pending mutation', async () => {
      const id = await addPendingMutation(
        '/api/test',
        'POST',
        { data: 'test' }
      );

      await removePendingMutation(id);
      const mutations = await getPendingMutations();

      expect(mutations.length).toBe(0);
    });

    it('should handle multiple mutations', async () => {
      const ids = [];
      for (let i = 0; i < 5; i++) {
        const id = await addPendingMutation(
          `/api/test-${i}`,
          'POST',
          { data: `test${i}` }
        );
        ids.push(id);
      }

      const mutations = await getPendingMutations();
      expect(mutations.length).toBe(5);

      // Remove one
      await removePendingMutation(ids[0]);
      const updated = await getPendingMutations();
      expect(updated.length).toBe(4);
    });
  });

  describe('Database Initialization', () => {
    it('should initialize database', async () => {
      const db = await initOfflineDB();
      expect(db).toBeDefined();
      expect(db.name).toBe('glwa-offline-db');
    });

    it('should handle multiple initializations', async () => {
      const db1 = await initOfflineDB();
      const db2 = await initOfflineDB();

      expect(db1).toBe(db2); // Should return same instance
    });
  });
});
