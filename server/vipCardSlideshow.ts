/**
 * 👑 10단계 VIP 카드 특화 슬라이드 시스템
 * 
 * VIP 퀸 골든 팰리스 영상 기반
 * - 10단계 카드별 비주얼 이식
 * - 등급별 색상 동기화
 * - 다국어 낭독 시스템
 * - 루프 배경화
 */

import { VIP_LEVELS, COLOR_SCHEME } from "./vipGoldenEngine";

/**
 * VIP 등급별 영상 매핑
 */
export const VIP_LEVEL_VIDEO_MAP: Record<number, {
  videoClip: string;
  backgroundColor: string;
  accentColor: string;
  duration: number;
}> = {
  1: {
    videoClip: "vip_queen_intro.mp4", // 골드 인트로
    backgroundColor: "#0a0a0a",
    accentColor: "#C0C0C0", // 실버
    duration: 2000,
  },
  2: {
    videoClip: "vip_queen_intro.mp4", // 골드 인트로
    backgroundColor: "#0a0a0a",
    accentColor: "#FFD700", // 골드
    duration: 2000,
  },
  3: {
    videoClip: "vip_queen_emerald.mp4", // 에메랄드빛
    backgroundColor: "#0a0a0a",
    accentColor: "#0F52BA", // 블루 사파이어
    duration: 2000,
  },
  4: {
    videoClip: "vip_queen_emerald.mp4", // 에메랄드빛
    backgroundColor: "#0a0a0a",
    accentColor: "#50C878", // 그린 에메랄드
    duration: 2000,
  },
  5: {
    videoClip: "vip_queen_emerald.mp4", // 에메랄드빛
    backgroundColor: "#0a0a0a",
    accentColor: "#B9F2FF", // 다이아몬드
    duration: 2000,
  },
  6: {
    videoClip: "vip_queen_emerald.mp4", // 에메랄드빛
    backgroundColor: "#0a0a0a",
    accentColor: "#0047AB", // 블루 다이아몬드
    duration: 2000,
  },
  7: {
    videoClip: "vip_queen_finale.mp4", // 로고 피날레
    backgroundColor: "#0a0a0a",
    accentColor: "#E5E4E2", // 플래티넘
    duration: 3000,
  },
  8: {
    videoClip: "vip_queen_finale.mp4", // 로고 피날레
    backgroundColor: "#0a0a0a",
    accentColor: "#1a1a1a", // 블랙 플래티넘
    duration: 3000,
  },
  9: {
    videoClip: "vip_queen_finale.mp4", // 로고 피날레
    backgroundColor: "#0a0a0a",
    accentColor: "#FFD700", // 로열 크라운
    duration: 3000,
  },
  10: {
    videoClip: "vip_queen_finale.mp4", // 로고 피날레
    backgroundColor: "#0a0a0a",
    accentColor: "#DAA520", // 임페리얼 스론
    duration: 3000,
  },
};

/**
 * VIP 등급별 다국어 축하 메시지
 */
export const VIP_LEVEL_MESSAGES: Record<number, Record<string, string>> = {
  1: {
    ko: "실버 등급에 오신 것을 환영합니다",
    en: "Welcome to Silver Level",
    ja: "シルバーレベルへようこそ",
    zh: "欢迎来到白银级别",
    es: "Bienvenido a Nivel Plata",
  },
  2: {
    ko: "골드 등급에 오신 것을 환영합니다",
    en: "Welcome to Gold Level",
    ja: "ゴールドレベルへようこそ",
    zh: "欢迎来到黄金级别",
    es: "Bienvenido a Nivel Oro",
  },
  3: {
    ko: "블루 사파이어 등급에 오신 것을 환영합니다",
    en: "Welcome to Blue Sapphire Level",
    ja: "ブルーサファイアレベルへようこそ",
    zh: "欢迎来到蓝宝石级别",
    es: "Bienvenido a Nivel Zafiro Azul",
  },
  4: {
    ko: "그린 에메랄드 등급에 오신 것을 환영합니다",
    en: "Welcome to Green Emerald Level",
    ja: "グリーンエメラルドレベルへようこそ",
    zh: "欢迎来到绿翡翠级别",
    es: "Bienvenido a Nivel Esmeralda Verde",
  },
  5: {
    ko: "다이아몬드 등급에 오신 것을 환영합니다",
    en: "Welcome to Diamond Level",
    ja: "ダイアモンドレベルへようこそ",
    zh: "欢迎来到钻石级别",
    es: "Bienvenido a Nivel Diamante",
  },
  6: {
    ko: "블루 다이아몬드 등급에 오신 것을 환영합니다",
    en: "Welcome to Blue Diamond Level",
    ja: "ブルーダイアモンドレベルへようこそ",
    zh: "欢迎来到蓝钻石级别",
    es: "Bienvenido a Nivel Diamante Azul",
  },
  7: {
    ko: "플래티넘 등급에 오신 것을 환영합니다",
    en: "Welcome to Platinum Level",
    ja: "プラチナレベルへようこそ",
    zh: "欢迎来到白金级别",
    es: "Bienvenido a Nivel Platino",
  },
  8: {
    ko: "블랙 플래티넘 등급에 오신 것을 환영합니다",
    en: "Welcome to Black Platinum Level",
    ja: "ブラックプラチナレベルへようこそ",
    zh: "欢迎来到黑色白金级别",
    es: "Bienvenido a Nivel Platino Negro",
  },
  9: {
    ko: "로열 크라운 등급에 오신 것을 환영합니다",
    en: "Welcome to Royal Crown Level",
    ja: "ロイヤルクラウンレベルへようこそ",
    zh: "欢迎来到皇家王冠级别",
    es: "Bienvenido a Nivel Corona Real",
  },
  10: {
    ko: "귀하는 제국의 임페리얼 스론 등급입니다",
    en: "You are now Imperial Throne Level",
    ja: "あなたは帝国の玉座レベルです",
    zh: "您现在是帝国皇座级别",
    es: "Usted es ahora Nivel Trono Imperial",
  },
};

/**
 * VIP 카드 슬라이드 설정
 */
export interface VIPCardSlideConfig {
  vipLevel: number;
  videoClip: string;
  cardImage: string;
  backgroundColor: string;
  accentColor: string;
  message: string;
  language: string;
  duration: number;
  autoPlay: boolean;
  loop: boolean;
}

/**
 * VIP 카드 슬라이드 생성
 */
export function createVIPCardSlideConfig(
  vipLevel: number,
  cardImage: string,
  language: string = "ko",
  autoPlay: boolean = true,
  loop: boolean = false
): VIPCardSlideConfig {
  const videoMap = VIP_LEVEL_VIDEO_MAP[vipLevel];
  const messages = VIP_LEVEL_MESSAGES[vipLevel];

  return {
    vipLevel,
    videoClip: videoMap.videoClip,
    cardImage,
    backgroundColor: videoMap.backgroundColor,
    accentColor: videoMap.accentColor,
    message: messages[language] || messages.en,
    language,
    duration: videoMap.duration,
    autoPlay,
    loop,
  };
}

/**
 * 텍스트 하이재킹 (VIP 로열 용어)
 */
const VIP_ROYAL_TEXT_MAP: Record<string, string> = {
  "Luxury Style": "GLWA ROYAL MEMBERSHIP",
  "Premium": "PREMIUM CLASS",
  "No Plugin": "EXCLUSIVE PRIVILEGE",
  "Welcome": "귀하를 환영합니다",
  "Member": "로열 멤버",
  "Status": "왕실 신분",
  "Level": "등급",
  "Card": "로열 카드",
  "Gold": "황금",
  "Platinum": "플래티넘",
  "Diamond": "다이아몬드",
  "Crown": "왕관",
  "Throne": "왕좌",
  "Empire": "제국",
  "Royal": "로열",
  "Imperial": "임페리얼",
  "Exclusive": "익스클루시브",
  "VIP": "VIP",
  "Black Platinum": "블랙 플래티넘",
  "Blue Diamond": "블루 다이아몬드",
};

/**
 * 텍스트 하이재킹 실행
 */
export function performRoyalTextHijacking(ocrText: string): string {
  let result = ocrText;

  Object.entries(VIP_ROYAL_TEXT_MAP).forEach(([original, replacement]) => {
    const regex = new RegExp(`\\b${original}\\b`, "gi");
    result = result.replace(regex, replacement);
  });

  return result;
}

/**
 * 루프 배경화 설정 (대시보드용)
 */
export interface LoopBackgroundConfig {
  videoClip: string;
  opacity: number;
  scale: number;
  blur: number;
  animationDuration: number;
}

export function createLoopBackgroundConfig(
  vipLevel: number
): LoopBackgroundConfig {
  const videoMap = VIP_LEVEL_VIDEO_MAP[vipLevel];

  return {
    videoClip: videoMap.videoClip,
    opacity: 0.1, // 은은한 배경
    scale: 1.2, // 약간 확대
    blur: 20, // 블러 처리
    animationDuration: videoMap.duration,
  };
}

/**
 * VIP 카드 슬라이드 애니메이션 설정
 */
export interface VIPSlideAnimation {
  cardEnter: {
    duration: number;
    delay: number;
    easing: string;
  };
  videoPlay: {
    duration: number;
    delay: number;
  };
  textAppear: {
    duration: number;
    delay: number;
  };
  voiceNarration: {
    startTime: number;
    duration: number;
  };
}

export function createVIPSlideAnimation(vipLevel: number): VIPSlideAnimation {
  const baseDuration = VIP_LEVEL_VIDEO_MAP[vipLevel].duration;

  return {
    cardEnter: {
      duration: 800,
      delay: 0,
      easing: "easeOut",
    },
    videoPlay: {
      duration: baseDuration,
      delay: 300,
    },
    textAppear: {
      duration: 600,
      delay: baseDuration / 2,
    },
    voiceNarration: {
      startTime: baseDuration / 4,
      duration: 3000,
    },
  };
}

/**
 * 0.1초 정확도 동기화 (음성 + 비주얼)
 */
export interface SyncConfig {
  videoStartTime: number;
  voiceStartTime: number;
  tolerance: number; // 밀리초
}

export function createPrecisionSyncConfig(
  videoStartTime: number = 0
): SyncConfig {
  return {
    videoStartTime,
    voiceStartTime: videoStartTime + 300, // 300ms 후 음성 시작
    tolerance: 100, // 100ms 오차 허용
  };
}

/**
 * VIP 카드 슬라이드 데이터 구조
 */
export interface VIPCardSlideData {
  id: string;
  vipLevel: number;
  config: VIPCardSlideConfig;
  animation: VIPSlideAnimation;
  syncConfig: SyncConfig;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * VIP 카드 슬라이드 생성 (전체)
 */
export function createCompleteVIPCardSlide(
  vipLevel: number,
  cardImage: string,
  language: string = "ko"
): VIPCardSlideData {
  return {
    id: `vip-slide-${vipLevel}-${Date.now()}`,
    vipLevel,
    config: createVIPCardSlideConfig(vipLevel, cardImage, language),
    animation: createVIPSlideAnimation(vipLevel),
    syncConfig: createPrecisionSyncConfig(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default {
  VIP_LEVEL_VIDEO_MAP,
  VIP_LEVEL_MESSAGES,
  createVIPCardSlideConfig,
  performRoyalTextHijacking,
  createLoopBackgroundConfig,
  createVIPSlideAnimation,
  createPrecisionSyncConfig,
  createCompleteVIPCardSlide,
};
