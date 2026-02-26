/**
 * 🎯 콘텐츠 압축 라우터 - tRPC 통합
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  matchContentByTrigger,
  createVolatileKnowledgeCard,
  globalCardManager,
  type HealthContext,
} from "./contentCompressor";

export const contentCompressorRouter = router({
  // 트리거 기반 콘텐츠 매칭
  getCompactContent: protectedProcedure
    .input(
      z.object({
        trigger: z.enum([
          "mission_start",
          "action_begin",
          "reward",
          "game_end",
          "dashboard",
          "streaming",
        ] as const),
        activityType: z.string(),
        currentLevel: z.number(),
        healthMetrics: z
          .object({
            steps: z.number().optional(),
            exerciseMinutes: z.number().optional(),
            sleepHours: z.number().optional(),
            stressLevel: z.number().optional(),
          })
          .optional(),
      })
    )
    .query(({ ctx, input }) => {
      try {
        const context: HealthContext = {
          userId: String(ctx.user?.id || ""),
          activityType: input.activityType,
          currentLevel: input.currentLevel,
          healthMetrics: input.healthMetrics,
        };

        const content = matchContentByTrigger(input.trigger, context);

        if (!content) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "매칭되는 콘텐츠가 없습니다",
          });
        }

        // 휘발성 카드 생성
        const card = createVolatileKnowledgeCard(content, 30);
        globalCardManager.addCard(card);

        return {
          success: true,
          content,
          card,
        };
      } catch (error) {
        console.error("Content matching failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "콘텐츠 매칭에 실패했습니다",
        });
      }
    }),

  // 휘발성 카드 조회
  getVolatileCards: protectedProcedure.query(({ ctx }) => {
    try {
      const cards = globalCardManager.getAllCards();
      const unreadCount = globalCardManager.getUnreadCount();

      return {
        success: true,
        cards,
        unreadCount,
        badge: {
          count: unreadCount,
          icon: "📌",
        },
      };
    } catch (error) {
      console.error("Failed to get volatile cards:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "카드 조회에 실패했습니다",
      });
    }
  }),

  // 카드 읽음 표시
  markCardAsRead: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .mutation(({ input }) => {
      try {
        globalCardManager.markAsRead(input.cardId);
        return {
          success: true,
          unreadCount: globalCardManager.getUnreadCount(),
        };
      } catch (error) {
        console.error("Failed to mark card as read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "카드 읽음 표시에 실패했습니다",
        });
      }
    }),

  // 카드 삭제
  deleteCard: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .mutation(({ input }) => {
      try {
        globalCardManager.deleteCard(input.cardId);
        return {
          success: true,
          unreadCount: globalCardManager.getUnreadCount(),
        };
      } catch (error) {
        console.error("Failed to delete card:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "카드 삭제에 실패했습니다",
        });
      }
    }),

  // 미읽음 카드만 조회
  getUnreadCards: protectedProcedure.query(({ ctx }) => {
    try {
      const cards = globalCardManager.getUnreadCards();
      return {
        success: true,
        cards,
        count: cards.length,
      };
    } catch (error) {
      console.error("Failed to get unread cards:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "미읽음 카드 조회에 실패했습니다",
      });
    }
  }),

  // 트리거별 카드 조회
  getCardsByTrigger: protectedProcedure
    .input(
      z.object({
        trigger: z.enum([
          "mission_start",
          "action_begin",
          "reward",
          "game_end",
          "dashboard",
          "streaming",
        ] as const),
      })
    )
    .query(({ input }) => {
      try {
        const cards = globalCardManager.getCardsByTrigger(input.trigger);
        return {
          success: true,
          cards,
          count: cards.length,
        };
      } catch (error) {
        console.error("Failed to get cards by trigger:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "트리거별 카드 조회에 실패했습니다",
        });
      }
    }),

  // 모든 카드 삭제 (정리)
  clearAllCards: protectedProcedure.mutation(({ ctx }) => {
    try {
      const cards = globalCardManager.getAllCards();
      cards.forEach((card) => {
        globalCardManager.deleteCard(card.id);
      });

      return {
        success: true,
        deletedCount: cards.length,
      };
    } catch (error) {
      console.error("Failed to clear cards:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "카드 정리에 실패했습니다",
      });
    }
  }),
});
