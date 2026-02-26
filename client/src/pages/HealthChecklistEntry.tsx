/**
 * 🏥 건강 체크리스트 진입 화면
 * 
 * HUD 스캔 애니메이션 + 종합 건강 진단
 * - 1~2초 강력한 임팩트
 * - AI 정밀 분석 시각화
 * - 데이터 오버레이 동기화
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MedicalHUDSystem, HUDScanAnimation } from "@/components/MedicalHUDSystem";
import { ChevronDown, Zap } from "lucide-react";

interface HealthChecklistEntryProps {
  onComplete?: () => void;
}

export function HealthChecklistEntry({ onComplete }: HealthChecklistEntryProps) {
  const [scanComplete, setScanComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [healthData, setHealthData] = useState<any[]>([]);

  // 건강 데이터 (임시 더미 데이터)
  const userHealthData = {
    stressLevel: -2,
    heartRate: 72,
    respiratoryRate: 16,
    bloodPressureSystolic: 120,
    bloodSugar: 95,
    exerciseMinutes: 45,
  };

  // 스캔 완료 시 데이터 매핑
  useEffect(() => {
    if (scanComplete) {
      const mappedData = [
        {
          bodyPart: "brain",
          value: userHealthData.stressLevel ? 100 - Math.abs(userHealthData.stressLevel * 10) : 75,
          unit: "%",
          status: userHealthData.stressLevel > 5 ? "critical" : "good",
          label: "스트레스 수준",
        },
        {
          bodyPart: "heart",
          value: userHealthData.heartRate || 72,
          unit: "bpm",
          status: userHealthData.heartRate > 100 ? "warning" : "good",
          label: "심박수",
        },
        {
          bodyPart: "lungs",
          value: userHealthData.respiratoryRate || 16,
          unit: "회/분",
          status: "good",
          label: "호흡수",
        },
        {
          bodyPart: "liver",
          value: userHealthData.bloodPressureSystolic || 120,
          unit: "mmHg",
          status: userHealthData.bloodPressureSystolic > 140 ? "critical" : "good",
          label: "혈압(수축기)",
        },
        {
          bodyPart: "stomach",
          value: userHealthData.bloodSugar || 95,
          unit: "mg/dL",
          status: userHealthData.bloodSugar > 126 ? "warning" : "good",
          label: "혈당",
        },
        {
          bodyPart: "muscles",
          value: userHealthData.exerciseMinutes || 0,
          unit: "분",
          status: userHealthData.exerciseMinutes > 30 ? "excellent" : "warning",
          label: "운동량",
        },
      ];
      setHealthData(mappedData);
      setShowResults(true);
    }
  }, [scanComplete]);

  const handleScanComplete = () => {
    setScanComplete(true);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <AnimatePresence mode="wait">
        {!scanComplete ? (
          // 스캔 애니메이션 단계
          <motion.div
            key="scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-screen"
          >
            <HUDScanAnimation
              onScanComplete={handleScanComplete}
              duration={2}
            />
          </motion.div>
        ) : (
          // 결과 표시 단계
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen p-6"
          >
            {/* 헤더 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">
                🏥 종합 건강 진단
              </h1>
              <p className="text-gray-400">
                AI 정밀 분석 완료 - 당신의 건강 상태를 확인하세요
              </p>
            </motion.div>

            {/* HUD 시스템 */}
            {showResults && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-black/50 border border-blue-500/30 rounded-2xl p-6 mb-8 min-h-96"
              >
                <MedicalHUDSystem
                  healthData={healthData}
                  isScanning={false}
                  language="ko"
                />
              </motion.div>
            )}

            {/* 종합 평가 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-6 mb-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">⭐</div>
                <div>
                  <h2 className="text-xl font-bold text-yellow-400">
                    종합 건강 점수
                  </h2>
                  <p className="text-gray-400">AI 분석 기반</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">전체 점수</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {Math.round(
                      healthData.reduce((sum, d) => sum + d.value, 0) /
                        healthData.length
                    )}
                    /100
                  </p>
                </div>

                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">평가</p>
                  <p className="text-2xl font-bold text-green-400">우수</p>
                </div>
              </div>
            </motion.div>

            {/* 상세 데이터 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 mb-8"
            >
              <h3 className="text-lg font-bold text-white mb-4">
                📊 상세 분석
              </h3>

              {healthData.map((data, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.05 }}
                  className="bg-gray-900/50 border border-blue-500/20 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-blue-300">
                      {data.label}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{
                        backgroundColor:
                          data.status === "excellent"
                            ? "rgba(34, 197, 94, 0.8)"
                            : data.status === "good"
                              ? "rgba(59, 130, 246, 0.8)"
                              : data.status === "warning"
                                ? "rgba(251, 146, 60, 0.8)"
                                : "rgba(239, 68, 68, 0.8)",
                      }}
                    >
                      {data.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-lg font-bold text-yellow-400 mb-2">
                    {data.value} {data.unit}
                  </div>

                  {/* 프로그레스 바 */}
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(data.value, 100)}%` }}
                      transition={{ duration: 1, delay: 0.6 + idx * 0.05 }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          data.status === "excellent"
                            ? "linear-gradient(90deg, rgba(34, 197, 94, 0.8), rgba(34, 197, 94, 1))"
                            : data.status === "good"
                              ? "linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 1))"
                              : data.status === "warning"
                                ? "linear-gradient(90deg, rgba(251, 146, 60, 0.8), rgba(251, 146, 60, 1))"
                                : "linear-gradient(90deg, rgba(239, 68, 68, 0.8), rgba(239, 68, 68, 1))",
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* 액션 버튼 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-4"
            >
              <button
                onClick={onComplete}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                건강 개선 미션 시작
              </button>

              <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-lg transition-all">
                상세 리포트 다운로드
              </button>
            </motion.div>

            {/* 스크롤 힌트 */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center mt-8 text-gray-500"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
