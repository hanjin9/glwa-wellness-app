/**
 * HanJin Level 계산 엔진
 * -10 ~ +10 범위의 건강 지수 자동 계산
 */

export type HealthMetricType = 
  | "sleep" 
  | "meal" 
  | "activity" 
  | "bloodPressure" 
  | "heartRate" 
  | "bloodSugar" 
  | "overall";

/**
 * HanJin Level 계산
 * @param metricType - 건강 지표 유형
 * @param value - 측정값
 * @returns HanJin Level (-10 ~ +10)
 */
export function calculateHanJinLevel(metricType: HealthMetricType, value: number): number {
  switch (metricType) {
    case "sleep":
      return calculateSleepLevel(value);
    case "meal":
      return calculateMealLevel(value);
    case "activity":
      return calculateActivityLevel(value);
    case "bloodPressure":
      return calculateBloodPressureLevel(value);
    case "heartRate":
      return calculateHeartRateLevel(value);
    case "bloodSugar":
      return calculateBloodSugarLevel(value);
    case "overall":
      return calculateOverallLevel(value);
    default:
      return 0;
  }
}

/**
 * 수면 시간 기반 HanJin Level 계산
 * 최적: 7~8시간 (+10)
 * @param sleepHours - 수면 시간
 */
function calculateSleepLevel(sleepHours: number): number {
  if (sleepHours >= 7 && sleepHours <= 8) return 10;
  if (sleepHours >= 6.5 && sleepHours < 7) return 8;
  if (sleepHours > 8 && sleepHours <= 8.5) return 8;
  if (sleepHours >= 6 && sleepHours < 6.5) return 6;
  if (sleepHours > 8.5 && sleepHours <= 9) return 6;
  if (sleepHours >= 5 && sleepHours < 6) return 4;
  if (sleepHours > 9 && sleepHours <= 10) return 4;
  if (sleepHours >= 4 && sleepHours < 5) return 2;
  if (sleepHours > 10 && sleepHours <= 11) return 2;
  if (sleepHours < 4 || sleepHours > 11) return -10;
  return 0;
}

/**
 * 영양 점수 기반 HanJin Level 계산
 * 최적: 8~10점 (+10)
 * @param nutritionScore - 영양 점수 (1-10)
 */
function calculateMealLevel(nutritionScore: number): number {
  if (nutritionScore >= 8 && nutritionScore <= 10) return 10;
  if (nutritionScore >= 7 && nutritionScore < 8) return 8;
  if (nutritionScore >= 6 && nutritionScore < 7) return 6;
  if (nutritionScore >= 5 && nutritionScore < 6) return 4;
  if (nutritionScore >= 4 && nutritionScore < 5) return 2;
  if (nutritionScore < 4) return -10;
  return 0;
}

/**
 * 활동 시간 기반 HanJin Level 계산
 * 최적: 30~60분 (+10)
 * @param durationMinutes - 활동 시간 (분)
 */
function calculateActivityLevel(durationMinutes: number): number {
  if (durationMinutes >= 30 && durationMinutes <= 60) return 10;
  if (durationMinutes >= 20 && durationMinutes < 30) return 8;
  if (durationMinutes > 60 && durationMinutes <= 90) return 8;
  if (durationMinutes >= 10 && durationMinutes < 20) return 6;
  if (durationMinutes > 90 && durationMinutes <= 120) return 6;
  if (durationMinutes >= 5 && durationMinutes < 10) return 4;
  if (durationMinutes > 120 && durationMinutes <= 180) return 4;
  if (durationMinutes < 5 || durationMinutes > 180) return -10;
  return 0;
}

/**
 * 혈압 기반 HanJin Level 계산
 * 최적: 수축기 120 이하 (+10)
 * @param systolicBP - 수축기 혈압
 */
function calculateBloodPressureLevel(systolicBP: number): number {
  if (systolicBP <= 120) return 10;
  if (systolicBP > 120 && systolicBP <= 130) return 8;
  if (systolicBP > 130 && systolicBP <= 140) return 6;
  if (systolicBP > 140 && systolicBP <= 160) return 2;
  if (systolicBP > 160) return -10;
  return 0;
}

/**
 * 심박수 기반 HanJin Level 계산
 * 최적: 60~100 bpm (+10)
 * @param heartRate - 심박수 (bpm)
 */
function calculateHeartRateLevel(heartRate: number): number {
  if (heartRate >= 60 && heartRate <= 100) return 10;
  if (heartRate >= 50 && heartRate < 60) return 8;
  if (heartRate > 100 && heartRate <= 110) return 8;
  if (heartRate >= 40 && heartRate < 50) return 6;
  if (heartRate > 110 && heartRate <= 120) return 6;
  if (heartRate >= 30 && heartRate < 40) return 2;
  if (heartRate > 120 && heartRate <= 140) return 2;
  if (heartRate < 30 || heartRate > 140) return -10;
  return 0;
}

/**
 * 혈당 기반 HanJin Level 계산
 * 최적: 공복 100 이하 (+10)
 * @param bloodSugar - 혈당 (mg/dL)
 */
function calculateBloodSugarLevel(bloodSugar: number): number {
  if (bloodSugar >= 70 && bloodSugar <= 100) return 10;
  if (bloodSugar >= 60 && bloodSugar < 70) return 8;
  if (bloodSugar > 100 && bloodSugar <= 125) return 8;
  if (bloodSugar >= 50 && bloodSugar < 60) return 6;
  if (bloodSugar > 125 && bloodSugar <= 150) return 6;
  if (bloodSugar >= 40 && bloodSugar < 50) return 2;
  if (bloodSugar > 150 && bloodSugar <= 200) return 2;
  if (bloodSugar < 40 || bloodSugar > 200) return -10;
  return 0;
}

/**
 * 종합 점수 기반 HanJin Level 계산
 * @param overallScore - 종합 점수 (1-10)
 */
function calculateOverallLevel(overallScore: number): number {
  // 점수를 -10 ~ +10 범위로 변환
  return Math.round((overallScore - 5) * 2);
}

/**
 * HanJin Level에 따른 상태 설명
 */
export function getHanJinLevelDescription(level: number): {
  level: number;
  status: string;
  emoji: string;
  color: string;
  recommendation: string;
} {
  if (level >= 8) {
    return {
      level,
      status: "최고 건강",
      emoji: "🔵",
      color: "blue",
      recommendation: "현재 상태를 유지하세요",
    };
  }
  if (level >= 5) {
    return {
      level,
      status: "활력 건강",
      emoji: "🟢",
      color: "green",
      recommendation: "좋은 상태입니다. 계속 유지하세요",
    };
  }
  if (level >= 2) {
    return {
      level,
      status: "양호",
      emoji: "🟢",
      color: "green",
      recommendation: "약간의 개선이 필요합니다",
    };
  }
  if (level >= -1) {
    return {
      level,
      status: "정상",
      emoji: "⚪",
      color: "gray",
      recommendation: "건강 관리를 시작하세요",
    };
  }
  if (level >= -4) {
    return {
      level,
      status: "주의",
      emoji: "🟡",
      color: "yellow",
      recommendation: "건강 관리가 필요합니다",
    };
  }
  if (level >= -7) {
    return {
      level,
      status: "심각",
      emoji: "🟠",
      color: "orange",
      recommendation: "집중 관리가 필요합니다",
    };
  }
  return {
    level,
    status: "최악악화",
    emoji: "🔴",
    color: "red",
    recommendation: "집중 치료가 필요합니다",
  };
}

/**
 * 일주일 평균 HanJin Level 계산
 */
export function calculateWeeklyAverageHanJinLevel(levels: number[]): number {
  if (levels.length === 0) return 0;
  const sum = levels.reduce((a: number, b: number) => a + b, 0);
  return Math.round(sum / levels.length);
}

/**
 * 월간 평균 HanJin Level 계산
 */
export function calculateMonthlyAverageHanJinLevel(levels: number[]): number {
  if (levels.length === 0) return 0;
  const sum = levels.reduce((a: number, b: number) => a + b, 0);
  return Math.round(sum / levels.length);
}
