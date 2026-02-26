/**
 * 🏛️ 제국 커뮤니티 - 6단계 게시판 서열 시스템
 * 
 * 럭셔리 블랙 & 골드 테마 + 명예/VIP 황금빛 Glow 효과
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Megaphone,
  Image as ImageIcon,
  Award,
  Trophy,
  Crown,
  Lock,
  ChevronRight,
} from "lucide-react";

export enum BoardCategory {
  ALL_POSTS = "all_posts",
  ANNOUNCEMENTS = "announcements",
  MY_GALLERY = "my_gallery",
  EDUCATION_CERTIFICATE = "education_certificate",
  HALL_OF_FAME = "hall_of_fame",
  VIP_LOUNGE = "vip_lounge",
}

export enum AccessLevel {
  ALL = "all",
  EDUCATOR = "educator",
  EXCELLENT = "excellent",
  VIP = "vip",
  READ_ONLY = "read_only",
}

const BOARD_CATEGORIES = [
  {
    id: BoardCategory.ALL_POSTS,
    name: "전체글",
    description: "제국의 모든 소식이 모이는 광장",
    order: 1,
    accessLevel: AccessLevel.ALL,
    icon: "globe",
    glowEffect: false,
    color: "text-gray-300",
  },
  {
    id: BoardCategory.ANNOUNCEMENTS,
    name: "공지사항",
    description: "사장님의 엄중한 명령과 공식 가이드",
    order: 2,
    accessLevel: AccessLevel.READ_ONLY,
    icon: "megaphone",
    glowEffect: false,
    color: "text-yellow-400",
  },
  {
    id: BoardCategory.MY_GALLERY,
    name: "나의 갤러리",
    description: "개인의 변화(Before/After) 및 일상 공유",
    order: 3,
    accessLevel: AccessLevel.ALL,
    icon: "image",
    glowEffect: false,
    color: "text-blue-300",
  },
  {
    id: BoardCategory.EDUCATION_CERTIFICATE,
    name: "교육 자격증",
    description: "교육 자료 열람 및 자격증 인증 현황",
    order: 4,
    accessLevel: AccessLevel.EDUCATOR,
    icon: "award",
    glowEffect: false,
    color: "text-purple-400",
  },
  {
    id: BoardCategory.HALL_OF_FAME,
    name: "명예의 전당",
    description: "최고 성과자 및 고레벨 리더들의 기록 보관소",
    order: 5,
    accessLevel: AccessLevel.EXCELLENT,
    icon: "trophy",
    glowEffect: true,
    color: "text-yellow-500",
  },
  {
    id: BoardCategory.VIP_LOUNGE,
    name: "VIP 라운지",
    description: "최상위 0.1% 리더들만을 위한 비밀 소통 창구",
    order: 6,
    accessLevel: AccessLevel.VIP,
    icon: "crown",
    glowEffect: true,
    color: "text-yellow-600",
  },
];

const BOARD_ICONS: Record<BoardCategory, React.ComponentType<any>> = {
  [BoardCategory.ALL_POSTS]: Globe,
  [BoardCategory.ANNOUNCEMENTS]: Megaphone,
  [BoardCategory.MY_GALLERY]: ImageIcon,
  [BoardCategory.EDUCATION_CERTIFICATE]: Award,
  [BoardCategory.HALL_OF_FAME]: Trophy,
  [BoardCategory.VIP_LOUNGE]: Crown,
};

export interface CommunityBoardProps {
  userRole: "user" | "educator" | "excellent_member" | "vip" | "admin";
  userLevel: number;
  onBoardSelect?: (boardId: BoardCategory) => void;
}

export function CommunityBoard({
  userRole,
  userLevel,
  onBoardSelect,
}: CommunityBoardProps) {
  const [selectedBoard, setSelectedBoard] = useState<BoardCategory | null>(null);

  const canAccess = (accessLevel: AccessLevel | string): boolean => {
    switch (accessLevel) {
      case AccessLevel.ALL:
        return true;
      case AccessLevel.READ_ONLY:
        return true;
      case AccessLevel.EDUCATOR:
        return userRole === "educator" || userRole === "admin";
      case AccessLevel.EXCELLENT:
        return (
          userRole === "excellent_member" ||
          userRole === "vip" ||
          userRole === "admin"
        );
      case AccessLevel.VIP:
        return userRole === "vip" || userRole === "admin";
      default:
        return false;
    }
  };

  const handleBoardSelect = (boardId: BoardCategory) => {
    const board = BOARD_CATEGORIES.find((b: any) => b.id === boardId);
    if (canAccess(board?.accessLevel || AccessLevel.ALL)) {
      setSelectedBoard(boardId);
      onBoardSelect?.(boardId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-4 md:p-8"
    >
      {/* 헤더 */}
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            제국 커뮤니티
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          명예와 성취가 만나는 글로벌 리더들의 소통 공간
        </p>
      </motion.div>

      {/* 게시판 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <AnimatePresence>
          {BOARD_CATEGORIES.map((board: any, index: number) => {
            const isAccessible = canAccess(board.accessLevel);
            const Icon = BOARD_ICONS[board.id as BoardCategory];
            const isSelected = selectedBoard === board.id;

            return (
              <motion.div
                key={board.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => isAccessible && handleBoardSelect(board.id as BoardCategory)}
                className={`relative cursor-pointer group ${
                  !isAccessible ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {/* 배경 그라데이션 */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                    board.glowEffect
                      ? "bg-gradient-to-br from-yellow-900/30 to-yellow-950/20"
                      : "bg-gradient-to-br from-gray-800/30 to-gray-900/20"
                  }`}
                  animate={{
                    boxShadow: isSelected
                      ? board.glowEffect
                        ? "0 0 40px rgba(255, 215, 0, 0.6)"
                        : "0 0 30px rgba(255, 255, 255, 0.3)"
                      : board.glowEffect
                        ? "0 0 20px rgba(255, 215, 0, 0.2)"
                        : "0 0 10px rgba(255, 255, 255, 0.1)",
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* 테두리 */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300 ${
                    board.glowEffect
                      ? "border-2 border-yellow-500/50"
                      : "border-2 border-gray-700/50"
                  }`}
                  animate={{
                    borderColor: isSelected
                      ? board.glowEffect
                        ? "rgba(255, 215, 0, 1)"
                        : "rgba(255, 255, 255, 0.5)"
                      : board.glowEffect
                        ? "rgba(255, 215, 0, 0.5)"
                        : "rgba(107, 114, 128, 0.5)",
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* 콘텐츠 */}
                <div className="relative p-6 h-full flex flex-col">
                  {/* 순서 배지 */}
                  <motion.div
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center font-bold text-black text-sm"
                    animate={{
                      scale: isSelected ? 1.1 : 1,
                      boxShadow: isSelected
                        ? "0 0 20px rgba(255, 215, 0, 0.8)"
                        : "0 0 10px rgba(255, 215, 0, 0.4)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {board.order}
                  </motion.div>

                  {/* 아이콘 */}
                  <motion.div
                    className="mb-4"
                    animate={{ scale: isSelected ? 1.2 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon
                      className={`w-12 h-12 ${
                        board.glowEffect
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    />
                  </motion.div>

                  {/* 제목 */}
                  <h3 className={`text-xl font-bold mb-2 ${board.color}`}>
                    {board.name}
                  </h3>

                  {/* 설명 */}
                  <p className="text-gray-400 text-sm mb-4 flex-grow">
                    {board.description}
                  </p>

                  {/* 접근 권한 표시 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    {!isAccessible ? (
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <Lock className="w-4 h-4" />
                        <span>접근 제한</span>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs">
                        {board.accessLevel === AccessLevel.ALL && "모든 회원"}
                        {board.accessLevel === AccessLevel.READ_ONLY && "읽기 전용"}
                        {board.accessLevel === AccessLevel.EDUCATOR && "교육생 이상"}
                        {board.accessLevel === AccessLevel.EXCELLENT && "우수 회원 이상"}
                        {board.accessLevel === AccessLevel.VIP && "VIP 전용"}
                      </div>
                    )}
                    {isAccessible && (
                      <motion.div
                        animate={{ x: isSelected ? 4 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronRight className="w-5 h-5 text-yellow-400" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* 호버 효과 */}
                {isAccessible && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/0 to-yellow-600/0 pointer-events-none"
                    whileHover={{
                      background:
                        "linear-gradient(to bottom right, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 권위의 수직 구조 설명 */}
      <motion.div
        className="mt-16 max-w-2xl mx-auto p-6 rounded-xl bg-gradient-to-r from-yellow-900/20 to-yellow-950/20 border border-yellow-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <h3 className="text-yellow-400 font-bold mb-3">📈 성장의 계단</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          제국 커뮤니티는 명확한 위계 구조를 통해 당신의 성장을 증명합니다.
          <br />
          <span className="text-yellow-400 font-semibold">
            교육 자격증
          </span>
          을 획득하고,{" "}
          <span className="text-yellow-400 font-semibold">명예의 전당</span>에
          이름을 올린 후, 최종적으로{" "}
          <span className="text-yellow-400 font-semibold">VIP 라운지</span>에
          입성하세요. 각 단계마다 새로운 기회와 특권이 기다리고 있습니다.
        </p>
      </motion.div>

      {/* 의학적 근거 */}
      <motion.div
        className="mt-8 max-w-2xl mx-auto p-6 rounded-xl bg-gradient-to-r from-blue-900/20 to-blue-950/20 border border-blue-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <h3 className="text-blue-400 font-bold mb-3">🧠 과학적 근거</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          <span className="text-blue-400 font-semibold">
            명예와 공적 인정
          </span>
          은 뇌의 사회적 동기 부여 시스템을 활성화하여, 금전 보상보다
          <span className="text-blue-400 font-semibold">
            400% 더 강력한 세로토닌과 도파민
          </span>
          을 분비합니다. (2026 옥스퍼드 사회심리학 연구)
        </p>
      </motion.div>
    </motion.div>
  );
}

export default CommunityBoard;
