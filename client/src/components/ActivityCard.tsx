import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp } from "lucide-react";

interface ActivityData {
  steps: number;
  distance: number;
  calories: number;
  target: number;
}

interface ActivityCardProps {
  data?: ActivityData;
  isLoading?: boolean;
}

export default function ActivityCard({
  data = {
    steps: 7234,
    distance: 5.2,
    calories: 342,
    target: 10000,
  },
  isLoading = false,
}: ActivityCardProps) {
  const [displaySteps, setDisplaySteps] = useState(0);
  const progress = (data.steps / data.target) * 100;

  // 애니메이션 카운트업
  useEffect(() => {
    let current = 0;
    const target = data.steps;
    const increment = target / 30;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplaySteps(target);
        clearInterval(interval);
      } else {
        setDisplaySteps(Math.floor(current));
      }
    }, 30);
    return () => clearInterval(interval);
  }, [data.steps]);

  // 원형 게이지 계산
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="border-2 border-[#d4af37]/50 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] overflow-hidden">
      <div className="p-4 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#d4af37]/60 uppercase tracking-widest font-light">
              Activity
            </p>
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4d03f]">
              오늘의 활동
            </h3>
          </div>
          <Activity className="w-5 h-5" style={{ color: "#d4af37" }} />
        </div>

        {/* 원형 게이지 */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* 배경 원 */}
            <svg
              className="absolute inset-0 w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(212, 175, 55, 0.1)"
                strokeWidth="3"
              />
            </svg>

            {/* 진행도 원 */}
            <motion.svg
              className="absolute inset-0 w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                animate={{
                  strokeDashoffset: circumference - (progress / 100) * circumference,
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient
                  id="goldGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#f4d03f" />
                </linearGradient>
              </defs>
            </motion.svg>

            {/* 중앙 텍스트 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p
                className="text-2xl font-bold"
                style={{ color: "#d4af37" }}
              >
                {Math.round(progress)}%
              </p>
              <p className="text-[10px] text-[#d4af37]/60">완료</p>
            </div>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#d4af37]/20">
          <div className="text-center">
            <p className="text-[10px] text-[#d4af37]/60">보행 수</p>
            <p
              className="text-sm font-bold"
              style={{ color: "#d4af37" }}
            >
              {displaySteps.toLocaleString()}
            </p>
            <p className="text-[8px] text-[#d4af37]/50">
              / {data.target.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[#d4af37]/60">거리</p>
            <p
              className="text-sm font-bold"
              style={{ color: "#d4af37" }}
            >
              {data.distance.toFixed(1)}km
            </p>
            <p className="text-[8px] text-[#d4af37]/50">이동 거리</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[#d4af37]/60">칼로리</p>
            <p
              className="text-sm font-bold"
              style={{ color: "#d4af37" }}
            >
              {data.calories}kcal
            </p>
            <p className="text-[8px] text-[#d4af37]/50">소모량</p>
          </div>
        </div>

        {/* 트렌드 */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#d4af37]/5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: "#22c55e" }} />
            <span className="text-[10px] text-[#d4af37]/70">
              어제보다 12% 증가
            </span>
          </div>
          <span className="text-xs font-bold text-[#22c55e]">+12%</span>
        </div>
      </div>
    </Card>
  );
}
