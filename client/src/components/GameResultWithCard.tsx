/**
 * 🎯 게임 결과 + 휘발성 카드 통합
 * 
 * 6개 접점 중 4번: 게임 종료 후
 * - 의학적 근거 자동 표시 (50% 단축)
 * - 도파민 부스트 메시지
 */

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { VolatileKnowledgeCard } from "./VolatileKnowledgeCard";
import { trpc } from "@/lib/trpc";

interface GameResult {
  gameId: string;
  gameName: string;
  result: "win" | "lose";
  points: number;
  duration: number;
}

interface GameResultWithCardProps {
  gameResult: GameResult;
  onClose?: () => void;
}

export function GameResultWithCard({ gameResult, onClose }: GameResultWithCardProps) {
  // 게임 종료 후 의학적 근거 카드 생성
  const { data: medicalCard } = trpc.content.getCompactContent.useQuery(
    {
      trigger: "game_end",
      activityType: gameResult.gameName,
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        className="bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-600/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        layoutId="game-result"
      >
        {/* 결과 헤더 */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-4"
          >
            {gameResult.result === "win" ? "🎉" : "😢"}
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {gameResult.result === "win" ? "승리!" : "패배"}
          </h2>

          <p className="text-gray-400 mb-4">{gameResult.gameName}</p>

          {/* 포인트 획득 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-500/20 rounded-lg p-3 mb-4 border border-yellow-500/30"
          >
            <p className="text-sm text-gray-400 mb-1">획득 포인트</p>
            <p className="text-3xl font-bold text-yellow-400">+{gameResult.points}</p>
          </motion.div>

          {/* 게임 시간 */}
          <p className="text-xs text-gray-500">
            ⏱️ 소요 시간: {Math.floor(gameResult.duration / 60)}분 {gameResult.duration % 60}초
          </p>
        </div>

        {/* 의학적 근거 카드 */}
        {medicalCard && medicalCard.card && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <VolatileKnowledgeCard
              card={medicalCard.card}
              onRead={handleCardRead}
              autoExpand={true}
            />
          </motion.div>
        )}

        {/* 액션 버튼 */}
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
