/**
 * 🎯 GLWA 무인 자동화 엔진 - 콘텐츠 압축 시스템
 * 
 * 트리거 기반 콘텐츠 압축 (Compact Mode):
 * - 미션 수령: 맞춤형 운동 + 소도구 (30% 단축)
 * - 동작 직전: 동기부여 메시지
 * - 보상 후: 요가 자세 & 스트레칭 (핵심어 중심)
 * - 게임 종료: 의학적 근거 (50% 단축)
 * - 대시보드: 오늘의 건강 팁 (헤드라인)
 * - 스트리밍: 실시간 피드백
 */

// ============================================================================
// 1️⃣ 콘텐츠 압축 데이터베이스
// ============================================================================

export interface CompactContent {
  id: string;
  category: "exercise" | "yoga" | "medical" | "tip" | "motivation";
  trigger: "mission_start" | "action_begin" | "reward" | "game_end" | "dashboard" | "streaming";
  headline: string; // 핵심어 중심 (최대 2줄)
  fullContent?: string;
  tools?: string[]; // 소도구 (수건, 요가 매트 등)
  duration?: number; // 초 단위
  difficulty?: "easy" | "medium" | "hard";
  medicalBasis?: string; // 의학적 근거 (헤드라인)
  confidence?: number; // 신뢰도 (0-100)
  tags?: string[];
}

// 맞춤형 운동 + 소도구 데이터베이스 (30% 단축)
export const EXERCISE_COMPACT_DB: Record<string, CompactContent> = {
  "neck_stretch": {
    id: "neck_stretch",
    category: "exercise",
    trigger: "mission_start",
    headline: "수건 활용 목 스트레칭",
    tools: ["수건"],
    duration: 60,
    difficulty: "easy",
    medicalBasis: "경추 유연성 증대",
    confidence: 95,
    tags: ["목", "스트레칭", "스트레스"],
  },
  "shoulder_roll": {
    id: "shoulder_roll",
    category: "exercise",
    trigger: "mission_start",
    headline: "어깨 롤 (근육 이완)",
    tools: [],
    duration: 30,
    difficulty: "easy",
    medicalBasis: "승모근 긴장 완화",
    confidence: 92,
    tags: ["어깨", "스트레칭", "긴장"],
  },
  "walking_mission": {
    id: "walking_mission",
    category: "exercise",
    trigger: "mission_start",
    headline: "빠른 걷기 (10분)",
    tools: [],
    duration: 600,
    difficulty: "medium",
    medicalBasis: "심폐 기능 강화",
    confidence: 98,
    tags: ["걷기", "유산소", "심장"],
  },
  "desk_yoga": {
    id: "desk_yoga",
    category: "yoga",
    trigger: "action_begin",
    headline: "책상 위 요가 (3분)",
    tools: ["의자"],
    duration: 180,
    difficulty: "easy",
    medicalBasis: "척추 정렬",
    confidence: 90,
    tags: ["요가", "자세", "척추"],
  },
};

// 요가 자세 & 스트레칭 데이터베이스 (핵심어 중심)
export const YOGA_COMPACT_DB: Record<string, CompactContent> = {
  "cobra_pose": {
    id: "cobra_pose",
    category: "yoga",
    trigger: "reward",
    headline: "코브라 자세 (척추이완)",
    tools: ["요가 매트"],
    duration: 30,
    difficulty: "medium",
    medicalBasis: "척추 유연성 증대",
    confidence: 94,
    tags: ["요가", "척추", "이완"],
  },
  "child_pose": {
    id: "child_pose",
    category: "yoga",
    trigger: "reward",
    headline: "아이 자세 (이완)",
    tools: ["요가 매트"],
    duration: 60,
    difficulty: "easy",
    medicalBasis: "등 근육 이완",
    confidence: 96,
    tags: ["요가", "이완", "스트레스"],
  },
  "mountain_pose": {
    id: "mountain_pose",
    category: "yoga",
    trigger: "reward",
    headline: "산 자세 (자세 교정)",
    tools: [],
    duration: 30,
    difficulty: "easy",
    medicalBasis: "자세 개선",
    confidence: 93,
    tags: ["요가", "자세", "균형"],
  },
  "butterfly_stretch": {
    id: "butterfly_stretch",
    category: "yoga",
    trigger: "reward",
    headline: "나비 스트레칭 (고관절)",
    tools: ["요가 매트"],
    duration: 45,
    difficulty: "medium",
    medicalBasis: "고관절 유연성",
    confidence: 91,
    tags: ["스트레칭", "고관절", "유연성"],
  },
};

// 의학적 근거 데이터베이스 (50% 단축 - 헤드라인)
export const MEDICAL_BASIS_COMPACT_DB: Record<string, CompactContent> = {
  "dopamine_boost": {
    id: "dopamine_boost",
    category: "medical",
    trigger: "game_end",
    headline: "도파민 2배 상승 근거",
    medicalBasis: "게임 승리 시 도파민 분비 증가 → 행복감 & 동기부여 강화",
    confidence: 97,
    tags: ["신경과학", "도파민", "동기부여"],
  },
  "sleep_longevity": {
    id: "sleep_longevity",
    category: "medical",
    trigger: "dashboard",
    headline: "수면 7시간 = 수명 연장",
    medicalBasis: "7시간 수면 → 수명 3-5년 연장 (Harvard Medical School)",
    confidence: 96,
    tags: ["수면", "장수", "건강"],
  },
  "exercise_immunity": {
    id: "exercise_immunity",
    category: "medical",
    trigger: "dashboard",
    headline: "운동 30분 = 면역력 30% 상승",
    medicalBasis: "유산소 운동 30분 → NK세포 활성화 → 면역력 증강",
    confidence: 94,
    tags: ["운동", "면역", "건강"],
  },
  "stress_cortisol": {
    id: "stress_cortisol",
    category: "medical",
    trigger: "dashboard",
    headline: "스트레스 관리 = 코르티솔 50% 감소",
    medicalBasis: "명상 & 요가 → 코르티솔 감소 → 스트레스 완화",
    confidence: 93,
    tags: ["스트레스", "호르몬", "명상"],
  },
  "hydration_brain": {
    id: "hydration_brain",
    category: "medical",
    trigger: "dashboard",
    headline: "수분 섭취 = 뇌 기능 15% 향상",
    medicalBasis: "탈수 상태 → 인지 기능 저하 / 수분 충분 → 집중력 증강",
    confidence: 92,
    tags: ["수분", "뇌", "인지"],
  },
};

// 오늘의 건강 팁 데이터베이스 (헤드라인)
export const HEALTH_TIPS_COMPACT_DB: CompactContent[] = [
  {
    id: "tip_morning",
    category: "tip",
    trigger: "dashboard",
    headline: "아침 햇빛 15분 = 생체시계 정상화",
    medicalBasis: "일광 노출 → 멜라토닌 조절 → 수면 질 개선",
    confidence: 95,
    tags: ["수면", "생체시계", "햇빛"],
  },
  {
    id: "tip_water",
    category: "tip",
    trigger: "dashboard",
    headline: "기상 직후 물 한 잔 = 신진대사 촉진",
    medicalBasis: "아침 수분 섭취 → 신진대사 30% 증가",
    confidence: 93,
    tags: ["수분", "신진대사", "건강"],
  },
  {
    id: "tip_stairs",
    category: "tip",
    trigger: "dashboard",
    headline: "계단 오르기 = 심폐 기능 강화",
    medicalBasis: "계단 운동 → 심박수 증가 → 심폐 지구력 향상",
    confidence: 94,
    tags: ["운동", "심폐", "계단"],
  },
  {
    id: "tip_breathing",
    category: "tip",
    trigger: "dashboard",
    headline: "복식호흡 5분 = 스트레스 40% 감소",
    medicalBasis: "깊은 호흡 → 부교감신경 활성화 → 이완 효과",
    confidence: 96,
    tags: ["호흡", "스트레스", "이완"],
  },
];

// 동기부여 메시지 데이터베이스
export const MOTIVATION_COMPACT_DB: CompactContent[] = [
  {
    id: "motivation_start",
    category: "motivation",
    trigger: "action_begin",
    headline: "🎯 지금 시작하면 포인트 +100 획득!",
    confidence: 100,
    tags: ["포인트", "동기부여"],
  },
  {
    id: "motivation_streak",
    category: "motivation",
    trigger: "action_begin",
    headline: "🔥 연속 3일 달성! 보너스 +50 포인트 예상",
    confidence: 100,
    tags: ["스트릭", "보너스"],
  },
  {
    id: "motivation_level",
    category: "motivation",
    trigger: "action_begin",
    headline: "⭐ 다음 미션으로 HanJin Level +1 가능!",
    confidence: 100,
    tags: ["레벨", "성장"],
  },
];

// ============================================================================
// 2️⃣ 트리거 기반 콘텐츠 매칭 엔진
// ============================================================================

export interface HealthContext {
  userId: string;
  activityType: string; // "walking", "exercise", "yoga", "game", etc.
  currentLevel: number; // HanJin Level
  recentActivities?: string[];
  healthMetrics?: {
    steps?: number;
    exerciseMinutes?: number;
    sleepHours?: number;
    stressLevel?: number;
  };
}

/**
 * AI 콘텐츠 매칭: 유저 활동과 가장 연관성 있는 운동/요가/의학 근거 자동 추출
 */
export function matchContentByTrigger(
  trigger: CompactContent["trigger"],
  context: HealthContext
): CompactContent | null {
  switch (trigger) {
    case "mission_start":
      return matchMissionStartContent(context);
    case "action_begin":
      return matchActionBeginContent(context);
    case "reward":
      return matchRewardContent(context);
    case "game_end":
      return matchGameEndContent(context);
    case "dashboard":
      return matchDashboardContent(context);
    case "streaming":
      return matchStreamingContent(context);
    default:
      return null;
  }
}

function matchMissionStartContent(context: HealthContext): CompactContent | null {
  // 활동 유형에 따른 맞춤형 운동 추천
  if (context.activityType === "walking") {
    return EXERCISE_COMPACT_DB["walking_mission"];
  }
  if (context.activityType === "stretching") {
    return EXERCISE_COMPACT_DB["neck_stretch"];
  }
  if (context.activityType === "yoga") {
    return EXERCISE_COMPACT_DB["desk_yoga"];
  }

  // 기본값: 난이도에 맞는 운동
  const exercises = Object.values(EXERCISE_COMPACT_DB);
  const matched = exercises.find((e) => e.difficulty === "easy");
  return matched || exercises[0];
}

function matchActionBeginContent(context: HealthContext): CompactContent | null {
  // 동기부여 메시지 랜덤 선택
  const motivations = MOTIVATION_COMPACT_DB;
  return motivations[Math.floor(Math.random() * motivations.length)];
}

function matchRewardContent(context: HealthContext): CompactContent | null {
  // 보상 후 요가 자세 추천
  const yogaPoses = Object.values(YOGA_COMPACT_DB);

  // 스트레스 레벨에 따른 자세 추천
  if (context.healthMetrics?.stressLevel && context.healthMetrics.stressLevel < -5) {
    return YOGA_COMPACT_DB["child_pose"]; // 이완
  }
  if (context.healthMetrics?.stressLevel && context.healthMetrics.stressLevel > 5) {
    return YOGA_COMPACT_DB["mountain_pose"]; // 자세 교정
  }

  // 기본값: 랜덤
  return yogaPoses[Math.floor(Math.random() * yogaPoses.length)];
}

function matchGameEndContent(context: HealthContext): CompactContent | null {
  // 게임 종료 후 의학적 근거 제공
  const medicalBases = Object.values(MEDICAL_BASIS_COMPACT_DB);
  return medicalBases[Math.floor(Math.random() * medicalBases.length)];
}

function matchDashboardContent(context: HealthContext): CompactContent | null {
  // 대시보드: 오늘의 건강 팁
  const tips = HEALTH_TIPS_COMPACT_DB;

  // 시간대별 팁 추천
  const hour = new Date().getHours();
  if (hour < 12) {
    // 아침
    return tips.find((t) => t.id === "tip_morning") || tips[0];
  }
  if (hour < 18) {
    // 오후
    return tips.find((t) => t.id === "tip_stairs") || tips[2];
  }
  // 저녁
  return tips.find((t) => t.id === "tip_breathing") || tips[3];
}

function matchStreamingContent(context: HealthContext): CompactContent | null {
  // 스트리밍: 실시간 피드백 (의학적 근거)
  const medicalBases = Object.values(MEDICAL_BASIS_COMPACT_DB);
  return medicalBases[Math.floor(Math.random() * medicalBases.length)];
}

// ============================================================================
// 3️⃣ 휘발성 지식 카드 생성 (Badge 형태)
// ============================================================================

export interface VolatileKnowledgeCard {
  id: string;
  trigger: CompactContent["trigger"];
  headline: string;
  medicalBasis?: string;
  tools?: string[];
  duration?: number;
  confidence?: number;
  timestamp: number;
  expiresAt: number; // 자동 삭제 시간
  isRead: boolean;
  badge?: {
    count: number; // 미읽음 개수
    icon: string; // 이모지
  };
}

/**
 * 휘발성 지식 카드 생성 (메시지 앱 Badge처럼 표시)
 */
export function createVolatileKnowledgeCard(
  content: CompactContent,
  expirationMinutes: number = 30
): VolatileKnowledgeCard {
  const now = Date.now();
  return {
    id: `card_${content.id}_${now}`,
    trigger: content.trigger,
    headline: content.headline,
    medicalBasis: content.medicalBasis,
    tools: content.tools,
    duration: content.duration,
    confidence: content.confidence,
    timestamp: now,
    expiresAt: now + expirationMinutes * 60 * 1000,
    isRead: false,
    badge: {
      count: 1,
      icon: getIconByCategory(content.category),
    },
  };
}

function getIconByCategory(category: CompactContent["category"]): string {
  const icons: Record<CompactContent["category"], string> = {
    exercise: "🏃",
    yoga: "🧘",
    medical: "⚕️",
    tip: "💡",
    motivation: "🔥",
  };
  return icons[category];
}

// ============================================================================
// 4️⃣ 카드 관리 시스템
// ============================================================================

export class VolatileCardManager {
  private cards: Map<string, VolatileKnowledgeCard> = new Map();

  /**
   * 카드 추가
   */
  addCard(card: VolatileKnowledgeCard): void {
    this.cards.set(card.id, card);
  }

  /**
   * 카드 읽음 표시
   */
  markAsRead(cardId: string): void {
    const card = this.cards.get(cardId);
    if (card) {
      card.isRead = true;
    }
  }

  /**
   * 카드 삭제
   */
  deleteCard(cardId: string): void {
    this.cards.delete(cardId);
  }

  /**
   * 만료된 카드 자동 정리
   */
  cleanupExpiredCards(): void {
    const now = Date.now();
    const expiredIds: string[] = [];

    this.cards.forEach((card, id) => {
      if (card.expiresAt < now) {
        expiredIds.push(id);
      }
    });

    expiredIds.forEach((id) => this.cards.delete(id));
  }

  /**
   * 미읽음 카드 개수
   */
  getUnreadCount(): number {
    return Array.from(this.cards.values()).filter((c) => !c.isRead).length;
  }

  /**
   * 모든 카드 조회
   */
  getAllCards(): VolatileKnowledgeCard[] {
    return Array.from(this.cards.values());
  }

  /**
   * 미읽음 카드만 조회
   */
  getUnreadCards(): VolatileKnowledgeCard[] {
    return Array.from(this.cards.values()).filter((c) => !c.isRead);
  }

  /**
   * 트리거별 카드 조회
   */
  getCardsByTrigger(trigger: CompactContent["trigger"]): VolatileKnowledgeCard[] {
    return Array.from(this.cards.values()).filter((c) => c.trigger === trigger);
  }
}

// ============================================================================
// 5️⃣ 글로벌 카드 매니저 인스턴스
// ============================================================================

export const globalCardManager = new VolatileCardManager();

// 주기적 정리 (1분마다)
setInterval(() => {
  globalCardManager.cleanupExpiredCards();
}, 60000);

export default {
  EXERCISE_COMPACT_DB,
  YOGA_COMPACT_DB,
  MEDICAL_BASIS_COMPACT_DB,
  HEALTH_TIPS_COMPACT_DB,
  MOTIVATION_COMPACT_DB,
  matchContentByTrigger,
  createVolatileKnowledgeCard,
  VolatileCardManager,
  globalCardManager,
};
