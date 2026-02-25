import { useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronDown } from "lucide-react";

export interface BodyPart {
  id: string;
  name: string;
  koreanName: string;
  symptoms: string[];
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const BODY_PARTS: BodyPart[] = [
  {
    id: "head",
    name: "Head",
    koreanName: "머리",
    symptoms: ["두통", "어지러움", "두피 가려움", "탈모"],
    color: "#FF6B6B",
    x: 45,
    y: 5,
    width: 10,
    height: 12,
  },
  {
    id: "eyes",
    name: "Eyes",
    koreanName: "눈",
    symptoms: ["피로", "건조함", "시력 변화", "충혈"],
    color: "#FF8C42",
    x: 40,
    y: 12,
    width: 5,
    height: 4,
  },
  {
    id: "ears",
    name: "Ears",
    koreanName: "귀",
    symptoms: ["청력 감소", "이명", "귀 통증", "귀지"],
    color: "#FFA500",
    x: 35,
    y: 13,
    width: 4,
    height: 5,
  },
  {
    id: "nose",
    name: "Nose",
    koreanName: "코",
    symptoms: ["코막힘", "알레르기", "냄새 감각", "코피"],
    color: "#FFB84D",
    x: 47,
    y: 14,
    width: 3,
    height: 3,
  },
  {
    id: "mouth",
    name: "Mouth",
    koreanName: "입/목",
    symptoms: ["입마름", "목통증", "삼킴 곤란", "구강 궤양"],
    color: "#FF6B9D",
    x: 45,
    y: 19,
    width: 5,
    height: 3,
  },
  {
    id: "neck",
    name: "Neck",
    koreanName: "목",
    symptoms: ["목 경직", "목 통증", "림프절 부종"],
    color: "#E74C3C",
    x: 47,
    y: 22,
    width: 4,
    height: 4,
  },
  {
    id: "chest",
    name: "Chest",
    koreanName: "가슴",
    symptoms: ["호흡곤란", "가슴 통증", "심계항진", "기침"],
    color: "#C0392B",
    x: 42,
    y: 28,
    width: 10,
    height: 12,
  },
  {
    id: "back",
    name: "Back",
    koreanName: "등",
    symptoms: ["등 통증", "경직", "근육 경련"],
    color: "#E67E22",
    x: 42,
    y: 28,
    width: 10,
    height: 12,
  },
  {
    id: "abdomen",
    name: "Abdomen",
    koreanName: "복부",
    symptoms: ["소화 불편", "복부 팽만감", "복부 통증", "장 운동"],
    color: "#F39C12",
    x: 42,
    y: 42,
    width: 10,
    height: 12,
  },
  {
    id: "left_arm",
    name: "Left Arm",
    koreanName: "왼쪽 팔",
    symptoms: ["팔 통증", "저림", "부종", "근력 약화"],
    color: "#3498DB",
    x: 30,
    y: 30,
    width: 8,
    height: 20,
  },
  {
    id: "right_arm",
    name: "Right Arm",
    koreanName: "오른쪽 팔",
    symptoms: ["팔 통증", "저림", "부종", "근력 약화"],
    color: "#3498DB",
    x: 62,
    y: 30,
    width: 8,
    height: 20,
  },
  {
    id: "left_hand",
    name: "Left Hand",
    koreanName: "왼쪽 손",
    symptoms: ["손가락 저림", "손목 통증", "손 부종", "손가락 경직"],
    color: "#2980B9",
    x: 28,
    y: 50,
    width: 6,
    height: 8,
  },
  {
    id: "right_hand",
    name: "Right Hand",
    koreanName: "오른쪽 손",
    symptoms: ["손가락 저림", "손목 통증", "손 부종", "손가락 경직"],
    color: "#2980B9",
    x: 66,
    y: 50,
    width: 6,
    height: 8,
  },
  {
    id: "left_leg",
    name: "Left Leg",
    koreanName: "왼쪽 다리",
    symptoms: ["다리 통증", "부종", "저림", "경련"],
    color: "#9B59B6",
    x: 38,
    y: 56,
    width: 8,
    height: 25,
  },
  {
    id: "right_leg",
    name: "Right Leg",
    koreanName: "오른쪽 다리",
    symptoms: ["다리 통증", "부종", "저림", "경련"],
    color: "#9B59B6",
    x: 54,
    y: 56,
    width: 8,
    height: 25,
  },
  {
    id: "left_foot",
    name: "Left Foot",
    koreanName: "왼쪽 발",
    symptoms: ["발 통증", "발가락 저림", "발 부종", "발톱 문제"],
    color: "#8E44AD",
    x: 38,
    y: 81,
    width: 6,
    height: 8,
  },
  {
    id: "right_foot",
    name: "Right Foot",
    koreanName: "오른쪽 발",
    symptoms: ["발 통증", "발가락 저림", "발 부종", "발톱 문제"],
    color: "#8E44AD",
    x: 56,
    y: 81,
    width: 6,
    height: 8,
  },
  {
    id: "skin",
    name: "Skin",
    koreanName: "피부",
    symptoms: ["발진", "가려움", "상처", "색소 변화"],
    color: "#E8B4B8",
    x: 42,
    y: 30,
    width: 16,
    height: 50,
  },
  {
    id: "joints",
    name: "Joints",
    koreanName: "관절",
    symptoms: ["관절 통증", "경직", "부종", "가동성 제한"],
    color: "#95A5A6",
    x: 42,
    y: 30,
    width: 16,
    height: 50,
  },
];

interface HealthBodyMapProps {
  selectedParts?: string[];
  onPartSelect?: (partId: string, part: BodyPart) => void;
  onPartDeselect?: (partId: string) => void;
}

export default function HealthBodyMap({
  selectedParts = [],
  onPartSelect,
  onPartDeselect,
}: HealthBodyMapProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [expandedPart, setExpandedPart] = useState<string | null>(null);

  const handlePartClick = (part: BodyPart) => {
    if (selectedParts.includes(part.id)) {
      onPartDeselect?.(part.id);
    } else {
      onPartSelect?.(part.id, part);
    }
    setExpandedPart(part.id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 인체도 SVG */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-8 border border-[#d4af37]/20 mb-6"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-auto max-w-sm mx-auto"
          style={{ aspectRatio: "1/1" }}
        >
          {/* 배경 */}
          <rect width="100" height="100" fill="transparent" />

          {/* 인체 부위 */}
          {BODY_PARTS.map((part) => (
            <motion.g
              key={part.id}
              onMouseEnter={() => setHoveredPart(part.id)}
              onMouseLeave={() => setHoveredPart(null)}
              onClick={() => handlePartClick(part)}
              className="cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              {/* 부위 영역 */}
              <rect
                x={part.x}
                y={part.y}
                width={part.width}
                height={part.height}
                fill={part.color}
                opacity={
                  hoveredPart === part.id
                    ? 0.8
                    : selectedParts.includes(part.id)
                      ? 0.7
                      : 0.4
                }
                rx="2"
                className="transition-opacity duration-200"
              />

              {/* 선택 표시 */}
              {selectedParts.includes(part.id) && (
                <rect
                  x={part.x - 1}
                  y={part.y - 1}
                  width={part.width + 2}
                  height={part.height + 2}
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="1.5"
                  rx="2"
                />
              )}

              {/* 부위명 라벨 */}
              {hoveredPart === part.id && (
                <text
                  x={part.x + part.width / 2}
                  y={part.y + part.height / 2 + 1}
                  textAnchor="middle"
                  fontSize="3"
                  fill="white"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {part.koreanName}
                </text>
              )}
            </motion.g>
          ))}
        </svg>

        {/* 범례 */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {Array.from(new Set(BODY_PARTS.map((p) => p.color))).map((color) => {
            const part = BODY_PARTS.find((p) => p.color === color);
            return (
              <div key={color} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[#d4af37]/70">{part?.koreanName}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 선택된 부위 상세 정보 */}
      {selectedParts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {selectedParts.map((partId) => {
            const part = BODY_PARTS.find((p) => p.id === partId);
            if (!part) return null;

            return (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl border border-[#d4af37]/20 overflow-hidden"
              >
                {/* 헤더 */}
                <div
                  className="p-4 cursor-pointer hover:bg-[#d4af37]/10 transition-colors"
                  onClick={() =>
                    setExpandedPart(expandedPart === part.id ? null : part.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: part.color }}
                      />
                      <div>
                        <h3 className="text-white font-semibold">
                          {part.koreanName}
                        </h3>
                        <p className="text-xs text-[#d4af37]/60">
                          {part.symptoms.length}개 증상
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPartDeselect?.(part.id);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </motion.button>
                      <ChevronDown
                        className={`w-4 h-4 text-[#d4af37] transition-transform ${
                          expandedPart === part.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 증상 목록 */}
                {expandedPart === part.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-[#d4af37]/10 p-4 space-y-2"
                  >
                    {part.symptoms.map((symptom, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded hover:bg-[#d4af37]/10 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[#d4af37]/30 bg-black checked:bg-[#d4af37] cursor-pointer"
                        />
                        <span className="text-sm text-[#d4af37]/80">
                          {symptom}
                        </span>
                      </label>
                    ))}

                    {/* 상세 입력 버튼 */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-black font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      상세 입력
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* 안내 메시지 */}
      {selectedParts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-[#d4af37]/60"
        >
          <p className="text-sm">인체도에서 건강 상태를 확인하고 싶은 부위를 클릭하세요</p>
        </motion.div>
      )}
    </div>
  );
}
