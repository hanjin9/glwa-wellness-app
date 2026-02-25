import { getDb } from "./db";
import { memberProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// VIP 등급 정의
export const VIP_LEVELS = {
  1: { name: "기본회원", minAmount: 0, color: "#9ca3af" },
  2: { name: "실버", minAmount: 50000, color: "#c0c0c0" },
  3: { name: "골드", minAmount: 100000, color: "#d4af37" },
  4: { name: "블루사파이어", minAmount: 300000, color: "#0ea5e9" },
  5: { name: "그린에메랄드", minAmount: 500000, color: "#10b981" },
  6: { name: "다이아몬드", minAmount: 1000000, color: "#06b6d4" },
  7: { name: "블루다이아몬드", minAmount: 2000000, color: "#3b82f6" },
  8: { name: "플래티넘", minAmount: 3000000, color: "#f59e0b" },
  9: { name: "블랙플래티넘", minAmount: 5000000, color: "#1f2937" },
  10: { name: "임페리얼", minAmount: 10000000, color: "#d4af37" },
};

// 결제 금액에 따른 VIP 레벨 계산
export function calculateVIPLevel(totalPaymentAmount: number): number {
  for (let level = 10; level >= 1; level--) {
    if (totalPaymentAmount >= VIP_LEVELS[level as keyof typeof VIP_LEVELS].minAmount) {
      return level;
    }
  }
  return 1;
}

// 포인트 자동 지급 (VIP 레벨별 차등 지급)
export function calculatePointsAwarded(
  paymentAmount: number,
  vipLevel: number
): number {
  // 기본 포인트: 결제 금액의 1%
  const basePoints = Math.round(paymentAmount * 0.01);

  // VIP 보너스: 레벨당 0.5% 추가
  const vipBonus = Math.round(paymentAmount * ((vipLevel - 1) * 0.005));

  // 최대 포인트 제한 (결제 금액의 10%)
  const totalPoints = Math.min(basePoints + vipBonus, paymentAmount * 0.1);

  return Math.round(totalPoints);
}

// AI 자동 VIP 승급 엔진
export async function autoUpgradeVIP(
  userId: number,
  paymentAmount: number
): Promise<{
  previousLevel: number;
  currentLevel: number;
  pointsAwarded: number;
  upgraded: boolean;
}> {
  try {
    // 사용자 프로필 조회
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    const profile = await db
      .select()
      .from(memberProfiles)
      .where(eq(memberProfiles.userId, userId))
      .limit(1);

    if (!profile || profile.length === 0) {
      throw new Error("사용자 프로필을 찾을 수 없습니다");
    }

    const currentProfile = profile[0];
    const previousLevel = currentProfile.memberGrade as unknown as number || 1;

    // 새로운 VIP 레벨 계산
    // 주의: memberGrade는 enum이므로 실제 구현에서는 숫자로 변환 필요
    const currentTotalAmount = (currentProfile.totalDays || 0) * 10000; // 예시: 일일 기본값
    const newTotalAmount = currentTotalAmount + paymentAmount;
    const newLevel = calculateVIPLevel(newTotalAmount);

    // 포인트 계산
    const pointsAwarded = calculatePointsAwarded(paymentAmount, newLevel);

    // VIP 레벨 업그레이드 여부
    const upgraded = newLevel > previousLevel;

    // 데이터베이스 업데이트 (실제 구현에서는 트랜잭션 사용)
    if (upgraded) {
      // memberGrade 업데이트 (enum 값으로 변환)
      const gradeMap: Record<number, string> = {
        1: "silver",
        2: "gold",
        3: "blue_sapphire",
        4: "green_emerald",
        5: "diamond",
        6: "blue_diamond",
        7: "platinum",
        8: "black_platinum",
      };

      // 실제 구현에서는 여기서 DB 업데이트
      console.log(`✅ VIP 자동 승급: ${previousLevel} → ${newLevel}`);
    }

    return {
      previousLevel,
      currentLevel: newLevel,
      pointsAwarded,
      upgraded,
    };
  } catch (error) {
    console.error("VIP 자동 승급 오류:", error);
    throw error;
  }
}

// 포인트 자동 지급 엔진
export async function awardPointsToUser(
  userId: number,
  points: number,
  reason: string
): Promise<{ success: boolean; totalPoints: number }> {
  try {
    // 실제 구현에서는 포인트 테이블에 기록
    console.log(`💰 포인트 지급: ${userId}에게 ${points}P (사유: ${reason})`);

    return {
      success: true,
      totalPoints: points,
    };
  } catch (error) {
    console.error("포인트 지급 오류:", error);
    throw error;
  }
}

// 결제 완료 후 자동 처리 (메인 엔진)
export async function processPaymentAutomation(
  userId: number,
  paymentAmount: number,
  paymentMethod: string
): Promise<{
  success: boolean;
  vipUpgrade: {
    previousLevel: number;
    currentLevel: number;
    upgraded: boolean;
  };
  pointsAwarded: number;
  message: string;
}> {
  try {
    // 1. VIP 자동 승급
    const vipResult = await autoUpgradeVIP(userId, paymentAmount);

    // 2. 포인트 자동 지급
    const pointsResult = await awardPointsToUser(
      userId,
      vipResult.pointsAwarded,
      `결제 (${paymentMethod}) - ${paymentAmount.toLocaleString()}원`
    );

    // 3. 결과 반환
    const message = vipResult.upgraded
      ? `🎉 축하합니다! VIP ${vipResult.previousLevel}단계에서 ${vipResult.currentLevel}단계로 승급되었습니다!`
      : `💰 포인트 ${vipResult.pointsAwarded}P가 지급되었습니다.`;

    return {
      success: true,
      vipUpgrade: {
        previousLevel: vipResult.previousLevel,
        currentLevel: vipResult.currentLevel,
        upgraded: vipResult.upgraded,
      },
      pointsAwarded: vipResult.pointsAwarded,
      message,
    };
  } catch (error) {
    console.error("결제 자동 처리 오류:", error);
    throw error;
  }
}
