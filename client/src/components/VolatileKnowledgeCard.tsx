/**
 * 🎯 휘발성 지식 카드 UI - Badge 형태
 * 
 * 메시지 앱의 숫자 표시(Badge)처럼 작동:
 * - 유저가 원할 때 열어보고 지울 수 있음
 * - 자동 만료 (30분)
 * - 트리거별 자동 생성
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Zap } from "lucide-react";

interface VolatileCard {
  id: string;
  trigger: string;
  headline: string;
  medicalBasis?: string;
  tools?: string[];
  duration?: number;
  confidence?: number;
  timestamp: number;
  expiresAt: number;
  isRead: boolean;
  badge?: {
    count: number;
    icon: string;
  };
}

interface VolatileKnowledgeCardProps {
  card: VolatileCard;
  onRead?: (cardId: string) => void;
  onDelete?: (cardId: string) => void;
  autoExpand?: boolean;
}

export function VolatileKnowledgeCard({
  card,
  onRead,
  onDelete,
  autoExpand = false,
}: VolatileKnowledgeCardProps) {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // 남은 시간 계산
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = Date.now();
      const remaining = card.expiresAt - now;

      if (remaining <= 0) {
        setTimeLeft("만료됨");
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      if (minutes > 0) {
        setTimeLeft(`${minutes}분 ${seconds}초`);
      } else {
        setTimeLeft(`${seconds}초`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [card.expiresAt]);

  const handleRead = () => {
    setIsExpanded(true);
    if (!card.isRead && onRead) {
      onRead(card.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(card.id);
    }
  };

  const getTriggerLabel = (trigger: string): string => {
    const labels: Record<string, string> = {
      mission_start: "🎯 미션 시작",
      action_begin: "⚡ 동작 시작",
      reward: "🎁 보상",
      game_end: "🏁 게임 종료",
      dashboard: "📊 대시보드",
      streaming: "📡 스트리밍",
    };
    return labels[trigger] || trigger;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full"
    >
      {/* 축약 모드 (Badge) */}
      {!isExpanded && (
        <motion.button
          onClick={handleRead}
          className="w-full bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-3 hover:border-yellow-500/60 transition-all text-left"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">{card.badge?.icon || "📌"}</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-yellow-400 truncate">
                  {getTriggerLabel(card.trigger)}
                </p>
                <p className="text-xs text-gray-400 truncate">{card.headline}</p>
              </div>
            </div>

            {/* 미읽음 배지 */}
            {!card.isRead && (
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse ml-2" />
            )}
          </div>
        </motion.button>
      )}

      {/* 확장 모드 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-600/30 rounded-lg p-4 shadow-2xl mt-2"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{card.badge?.icon || "📌"}</span>
                <div>
                  <p className="text-sm font-bold text-yellow-400">
                    {getTriggerLabel(card.trigger)}
                  </p>
                  <p className="text-xs text-gray-500">
                    신뢰도: {card.confidence}%
                  </p>
                </div>
              </div>

              <motion.button
                onClick={() => setIsExpanded(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="space-y-3 mb-4">
              {/* 헤드라인 */}
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <p className="text-lg font-bold text-white">{card.headline}</p>
              </div>

              {/* 의학적 근거 */}
              {card.medicalBasis && (
                <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                  <p className="text-xs text-gray-400 mb-1">⚕️ 의학적 근거</p>
                  <p className="text-sm text-yellow-300">{card.medicalBasis}</p>
                </div>
              )}

              {/* 소도구 */}
              {card.tools && card.tools.length > 0 && (
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                  <p className="text-xs text-gray-400 mb-2">🛠️ 필요한 소도구</p>
                  <div className="flex flex-wrap gap-2">
                    {card.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-600/30 text-blue-200 text-xs px-2 py-1 rounded"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 소요 시간 */}
              {card.duration && (
                <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">
                    소요 시간: {Math.floor(card.duration / 60)}분 {card.duration % 60}초
                  </span>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                <span>남은 시간: {timeLeft}</span>
              </div>

              <motion.button
                onClick={handleDelete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs px-3 py-1 rounded transition-colors"
              >
                삭제
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// 카드 배지 (미읽음 개수 표시)
// ============================================================================

interface VolatileCardBadgeProps {
  unreadCount: number;
  onClick?: () => void;
}

export function VolatileCardBadge({ unreadCount, onClick }: VolatileCardBadgeProps) {
  if (unreadCount === 0) return null;

  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="relative inline-flex items-center justify-center"
    >
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
          <span className="text-white font-bold text-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        </div>

        {/* 펄스 애니메이션 */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-yellow-500 opacity-50"
        />
      </div>
    </motion.button>
  );
}

// ============================================================================
// 카드 컨테이너 (여러 카드 표시)
// ============================================================================

interface VolatileCardContainerProps {
  cards: VolatileCard[];
  onRead?: (cardId: string) => void;
  onDelete?: (cardId: string) => void;
  maxVisible?: number;
}

export function VolatileCardContainer({
  cards,
  onRead,
  onDelete,
  maxVisible = 3,
}: VolatileCardContainerProps) {
  const visibleCards = cards.slice(0, maxVisible);
  const hiddenCount = Math.max(0, cards.length - maxVisible);

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {visibleCards.map((card) => (
          <VolatileKnowledgeCard
            key={card.id}
            card={card}
            onRead={onRead}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>

      {/* 숨겨진 카드 표시 */}
      {hiddenCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-gray-500 py-2"
        >
          +{hiddenCount}개 더보기
        </motion.div>
      )}
    </div>
  );
}
