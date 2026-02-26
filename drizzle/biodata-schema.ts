import { mysqlTable, int, varchar, text, timestamp, float, json, mysqlEnum, boolean } from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════════════
// 생체 데이터 실시간 연동 시스템
// ═══════════════════════════════════════════════════════════════════════

// ─── Sleep Data (수면 데이터) ────────────────────────────────────────────
export const sleepData = mysqlTable("sleep_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recordDate: varchar("recordDate", { length: 10 }).notNull(), // YYYY-MM-DD
  bedTime: varchar("bedTime", { length: 5 }).notNull(), // HH:MM (취침 시간)
  wakeTime: varchar("wakeTime", { length: 5 }).notNull(), // HH:MM (기상 시간)
  sleepHours: float("sleepHours").notNull(), // 수면 시간 (자동 계산)
  sleepQuality: int("sleepQuality"), // 1-10 (수면 질)
  deepSleepPercentage: float("deepSleepPercentage"), // 깊은 수면 비율
  remSleepPercentage: float("remSleepPercentage"), // REM 수면 비율
  lightSleepPercentage: float("lightSleepPercentage"), // 얕은 수면 비율
  hanJinLevel: int("hanJinLevel"), // -10 ~ +10 (건강 지수)
  aiAnalysis: text("aiAnalysis"), // AI 분석 결과
  voiceFeedback: text("voiceFeedback"), // 음성 피드백 (15개국)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SleepData = typeof sleepData.$inferSelect;
export type InsertSleepData = typeof sleepData.$inferInsert;

// ─── Meal Data (식사 데이터) ────────────────────────────────────────────
export const mealData = mysqlTable("meal_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recordDate: varchar("recordDate", { length: 10 }).notNull(), // YYYY-MM-DD
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).notNull(),
  mealTime: varchar("mealTime", { length: 5 }).notNull(), // HH:MM
  foodItems: json("foodItems"), // array of {name, quantity, calories, protein, carbs, fat, fiber}
  totalCalories: float("totalCalories").notNull(),
  totalProtein: float("totalProtein"),
  totalCarbs: float("totalCarbs"),
  totalFat: float("totalFat"),
  totalFiber: float("totalFiber"),
  nutritionScore: int("nutritionScore"), // 1-10 (영양 점수)
  hanJinLevel: int("hanJinLevel"), // -10 ~ +10
  aiAnalysis: text("aiAnalysis"), // AI 분석 결과
  voiceFeedback: text("voiceFeedback"), // 음성 피드백
  photoUrl: text("photoUrl"), // 식사 사진
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MealData = typeof mealData.$inferSelect;
export type InsertMealData = typeof mealData.$inferInsert;

// ─── Activity Data (활동 데이터) ────────────────────────────────────────
export const activityData = mysqlTable("activity_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recordDate: varchar("recordDate", { length: 10 }).notNull(), // YYYY-MM-DD
  activityType: mysqlEnum("activityType", ["walking", "running", "cycling", "swimming", "yoga", "strength", "sports", "other"]).notNull(),
  startTime: varchar("startTime", { length: 5 }).notNull(), // HH:MM
  endTime: varchar("endTime", { length: 5 }).notNull(), // HH:MM
  durationMinutes: int("durationMinutes").notNull(),
  distance: float("distance"), // km
  calories: float("calories"),
  averageHeartRate: int("averageHeartRate"),
  maxHeartRate: int("maxHeartRate"),
  minHeartRate: int("minHeartRate"),
  intensity: mysqlEnum("intensity", ["low", "moderate", "high", "very_high"]),
  hanJinLevel: int("hanJinLevel"), // -10 ~ +10
  aiAnalysis: text("aiAnalysis"), // AI 분석 결과
  voiceFeedback: text("voiceFeedback"), // 음성 피드백
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActivityData = typeof activityData.$inferSelect;
export type InsertActivityData = typeof activityData.$inferInsert;

// ─── Vital Signs (생체 신호) ────────────────────────────────────────────
export const vitalSigns = mysqlTable("vital_signs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recordDate: varchar("recordDate", { length: 10 }).notNull(), // YYYY-MM-DD
  recordTime: varchar("recordTime", { length: 5 }).notNull(), // HH:MM
  systolicBP: int("systolicBP").notNull(), // 수축기 혈압
  diastolicBP: int("diastolicBP").notNull(), // 이완기 혈압
  heartRate: int("heartRate").notNull(), // 심박수
  bloodSugar: float("bloodSugar"), // 혈당 (mg/dL)
  bodyTemperature: float("bodyTemperature"), // 체온 (°C)
  oxygenSaturation: float("oxygenSaturation"), // SpO2 (%)
  bpHanJinLevel: int("bpHanJinLevel"), // 혈압 HanJin Level
  heartRateHanJinLevel: int("heartRateHanJinLevel"), // 심박수 HanJin Level
  bloodSugarHanJinLevel: int("bloodSugarHanJinLevel"), // 혈당 HanJin Level
  overallHanJinLevel: int("overallHanJinLevel"), // 종합 HanJin Level (-10 ~ +10)
  aiAnalysis: text("aiAnalysis"), // AI 분석 결과
  voiceFeedback: text("voiceFeedback"), // 음성 피드백
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VitalSigns = typeof vitalSigns.$inferSelect;
export type InsertVitalSigns = typeof vitalSigns.$inferInsert;

// ─── Daily Health Summary (일일 건강 요약) ──────────────────────────────
export const dailyHealthSummary = mysqlTable("daily_health_summary", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recordDate: varchar("recordDate", { length: 10 }).notNull(), // YYYY-MM-DD
  sleepScore: int("sleepScore"), // 1-10
  nutritionScore: int("nutritionScore"), // 1-10
  activityScore: int("activityScore"), // 1-10
  vitalScore: int("vitalScore"), // 1-10
  overallScore: int("overallScore"), // 1-10 (평균)
  hanJinLevel: int("hanJinLevel"), // -10 ~ +10
  aiAnalysis: text("aiAnalysis"), // AI 종합 분석
  voiceFeedback: text("voiceFeedback"), // 음성 피드백 (일일 요약)
  recommendations: json("recommendations"), // 추천사항 배열
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyHealthSummary = typeof dailyHealthSummary.$inferSelect;
export type InsertDailyHealthSummary = typeof dailyHealthSummary.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════
// 기능별 온보딩 가이드 영상 시스템
// ═══════════════════════════════════════════════════════════════════════

// ─── Onboarding Videos (온보딩 영상) ────────────────────────────────────
export const onboardingVideos = mysqlTable("onboarding_videos", {
  id: int("id").autoincrement().primaryKey(),
  featureKey: varchar("featureKey", { length: 100 }).notNull().unique(), // 기능 키 (예: health_check, vip_level, sleep_record)
  featureName: varchar("featureName", { length: 200 }).notNull(), // 기능명
  description: text("description"), // 설명
  videoUrl: text("videoUrl").notNull(), // 영상 URL (S3/CDN)
  videoDuration: int("videoDuration").notNull(), // 영상 길이 (초)
  thumbnailUrl: text("thumbnailUrl"), // 썸네일 URL
  displayOrder: int("displayOrder").default(0), // 표시 순서
  isActive: boolean("isActive").default(true).notNull(),
  language: mysqlEnum("language", [
    "ko", "en", "ja", "zh", "es", "fr", "de", "ru", "ar", "hi",
    "id", "th", "vi", "ms", "pt"
  ]).default("ko").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingVideo = typeof onboardingVideos.$inferSelect;
export type InsertOnboardingVideo = typeof onboardingVideos.$inferInsert;

// ─── Onboarding Progress (온보딩 진행 상태) ────────────────────────────
export const onboardingProgress = mysqlTable("onboarding_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  videoId: int("videoId").notNull(),
  featureKey: varchar("featureKey", { length: 100 }).notNull(),
  isViewed: boolean("isViewed").default(false).notNull(),
  viewCount: int("viewCount").default(0), // 시청 횟수
  viewedAt: timestamp("viewedAt"), // 마지막 시청 시간
  isSkipped: boolean("isSkipped").default(false), // 스킵 여부
  skippedAt: timestamp("skippedAt"), // 스킵 시간
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingProgress = typeof onboardingProgress.$inferSelect;
export type InsertOnboardingProgress = typeof onboardingProgress.$inferInsert;

// ─── User Onboarding Settings (사용자 온보딩 설정) ──────────────────────
export const userOnboardingSettings = mysqlTable("user_onboarding_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  isFirstTimeUser: boolean("isFirstTimeUser").default(true).notNull(),
  showOnboardingVideos: boolean("showOnboardingVideos").default(true).notNull(), // 온보딩 영상 표시 여부
  autoPlayVideos: boolean("autoPlayVideos").default(true).notNull(), // 자동 재생 여부
  repeatVideos: boolean("repeatVideos").default(false).notNull(), // 반복 재생 여부
  completedOnboarding: boolean("completedOnboarding").default(false).notNull(), // 온보딩 완료 여부
  completedAt: timestamp("completedAt"), // 온보딩 완료 시간
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserOnboardingSettings = typeof userOnboardingSettings.$inferSelect;
export type InsertUserOnboardingSettings = typeof userOnboardingSettings.$inferInsert;

// ─── Feature Entry Tracking (기능 진입 추적) ────────────────────────────
export const featureEntryTracking = mysqlTable("feature_entry_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  featureKey: varchar("featureKey", { length: 100 }).notNull(),
  entryCount: int("entryCount").default(1), // 진입 횟수
  lastEntryAt: timestamp("lastEntryAt").defaultNow().notNull(), // 마지막 진입 시간
  shouldShowVideo: boolean("shouldShowVideo").default(true).notNull(), // 영상 표시 여부
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureEntryTracking = typeof featureEntryTracking.$inferSelect;
export type InsertFeatureEntryTracking = typeof featureEntryTracking.$inferInsert;
