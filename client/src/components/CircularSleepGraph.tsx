/**
 * 아날로그 원형 그래프 - 수면시간
 * 시작/끝 시간 선택 → 중간 영역에 수면 시간 표시
 */

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/glassmorphism-theme.css";

interface SleepTime {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface CircularSleepGraphProps {
  onSleepTimeChange?: (sleepTime: SleepTime) => void;
  className?: string;
}

export const CircularSleepGraph: React.FC<CircularSleepGraphProps> = ({
  onSleepTimeChange,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sleepTime, setSleepTime] = useState<SleepTime>({
    startHour: 22,
    startMinute: 0,
    endHour: 6,
    endMinute: 0,
  });
  const [selectedMode, setSelectedMode] = useState<"start" | "end" | null>(null);
  const [sleepDuration, setSleepDuration] = useState<string>("8h 0m");

  // 수면 시간 계산
  useEffect(() => {
    const startTotalMinutes = sleepTime.startHour * 60 + sleepTime.startMinute;
    const endTotalMinutes = sleepTime.endHour * 60 + sleepTime.endMinute;

    let duration = endTotalMinutes - startTotalMinutes;
    if (duration <= 0) {
      duration += 24 * 60; // 다음날 기상인 경우
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    setSleepDuration(`${hours}h ${minutes}m`);

    if (onSleepTimeChange) {
      onSleepTimeChange(sleepTime);
    }
  }, [sleepTime, onSleepTimeChange]);

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

      // 시간 텍스트 (6시간마다)
      if (i % 6 === 0) {
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

    // 수면 시간 영역 그리기
    const startAngle = (sleepTime.startHour / 24 + sleepTime.startMinute / (24 * 60)) * Math.PI * 2 - Math.PI / 2;
    let endAngle = (sleepTime.endHour / 24 + sleepTime.endMinute / (24 * 60)) * Math.PI * 2 - Math.PI / 2;

    if (endAngle <= startAngle) {
      endAngle += Math.PI * 2;
    }

    // 수면 영역 (파란색)
    ctx.fillStyle = "rgba(100, 150, 255, 0.3)";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // 수면 영역 테두리
    ctx.strokeStyle = "rgba(100, 150, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();

    // 시작 시간 마커 (초록색)
    const startX = centerX + Math.cos(startAngle) * radius;
    const startY = centerY + Math.sin(startAngle) * radius;
    ctx.fillStyle = "rgba(100, 255, 150, 0.8)";
    ctx.beginPath();
    ctx.arc(startX, startY, 8, 0, Math.PI * 2);
    ctx.fill();

    // 끝 시간 마커 (주황색)
    const endX = centerX + Math.cos(endAngle) * radius;
    const endY = centerY + Math.sin(endAngle) * radius;
    ctx.fillStyle = "rgba(255, 150, 100, 0.8)";
    ctx.beginPath();
    ctx.arc(endX, endY, 8, 0, Math.PI * 2);
    ctx.fill();

    // 중앙 텍스트 (수면 시간)
    ctx.fillStyle = "rgba(212, 175, 55, 0.9)";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sleepDuration, centerX, centerY - 15);

    ctx.fillStyle = "rgba(212, 175, 55, 0.6)";
    ctx.font = "12px Arial";
    ctx.fillText("수면 시간", centerX, centerY + 15);
  }, [sleepTime, sleepDuration]);

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

    if (selectedMode === "start") {
      setSleepTime((prev) => ({
        ...prev,
        startHour: hour,
        startMinute: minute,
      }));
      setSelectedMode("end");
    } else if (selectedMode === "end") {
      setSleepTime((prev) => ({
        ...prev,
        endHour: hour,
        endMinute: minute,
      }));
      setSelectedMode(null);
    }
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-lg font-bold text-gold">수면 시간 기록</h3>

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

        <div className="flex gap-4 w-full">
          <motion.button
            onClick={() => setSelectedMode(selectedMode === "start" ? null : "start")}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              selectedMode === "start"
                ? "bg-green-500/40 border-2 border-green-400 text-green-300"
                : "glass-button"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            취침: {String(sleepTime.startHour).padStart(2, "0")}:
            {String(sleepTime.startMinute).padStart(2, "0")}
          </motion.button>

          <motion.button
            onClick={() => setSelectedMode(selectedMode === "end" ? null : "end")}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              selectedMode === "end"
                ? "bg-orange-500/40 border-2 border-orange-400 text-orange-300"
                : "glass-button"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            기상: {String(sleepTime.endHour).padStart(2, "0")}:
            {String(sleepTime.endMinute).padStart(2, "0")}
          </motion.button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gold-muted">
            {selectedMode === "start" && "취침 시간을 선택하세요"}
            {selectedMode === "end" && "기상 시간을 선택하세요"}
            {!selectedMode && "시작 또는 끝 버튼을 클릭하여 시간을 설정하세요"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CircularSleepGraph;
