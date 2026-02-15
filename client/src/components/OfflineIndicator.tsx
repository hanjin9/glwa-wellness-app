import React, { useEffect, useState } from 'react';
import { useOffline } from '@/contexts/OfflineContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function OfflineIndicator() {
  const { isOnline, updateAvailable, updateServiceWorker } = useOffline();
  const [showBanner, setShowBanner] = useState(!isOnline);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setShowBanner(!isOnline);
  }, [isOnline]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateServiceWorker();
    } catch (error) {
      console.error('[OfflineIndicator] Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isOnline && !updateAvailable) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">오프라인 상태입니다. 캐시된 데이터를 사용하고 있습니다.</span>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-white hover:text-red-100 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-blue-500 text-white px-4 py-3 rounded-lg flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            <span className="text-sm font-medium">새로운 버전이 있습니다.</span>
          </div>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {isUpdating ? '업데이트 중...' : '업데이트'}
          </button>
        </div>
      )}

      {/* Online Indicator */}
      {isOnline && !updateAvailable && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 px-3 py-2 rounded-full border border-green-200">
          <Wifi className="w-4 h-4" />
          <span>온라인</span>
        </div>
      )}
    </>
  );
}
