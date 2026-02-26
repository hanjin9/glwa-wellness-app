/**
 * 🎯 미션 시작 + 휘발성 카드 통합
 * 
 * 6개 접점 중 1번: 미션 수령
 * - 맞춤형 운동 + 소도구 (30% 단축)
 * - 동작 직전 동기부여
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { VolatileKnowledgeCard } from "./VolatileKnowledgeCard";
import { trpc } from "@/lib/trpc";
import { Play } from "lucide-react";

interface Mission {
  id: string;
  name: string;
  type: string;
  target: number;
  unit: string;
}

interface MissionStartWithCardProps {
  mission: Mission;
  onStart?: () => void;
}

export function MissionStartWithCard({ mission, onStart }: MissionStartWithCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // 미션 시작 시 맞춤형 운동 카드 생성
  const { data: exerciseCard } = trpc.content.getCompactContent.useQuery(
    {
      trigger: "mission_start",
      activityType: mission.type,
      currentLevel: 0,
    },
    { enabled: true }
  );

  // 동작 직전 동기부여 카드
  const { data: motivationCard } = trpc.content.getCompactContent.useQuery(
    {
      trigger: "action_begin",
      activityType: mission.type,
      currentLevel: 0,
    },
    { enabled: showDetails }
  );

  // 카드 읽음 표시
  const markCardAsReadMutation = trpc.content.markCardAsRead.useMutation();

  const handleCardRead = (cardId: string) => {
    markCardAsReadMutation.mutate({ cardId });
  };

  const handleStart = () => {
    setShowDetails(true);
    if (onStart) {
      onStart();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4"
    >
      {/* 미션 카드 */}
      <motion.div
        className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-4"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-400">오늘의 미션</p>
            <h3 className="text-xl font-bold text-white">{mission.name}</h3>
          </div>
          <div className="text-3xl">🎯</div>
        </div>

        <div className="bg-blue-900/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-300">
            목표: {mission.target} {mission.unit}
          </p>
        </div>

        {/* 맞춤형 운동 카드 */}
        {exerciseCard && exerciseCard.card && !showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4"
          >
            <VolatileKnowledgeCard
              card={exerciseCard.card}
              onRead={handleCardRead}
              autoExpand={false}
            />
          </motion.div>
        )}

        {/* 시작 버튼 */}
        <motion.button
          onClick={handleStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          미션 시작
        </motion.button>
      </motion.div>

      {/* 동작 직전 동기부여 */}
      {showDetails && motivationCard && motivationCard.card && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <p className="text-xs font-bold text-gray-400">⚡ 동작 직전 동기부여</p>
          <VolatileKnowledgeCard
            card={motivationCard.card}
            onRead={handleCardRead}
            autoExpand={true}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
