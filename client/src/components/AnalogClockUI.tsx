/**
 * 🕐 아날로그 시계형 데이터 입력 UI
 * 
 * 수면 시간 및 식사 기록을 위한 직관적 터치 인터페이스
 * 추억의 생활계획표 감성 + 최첨단 럭셔리 버전
 */

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, UtensilsCrossed, Moon } from "lucide-react";

export interface AnalogClockUIProps {
  type: "sleep" | "meal";
  onTimeChange?: (startTime: number, endTime: number) => void;
  onMealLog?: (time: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MEAL_TIMES = [7, 12, 18]; // 아침, 점심, 저녁

export function AnalogClockUI({ type, onTimeChange, onMealLog }: AnalogClockUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startAngle, setStartAngle] = useState<number | null>(null);
  const [endAngle, setEndAngle] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"start" | "end">("start");
  const [mealTimes, setMealTimes] = useState<number[]>([]);

  const RADIUS = 150;
  const CENTER = { x: 200, y: 200 };

  // 각도를 시간으로 변환
  const angleToHour = (angle: number): number => {
    const hour = Math.round((angle / 360) * 24);
    return hour === 24 ? 0 : hour;
  };

  // 시간을 각도로 변환
  const hourToAngle = (hour: number): number => {
    return (hour / 24) * 360;
  };

  // 마우스 위치를 각도로 변환
  const getAngleFromMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER.x;
    const y = e.clientY - rect.top - CENTER.y;

    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    return angle;
  };

  // 캔버스 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 배경 초기화
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 원형 배경 (럭셔리 블랙 & 골드)
    const gradient = ctx.createRadialGradient(CENTER.x, CENTER.y, 0, CENTER.x, CENTER.y, RADIUS);
    gradient.addColorStop(0, "#1a1a1a");
    gradient.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // 테두리 (황금빛)
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // 시간 눈금 및 숫자
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
      const x = CENTER.x + Math.cos(angle) * (RADIUS - 20);
      const y = CENTER.y + Math.sin(angle) * (RADIUS - 20);

      // 눈금
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        CENTER.x + Math.cos(angle) * (RADIUS - 10),
        CENTER.y + Math.sin(angle) * (RADIUS - 10)
      );
      ctx.lineTo(
        CENTER.x + Math.cos(angle) * (RADIUS - 25),
        CENTER.y + Math.sin(angle) * (RADIUS - 25)
      );
      ctx.stroke();

      // 숫자
      ctx.fillStyle = "#d4af37";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i), x, y);
    }

    // 중심점
    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // 수면 모드: 시작/종료 시간 표시
    if (type === "sleep") {
      if (startAngle !== null) {
        const startHour = angleToHour(startAngle as number);
        const startX = CENTER.x + Math.cos(((startAngle as number) * Math.PI) / 180 - Math.PI / 2) * (RADIUS - 40);
        const startY = CENTER.y + Math.sin(((startAngle as number) * Math.PI) / 180 - Math.PI / 2) * (RADIUS - 40);

        // 시작점 표시
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.arc(startX, startY, 10, 0, Math.PI * 2);
        ctx.fill();

        // 시작 시간 라벨
        ctx.fillStyle = "#3b82f6";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${startHour}시`, startX, startY - 20);
      }

      if (endAngle !== null) {
        const endHour = angleToHour(endAngle as number);
        const endX = CENTER.x + Math.cos(((endAngle as number) * Math.PI) / 180 - Math.PI / 2) * (RADIUS - 40);
        const endY = CENTER.y + Math.sin(((endAngle as number) * Math.PI) / 180 - Math.PI / 2) * (RADIUS - 40);

        // 종료점 표시
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(endX, endY, 10, 0, Math.PI * 2);
        ctx.fill();

        // 종료 시간 라벨
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${endHour}시`, endX, endY + 20);

        // 수면 시간 계산 및 표시
        let sleepHours = ((endAngle as number) - (startAngle as number)) / 15;
        if (sleepHours < 0) sleepHours += 24;
        ctx.fillStyle = "#d4af37";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`수면: ${sleepHours.toFixed(1)}시간`, CENTER.x, CENTER.y + 180);
      }

      // 채워진 영역 표시
      if (startAngle !== null && endAngle !== null) {
        const startRad = ((startAngle as number) * Math.PI) / 180 - Math.PI / 2;
        const endRad = ((endAngle as number) * Math.PI) / 180 - Math.PI / 2;

        ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
        ctx.beginPath();
        ctx.moveTo(CENTER.x, CENTER.y);
        ctx.arc(CENTER.x, CENTER.y, RADIUS - 40, startRad, endRad);
        ctx.lineTo(CENTER.x, CENTER.y);
        ctx.fill();
      }
    }

    // 식사 모드: 식사 시간 표시
    if (type === "meal") {
      mealTimes.forEach((time) => {
        const angle = hourToAngle(time);
        const rad = (angle * Math.PI) / 180 - Math.PI / 2;
        const x = CENTER.x + Math.cos(rad) * (RADIUS - 40);
        const y = CENTER.y + Math.sin(rad) * (RADIUS - 40);

        // 식사 아이콘
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();

        // 시간 라벨
        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${time}시`, x, y - 25);
      });
    }
  }, [startAngle, endAngle, mealTimes, type]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (type === "sleep") {
      setIsDragging(true);
      const angle = getAngleFromMouse(e);
      if (startAngle === null) {
        setStartAngle(angle);
      } else {
        setEndAngle(angle);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (type === "sleep" && isDragging) {
      const angle = getAngleFromMouse(e);
      if (startAngle === null) {
        setStartAngle(angle);
      } else {
        setEndAngle(angle);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (startAngle !== null && endAngle !== null) {
      const start = angleToHour(startAngle);
      const end = angleToHour(endAngle);
      onTimeChange?.(start, end);
    }
  };

  const handleMealClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (type === "meal") {
      const angle = getAngleFromMouse(e);
      const hour = angleToHour(angle);

      if (mealTimes.includes(hour)) {
        setMealTimes(mealTimes.filter((t) => t !== hour));
      } else {
        setMealTimes([...mealTimes, hour].sort((a, b) => a - b));
        onMealLog?.(hour);
      }
    }
  };

  const handleReset = () => {
    if (type === "sleep") {
      setStartAngle(null);
      setEndAngle(null);
    } else {
      setMealTimes([]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/50"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        {type === "sleep" ? (
          <>
            <Moon className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-yellow-400">수면 시간</h2>
          </>
        ) : (
          <>
            <UtensilsCrossed className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-yellow-400">식사 기록</h2>
          </>
        )}
      </div>

      {/* 캔버스 */}
      <motion.canvas
        ref={canvasRef}
        width={400}
        height={420}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMealClick}
        className="w-full border-2 border-yellow-500/30 rounded-xl cursor-crosshair mb-4"
        whileHover={{ boxShadow: "0 0 30px rgba(212, 175, 55, 0.3)" }}
      />

      {/* 안내 텍스트 */}
      <div className="text-center mb-4">
        {type === "sleep" ? (
          <p className="text-gray-400 text-sm">
            {startAngle === null
              ? "취침 시간을 터치하세요"
              : endAngle === null
                ? "기상 시간을 터치하세요"
                : "수면 시간이 기록되었습니다"}
          </p>
        ) : (
          <p className="text-gray-400 text-sm">
            식사 시간을 터치하여 기록하세요
          </p>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
        >
          초기화
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold transition-all"
        >
          저장
        </motion.button>
      </div>

      {/* 기록된 데이터 표시 */}
      {type === "meal" && mealTimes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-amber-900/20 border border-amber-500/30"
        >
          <p className="text-amber-400 text-sm font-semibold mb-2">
            기록된 식사 시간:
          </p>
          <div className="flex flex-wrap gap-2">
            {mealTimes.map((time) => (
              <span
                key={time}
                className="px-3 py-1 rounded-full bg-amber-500/30 text-amber-300 text-xs font-semibold"
              >
                {time}시
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AnalogClockUI;
