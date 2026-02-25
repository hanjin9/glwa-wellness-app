/**
 * HanJin Level System (-10 ~ +10)
 * GLWA 앱의 절대 불변 정책: 거의 모든 측정 부분에 사용
 * 
 * -10 ~ -8: 최악악화 (집중치료) - 빨강
 * -7 ~ -5: 심각 (집중관리) - 주황
 * -4 ~ -2: 주의 (관리) - 노랑
 * -1 ~ +1: 정상 - 회색
 * +2 ~ +4: 양호 - 연초록
 * +5 ~ +7: 활력건강 - 초록
 * +8 ~ +10: 최고 - 진파랑
 */

export interface HanJinLevel {
  value: number; // -10 ~ +10
  label: string;
  category: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  hexColor: string;
}

/**
 * HanJin Level 값에 따른 색상 및 라벨 반환
 */
export function getHanJinLevelInfo(value: number): HanJinLevel {
  // -10 ~ -8: 최악악화 (집중치료)
  if (value <= -8) {
    return {
      value,
      label: "최악악화",
      category: "집중치료",
      color: "text-red-700",
      bgColor: "bg-red-500/30",
      borderColor: "border-red-500/60",
      icon: "🔴",
      hexColor: "#dc2626",
    };
  }

  // -7 ~ -5: 심각 (집중관리)
  if (value <= -5) {
    return {
      value,
      label: "심각",
      category: "집중관리",
      color: "text-orange-600",
      bgColor: "bg-orange-500/30",
      borderColor: "border-orange-500/60",
      icon: "🟠",
      hexColor: "#f97316",
    };
  }

  // -4 ~ -2: 주의 (관리)
  if (value <= -2) {
    return {
      value,
      label: "주의",
      category: "관리",
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/30",
      borderColor: "border-yellow-500/60",
      icon: "🟡",
      hexColor: "#eab308",
    };
  }

  // -1 ~ +1: 정상
  if (value <= 1) {
    return {
      value,
      label: "정상",
      category: "기준",
      color: "text-gray-400",
      bgColor: "bg-gray-500/30",
      borderColor: "border-gray-500/60",
      icon: "⚪",
      hexColor: "#9ca3af",
    };
  }

  // +2 ~ +4: 양호
  if (value <= 4) {
    return {
      value,
      label: "양호",
      category: "개선",
      color: "text-lime-500",
      bgColor: "bg-lime-500/30",
      borderColor: "border-lime-500/60",
      icon: "🟢",
      hexColor: "#a3e635",
    };
  }

  // +5 ~ +7: 활력건강
  if (value <= 7) {
    return {
      value,
      label: "활력건강",
      category: "우수",
      color: "text-green-600",
      bgColor: "bg-green-500/30",
      borderColor: "border-green-500/60",
      icon: "🟢",
      hexColor: "#22c55e",
    };
  }

  // +8 ~ +10: 최고
  return {
    value,
    label: "최고",
    category: "탁월",
    color: "text-blue-700",
    bgColor: "bg-blue-500/30",
    borderColor: "border-blue-500/60",
    icon: "🔵",
    hexColor: "#1e40af",
  };
}

/**
 * HanJin Level 슬라이더 배경 그래디언트
 */
export function getHanJinGradient(): string {
  return `linear-gradient(to right, 
    #dc2626 0%,      /* -10: 최악악화 - 빨강 */
    #f97316 25%,     /* -5: 심각 - 주황 */
    #eab308 37.5%,   /* -2: 주의 - 노랑 */
    #9ca3af 50%,     /* 0: 정상 - 회색 */
    #a3e635 62.5%,   /* +4: 양호 - 연초록 */
    #22c55e 75%,     /* +7: 활력건강 - 초록 */
    #1e40af 100%)`;  /* +10: 최고 - 진파랑 */
}

/**
 * HanJin Level 표시 형식
 */
export function formatHanJinLevel(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }
  return String(value);
}

/**
 * 두 HanJin Level 값 비교
 */
export function compareHanJinLevels(
  baseline: number,
  current: number
): { change: number; trend: "up" | "down" | "stable"; label: string } {
  const change = current - baseline;

  if (change > 0) {
    return {
      change,
      trend: "up",
      label: `+${change} (개선)`,
    };
  }
  if (change < 0) {
    return {
      change,
      trend: "down",
      label: `${change} (악화)`,
    };
  }
  return {
    change: 0,
    trend: "stable",
    label: "0 (유지)",
  };
}

/**
 * HanJin Level 범위 검증
 */
export function validateHanJinLevel(value: number): boolean {
  return value >= -10 && value <= 10 && Number.isInteger(value);
}

/**
 * 여러 HanJin Level 값의 평균 계산
 */
export function averageHanJinLevels(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / values.length);
}

/**
 * HanJin Level 기반 AI 피드백 생성
 */
export function generateHanJinFeedback(value: number, metric: string): string {
  if (value <= -8) {
    return `🚨 ${metric}이(가) 최악 상태입니다. 즉시 전문가 상담 및 집중 치료가 필요합니다.`;
  }
  if (value <= -5) {
    return `⚠️ ${metric}이(가) 심각한 상태입니다. 집중 관리와 전문가 상담을 권장합니다.`;
  }
  if (value <= -2) {
    return `📊 ${metric}이(가) 주의 상태입니다. 생활 습관 개선이 필요합니다.`;
  }
  if (value <= 1) {
    return `✅ ${metric}이(가) 정상 범위입니다. 현재 상태를 유지하세요.`;
  }
  if (value <= 4) {
    return `📈 ${metric}이(가) 양호 상태입니다. 좋은 추세를 계속 유지하세요!`;
  }
  if (value <= 7) {
    return `🎉 ${metric}이(가) 활력 건강 상태입니다! 현재 습관을 계속 유지하세요.`;
  }
  return `🏆 ${metric}이(가) 최고 상태입니다! 훌륭한 성과를 축하합니다!`;
}

/**
 * HanJin Level 기반 색상 코드 (Hex)
 */
export const HAN_JIN_COLORS = {
  CRITICAL_DOWN: "#dc2626", // -10 ~ -8: 최악악화
  SEVERE: "#f97316", // -7 ~ -5: 심각
  WARNING: "#eab308", // -4 ~ -2: 주의
  NORMAL: "#9ca3af", // -1 ~ +1: 정상
  GOOD: "#a3e635", // +2 ~ +4: 양호
  EXCELLENT: "#22c55e", // +5 ~ +7: 활력건강
  SUPERIOR: "#1e40af", // +8 ~ +10: 최고
};

/**
 * HanJin Level 카테고리별 설명
 */
export const HAN_JIN_CATEGORIES = {
  CRITICAL_DOWN: { label: "최악악화", action: "집중치료", color: "#dc2626" },
  SEVERE: { label: "심각", action: "집중관리", color: "#f97316" },
  WARNING: { label: "주의", action: "관리", color: "#eab308" },
  NORMAL: { label: "정상", action: "유지", color: "#9ca3af" },
  GOOD: { label: "양호", action: "개선", color: "#a3e635" },
  EXCELLENT: { label: "활력건강", action: "우수", color: "#22c55e" },
  SUPERIOR: { label: "최고", action: "탁월", color: "#1e40af" },
};
