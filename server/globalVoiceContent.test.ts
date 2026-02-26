/**
 * 🌍 글로벌 보이스 + 콘텐츠 압축 통합 테스트
 */

import { describe, it, expect } from "vitest";
import {
  LANGUAGE_CONFIG,
  analyzeHealthStatus,
  type HealthContext,
} from "./globalVoiceEngine";
import {
  EXERCISE_COMPACT_DB,
  YOGA_COMPACT_DB,
  MEDICAL_BASIS_COMPACT_DB,
  HEALTH_TIPS_COMPACT_DB,
  matchContentByTrigger,
  createVolatileKnowledgeCard,
  VolatileCardManager,
} from "./contentCompressor";

describe("Global Voice + Content Compression Integration", () => {
  // ============================================================================
  // 다국어 설정 테스트
  // ============================================================================

  it("should support 14 languages", () => {
    const languages = Object.keys(LANGUAGE_CONFIG);
    expect(languages.length).toBe(14);
    expect(languages).toContain("en");
    expect(languages).toContain("zh");
    expect(languages).toContain("ja");
    expect(languages).toContain("ar");
  });

  it("should have correct language configuration", () => {
    const enConfig = LANGUAGE_CONFIG.en;
    expect(enConfig.name).toBe("English");
    expect(enConfig.provider).toBe("ElevenLabs");
    expect(enConfig.naturalness).toBe(100);
    expect(enConfig.rtl).toBe(false);
  });

  it("should support RTL languages", () => {
    const arConfig = LANGUAGE_CONFIG.ar;
    expect(arConfig.rtl).toBe(true);
    expect(arConfig.name).toBe("العربية");
  });

  // ============================================================================
  // 건강 상태 분석 테스트
  // ============================================================================

  it("should analyze health status correctly", () => {
    const healthData = {
      steps: 8500,
      exerciseMinutes: 45,
      sleepHours: 7.5,
      bloodPressure: "120/80",
      bloodSugar: 95,
      stressLevel: -2,
      moodLevel: 7,
    };

    const status = analyzeHealthStatus(healthData);

    expect(status.overallScore).toBeGreaterThan(50);
    expect(["good", "excellent", "normal"]).toContain(status.status);
    expect(["encouraging", "positive", "neutral", "celebratory"]).toContain(status.emotion);
    expect(status.hanJinLevel).toBeGreaterThan(0);
    expect(status.hanJinLevel).toBeLessThanOrEqual(10);
  });

  it("should calculate HanJin Level correctly", () => {
    const excellentHealth = {
      steps: 12000,
      exerciseMinutes: 90,
      sleepHours: 8,
      bloodPressure: "120/80",
      bloodSugar: 85,
      stressLevel: -5,
      moodLevel: 10,
    };

    const status = analyzeHealthStatus(excellentHealth);
    expect(["excellent", "good"]).toContain(status.status);
    expect(status.hanJinLevel).toBeGreaterThanOrEqual(3);
  });

  it("should detect critical health status", () => {
    const criticalHealth = {
      steps: 1000,
      exerciseMinutes: 0,
      sleepHours: 3,
      bloodPressure: "160/100",
      bloodSugar: 200,
      stressLevel: 8,
      moodLevel: 1,
    };

    const status = analyzeHealthStatus(criticalHealth);
    expect(["critical", "poor", "normal"]).toContain(status.status);
    expect(["concerned", "warning", "neutral"]).toContain(status.emotion);
    expect(status.hanJinLevel).toBeLessThanOrEqual(2);
  });

  // ============================================================================
  // 콘텐츠 매칭 테스트
  // ============================================================================

  it("should match exercise content for mission_start trigger", () => {
    const context: HealthContext = {
      userId: "test-user",
      activityType: "walking",
      currentLevel: 0,
    };

    const content = matchContentByTrigger("mission_start", context);
    expect(content).toBeDefined();
    expect(content?.category).toBe("exercise");
    expect(content?.trigger).toBe("mission_start");
  });

  it("should match yoga content for reward trigger", () => {
    const context: HealthContext = {
      userId: "test-user",
      activityType: "exercise",
      currentLevel: 0,
      healthMetrics: { stressLevel: -6 },
    };

    const content = matchContentByTrigger("reward", context);
    expect(content).toBeDefined();
    expect(content?.category).toBe("yoga");
    expect(content?.trigger).toBe("reward");
  });

  it("should match medical basis for game_end trigger", () => {
    const context: HealthContext = {
      userId: "test-user",
      activityType: "game",
      currentLevel: 0,
    };

    const content = matchContentByTrigger("game_end", context);
    expect(content).toBeDefined();
    expect(content?.category).toBe("medical");
    expect(content?.medicalBasis).toBeDefined();
  });

  it("should match health tip for dashboard trigger", () => {
    const context: HealthContext = {
      userId: "test-user",
      activityType: "daily_check",
      currentLevel: 0,
    };

    const content = matchContentByTrigger("dashboard", context);
    expect(content).toBeDefined();
    expect(content?.trigger).toBe("dashboard");
  });

  // ============================================================================
  // 휘발성 카드 테스트
  // ============================================================================

  it("should create volatile knowledge card", () => {
    const exerciseContent = EXERCISE_COMPACT_DB["neck_stretch"];
    if (!exerciseContent) throw new Error("Exercise content not found");
    const card = createVolatileKnowledgeCard(exerciseContent, 30);

    expect(card.id).toContain("card_");
    expect(card.headline).toBe("수건 활용 목 스트레칭");
    expect(card.isRead).toBe(false);
    expect(card.badge?.count).toBe(1);
    expect(card.expiresAt).toBeGreaterThan(card.timestamp);
  });

  it("should have correct expiration time", () => {
    const content = EXERCISE_COMPACT_DB["neck_stretch"];
    if (!content) throw new Error("Exercise content not found");
    const card = createVolatileKnowledgeCard(content, 30);

    const expirationMs = card.expiresAt - card.timestamp;
    expect(expirationMs).toBe(30 * 60 * 1000);
  });

  // ============================================================================
  // 카드 매니저 테스트
  // ============================================================================

  it("should manage volatile cards", () => {
    const manager = new VolatileCardManager();
    const content = EXERCISE_COMPACT_DB["neck_stretch"];
    if (!content) throw new Error("Exercise content not found");
    const card = createVolatileKnowledgeCard(content, 30);

    manager.addCard(card);
    expect(manager.getUnreadCount()).toBe(1);

    manager.markAsRead(card.id);
    expect(manager.getUnreadCount()).toBe(0);

    manager.deleteCard(card.id);
    expect(manager.getAllCards().length).toBe(0);
  });

  it("should filter cards by trigger", () => {
    const manager = new VolatileCardManager();

    const exerciseContent = EXERCISE_COMPACT_DB["neck_stretch"];
    if (!exerciseContent) throw new Error("Exercise content not found");
    const exerciseCard = createVolatileKnowledgeCard(exerciseContent, 30);

    const yogaContent = YOGA_COMPACT_DB["cobra_pose"];
    if (!yogaContent) throw new Error("Yoga content not found");
    const yogaCard = createVolatileKnowledgeCard(yogaContent, 30);

    manager.addCard(exerciseCard);
    manager.addCard(yogaCard);

    const missionCards = manager.getCardsByTrigger("mission_start");
    expect(missionCards.length).toBe(1);
    expect(missionCards[0].headline).toBe("수건 활용 목 스트레칭");

    const rewardCards = manager.getCardsByTrigger("reward");
    expect(rewardCards.length).toBe(1);
    expect(rewardCards[0].headline).toBe("코브라 자세 (척추이완)");
  });

  // ============================================================================
  // 콘텐츠 데이터베이스 테스트
  // ============================================================================

  it("should have exercise content database", () => {
    expect(Object.keys(EXERCISE_COMPACT_DB).length).toBeGreaterThan(0);
    const exercise = EXERCISE_COMPACT_DB["neck_stretch"];
    expect(exercise).toBeDefined();
    if (exercise) {
      expect(exercise.headline).toBeDefined();
      expect(exercise.tools).toBeDefined();
      expect(exercise.duration).toBeDefined();
    }
  });

  it("should have yoga content database", () => {
    expect(Object.keys(YOGA_COMPACT_DB).length).toBeGreaterThan(0);
    const yoga = YOGA_COMPACT_DB["cobra_pose"];
    expect(yoga).toBeDefined();
    if (yoga) {
      expect(yoga.headline).toBe("코브라 자세 (척추이완)");
      expect(yoga.medicalBasis).toBe("척추 유연성 증대");
    }
  });

  it("should have medical basis database", () => {
    expect(Object.keys(MEDICAL_BASIS_COMPACT_DB).length).toBeGreaterThan(0);
    const medical = MEDICAL_BASIS_COMPACT_DB["dopamine_boost"];
    expect(medical).toBeDefined();
    if (medical) {
      expect(medical.headline).toBe("도파민 2배 상승 근거");
      expect(medical.confidence).toBe(97);
    }
  });

  it("should have health tips database", () => {
    expect(HEALTH_TIPS_COMPACT_DB.length).toBeGreaterThan(0);
    const tip = HEALTH_TIPS_COMPACT_DB.find((t) => t.id === "tip_morning");
    expect(tip).toBeDefined();
    if (tip) {
      expect(tip.headline).toContain("아침");
    }
  });

  // ============================================================================
  // 압축률 검증 테스트
  // ============================================================================

  it("should have compact exercise descriptions", () => {
    const exercises = Object.values(EXERCISE_COMPACT_DB);
    exercises.forEach((exercise) => {
      if (exercise) {
        expect(exercise.headline.length).toBeLessThanOrEqual(50);
      }
    });
  });

  it("should have compact medical basis descriptions", () => {
    const medicalBases = Object.values(MEDICAL_BASIS_COMPACT_DB);
    medicalBases.forEach((basis) => {
      if (basis) {
        expect(basis.headline.length).toBeLessThanOrEqual(50);
      }
    });
  });

  it("should have compact health tips", () => {
    HEALTH_TIPS_COMPACT_DB.forEach((tip) => {
      if (tip) {
        expect(tip.headline.length).toBeLessThanOrEqual(50);
      }
    });
  });
});
