import React, { useEffect, useState } from 'react';
import { useOffline } from '@/contexts/OfflineContext';
import { formatBytes } from '@/lib/offlineCache';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, HardDrive } from 'lucide-react';

export function OfflineCacheSettings() {
  const { isSupported, cacheSize, clearCache, isOnline } = useOffline();
  const [isClearing, setIsClearing] = useState(false);
  const [displaySize, setDisplaySize] = useState('0 Bytes');

  useEffect(() => {
    setDisplaySize(formatBytes(cacheSize * 1024 * 1024)); // Convert MB to bytes
  }, [cacheSize]);

  const handleClearCache = async () => {
    if (!confirm('캐시를 삭제하시겠습니까? 오프라인 데이터가 모두 삭제됩니다.')) {
      return;
    }

    setIsClearing(true);
    try {
      const success = await clearCache();
      if (success) {
        alert('캐시가 삭제되었습니다.');
      } else {
        alert('캐시 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('[OfflineCacheSettings] Clear cache failed:', error);
      alert('캐시 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsClearing(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          이 브라우저는 오프라인 모드를 지원하지 않습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cache Status */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">캐시 저장소</p>
              <p className="text-xs text-blue-700 mt-1">
                현재 사용 중: <span className="font-semibold">{displaySize}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-700">
              {isOnline ? (
                <span className="text-green-600 font-medium">● 온라인</span>
              ) : (
                <span className="text-red-600 font-medium">● 오프라인</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Cache Information */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">캐시된 데이터</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✓ 대시보드 건강 데이터</li>
          <li>✓ 미션 목록 (기간별)</li>
          <li>✓ 사용자 프로필</li>
          <li>✓ 건강 기록</li>
          <li>✓ 정적 자산 (CSS, JS, 이미지)</li>
        </ul>
      </div>

      {/* Offline Support Info */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-sm font-medium text-green-900 mb-2">오프라인 모드 지원</h3>
        <p className="text-xs text-green-700 mb-3">
          인터넷 연결이 없어도 다음 기능을 사용할 수 있습니다:
        </p>
        <ul className="text-xs text-green-700 space-y-1">
          <li>• 대시보드 조회 (마지막 저장된 데이터)</li>
          <li>• 미션 목록 조회</li>
          <li>• 프로필 정보 조회</li>
          <li>• 건강 기록 조회</li>
          <li>• 앱 기본 기능 사용</li>
        </ul>
      </div>

      {/* Clear Cache Button */}
      <Button
        onClick={handleClearCache}
        disabled={isClearing}
        variant="destructive"
        className="w-full"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {isClearing ? '캐시 삭제 중...' : '캐시 삭제'}
      </Button>

      {/* Auto-Sync Info */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-medium text-purple-900">자동 동기화</h3>
        </div>
        <p className="text-xs text-purple-700">
          온라인으로 복귀하면 오프라인 상태에서 변경한 데이터가 자동으로 서버에 동기화됩니다.
        </p>
      </div>
    </div>
  );
}
