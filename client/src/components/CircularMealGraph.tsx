/**
 * 아날로그 원형 그래프 - 식사시간
 * 시간 터치 → 자동 회수 입력 (아침/점심/저녁)
 */

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/glassmorphism-theme.css";

interface MealRecord {
  mealType: "breakfast" | "lunch" | "dinner" | null;
  hour: number;
  minute: number;
  timestamp: number;
}

export interface CircularMealGraphProps {
  onMealTimeChange?: (meals: MealRecord[]) => void;
  className?: string;
}

export const CircularMealGraph: React.FC<CircularMealGraphProps> = ({
  onMealTimeChange,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [meals, setMeals] = useState<MealRecord[]>([]);

  // 식사 타입 판단 (시간 기반)
  const getMealType = (hour: number): "breakfast" | "lunch" | "dinner" => {
    if (hour >= 6 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 16) return "lunch";
    return "dinner";
  };

  // 식사 타입 한글명
  const getMealTypeName = (type: "breakfast" | "lunch" | "dinner"): string => {
    const names = {
      breakfast: "아침",
      lunch: "점심",
      dinner: "저녁",
    };
    return names[type];
  };

  // 식사 타입 색상
  const getMealTypeColor = (
    type: "breakfast" | "lunch" | "dinner"
  ): { fill: string; stroke: string } => {
    const colors = {
      breakfast: { fill: "rgba(255, 200, 100, 0.3)", stroke: "rgba(255, 200, 100, 0.8)" },
      lunch: { fill: "rgba(100, 200, 255, 0.3)", stroke: "rgba(100, 200, 255, 0.8)" },
      dinner: { fill: "rgba(200, 100, 255, 0.3)", stroke: "rgba(200, 100, 255, 0.8)" },
    };
    return colors[type];
  };

  // 원형 그래프 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;

    // 배경 초기화
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 배경 원 (24시간)
    ctx.strokeStyle = "rgba(212, 175, 55, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 시간 마크 그리기
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
      const x1 = centerX + Math.cos(angle) * (radius - 10);
      const y1 = centerY + Math.sin(angle) * (radius - 10);
      const x2 = centerX + Math.cos(angle) * radius;
      const y2 = centerY + Math.sin(angle) * radius;

      ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // 시간 텍스트 (3시간마다)
      if (i % 3 === 0) {
        const textAngle = (i / 24) * Math.PI * 2 - Math.PI / 2;
        const textX = centerX + Math.cos(textAngle) * (radius + 25);
        const textY = centerY + Math.sin(textAngle) * (radius + 25);

        ctx.fillStyle = "rgba(212, 175, 55, 0.6)";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${i}h`, textX, textY);
      }
    }

    // 식사 시간대 배경 (권장 시간)
    // 아침: 6~11시
    const breakfastStart = (6 / 24) * Math.PI * 2 - Math.PI / 2;
    const breakfastEnd = (11 / 24) * Math.PI * 2 - Math.PI / 2;
    ctx.fillStyle = "rgba(255, 200, 100, 0.1)";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, breakfastStart, breakfastEnd);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // 점심: 11~16시
    const lunchStart = (11 / 24) * Math.PI * 2 - Math.PI / 2;
    const lunchEnd = (16 / 24) * Math.PI * 2 - Math.PI / 2;
    ctx.fillStyle = "rgba(100, 200, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, lunchStart, lunchEnd);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // 저녁: 16~23시
    const dinnerStart = (16 / 24) * Math.PI * 2 - Math.PI / 2;
    const dinnerEnd = (23 / 24) * Math.PI * 2 - Math.PI / 2;
    ctx.fillStyle = "rgba(200, 100, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, dinnerStart, dinnerEnd);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // 기록된 식사 마커 그리기
    meals.forEach((meal) => {
      if (!meal.mealType) return;

      const angle = (meal.hour / 24 + meal.minute / (24 * 60)) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const color = getMealTypeColor(meal.mealType);
      ctx.fillStyle = color.fill;
      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // 중앙 텍스트
    ctx.fillStyle = "rgba(212, 175, 55, 0.9)";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${meals.length}회`, centerX, centerY - 15);

    ctx.fillStyle = "rgba(212, 175, 55, 0.6)";
    ctx.font = "12px Arial";
    ctx.fillText("식사 기록", centerX, centerY + 15);
  }, [meals]);

  // 캔버스 클릭 처리
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
    const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
    const hour = Math.floor((normalizedAngle / (Math.PI * 2)) * 24);
    const minute = Math.floor(((normalizedAngle / (Math.PI * 2)) * 24 - hour) * 60);

    const mealType = getMealType(hour);
    const newMeal: MealRecord = {
      mealType,
      hour,
      minute,
      timestamp: Date.now(),
    };

    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);

    if (onMealTimeChange) {
      onMealTimeChange(updatedMeals);
    }
  };

  // 식사 기록 삭제
  const removeMeal = (index: number) => {
    const updatedMeals = meals.filter((_, i) => i !== index);
    setMeals(updatedMeals);

    if (onMealTimeChange) {
      onMealTimeChange(updatedMeals);
    }
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-lg font-bold text-gold">식사 시간 기록</h3>

        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onClick={handleCanvasClick}
          className="cursor-pointer"
          style={{
            filter: "drop-shadow(0 0 20px rgba(212, 175, 55, 0.2))",
          }}
        />

        <div className="w-full">
          <p className="text-sm text-gold-muted mb-3">시간을 터치하여 식사 기록</p>

          {meals.length > 0 ? (
            <div className="space-y-2">
              {meals.map((meal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-gold/20"
                >
                  <span className="text-sm text-gold">
                    {getMealTypeName(meal.mealType!)} {String(meal.hour).padStart(2, "0")}:
                    {String(meal.minute).padStart(2, "0")}
                  </span>
                  <motion.button
                    onClick={() => removeMeal(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gold-muted text-center py-4">
              아직 기록된 식사가 없습니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircularMealGraph;
