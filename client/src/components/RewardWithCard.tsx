/**
 * 🎯 포인트 획득 + 휘발성 카드 통합
 * 
 * 6개 접점 중 3번: 포인트 획득 시
 * - 요가 자세 & 스트레칭 (핵심어 중심)
 * - 보상 후 이완 효과
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { VolatileKnowledgeCard } from "./VolatileKnowledgeCard";
import { trpc } from "@/lib/trpc";
import { Sparkles } from "lucide-react";

interface RewardEvent {
  id: string;
  type: "mission" | "game" | "exercise" | "daily";
  points: number;
  reason: string;
  stressLevel?: number;
}

interface RewardWithCardProps {
  reward: RewardEvent;
  onClose?: () => void;
}

export function RewardWithCard({ reward, onClose }: RewardWithCardProps) {
  const [showYoga, setShowYoga] = useState(false);

  // 포인트 획득 후 요가 자세 카드 생성
  const { data: yogaCard } = trpc.content.getCompactContent.useQuery(
    {
      trigger: "reward",
      activityType: reward.type,
      currentLevel: 0,
      healthMetrics: {
        stressLevel: reward.stressLevel || 0,
      },
    },
    { enabled: showYoga }
  );

  // 카드 읽음 표시
  const markCardAsReadMutation = trpc.content.markCardAsRead.useMutation();

  const handleCardRead = (cardId: string) => {
    markCardAsReadMutation.mutate({ cardId });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      {/* 포인트 획득 애니메이션 */}
      <motion.div
        className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/40 rounded-xl p-6 text-center mb-4"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        {/* 포인트 숫자 떨어지는 애니메이션 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <span className="text-4xl font-bold text-yellow-300">+{reward.points}</span>
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-sm text-gray-300">{reward.reason}</p>
        </motion.div>

        {/* 포인트 타입별 이모지 */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl mb-4"
        >
          {reward.type === "mission" && "🎯"}
          {reward.type === "game" && "🎮"}
          {reward.type === "exercise" && "💪"}
          {reward.type === "daily" && "⭐"}
        </motion.div>
      </motion.div>

      {/* 요가 자세 제안 버튼 */}
      {!showYoga && (
        <motion.button
          onClick={() => setShowYoga(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/40 hover:border-purple-500/60 text-purple-300 font-bold py-3 rounded-lg transition-all mb-4"
        >
          🧘 이완 요가 자세 보기
        </motion.button>
      )}

      {/* 요가 자세 카드 */}
      {showYoga && yogaCard && yogaCard.card && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <p className="text-xs font-bold text-gray-400 mb-2">🧘 보상 후 이완 효과</p>
          <VolatileKnowledgeCard
            card={yogaCard.card}
            onRead={handleCardRead}
            autoExpand={true}
          />
        </motion.div>
      )}

      {/* 닫기 버튼 */}
      {onClose && (
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gray-700/50 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition-all"
        >
          계속
        </motion.button>
      )}
    </motion.div>
  );
}
