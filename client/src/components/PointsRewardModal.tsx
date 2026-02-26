/**
 * 🎯 포인트 지급창 + 휘발성 카드 통합
 * 
 * 6개 접점 중 2번: 포인트 지급창
 * - 의학적 근거 표시
 * - 신뢰도 및 권위 부여
 */

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { VolatileKnowledgeCard } from "./VolatileKnowledgeCard";
import { trpc } from "@/lib/trpc";
import { Award, TrendingUp } from "lucide-react";

interface PointsRewardModalProps {
  points: number;
  reason: string;
  activityType: string;
  onClose?: () => void;
}

export function PointsRewardModal({
  points,
  reason,
  activityType,
  onClose,
}: PointsRewardModalProps) {
  // 포인트 지급 시 의학적 근거 카드 생성
  const { data: medicalCard } = trpc.content.getCompactContent.useQuery(
    {
      trigger: "game_end",
      activityType,
      currentLevel: 0,
    },
    { enabled: true }
  );

  // 카드 읽음 표시
  const markCardAsReadMutation = trpc.content.markCardAsRead.useMutation();

  const handleCardRead = (cardId: string) => {
    markCardAsReadMutation.mutate({ cardId });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-600/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        {/* 헤더 */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
            className="text-6xl mb-4"
          >
            🏆
          </motion.div>

          <h2 className="text-2xl font-bold text-yellow-400 mb-2">포인트 획득!</h2>
          <p className="text-gray-400 mb-4">{reason}</p>
        </div>

        {/* 포인트 표시 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 mb-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-4xl font-bold text-yellow-300">+{points}</span>
            <Award className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-xs text-yellow-200">포인트가 지급되었습니다</p>
        </motion.div>

        {/* 의학적 근거 카드 */}
        {medicalCard && medicalCard.card && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <p className="text-xs font-bold text-gray-400 mb-2">⚕️ 신뢰도 & 권위</p>
            <VolatileKnowledgeCard
              card={medicalCard.card}
              onRead={handleCardRead}
              autoExpand={true}
            />
          </motion.div>
        )}

        {/* 닫기 버튼 */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 rounded-lg transition-all"
        >
          계속하기
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
