import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { 
  sleepData, 
  mealData, 
  activityData, 
  vitalSigns, 
  dailyHealthSummary 
} from "../drizzle/biodata-schema";
import { eq, and } from "drizzle-orm";
import globalVoiceEngineExtended from "./globalVoiceEngineExtended";
import { calculateHanJinLevel } from "./hanJinCalculator";

// ─── Sleep Data Router ───────────────────────────────────────────────
export const sleepRouter = router({
  // 수면 데이터 저장
  recordSleep: protectedProcedure
    .input(z.object({
      recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      bedTime: z.string().regex(/^\d{2}:\d{2}$/),
      wakeTime: z.string().regex(/^\d{2}:\d{2}$/),
      sleepQuality: z.number().int().min(1).max(10).optional(),
      deepSleepPercentage: z.number().min(0).max(100).optional(),
      remSleepPercentage: z.number().min(0).max(100).optional(),
      lightSleepPercentage: z.number().min(0).max(100).optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      // 수면 시간 자동 계산
      const [bedHour, bedMin] = input.bedTime.split(":").map(Number);
      const [wakeHour, wakeMin] = input.wakeTime.split(":").map(Number);
      
      let sleepHours = wakeHour - bedHour + (wakeMin - bedMin) / 60;
      if (sleepHours < 0) sleepHours += 24; // 다음날 기상 처리
      
      // HanJin Level 계산
      const hanJinLevel = calculateHanJinLevel("sleep", sleepHours);
      
      // AI 분석
      const aiAnalysis = await globalVoiceEngineExtended.analyzeSleep({
        sleepHours,
        sleepQuality: input.sleepQuality || 5,
        deepSleepPercentage: input.deepSleepPercentage || 20,
      });
      
      // 음성 피드백 생성 (15개국)
      const voiceFeedback = await globalVoiceEngineExtended.generateVoiceFeedback({
        type: "sleep",
        sleepHours,
        hanJinLevel,
        language: ctx.user?.language || "ko",
      });
      
      // DB 저장
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      const result = await dbInstance.insert(sleepData).values({
        userId: ctx.user.id,
        recordDate: input.recordDate,
        bedTime: input.bedTime,
        wakeTime: input.wakeTime,
        sleepHours,
        sleepQuality: input.sleepQuality,
        deepSleepPercentage: input.deepSleepPercentage,
        remSleepPercentage: input.remSleepPercentage,
        lightSleepPercentage: input.lightSleepPercentage,
        hanJinLevel,
        aiAnalysis,
        voiceFeedback,
      });
      
      return {
        success: true,
        sleepHours,
        hanJinLevel,
        aiAnalysis,
        voiceFeedback,
      };
    }),

  // 수면 데이터 조회
  getSleepData: protectedProcedure
    .input(z.object({
      recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }))
    .query(async ({ ctx, input }: any) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      
      const result = await dbInstance
        .select()
        .from(sleepData)
        .where(
          and(
            eq(sleepData.userId, ctx.user.id),
            eq(sleepData.recordDate, input.recordDate)
          )
        )
        .limit(1);
      
      return result[0] || null;
    }),

  // 최근 7일 수면 데이터
  getRecentSleepData: protectedProcedure
    .input(z.object({
      days: z.number().int().min(1).max(365).default(7),
    }))
    .query(async ({ ctx, input }: any) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      const startDateStr = startDate.toISOString().split("T")[0];
      
      const results = await dbInstance
        .select()
        .from(sleepData)
        .where(
          and(
            eq(sleepData.userId, ctx.user.id),
          )
        )
        .orderBy(sleepData.recordDate);
      
      return results;
    }),
});

// ─── Meal Data Router ───────────────────────────────────────────────
export const mealRouter = router({
  // 식사 데이터 저장
  recordMeal: protectedProcedure
    .input(z.object({
      recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
      mealTime: z.string().regex(/^\d{2}:\d{2}$/),
      foodItems: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        calories: z.number(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fat: z.number().optional(),
        fiber: z.number().optional(),
      })),
      photoUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      // 영양소 합계 계산
      const totalCalories = input.foodItems.reduce((sum: number, item: any) => sum + item.calories, 0);
      const totalProtein = input.foodItems.reduce((sum: number, item: any) => sum + (item.protein || 0), 0);
      const totalCarbs = input.foodItems.reduce((sum: number, item: any) => sum + (item.carbs || 0), 0);
      const totalFat = input.foodItems.reduce((sum: number, item: any) => sum + (item.fat || 0), 0);
      const totalFiber = input.foodItems.reduce((sum: number, item: any) => sum + (item.fiber || 0), 0);
      
      // 영양 점수 계산 (1-10)
      const nutritionScore = Math.min(10, Math.max(1, Math.round((totalProtein / 50 + totalFiber / 30) / 2)));
      
      // HanJin Level 계산
      const hanJinLevel = calculateHanJinLevel("meal", nutritionScore);
      
      // AI 분석
      const aiAnalysis = await globalVoiceEngineExtended.analyzeMeal({
        foodItems: input.foodItems,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      });
      
      // 음성 피드백 생성
      const voiceFeedback = await globalVoiceEngineExtended.generateVoiceFeedback({
        type: "meal",
        mealType: input.mealType,
        totalCalories,
        hanJinLevel,
        language: ctx.user?.language || "ko",
      });
      
      // DB 저장
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      const result = await dbInstance.insert(mealData).values({
        userId: ctx.user.id,
        recordDate: input.recordDate,
        mealType: input.mealType,
        mealTime: input.mealTime,
        foodItems: input.foodItems,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        totalFiber,
        nutritionScore,
        hanJinLevel,
        aiAnalysis,
        voiceFeedback,
        photoUrl: input.photoUrl,
      });
      
      return {
        success: true,
        nutritionScore,
        hanJinLevel,
        aiAnalysis,
        voiceFeedback,
      };
    }),

  // 식사 데이터 조회
  getMealData: protectedProcedure
    .input(z.object({
      recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }))
    .query(async ({ ctx, input }: any) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      
      const results = await dbInstance
        .select()
        .from(mealData)
        .where(
          and(
            eq(mealData.userId, ctx.user.id),
            eq(mealData.recordDate, input.recordDate)
          )
        );
      
      return results;
    }),
});

// ─── Activity Data Router ───────────────────────────────────────────
export const activityRouter = router({
  // 활동 데이터 저장
  recordActivity: protectedProcedure
    .input(z.object({
      recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      activityType: z.enum(["walking", "running", "cycling", "swimming", "yoga", "strength", "sports", "other"]),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      distance: z.number().optional(),
      calories: z.number().optional(),
      averageHeartRate: z.number().int().optional(),
      maxHeartRate: z.number().int().optional(),
      minHeartRate: z.number().int().optional(),
      intensity: z.enum(["low", "moderate", "high", "very_high"]).optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      // 운동 시간 계산
      const [startHour, startMin] = input.startTime.split(":").map(Number);
      const [endHour, endMin] = input.endTime.split(":").map(Number);
      let durationMinutes = (endHour - startHour) * 60 + (endMin - startMin);
      if (durationMinutes < 0) durationMinutes += 24 * 60;
      
      // HanJin Level 계산
      const hanJinLevel = calculateHanJinLevel("activity", durationMinutes);
      
      // AI 분석
      const aiAnalysis = await globalVoiceEngineExtended.analyzeActivity({
        activityType: input.activityType,
        durationMinutes,
        distance: input.distance,
        calories: input.calories,
        averageHeartRate: input.averageHeartRate,
      });
      
      // 음성 피드백 생성
      const voiceFeedback = await globalVoiceEngineExtended.generateVoiceFeedback({
        type: "activity",
        activityType: input.activityType,
        durationMinutes,
        hanJinLevel,
        language: ctx.user?.language || "ko",
      });
      
      // DB 저장
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      const result = await dbInstance.insert(activityData).values({
        userId: ctx.user.id,
        recordDate: input.recordDate,
        activityType: input.activityType,
        startTime: input.startTime,
        endTime: input.endTime,
        durationMinutes,
        distance: input.distance,
        calories: input.calories,
        averageHeartRate: input.averageHeartRate,
        maxHeartRate: input.maxHeartRate,
        minHeartRate: input.minHeartRate,
        intensity: input.intensity,
        hanJinLevel,
        aiAnalysis,
        voiceFeedback,
      });
      
      return {
        success: true,
        durationMinutes,
        hanJinLevel,
        aiAnalysis,
        voiceFeedback,
      };
    }),

  // 활동 데이터 조회
  getActivityData: protectedProcedure
    .input(z.object({
      recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }))
    .query(async ({ ctx, input }: any) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      
      const results = await dbInstance
        .select()
        .from(activityData)
        .where(
          and(
            eq(activityData.userId, ctx.user.id),
            eq(activityData.recordDate, input.recordDate)
          )
        );
      
      return results;
    }),
});

// ─── Vital Signs Router ──────────────────────────────────────────────
export const vitalSignsRouter = router({
  // 생체 신호 저장
  recordVitalSigns: protectedProcedure
    .input(z.object({
      recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      recordTime: z.string().regex(/^\d{2}:\d{2}$/),
      systolicBP: z.number().int(),
      diastolicBP: z.number().int(),
      heartRate: z.number().int(),
      bloodSugar: z.number(),
      bodyTemperature: z.number().optional(),
      oxygenSaturation: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      // 각 생체 신호별 HanJin Level 계산
      const bpHanJinLevel = calculateHanJinLevel("bloodPressure", input.systolicBP);
      const heartRateHanJinLevel = calculateHanJinLevel("heartRate", input.heartRate);
      const bloodSugarHanJinLevel = calculateHanJinLevel("bloodSugar", input.bloodSugar);
      
      // 종합 HanJin Level (평균)
      const overallHanJinLevel = Math.round(
        (bpHanJinLevel + heartRateHanJinLevel + bloodSugarHanJinLevel) / 3
      );
      
      // AI 분석
      const aiAnalysis = await globalVoiceEngineExtended.analyzeVitalSigns({
        systolicBP: input.systolicBP,
        diastolicBP: input.diastolicBP,
        heartRate: input.heartRate,
        bloodSugar: input.bloodSugar,
      });
      
      // 음성 피드백 생성
      const voiceFeedback = await globalVoiceEngineExtended.generateVoiceFeedback({
        type: "vitalSigns",
        systolicBP: input.systolicBP,
        heartRate: input.heartRate,
        bloodSugar: input.bloodSugar,
        hanJinLevel: overallHanJinLevel,
        language: ctx.user?.language || "ko",
      });
      
      // DB 저장
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      const result = await dbInstance.insert(vitalSigns).values({
        userId: ctx.user.id,
        recordDate: input.recordDate,
        recordTime: input.recordTime,
        systolicBP: input.systolicBP,
        diastolicBP: input.diastolicBP,
        heartRate: input.heartRate,
        bloodSugar: input.bloodSugar,
        bodyTemperature: input.bodyTemperature,
        oxygenSaturation: input.oxygenSaturation,
        bpHanJinLevel,
        heartRateHanJinLevel,
        bloodSugarHanJinLevel,
        overallHanJinLevel,
        aiAnalysis,
        voiceFeedback,
      });
      
      return {
        success: true,
        bpHanJinLevel,
        heartRateHanJinLevel,
        bloodSugarHanJinLevel,
        overallHanJinLevel,
        aiAnalysis,
        voiceFeedback,
      };
    }),

  // 생체 신호 조회
  getVitalSigns: protectedProcedure
    .input(z.object({
      recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }))
    .query(async ({ ctx, input }: any) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      
      const results = await dbInstance
        .select()
        .from(vitalSigns)
        .where(
          and(
            eq(vitalSigns.userId, ctx.user.id),
            eq(vitalSigns.recordDate, input.recordDate)
          )
        );
      
      return results;
    }),
});

// ─── Daily Health Summary Router ────────────────────────────────────
export const dailyHealthRouter = router({
  // 일일 건강 요약 생성
  generateDailySummary: protectedProcedure
    .input(z.object({
      recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      
      // 각 카테고리별 데이터 조회
      const sleepRecords = await dbInstance.select().from(sleepData).where(
        and(eq(sleepData.userId, ctx.user.id), eq(sleepData.recordDate, input.recordDate))
      );
      
      const mealRecords = await dbInstance.select().from(mealData).where(
        and(eq(mealData.userId, ctx.user.id), eq(mealData.recordDate, input.recordDate))
      );
      
      const activityRecords = await dbInstance.select().from(activityData).where(
        and(eq(activityData.userId, ctx.user.id), eq(activityData.recordDate, input.recordDate))
      );
      
      const vitalRecords = await dbInstance.select().from(vitalSigns).where(
        and(eq(vitalSigns.userId, ctx.user.id), eq(vitalSigns.recordDate, input.recordDate))
      );
      
      // 점수 계산
      const sleepScore = sleepRecords.length > 0 ? sleepRecords[0].sleepQuality || 5 : 0;
      const nutritionScore = mealRecords.length > 0 
        ? Math.round(mealRecords.reduce((sum: number, m: any) => sum + (m.nutritionScore || 0), 0) / mealRecords.length)
        : 0;
      const activityScore = activityRecords.length > 0 ? Math.min(10, Math.round(activityRecords.length * 2)) : 0;
      const vitalScore = vitalRecords.length > 0 
        ? Math.round(vitalRecords.reduce((sum: number, v: any) => sum + (v.overallHanJinLevel || 0), 0) / vitalRecords.length) + 5
        : 0;
      
      const overallScore = Math.round((sleepScore + nutritionScore + activityScore + vitalScore) / 4);
      const hanJinLevel = calculateHanJinLevel("overall", overallScore);
      
      // AI 종합 분석
      const aiAnalysis = await globalVoiceEngineExtended.generateDailySummary({
        sleepScore,
        nutritionScore,
        activityScore,
        vitalScore,
        overallScore,
      });
      
      // 음성 피드백 생성
      const voiceFeedback = await globalVoiceEngineExtended.generateVoiceFeedback({
        type: "dailySummary",
        hanJinLevel,
        language: ctx.user?.language || "ko",
      });
      
      // DB 저장
      const result = await dbInstance.insert(dailyHealthSummary).values({
        userId: ctx.user.id,
        recordDate: input.recordDate,
        sleepScore,
        nutritionScore,
        activityScore,
        vitalScore,
        overallScore,
        hanJinLevel,
        aiAnalysis,
        voiceFeedback,
        recommendations: [
          sleepScore < 5 ? "더 많은 수면이 필요합니다" : "수면 상태가 좋습니다",
          nutritionScore < 5 ? "영양 균형을 개선해주세요" : "영양 상태가 좋습니다",
          activityScore < 5 ? "더 많은 활동을 권장합니다" : "활동량이 충분합니다",
        ],
      });
      
      return {
        success: true,
        sleepScore,
        nutritionScore,
        activityScore,
        vitalScore,
        overallScore,
        hanJinLevel,
        aiAnalysis,
        voiceFeedback,
      };
    }),

  // 일일 건강 요약 조회
  getDailySummary: protectedProcedure
    .input(z.object({
      recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }))
    .query(async ({ ctx, input }: any) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");
      
      const result = await dbInstance
        .select()
        .from(dailyHealthSummary)
        .where(
          and(
            eq(dailyHealthSummary.userId, ctx.user.id),
            eq(dailyHealthSummary.recordDate, input.recordDate)
          )
        )
        .limit(1);
      
      return result[0] || null;
    }),
});

// ─── Main Biodata Router ────────────────────────────────────────────
export const biodataRouter = router({
  sleep: sleepRouter,
  meal: mealRouter,
  activity: activityRouter,
  vitalSigns: vitalSignsRouter,
  dailyHealth: dailyHealthRouter,
});
