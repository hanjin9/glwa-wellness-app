/**
 * 🎬 첨단 메디컬 HUD 시스템
 * 
 * Envato 'HUD Medical Body' 기술력 하이재킹
 * - 인체 스캔 애니메이션 (1~2초)
 * - 신체 부위별 데이터 오버레이
 * - 다국어 텍스트 동기화
 * - 럭셔리 블랙 & 골드 테마
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";

interface HealthDataPoint {
  bodyPart: string;
  value: number;
  unit: string;
  status: "excellent" | "good" | "warning" | "critical";
  label: string;
}

interface MedicalHUDProps {
  healthData?: HealthDataPoint[];
  isScanning?: boolean;
  language?: string;
}

// HUD 신체 부위 맵핑
const BODY_PARTS_MAP = {
  brain: { x: "50%", y: "8%", label: "뇌" },
  heart: { x: "50%", y: "25%", label: "심장" },
  lungs: { x: "50%", y: "28%", label: "폐" },
  liver: { x: "45%", y: "40%", label: "간" },
  stomach: { x: "50%", y: "45%", label: "위" },
  kidneys: { x: "50%", y: "50%", label: "신장" },
  bones: { x: "50%", y: "60%", label: "뼈" },
  muscles: { x: "50%", y: "65%", label: "근육" },
};

// 상태별 색상
const STATUS_COLORS = {
  excellent: "rgba(34, 197, 94, 0.8)", // 초록색
  good: "rgba(59, 130, 246, 0.8)", // 파란색
  warning: "rgba(251, 146, 60, 0.8)", // 주황색
  critical: "rgba(239, 68, 68, 0.8)", // 빨간색
};

export function MedicalHUDSystem({
  healthData = [],
  isScanning = false,
  language = "ko",
}: MedicalHUDProps) {
  const [displayData, setDisplayData] = useState<HealthDataPoint[]>(healthData);
  const [scanProgress, setScanProgress] = useState(0);

  // 스캔 애니메이션
  useEffect(() => {
    if (!isScanning) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        setScanProgress(100);
        clearInterval(interval);
      } else {
        setScanProgress(progress);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isScanning]);

  // 데이터 업데이트
  useEffect(() => {
    setDisplayData(healthData);
  }, [healthData]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl overflow-hidden">
      {/* HUD 배경 그리드 */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        {/* 인체 스캔 영역 */}
        <div className="relative w-full max-w-md aspect-square">
          {/* 외부 원형 테두리 */}
          <motion.div
            animate={isScanning ? { rotate: 360 } : {}}
            transition={isScanning ? { duration: 3, repeat: Infinity } : {}}
            className="absolute inset-0 rounded-full border-2 border-blue-500/30"
          />

          {/* 스캔 프로그레스 링 */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="rgba(59, 130, 246, 0.1)"
              strokeWidth="2"
            />
            <motion.circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="url(#scanGradient)"
              strokeWidth="3"
              strokeDasharray={`${(scanProgress / 100) * 597} 597`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient
                id="scanGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(59, 130, 246, 1)" />
                <stop offset="100%" stopColor="rgba(34, 197, 94, 1)" />
              </linearGradient>
            </defs>
          </svg>

          {/* 신체 부위 데이터 포인트 */}
          {displayData.map((point, idx) => {
            const bodyPart = BODY_PARTS_MAP[point.bodyPart as keyof typeof BODY_PARTS_MAP];
            if (!bodyPart) return null;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="absolute"
                style={{
                  left: bodyPart.x,
                  top: bodyPart.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* 데이터 포인트 */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: STATUS_COLORS[point.status],
                    boxShadow: `0 0 20px ${STATUS_COLORS[point.status]}`,
                  }}
                />

                {/* 데이터 레이블 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 + 0.2 }}
                  className="absolute mt-2 bg-black/80 border border-blue-500/50 rounded px-2 py-1 whitespace-nowrap text-xs"
                  style={{ left: "-50%", top: "100%" }}
                >
                  <div className="text-yellow-400 font-bold">{bodyPart.label}</div>
                  <div className="text-blue-300">
                    {point.value} {point.unit}
                  </div>
                  <div className="text-gray-400 text-xs">{point.label}</div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* 중앙 AI 스캔 표시 */}
          <motion.div
            animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
            transition={isScanning ? { duration: 1.5, repeat: Infinity } : {}}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 mb-2">
                AI
              </div>
              <div className="text-xs text-blue-300">스캔 중...</div>
              {isScanning && (
                <div className="mt-2 text-xs text-yellow-400">
                  {Math.round(scanProgress)}%
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* 우측 데이터 패널 */}
        <div className="ml-8 space-y-4 max-w-xs">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">
            종합 건강 진단
          </h3>

          {displayData.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-900/50 border border-blue-500/30 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">{point.label}</span>
                <span
                  className="text-xs font-bold px-2 py-1 rounded"
                  style={{
                    backgroundColor: STATUS_COLORS[point.status],
                    color: "white",
                  }}
                >
                  {point.status.toUpperCase()}
                </span>
              </div>

              {/* 프로그레스 바 */}
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(point.value, 100)}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${STATUS_COLORS[point.status]}, rgba(34, 197, 94, 0.8))`,
                  }}
                />
              </div>

              <div className="mt-2 text-sm text-blue-300">
                {point.value} {point.unit}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 하단 스캔 상태 */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-4 right-4 bg-black/80 border border-blue-500/50 rounded-lg p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-300">정밀 AI 스캔 진행 중</span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-4 h-4 border-2 border-blue-500 border-t-yellow-400 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// HUD 스캔 애니메이션 래퍼
// ============================================================================

interface HUDScanWrapperProps {
  onScanComplete?: () => void;
  duration?: number;
}

export function HUDScanAnimation({ onScanComplete, duration = 2 }: HUDScanWrapperProps) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      onScanComplete?.();
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [duration, onScanComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
    >
      <MedicalHUDSystem
        healthData={[]}
        isScanning={!isComplete}
        language="ko"
      />
    </motion.div>
  );
}
