import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Zap } from "lucide-react";

interface MissionProgress {
  completed: number;
  total: number;
  currentMission: string;
  points: number;
}

interface LockScreenWidgetProps {
  missionProgress?: MissionProgress;
  isLiveActivitySupported?: boolean;
}

/**
 * iOS Live Activities & Android Widget 통합 컴포넌트
 * 
 * iOS: ActivityKit 기반 Live Activities
 * Android: RemoteViews 기반 Widget
 * 
 * 사용자 허락 하에 잠금 화면에서 미션 진행률 실시간 표시
 */
export default function LockScreenWidget({
  missionProgress = {
    completed: 3,
    total: 5,
    currentMission: "오전 운동",
    points: 150,
  },
  isLiveActivitySupported = false,
}: LockScreenWidgetProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // iOS Live Activities 권한 요청
  const requestiOSLiveActivityPermission = async () => {
    try {
      // iOS 16.1+ 필요
      if ("ActivityKit" in window) {
        // @ts-ignore
        const response = await window.ActivityKit?.requestPermission?.();
        setHasPermission(response === "granted");
      }
    } catch (error) {
      console.error("iOS Live Activity 권한 요청 실패:", error);
    }
  };

  // Android Widget 권한 요청
  const requestAndroidWidgetPermission = async () => {
    try {
      // Android 12+ 필요
      if ("android" in window) {
        // @ts-ignore
        const response = await window.android?.requestWidgetPermission?.();
        setHasPermission(response === "granted");
      }
    } catch (error) {
      console.error("Android Widget 권한 요청 실패:", error);
    }
  };

  // 권한 요청
  const requestPermission = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      await requestiOSLiveActivityPermission();
    } else {
      await requestAndroidWidgetPermission();
    }
  };

  // Live Activity 시작
  const startLiveActivity = async () => {
    try {
      if (!hasPermission) {
        await requestPermission();
        return;
      }

      // iOS Live Activities 시작
      if ("ActivityKit" in window) {
        // @ts-ignore
        await window.ActivityKit?.startActivity?.({
          attributes: {
            missionTitle: missionProgress.currentMission,
            totalMissions: missionProgress.total,
          },
          contentState: {
            completedMissions: missionProgress.completed,
            earnedPoints: missionProgress.points,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Android Widget 업데이트
      if ("android" in window) {
        // @ts-ignore
        await window.android?.updateWidget?.({
          title: "GLWA 미션",
          progress: (missionProgress.completed / missionProgress.total) * 100,
          mission: missionProgress.currentMission,
          points: missionProgress.points,
        });
      }

      setIsActive(true);
    } catch (error) {
      console.error("Live Activity 시작 실패:", error);
    }
  };

  // 컴포넌트 마운트 시 권한 확인
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS && "ActivityKit" in window) {
          // @ts-ignore
          const permission = await window.ActivityKit?.getPermission?.();
          setHasPermission(permission === "granted");
        }
      } catch (error) {
        console.error("권한 확인 실패:", error);
      }
    };

    checkPermission();
  }, []);

  const progress = (missionProgress.completed / missionProgress.total) * 100;

  return (
    <div className="space-y-4">
      {/* 라이브 위젯 프리뷰 */}
      <motion.div
        className="rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#d4af37]/30 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* iOS 스타일 */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#d4af37]/60 uppercase">미션 진행</p>
              <h3 className="text-sm font-bold text-[#d4af37]">
                {missionProgress.currentMission}
              </h3>
            </div>
            <Zap className="w-5 h-5" style={{ color: "#d4af37" }} />
          </div>

          {/* 진행률 바 */}
          <div className="space-y-2">
            <div className="w-full h-2 rounded-full bg-[#d4af37]/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[#d4af37]/60">
              <span>{missionProgress.completed}/{missionProgress.total} 완료</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* 포인트 */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#d4af37]/5">
            <CheckCircle className="w-4 h-4" style={{ color: "#22c55e" }} />
            <span className="text-[10px] text-[#d4af37]">
              +{missionProgress.points} 포인트 획득
            </span>
          </div>
        </div>
      </motion.div>

      {/* 라이브 위젯 활성화 버튼 */}
      <motion.button
        onClick={startLiveActivity}
        className="w-full h-10 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#0a0a0a] font-bold text-sm hover:shadow-lg transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isActive ? "✓ 잠금 화면 위젯 활성화 중" : "잠금 화면에 미션 표시"}
      </motion.button>

      {/* 정보 텍스트 */}
      <p className="text-[9px] text-[#d4af37]/50 text-center">
        {hasPermission
          ? "사용자 허락 완료 - 잠금 화면에서 미션 진행 상황을 실시간으로 확인하세요"
          : "iOS 16.1+ 또는 Android 12+ 필요"}
      </p>
    </div>
  );
}
