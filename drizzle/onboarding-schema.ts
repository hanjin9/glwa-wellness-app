import { mysqlTable, varchar, text, int, boolean, timestamp, json, enum as mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { users } from "./schema";

/**
 * 온보딩 영상 메타데이터 테이블
 * 앱 초기 실행 및 기능 진입 시 재생할 가이드 영상 정보
 */
export const onboardingVideos = mysqlTable("onboarding_videos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  
  // 영상 기본 정보
  title: varchar("title", { length: 255 }).notNull(), // "Healthcare Widget Guide", "Golden Slideshow"
  description: text("description"), // 영상 설명
  
  // 영상 분류
  category: mysqlEnum("category", [
    "intro", // 앱 초기 실행 인트로 (1분 40초)
    "health_check", // 건강 체크 기능 (30초)
    "sleep_tracking", // 수면 기록 기능 (30초)
    "meal_tracking", // 식사 기록 기능 (30초)
    "activity_tracking", // 활동 기록 기능 (30초)
    "vip_membership", // VIP 멤버십 (30초)
    "dashboard", // 대시보드 (30초)
    "points_rewards", // 포인트 보상 (30초)
    "missions", // 미션 (30초)
    "community", // 커뮤니티 (30초),
  ]).notNull(),
  
  // 영상 파일 정보
  videoUrl: text("video_url").notNull(), // S3 또는 CDN URL
  thumbnailUrl: text("thumbnail_url"), // 썸네일 이미지 URL
  duration: int("duration").notNull(), // 영상 길이 (초)
  
  // 영상 메타데이터
  videoWidth: int("video_width").default(1920), // 1920
  videoHeight: int("video_height").default(1080), // 1080
  fps: int("fps").default(30), // 30fps
  fileSize: int("file_size"), // 파일 크기 (bytes)
  mimeType: varchar("mime_type", { length: 50 }).default("video/mp4"), // video/mp4
  
  // 재생 설정
  autoPlay: boolean("auto_play").default(true), // 자동 재생 여부
  muted: boolean("muted").default(false), // 기본 음소거 여부
  loop: boolean("loop").default(false), // 반복 재생 여부
  
  // UI 설정
  showSkipButton: boolean("show_skip_button").default(true), // [+] 스킵 버튼 표시
  skipButtonStyle: mysqlEnum("skip_button_style", [
    "hologram", // 투명 홀로그램 스타일
    "solid", // 실선 버튼
    "gradient", // 그래디언트
    "glass", // 글래스모르피즘
  ]).default("hologram"),
  
  // 디자인 정보
  backgroundColor: varchar("background_color", { length: 20 }).default("#000000"), // 배경색
  accentColor: varchar("accent_color", { length: 20 }).default("#FFD700"), // 강조색 (골드)
  
  // 타겟 사용자
  targetUserRole: mysqlEnum("target_user_role", [
    "all", // 모든 사용자
    "new_user", // 신규 사용자만
    "vip", // VIP 멤버만
    "premium", // 프리미엄 멤버만
  ]).default("all"),
  
  // 언어 및 지역화
  languages: json("languages").$type<string[]>().default(["ko", "en", "ja", "zh", "es"]), // 지원 언어
  defaultLanguage: varchar("default_language", { length: 10 }).default("ko"),
  
  // 활성화 상태
  isActive: boolean("is_active").default(true),
  isPublished: boolean("is_published").default(false),
  
  // 타임스탬프
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

/**
 * 사용자 온보딩 진행 상황 추적 테이블
 * 각 사용자가 어떤 영상을 봤는지, 스킵했는지 기록
 */
export const userOnboardingProgress = mysqlTable("user_onboarding_progress", {
  id: varchar("id", { length: 36 }).primaryKey(),
  
  // 사용자 정보
  userId: varchar("user_id", { length: 36 }).notNull(),
  
  // 영상 정보
  videoId: varchar("video_id", { length: 36 }).notNull(),
  
  // 시청 상태
  status: mysqlEnum("status", [
    "not_started", // 미시작
    "watching", // 시청 중
    "completed", // 완료
    "skipped", // 스킵
  ]).default("not_started"),
  
  // 시청 통계
  watchedDuration: int("watched_duration").default(0), // 시청한 초 단위 길이
  totalDuration: int("total_duration"), // 영상 전체 길이
  watchPercentage: int("watch_percentage").default(0), // 시청률 (0-100)
  
  // 스킵 정보
  skippedAt: timestamp("skipped_at"), // 스킵한 시간
  skippedReason: varchar("skipped_reason", { length: 255 }), // 스킵 이유
  
  // 반복 시청
  viewCount: int("view_count").default(0), // 시청 횟수
  lastWatchedAt: timestamp("last_watched_at"), // 마지막 시청 시간
  
  // 설정
  autoPlayEnabled: boolean("auto_play_enabled").default(true), // 자동 재생 활성화
  showGuideAgain: boolean("show_guide_again").default(false), // 가이드 영상 다시 보기
  
  // 타임스탬프
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

/**
 * 온보딩 영상 분석 데이터 테이블
 * 영상 시청 패턴 분석 및 개선을 위한 통계
 */
export const onboardingAnalytics = mysqlTable("onboarding_analytics", {
  id: varchar("id", { length: 36 }).primaryKey(),
  
  // 영상 정보
  videoId: varchar("video_id", { length: 36 }).notNull(),
  
  // 통계
  totalViews: int("total_views").default(0), // 총 시청 수
  completionRate: int("completion_rate").default(0), // 완료율 (%)
  skipRate: int("skip_rate").default(0), // 스킵율 (%)
  averageWatchTime: int("average_watch_time").default(0), // 평균 시청 시간 (초)
  
  // 사용자 피드백
  avgRating: int("avg_rating").default(0), // 평균 평점 (1-5)
  totalRatings: int("total_ratings").default(0), // 평점 수
  
  // 성능 지표
  engagementScore: int("engagement_score").default(0), // 참여도 점수 (0-100)
  conversionRate: int("conversion_rate").default(0), // 전환율 (%) - 영상 후 기능 사용 비율
  
  // 기기별 통계
  mobileViews: int("mobile_views").default(0), // 모바일 시청
  desktopViews: int("desktop_views").default(0), // 데스크톱 시청
  
  // 시간대별 통계
  peakHour: int("peak_hour"), // 피크 시간 (0-23)
  peakDayOfWeek: int("peak_day_of_week"), // 피크 요일 (0-6, 0=일요일)
  
  // 타임스탬프
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

/**
 * 온보딩 영상 피드백 테이블
 * 사용자가 영상에 대해 남긴 피드백 및 평점
 */
export const onboardingFeedback = mysqlTable("onboarding_feedback", {
  id: varchar("id", { length: 36 }).primaryKey(),
  
  // 사용자 및 영상 정보
  userId: varchar("user_id", { length: 36 }).notNull(),
  videoId: varchar("video_id", { length: 36 }).notNull(),
  
  // 평가
  rating: int("rating").notNull(), // 1-5 별점
  comment: text("comment"), // 피드백 코멘트
  
  // 피드백 카테고리
  category: mysqlEnum("category", [
    "helpful", // 도움이 됨
    "confusing", // 혼란스러움
    "too_long", // 너무 김
    "too_short", // 너무 짧음
    "unclear", // 불명확함
    "excellent", // 우수함
    "other", // 기타
  ]),
  
  // 타임스탬프
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

/**
 * 온보딩 영상 버전 관리 테이블
 * 영상 업데이트 및 A/B 테스트를 위한 버전 관리
 */
export const onboardingVideoVersions = mysqlTable("onboarding_video_versions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  
  // 영상 정보
  videoId: varchar("video_id", { length: 36 }).notNull(),
  
  // 버전 정보
  version: int("version").notNull(), // 버전 번호 (1, 2, 3...)
  versionName: varchar("version_name", { length: 100 }), // "v1.0", "A/B Test - Version A"
  
  // 파일 정보
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  
  // 변경 사항
  changelog: text("changelog"), // 변경 내역
  
  // 상태
  isActive: boolean("is_active").default(false), // 현재 활성화된 버전인지
  isPublished: boolean("is_published").default(false),
  
  // A/B 테스트
  abTestName: varchar("ab_test_name", { length: 100 }), // A/B 테스트 이름
  testPercentage: int("test_percentage").default(100), // 테스트 대상 비율 (%)
  
  // 타임스탬프
  createdAt: timestamp("created_at").defaultNow(),
  publishedAt: timestamp("published_at"),
  deprecatedAt: timestamp("deprecated_at"), // 지원 종료 시간
});

// 관계 정의
export const onboardingVideosRelations = relations(onboardingVideos, ({ many }) => ({
  userProgress: many(userOnboardingProgress),
  feedback: many(onboardingFeedback),
  versions: many(onboardingVideoVersions),
}));

export const userOnboardingProgressRelations = relations(userOnboardingProgress, ({ one }) => ({
  user: one(users, {
    fields: [userOnboardingProgress.userId],
    references: [users.id],
  }),
  video: one(onboardingVideos, {
    fields: [userOnboardingProgress.videoId],
    references: [onboardingVideos.id],
  }),
}));

export const onboardingFeedbackRelations = relations(onboardingFeedback, ({ one }) => ({
  user: one(users, {
    fields: [onboardingFeedback.userId],
    references: [users.id],
  }),
  video: one(onboardingVideos, {
    fields: [onboardingFeedback.videoId],
    references: [onboardingVideos.id],
  }),
}));

export const onboardingVideoVersionsRelations = relations(onboardingVideoVersions, ({ one }) => ({
  video: one(onboardingVideos, {
    fields: [onboardingVideoVersions.videoId],
    references: [onboardingVideos.id],
  }),
}));
