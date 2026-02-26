/**
 * 🎯 대시보드 + 휘발성 카드 통합
 * 
 * 6개 접점 중 1번: 대시보드 확인
 * - 오늘의 건강 팁 자동 표시
 * - 미읽음 카드 배지
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { VolatileCardContainer, VolatileCardBadge } from "./VolatileKnowledgeCard";
import { trpc } from "@/lib/trpc";

interface DashboardWithCardsProps {
  userId: string;
}

export function DashboardWithCards({ userId }: DashboardWithCardsProps) {
  const [showCards, setShowCards] = useState(false);

  // 대시보드 콘텐츠 가져오기
  const { data: dashboardContent } = trpc.content.getCompactContent.useQuery(
    {
      trigger: "dashboard",
      activityType: "daily_check",
      currentLevel: 0,
    },
    { enabled: true }
  );

  // 휘발성 카드 조회
  const { data: cardsData, refetch: refetchCards } = trpc.content.getVolatileCards.useQuery(
    undefined,
    { enabled: true }
  );

  // 카드 읽음 표시
  const markCardAsReadMutation = trpc.content.markCardAsRead.useMutation({
    onSuccess: () => {
      refetchCards();
    },
  });

  // 카드 삭제
  const deleteCardMutation = trpc.content.deleteCard.useMutation({
    onSuccess: () => {
      refetchCards();
    },
  });

  const handleCardRead = (cardId: string) => {
    markCardAsReadMutation.mutate({ cardId });
  };

  const handleCardDelete = (cardId: string) => {
    deleteCardMutation.mutate({ cardId });
  };

  return (
    <div className="w-full space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">📊 오늘의 건강</h2>

        {/* 미읽음 배지 */}
        {cardsData && cardsData.unreadCount > 0 && (
          <motion.button
            onClick={() => setShowCards(!showCards)}
            className="relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <VolatileCardBadge
              unreadCount={cardsData.unreadCount}
              onClick={() => setShowCards(!showCards)}
            />
          </motion.button>
        )}
      </div>

      {/* 오늘의 건강 팁 */}
      {dashboardContent && dashboardContent.content && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">{dashboardContent.card.badge?.icon}</span>
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">💡 오늘의 건강 팁</p>
              <p className="text-lg font-bold text-yellow-300">
                {dashboardContent.content.headline}
              </p>
              {dashboardContent.content.medicalBasis && (
                <p className="text-xs text-yellow-200 mt-2">
                  {dashboardContent.content.medicalBasis}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 휘발성 카드 컨테이너 */}
      {showCards && cardsData && cardsData.cards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <h3 className="text-sm font-bold text-gray-400">📌 알림 카드</h3>
          <VolatileCardContainer
            cards={cardsData.cards}
            onRead={handleCardRead}
            onDelete={handleCardDelete}
            maxVisible={5}
          />
        </motion.div>
      )}
    </div>
  );
}
