import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";

/**
 * 온보딩 영상 관련 tRPC 라우터
 * Phase 58: 기능별 온보딩 가이드 영상 시스템
 * 
 * DB 스키마: drizzle/onboarding-schema.ts
 * - onboardingVideos: 영상 메타데이터
 * - userOnboardingProgress: 사용자 시청 기록
 * - onboardingFeedback: 사용자 피드백
 * - onboardingAnalytics: 분석 데이터
 */
export const onboardingRouter = router({
  /**
   * 온보딩 영상 조회
   */
  videos: router({
    /**
     * 앱 초기 실행 시 인트로 영상 조회
     */
    getIntro: publicProcedure.query(async () => {
      // TODO: DB에서 intro 카테고리 영상 조회
      return {
        id: "intro-1",
        title: "GLWA 글로벌 웰니스 제국에 오신 것을 환영합니다",
        category: "intro",
        videoUrl: "", // S3 URL
        duration: 100, // 1분 40초
        autoPlay: true,
        skipButtonStyle: "hologram",
        backgroundColor: "#000000",
        accentColor: "#FFD700",
      };
    }),

    /**
     * 특정 카테고리의 영상 조회
     */
    getByCategory: publicProcedure
      .input(
        z.enum([
          "intro",
          "health_check",
          "sleep_tracking",
          "meal_tracking",
          "activity_tracking",
          "vip_membership",
          "dashboard",
          "points_rewards",
          "missions",
          "community",
        ])
      )
      .query(async ({ input }) => {
        // TODO: DB에서 해당 카테고리 영상 조회
        return [];
      }),

    /**
     * 특정 영상 조회
     */
    getById: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        // TODO: DB에서 특정 영상 조회
        return null;
      }),
  }),

  /**
   * 사용자 온보딩 진행 상황 추적
   */
  progress: router({
    /**
     * 영상 시청 완료 기록
     */
    completeWatching: protectedProcedure
      .input(
        z.object({
          videoId: z.string(),
          watchedDuration: z.number(),
          totalDuration: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: DB에 시청 기록 저장
        return { status: "completed" };
      }),

    /**
     * 영상 스킵 기록
     */
    skipVideo: protectedProcedure
      .input(
        z.object({
          videoId: z.string(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: DB에 스킵 기록 저장
        return { status: "skipped" };
      }),

    /**
     * 신규 사용자 여부 확인
     */
    isNewUser: protectedProcedure.query(async ({ ctx }) => {
      // TODO: DB에서 사용자의 시청 기록 확인
      return true; // 신규 사용자
    }),
  }),

  /**
   * 온보딩 설정
   */
  settings: router({
    /**
     * 사용자의 온보딩 설정 조회
     */
    getSettings: protectedProcedure.query(async ({ ctx }) => {
      return {
        autoPlayEnabled: true,
        showGuideAgain: false,
      };
    }),

    /**
     * 사용자의 온보딩 설정 업데이트
     */
    updateSettings: protectedProcedure
      .input(
        z.object({
          autoPlayEnabled: z.boolean().optional(),
          showGuideAgain: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: DB에 설정 저장
        return { status: "updated", settings: input };
      }),
  }),
});

export type OnboardingRouter = typeof onboardingRouter;
