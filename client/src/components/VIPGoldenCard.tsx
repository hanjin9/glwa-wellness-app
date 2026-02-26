/**
 * 🏛️ VIP 골든 카드 컴포넌트
 * 
 * Golden Slideshow 영상 기반 VIP 멤버십 카드
 * - 카드 이미지 오버레이
 * - 애니메이션 입장 효과
 * - 다국어 보이스 연동
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Zap, Gift } from "lucide-react";

export interface VIPCardProps {
  userName: string;
  vipLevel: number;
  levelName: string;
  cardColor: string;
  points: number;
  progressPercent: number;
  profileImage?: string;
  videoSrc?: string;
  onAnimationComplete?: () => void;
  isLevelUp?: boolean;
  language?: string;
}

export function VIPGoldenCard({
  userName,
  vipLevel,
  levelName,
  cardColor,
  points,
  progressPercent,
  profileImage,
  videoSrc,
  onAnimationComplete,
  isLevelUp = false,
  language = "ko",
}: VIPCardProps) {
  const [showCard, setShowCard] = useState(false);
  const [playVoice, setPlayVoice] = useState(false);

  useEffect(() => {
    // 카드 표시 시작
    setShowCard(true);
    
    // 음성 재생 트리거
    setTimeout(() => setPlayVoice(true), 500);
  }, []);

  const animationDuration = 3 + vipLevel * 0.5; // 레벨에 따라 애니메이션 시간 증가

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: animationDuration,
      },
    },
  };

  const cardVariants = {
    hidden: { rotateY: 180, opacity: 0 },
    visible: {
      rotateY: 0,
      opacity: 1,
      transition: {
        duration: 1.5,
      },
    },
  };

  const glowVariants = {
    initial: { boxShadow: `0 0 20px ${cardColor}` },
    animate: {
      boxShadow: [
        `0 0 20px ${cardColor}`,
        `0 0 40px ${cardColor}`,
        `0 0 20px ${cardColor}`,
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.div
      className="relative w-full max-w-md mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate={showCard ? "visible" : "hidden"}
      onAnimationComplete={onAnimationComplete}
    >
      {/* 배경 영상 (선택사항) */}
      {videoSrc && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-30 -z-10">
          <video
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
            src={videoSrc}
          />
        </div>
      )}

      {/* VIP 카드 */}
      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)`,
          border: `3px solid ${cardColor}`,
          backdropFilter: "blur(10px)",
        }}
      >
        {/* 카드 내용 */}
        <motion.div variants={cardVariants} className="p-8 text-center">
          {/* 레벨 아이콘 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            {vipLevel >= 7 && (
              <Crown
                className="w-12 h-12"
                style={{ color: cardColor }}
              />
            )}
            {vipLevel < 7 && (
              <Zap
                className="w-12 h-12"
                style={{ color: cardColor }}
              />
            )}
          </motion.div>

          {/* VIP 레벨 텍스트 */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-4xl font-bold mb-4"
            style={{ color: cardColor }}
          >
            {levelName}
          </motion.h2>

          {/* 사용자 이름 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-2xl font-semibold mb-6"
            style={{ color: "#FFD700" }}
          >
            {userName}
          </motion.p>

          {/* 프로필 이미지 (선택사항) */}
          {profileImage && (
            <motion.img
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              src={profileImage}
              alt={userName}
              className="w-24 h-24 rounded-full mx-auto mb-6 border-2"
              style={{ borderColor: cardColor }}
            />
          )}

          {/* 포인트 정보 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="mb-6"
          >
            <p className="text-gray-300 text-sm mb-2">Total Points</p>
            <p className="text-3xl font-bold" style={{ color: "#FFD700" }}>
              {points.toLocaleString()}
            </p>
          </motion.div>

          {/* 진행률 바 */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mb-4"
          >
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ delay: 2, duration: 1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: cardColor }}
              />
            </div>
            <p className="text-gray-400 text-xs mt-2">
              {progressPercent}% to Next Level
            </p>
          </motion.div>

          {/* 레벨업 배지 */}
          {isLevelUp && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 2.5, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                backgroundColor: cardColor,
                color: "#1a1a1a",
              }}
            >
              <Gift className="w-4 h-4" />
              <span className="font-bold text-sm">LEVEL UP!</span>
            </motion.div>
          )}

          {/* 혜택 미리보기 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.7, duration: 0.5 }}
            className="text-left bg-black/30 rounded-lg p-4 border border-gray-700"
          >
            <p className="text-gray-300 text-xs font-semibold mb-2">EXCLUSIVE BENEFITS</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>✓ 프리미엄 건강 분석</li>
              <li>✓ 24/7 AI 코칭</li>
              <li>✓ VIP 라운지 접근</li>
              {vipLevel >= 6 && <li>✓ 개인 건강 매니저</li>}
              {vipLevel >= 8 && <li>✓ 럭셔리 웰니스 리트릿</li>}
            </ul>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 배경 장식 */}
      <motion.div
        className="absolute -inset-4 rounded-2xl opacity-20 -z-20"
        style={{ backgroundColor: cardColor }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
}

export default VIPGoldenCard;
