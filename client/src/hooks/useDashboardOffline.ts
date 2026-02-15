import { useEffect, useState } from 'react';
import { useOffline } from '@/contexts/OfflineContext';
import {
  saveOfflineData,
  getOfflineData,
  queryOfflineData,
} from '@/lib/offlineDB';
import { networkFirstFetch } from '@/lib/offlineCache';

export interface DashboardData {
  healthData: any;
  recentRecords: any[];
  statistics: any;
}

/**
 * Hook for dashboard offline support
 * Caches dashboard data and provides offline access
 */
export function useDashboardOffline() {
  const { isOnline } = useOffline();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [isOnline]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Try to fetch from network
        const healthData = await networkFirstFetch('/api/trpc/dashboard.getHealthData', {
          cacheName: 'dashboard-cache',
          maxAge: 5 * 60 * 1000, // 5 minutes
        });

        if (healthData) {
          // Save to offline storage
          await saveOfflineData('dashboard-data', 'health-data', healthData);

          setData({
            healthData: healthData as any,
            recentRecords: (healthData as any)?.recentRecords || [],
            statistics: (healthData as any)?.statistics || {},
          });
          setIsFromCache(false);
        } else {
          throw new Error('Failed to fetch dashboard data');
        }
      } else {
        // Load from offline storage
        const cachedData = await getOfflineData('dashboard-data', 'health-data');

        if (cachedData) {
          setData({
            healthData: cachedData as any,
            recentRecords: (cachedData as any)?.recentRecords || [],
            statistics: (cachedData as any)?.statistics || {},
          });
          setIsFromCache(true);
        } else {
          setError('오프라인 상태이며 저장된 데이터가 없습니다.');
        }
      }
    } catch (err) {
      console.error('[useDashboardOffline] Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Try to load from cache as fallback
      try {
        const cachedData = await getOfflineData('dashboard-data', 'health-data');
        if (cachedData) {
          setData({
            healthData: cachedData as any,
            recentRecords: (cachedData as any)?.recentRecords || [],
            statistics: (cachedData as any)?.statistics || {},
          });
          setIsFromCache(true);
          setError(null);
        }
      } catch (fallbackErr) {
        console.error('[useDashboardOffline] Fallback failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refresh: loadDashboardData,
  };
}

/**
 * Hook for missions offline support
 */
export function useMissionsOffline(period?: string) {
  const { isOnline } = useOffline();
  const [missions, setMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    loadMissions();
  }, [isOnline, period]);

  const loadMissions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Try to fetch from network
        const url = period
          ? `/api/trpc/missions.getByPeriod?period=${period}`
          : '/api/trpc/missions.getAll';

        const data = await networkFirstFetch(url, {
          cacheName: 'missions-cache',
          maxAge: 5 * 60 * 1000, // 5 minutes
        });

        if (data) {
          const missionsList = Array.isArray(data) ? data : (data as any)?.missions || [];
          await saveOfflineData('missions', `missions-${period || 'all'}`, missionsList);
          setMissions(missionsList as any[]);
          setIsFromCache(false);
        } else {
          throw new Error('Failed to fetch missions');
        }
      } else {
        // Load from offline storage
        const cachedMissions = await getOfflineData(
          'missions',
          `missions-${period || 'all'}`
        );

        if (cachedMissions) {
          setMissions(cachedMissions as any[]);
          setIsFromCache(true);
        } else {
          setError('오프라인 상태이며 저장된 미션이 없습니다.');
        }
      }
    } catch (err) {
      console.error('[useMissionsOffline] Error loading missions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Try to load from cache as fallback
      try {
        const cachedMissions = await getOfflineData(
          'missions',
          `missions-${period || 'all'}`
        );
        if (cachedMissions) {
          setMissions(cachedMissions as any[]);
          setIsFromCache(true);
          setError(null);
        }
      } catch (fallbackErr) {
        console.error('[useMissionsOffline] Fallback failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    missions,
    isLoading,
    error,
    isFromCache,
    refresh: loadMissions,
  };
}

/**
 * Hook for profile offline support
 */
export function useProfileOffline() {
  const { isOnline } = useOffline();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [isOnline]);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Try to fetch from network
        const data = await networkFirstFetch('/api/trpc/profile.getProfile', {
          cacheName: 'profile-cache',
          maxAge: 10 * 60 * 1000, // 10 minutes
        });

        if (data) {
          await saveOfflineData('profiles', 'user-profile', data);
          setProfile(data as any);
          setIsFromCache(false);
        } else {
          throw new Error('Failed to fetch profile');
        }
      } else {
        // Load from offline storage
        const cachedProfile = await getOfflineData('profiles', 'user-profile');

        if (cachedProfile) {
          setProfile(cachedProfile as any);
          setIsFromCache(true);
        } else {
          setError('오프라인 상태이며 저장된 프로필이 없습니다.');
        }
      }
    } catch (err) {
      console.error('[useProfileOffline] Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Try to load from cache as fallback
      try {
        const cachedProfile = await getOfflineData('profiles', 'user-profile');
        if (cachedProfile) {
          setProfile(cachedProfile as any);
          setIsFromCache(true);
          setError(null);
        }
      } catch (fallbackErr) {
        console.error('[useProfileOffline] Fallback failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    isFromCache,
    refresh: loadProfile,
  };
}
