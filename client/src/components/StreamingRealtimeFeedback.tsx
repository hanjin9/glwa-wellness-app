/**
 * 🎯 스트리밍 실시간 피드백 + 휘발성 카드 통합
 * 
 * 6개 접점 중 6번: 스트리밍 (상시 건강 트래킹)
 * - 실시간 의학적 근거
 * - 지속적인 건강 팁
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VolatileKnowledgeCard } from "./VolatileKnowledgeCard";
import { trpc } from "@/lib/trpc";
import { Activity, Zap } from "lucide-react";

interface StreamingRealtimeFeedbackProps {
  userId: string;
  isActive: boolean;
}

export function StreamingRealtimeFeedback({
  userId,
  isActive,
}: StreamingRealtimeFeedbackProps) {
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [cardHistory, setCardHistory] = useState<any[]>([]);

  // 스트리밍 실시간 피드백 카드 생성
  const { data: streamingCard, refetch: refetchCard } =
    trpc.content.getCompactContent.useQuery(
      {
        trigger: "streaming",
        activityType: "realtime_tracking",
        currentLevel: 0,
      },
      { enabled: isActive }
    );

  // 카드 읽음 표시
  const markCardAsReadMutation = trpc.content.markCardAsRead.useMutation();

  // 카드 삭제
  const deleteCardMutation = trpc.content.deleteCard.useMutation({
    onSuccess: () => {
      // 다음 카드 생성
      setTimeout(() => {
        refetchCard();
      }, 500);
    },
  });

  const handleCardRead = (cardId: string) => {
    markCardAsReadMutation.mutate({ cardId });
  };

  const handleCardDelete = (cardId: string) => {
    deleteCardMutation.mutate({ cardId });
  };

  // 새로운 카드 수신 시 업데이트
  useEffect(() => {
    if (streamingCard && streamingCard.card) {
      setCurrentCard(streamingCard.card);
      setCardHistory((prev) => [streamingCard.card, ...prev.slice(0, 4)]);
    }
  }, [streamingCard]);

  if (!isActive || !currentCard) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 max-w-sm z-40"
    >
      {/* 현재 카드 */}
      <motion.div
        key={currentCard.id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="mb-2"
      >
        <VolatileKnowledgeCard
          card={currentCard}
          onRead={handleCardRead}
          onDelete={handleCardDelete}
          autoExpand={false}
        />
      </motion.div>

      {/* 카드 히스토리 (축약) */}
      {cardHistory.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500 text-center"
        >
          <p>최근 {cardHistory.length}개 피드백</p>
        </motion.div>
      )}

      {/* 활성 상태 표시 */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"
      />
    </motion.div>
  );
}

// ============================================================================
// 스트리밍 제어 패널
// ============================================================================

interface StreamingControlPanelProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

export function StreamingControlPanel({
  isActive,
  onToggle,
}: StreamingControlPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-green-400" />
        <div>
          <p className="text-sm font-bold text-white">실시간 건강 트래킹</p>
          <p className="text-xs text-gray-400">
            {isActive ? "활성 중" : "비활성"}
          </p>
        </div>
      </div>

      <motion.button
        onClick={() => onToggle(!isActive)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-lg font-bold transition-all ${
          isActive
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        {isActive ? "중지" : "시작"}
      </motion.button>
    </motion.div>
  );
}
