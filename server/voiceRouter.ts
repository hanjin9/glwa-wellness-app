/**
 * 🌍 글로벌 음성 라우터 - tRPC 통합
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  LANGUAGE_CONFIG,
  analyzeHealthStatus,
  getCachedOrGenerateFeedback,
  generateAutoCoachingForAllLanguages,
  type SupportedLanguage,
} from "./globalVoiceEngine";

export const voiceRouter = router({
  // 단일 언어 음성 피드백 생성
  generateFeedback: protectedProcedure
    .input(
      z.object({
        language: z.enum([
          "en",
          "zh",
          "ja",
          "es",
          "fr",
          "de",
          "ar",
          "hi",
          "th",
          "vi",
          "ms",
          "ru",
          "pt",
          "id",
        ] as const),
        healthData: z.object({
          steps: z.number(),
          exerciseMinutes: z.number(),
          sleepHours: z.number(),
          bloodPressure: z.string(),
          bloodSugar: z.number(),
          stressLevel: z.number(),
          moodLevel: z.number(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { text, audioUrl, language } = await getCachedOrGenerateFeedback(
          input.language as SupportedLanguage,
          input.healthData,
          {
            name: ctx.user?.name || undefined,
            role: "Executive",
            location: "Global",
          }
        );

        return {
          success: true,
          language,
          text,
          audioUrl,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Voice feedback generation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "음성 피드백 생성에 실패했습니다",
        });
      }
    }),

  // 모든 언어 자동 코칭 생성 (80% 자동화)
  generateAutoCoaching: protectedProcedure
    .input(
      z.object({
        healthData: z.object({
          steps: z.number(),
          exerciseMinutes: z.number(),
          sleepHours: z.number(),
          bloodPressure: z.string(),
          bloodSugar: z.number(),
          stressLevel: z.number(),
          moodLevel: z.number(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const coachings = await generateAutoCoachingForAllLanguages(input.healthData, {
          name: ctx.user?.name || undefined,
          role: "Executive",
          location: "Global",
        });

        return {
          success: true,
          coachings,
          totalLanguages: coachings.length,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Auto coaching generation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "자동 코칭 생성에 실패했습니다",
        });
      }
    }),

  // 건강 상태 분석
  analyzeHealth: publicProcedure
    .input(
      z.object({
        steps: z.number(),
        exerciseMinutes: z.number(),
        sleepHours: z.number(),
        bloodPressure: z.string(),
        bloodSugar: z.number(),
        stressLevel: z.number(),
        moodLevel: z.number(),
      })
    )
    .query(({ input }) => {
      const analysis = analyzeHealthStatus(input);
      return {
        success: true,
        ...analysis,
      };
    }),

  // 지원 언어 목록
  getSupportedLanguages: publicProcedure.query(() => {
    const languages = Object.entries(LANGUAGE_CONFIG).map(([code, config]) => ({
      code,
      name: config.name,
      region: config.region,
      provider: config.provider,
      naturalness: config.naturalness,
      rtl: config.rtl,
    }));

    return {
      success: true,
      languages,
      total: languages.length,
    };
  }),
});
