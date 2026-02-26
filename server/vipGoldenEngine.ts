/**
 * 🏛️ VIP 골든 엔진 - 10단계 프리미엄 카드 시스템
 * 
 * Golden Slideshow 영상 기반 VIP 멤버십 시스템
 * - 10단계 VIP 카드 이미지 오버레이
 * - 텍스트 자동 치환 (Heart Rate → 숨 레벨/GLWA 지수)
 * - 블랙 & 골드 색상 최적화
 * - 다국어 보이스 연동 (15개국 축하 메시지)
 */

import { invokeLLM } from "./_core/llm";

/**
 * VIP 등급 정의 (10단계)
 */
export const VIP_LEVELS = {
  SILVER: { level: 1, name: "Silver LEVEL", color: "#C0C0C0", points: 0 },
  GOLD: { level: 2, name: "Gold LEVEL", color: "#FFD700", points: 5000 },
  BLUE_SAPPHIRE: { level: 3, name: "Blue Sapphire LEVEL", color: "#0F52BA", points: 15000 },
  GREEN_EMERALD: { level: 4, name: "Green Emerald LEVEL", color: "#50C878", points: 30000 },
  DIAMOND: { level: 5, name: "Diamond LEVEL", color: "#B9F2FF", points: 50000 },
  BLUE_DIAMOND: { level: 6, name: "Blue Diamond LEVEL", color: "#0047AB", points: 75000 },
  PLATINUM: { level: 7, name: "Platinum LEVEL", color: "#E5E4E2", points: 100000 },
  BLACK_PLATINUM: { level: 8, name: "Black Platinum LEVEL", color: "#1a1a1a", points: 150000 },
  ROYAL_CROWN: { level: 9, name: "Royal Crown LEVEL", color: "#FFD700", points: 250000 },
  IMPERIAL_THRONE: { level: 10, name: "Imperial Throne LEVEL", color: "#DAA520", points: 500000 },
} as const;

/**
 * VIP 카드 데이터 구조
 */
export interface VIPCard {
  userId: string;
  level: number;
  levelName: string;
  cardColor: string;
  profileImage?: string;
  userName: string;
  joinDate: Date;
  points: number;
  nextLevelPoints: number;
  progressPercent: number;
  benefits: string[];
  expiryDate?: Date;
}

/**
 * 텍스트 자동 치환 매핑
 */
const TEXT_REPLACEMENT_MAP: Record<string, string> = {
  "Heart Rate": "숨 레벨",
  "Blood Pressure": "혈압 지수",
  "Oxygen": "산소 포화도",
  "Temperature": "체온 지수",
  "Sleep": "수면 질",
  "Activity": "활동량",
  "Stress": "스트레스 지수",
  "Calories": "칼로리 소모",
  "Steps": "걸음 수",
  "Distance": "이동 거리",
  "Premium": "프리미엄",
  "Luxury": "럭셔리",
  "VIP": "VIP",
  "Member": "회원",
  "Status": "상태",
  "Level": "레벨",
};

/**
 * 색상 최적화 - 블랙 & 골드 테마
 */
export const COLOR_SCHEME = {
  black_primary: "#0a0a0a",
  black_secondary: "#1a1a1a",
  black_tertiary: "#2a2a2a",
  gold_primary: "#FFD700",
  gold_secondary: "#FFC700",
  gold_dark: "#DAA520",
  silver: "#C0C0C0",
  accent_blue: "#1E90FF",
  accent_cyan: "#00CED1",
};

/**
 * 다국어 VIP 축하 메시지 생성
 */
export async function generateVIPWelcomeMessage(
  userName: string,
  vipLevel: string,
  language: string = "ko"
): Promise<string> {
  const languageMap: Record<string, string> = {
    ko: "Korean",
    en: "English",
    ja: "Japanese",
    zh: "Chinese",
    es: "Spanish",
    fr: "French",
    de: "German",
    ru: "Russian",
    ar: "Arabic",
    hi: "Hindi",
    id: "Indonesian",
    th: "Thai",
    vi: "Vietnamese",
    ms: "Malay",
    pt: "Portuguese",
  };

  const targetLanguage = languageMap[language] || "English";

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a luxury VIP membership welcome assistant. Generate a warm, prestigious welcome message in ${targetLanguage}. Keep it under 50 words. Use elegant, sophisticated language appropriate for high-end membership.`,
      },
      {
        role: "user",
        content: `Generate a welcome message for ${userName} who just achieved ${vipLevel} membership in GLWA Premium Wellness Club.`,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content || "";
  return typeof content === "string" ? content : JSON.stringify(content);
}

/**
 * VIP 카드 생성 (데이터 구조)
 */
export function createVIPCard(
  userId: string,
  userName: string,
  levelNumber: number,
  currentPoints: number,
  profileImage?: string
): VIPCard {
  const levelKey = Object.keys(VIP_LEVELS)[levelNumber - 1] as keyof typeof VIP_LEVELS;
  const levelData = VIP_LEVELS[levelKey];
  
  const nextLevelKey = Object.keys(VIP_LEVELS)[levelNumber] as keyof typeof VIP_LEVELS;
  const nextLevelPoints = nextLevelKey ? VIP_LEVELS[nextLevelKey].points : VIP_LEVELS.IMPERIAL_THRONE.points;

  const progressPercent = Math.min(
    100,
    Math.round((currentPoints / nextLevelPoints) * 100)
  );

  return {
    userId,
    level: levelData.level,
    levelName: levelData.name,
    cardColor: levelData.color,
    profileImage,
    userName,
    joinDate: new Date(),
    points: currentPoints,
    nextLevelPoints,
    progressPercent,
    benefits: getVIPBenefits(levelNumber),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년
  };
}

/**
 * VIP 레벨별 혜택 정의
 */
function getVIPBenefits(level: number): string[] {
  const baseBenefits = [
    "프리미엄 건강 분석",
    "24/7 AI 코칭",
    "우선 고객 지원",
  ];

  const levelBenefits: Record<number, string[]> = {
    1: [...baseBenefits],
    2: [...baseBenefits, "월간 건강 리포트"],
    3: [...baseBenefits, "월간 건강 리포트", "전문가 상담"],
    4: [...baseBenefits, "월간 건강 리포트", "전문가 상담", "VIP 라운지 접근"],
    5: [...baseBenefits, "월간 건강 리포트", "전문가 상담", "VIP 라운지 접근", "프리미엄 제품 할인"],
    6: [...baseBenefits, "월간 건강 리포트", "전문가 상담", "VIP 라운지 접근", "프리미엄 제품 할인", "개인 건강 매니저"],
    7: [...baseBenefits, "월간 건강 리포트", "전문가 상담", "VIP 라운지 접근", "프리미엄 제품 할인", "개인 건강 매니저", "연간 건강 검진"],
    8: [...baseBenefits, "월간 건강 리포트", "전문가 상담", "VIP 라운지 접근", "프리미엄 제품 할인", "개인 건강 매니저", "연간 건강 검진", "럭셔리 웰니스 리트릿"],
    9: [...baseBenefits, "월간 건강 리포트", "전문가 상담", "VIP 라운지 접근", "프리미엄 제품 할인", "개인 건강 매니저", "연간 건강 검진", "럭셔리 웰니스 리트릿", "글로벌 건강 네트워크"],
    10: [...baseBenefits, "월간 건강 리포트", "전문가 상담", "VIP 라운지 접근", "프리미엄 제품 할인", "개인 건강 매니저", "연간 건강 검진", "럭셔리 웰니스 리트릿", "글로벌 건강 네트워크", "황제급 개인 서비스"],
  };

  return levelBenefits[level] || baseBenefits;
}

/**
 * 텍스트 자동 치환 (OCR 결과 기반)
 */
export function replaceVideoText(ocrText: string): string {
  let result = ocrText;

  Object.entries(TEXT_REPLACEMENT_MAP).forEach(([original, replacement]) => {
    const regex = new RegExp(original, "gi");
    result = result.replace(regex, replacement);
  });

  return result;
}

/**
 * 색상 최적화 - 블랙 & 골드 필터
 */
export function applyLuxuryColorScheme(
  imageData: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(imageData);

  // 간단한 색상 변환 (실제로는 더 정교한 처리 필요)
  for (let i = 0; i < result.length; i += 4) {
    const r = result[i];
    const g = result[i + 1];
    const b = result[i + 2];
    const a = result[i + 3];

    // 밝은 부분 → 골드
    const brightness = (r + g + b) / 3;
    if (brightness > 200) {
      result[i] = 255; // R
      result[i + 1] = 215; // G
      result[i + 2] = 0; // B (골드색)
    }
    // 어두운 부분 → 검은색 유지
    else if (brightness < 50) {
      result[i] = 10;
      result[i + 1] = 10;
      result[i + 2] = 10;
    }
    // 중간 톤 → 어두운 회색
    else {
      result[i] = Math.round(brightness * 0.3);
      result[i + 1] = Math.round(brightness * 0.3);
      result[i + 2] = Math.round(brightness * 0.3);
    }

    result[i + 3] = a; // 투명도 유지
  }

  return result;
}

/**
 * VIP 카드 이미지 오버레이 (Canvas 기반)
 */
export function createVIPCardOverlay(
  canvasWidth: number,
  canvasHeight: number,
  vipCard: VIPCard
): string {
  // Canvas 시뮬레이션 (실제로는 Canvas API 사용)
  const svgContent = `
    <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <!-- 배경 -->
      <rect width="${canvasWidth}" height="${canvasHeight}" fill="${COLOR_SCHEME.black_primary}" />
      
      <!-- 카드 테두리 -->
      <rect 
        x="50" y="50" 
        width="${canvasWidth - 100}" height="${canvasHeight - 100}"
        fill="none"
        stroke="${vipCard.cardColor}"
        stroke-width="3"
        rx="20"
      />
      
      <!-- VIP 레벨 텍스트 -->
      <text 
        x="${canvasWidth / 2}" y="100"
        font-size="48"
        font-weight="bold"
        fill="${vipCard.cardColor}"
        text-anchor="middle"
      >
        ${vipCard.levelName}
      </text>
      
      <!-- 사용자 이름 -->
      <text 
        x="${canvasWidth / 2}" y="200"
        font-size="32"
        fill="${COLOR_SCHEME.gold_primary}"
        text-anchor="middle"
      >
        ${vipCard.userName}
      </text>
      
      <!-- 포인트 표시 -->
      <text 
        x="${canvasWidth / 2}" y="280"
        font-size="24"
        fill="${COLOR_SCHEME.silver}"
        text-anchor="middle"
      >
        Points: ${vipCard.points.toLocaleString()}
      </text>
      
      <!-- 진행률 바 -->
      <rect 
        x="100" y="320"
        width="${canvasWidth - 200}" height="20"
        fill="${COLOR_SCHEME.black_tertiary}"
        rx="10"
      />
      <rect 
        x="100" y="320"
        width="${((canvasWidth - 200) * vipCard.progressPercent) / 100}" height="20"
        fill="${COLOR_SCHEME.gold_primary}"
        rx="10"
      />
      
      <!-- 진행률 텍스트 -->
      <text 
        x="${canvasWidth / 2}" y="370"
        font-size="18"
        fill="${COLOR_SCHEME.silver}"
        text-anchor="middle"
      >
        ${vipCard.progressPercent}% to Next Level
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;
}

/**
 * VIP 입장 인트로 애니메이션 설정
 */
export interface VIPIntroAnimation {
  duration: number; // 밀리초
  delay: number;
  easing: string;
  effects: string[];
}

export const VIP_INTRO_ANIMATIONS: Record<number, VIPIntroAnimation> = {
  1: {
    duration: 1500,
    delay: 0,
    easing: "easeInOut",
    effects: ["fade", "slideUp"],
  },
  2: {
    duration: 2000,
    delay: 500,
    easing: "easeInOut",
    effects: ["fade", "slideUp", "scale"],
  },
  3: {
    duration: 2500,
    delay: 1000,
    easing: "easeInOut",
    effects: ["fade", "slideUp", "scale", "rotate"],
  },
  4: {
    duration: 3000,
    delay: 1500,
    easing: "easeInOut",
    effects: ["fade", "slideUp", "scale", "rotate", "glow"],
  },
  5: {
    duration: 3500,
    delay: 2000,
    easing: "easeInOut",
    effects: ["fade", "slideUp", "scale", "rotate", "glow", "pulse"],
  },
  6: {
    duration: 4000,
    delay: 2500,
    easing: "easeInOut",
    effects: ["fade", "slideUp", "scale", "rotate", "glow", "pulse", "shimmer"],
  },
  7: {
    duration: 4500,
    delay: 3000,
    easing: "easeInOut",
    effects: ["fade", "slideUp", "scale", "rotate", "glow", "pulse", "shimmer", "crown"],
  },
  8: {
    duration: 5000,
    delay: 3500,
    easing: "easeInOut",
    effects: ["fade", "slideUp", "scale", "rotate", "glow", "pulse", "shimmer", "crown", "throne"],
  },
  9: {
    duration: 5500,
    delay: 4000,
    easing: "easeInOut",
    effects: ["fade", "slideUp", "scale", "rotate", "glow", "pulse", "shimmer", "crown", "throne", "royal"],
  },
  10: {
    duration: 6000,
    delay: 4500,
    easing: "easeInOut",
    effects: ["fade", "slideUp", "scale", "rotate", "glow", "pulse", "shimmer", "crown", "throne", "royal", "imperial"],
  },
};

/**
 * VIP 등급 승급 축하 메시지 생성
 */
export async function generateLevelUpMessage(
  userName: string,
  newLevel: string,
  language: string = "ko"
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a luxury VIP membership congratulations message generator. Generate an exciting, prestigious level-up message in ${language}. Keep it under 30 words. Use celebratory language.`,
      },
      {
        role: "user",
        content: `${userName} just upgraded to ${newLevel}. Generate a congratulation message.`,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content || "";
  return typeof content === "string" ? content : JSON.stringify(content);
}

export default {
  VIP_LEVELS,
  COLOR_SCHEME,
  TEXT_REPLACEMENT_MAP,
  generateVIPWelcomeMessage,
  createVIPCard,
  replaceVideoText,
  applyLuxuryColorScheme,
  createVIPCardOverlay,
  VIP_INTRO_ANIMATIONS,
  generateLevelUpMessage,
};
