/**
 * 포인트 보상 시스템
 * 모든 활동에서 포인트를 자동으로 적립하는 통합 로직
 */

import * as db from "./db";

export interface RewardConfig {
  missionCompletion: number; // 미션 완료: 최대 2000 포인트
  gameWin: number; // 게임 승리: 최대 1000 포인트
  gameLoss: number; // 게임 패배: 최소 100 포인트
  healthImprovement: number; // 건강 개선: 최대 500 포인트
  sleepQuality: number; // 숙면 감지: 최대 300 포인트
  attendanceBonus: number; // 일일 출석: 100 포인트
  tierBonus: number; // 등급 상승 보너스: 등급별 차등
}

export const DEFAULT_REWARD_CONFIG: RewardConfig = {
  missionCompletion: 2000,
  gameWin: 1000,
  gameLoss: 100,
  healthImprovement: 500,
  sleepQuality: 300,
  attendanceBonus: 100,
  tierBonus: 500,
};

/**
 * 미션 완료 포인트 적립
 */
export async function awardMissionPoints(
  userId: number,
  missionId: string,
  difficulty: "low" | "medium" | "high",
  config: RewardConfig = DEFAULT_REWARD_CONFIG
): Promise<{ amount: number } | null> {
  const difficultyMultiplier = {
    low: 0.5,
    medium: 1.0,
    high: 1.5,
  };

  const points = Math.round(config.missionCompletion * difficultyMultiplier[difficulty]);

  await db.addPointsTransaction({
    userId,
    type: "earn",
    amount: points,
    balance: 0, // DB에서 계산됨
    source: "mission",
    description: `미션 완료 (${difficulty}) - ${points} 포인트`,
    referenceId: missionId,
  });
  return { amount: points };
}

/**
 * 게임 결과 포인트 적립
 */
export async function awardGamePoints(
  userId: number,
  gameId: string,
  result: "win" | "loss",
  difficulty: "easy" | "medium" | "hard",
  config: RewardConfig = DEFAULT_REWARD_CONFIG
): Promise<{ amount: number } | null> {
  const difficultyMultiplier = {
    easy: 0.5,
    medium: 1.0,
    hard: 1.5,
  };

  let points = 0;
  if (result === "win") {
    points = Math.round(config.gameWin * difficultyMultiplier[difficulty]);
  } else {
    points = config.gameLoss;
  }

  await db.addPointsTransaction({
    userId,
    type: "earn",
    amount: points,
    balance: 0,
    source: "event",
    description: `게임 ${result === "win" ? "승리" : "패배"} - ${gameId} - ${points} 포인트`,
    referenceId: gameId,
  });
  return { amount: points };
}

/**
 * 건강 개선 포인트 적립 (AI 자동 감지)
 */
export async function awardHealthImprovementPoints(
  userId: number,
  healthMetric: string,
  improvementScore: number, // 0-100
  config: RewardConfig = DEFAULT_REWARD_CONFIG
): Promise<{ amount: number } | null> {
  // 개선도에 따른 포인트 계산 (0-100 → 0-config.healthImprovement)
  const points = Math.round((improvementScore / 100) * config.healthImprovement);

  if (points < 10) return null; // 최소 10포인트 이상만 적립

  await db.addPointsTransaction({
    userId,
    type: "earn",
    amount: points,
    balance: 0,
    source: "event",
    description: `건강 개선 - ${healthMetric} (${improvementScore}%) - ${points} 포인트`,
    referenceId: `health-${healthMetric}-${Date.now()}`,
  });
  return { amount: points };
}

/**
 * 숙면 감지 포인트 적립 (센서 기반)
 */
export async function awardSleepQualityPoints(
  userId: number,
  sleepHours: number,
  sleepQuality: number, // 0-100
  config: RewardConfig = DEFAULT_REWARD_CONFIG
): Promise<{ amount: number } | null> {
  // 수면 시간과 품질 모두 고려
  const qualityBonus = (sleepQuality / 100) * config.sleepQuality;
  const durationBonus = Math.min(sleepHours / 8, 1) * (config.sleepQuality * 0.5);
  const points = Math.round(qualityBonus + durationBonus);

  if (points < 10) return null;

  await db.addPointsTransaction({
    userId,
    type: "earn",
    amount: points,
    balance: 0,
    source: "event",
    description: `숙면 감지 - ${sleepHours}시간, 품질 ${sleepQuality}% - ${points} 포인트`,
    referenceId: `sleep-${Date.now()}`,
  });
  return { amount: points };
}

/**
 * 일일 출석 보너스
 */
export async function awardAttendanceBonus(
  userId: number,
  consecutiveDays: number,
  config: RewardConfig = DEFAULT_REWARD_CONFIG
): Promise<{ amount: number } | null> {
  // 연속 출석 일수에 따른 배수 적용 (최대 2배)
  const multiplier = Math.min(1 + (consecutiveDays / 30), 2);
  const points = Math.round(config.attendanceBonus * multiplier);

  await db.addPointsTransaction({
    userId,
    type: "earn",
    amount: points,
    balance: 0,
    source: "attendance",
    description: `일일 출석 보너스 (${consecutiveDays}일 연속) - ${points} 포인트`,
    referenceId: `attendance-${new Date().toISOString().split("T")[0]}`,
  });
  return { amount: points };
}

/**
 * 등급 상승 보너스
 */
export async function awardTierUpBonus(
  userId: number,
  newTier: string,
  config: RewardConfig = DEFAULT_REWARD_CONFIG
): Promise<{ amount: number } | null> {
  const tierBonusMap: { [key: string]: number } = {
    silver: 500,
    gold: 1000,
    emerald: 1500,
    green_emerald: 2000,
    sapphire: 2500,
    blue_sapphire: 3000,
    diamond: 5000,
    blue_diamond: 7500,
    platinum: 10000,
    black_platinum: 15000,
  };

  const points = tierBonusMap[newTier] || config.tierBonus;

  await db.addPointsTransaction({
    userId,
    type: "earn",
    amount: points,
    balance: 0,
    source: "tier_bonus",
    description: `등급 상승 보너스 - ${newTier} 등급 달성 - ${points} 포인트`,
    referenceId: `tier-${newTier}-${Date.now()}`,
  });
  return { amount: points };
}

/**
 * AI 자동 보너스 포인트 적립 (센서 데이터 기반)
 * 관리자 개입 없이 자동으로 실행
 */
export async function awardAIAutoBonus(
  userId: number,
  sensorData: {
    dailySteps?: number;
    distance?: number;
    sleepHours?: number;
    sleepQuality?: number;
    heartRateAvg?: number;
    stressLevel?: number;
  },
  config: RewardConfig = DEFAULT_REWARD_CONFIG
): Promise<{ amount: number } | null> {
  let totalPoints = 0;

  // 만보 달성 보너스
  if (sensorData.dailySteps && sensorData.dailySteps >= 10000) {
    const stepsBonus = Math.round((sensorData.dailySteps / 10000) * 200);
    totalPoints += stepsBonus;
  }

  // 거리 달성 보너스
  if (sensorData.distance && sensorData.distance >= 5) {
    const distanceBonus = Math.round((sensorData.distance / 5) * 150);
    totalPoints += distanceBonus;
  }

  // 숙면 보너스
  if (sensorData.sleepHours && sensorData.sleepQuality) {
    const sleepBonus = Math.round(
      (sensorData.sleepQuality / 100) * config.sleepQuality
    );
    totalPoints += sleepBonus;
  }

  // 스트레스 감소 보너스
  if (sensorData.stressLevel && sensorData.stressLevel < 30) {
    const stressBonus = Math.round(((30 - sensorData.stressLevel) / 30) * 100);
    totalPoints += stressBonus;
  }

  if (totalPoints < 10) return null;

  await db.addPointsTransaction({
    userId,
    type: "earn",
    amount: totalPoints,
    balance: 0,
    source: "event",
    description: `AI 자동 보너스 - 센서 데이터 기반 - ${totalPoints} 포인트`,
    referenceId: `ai-bonus-${Date.now()}`,
  });
  return { amount: totalPoints };
}
