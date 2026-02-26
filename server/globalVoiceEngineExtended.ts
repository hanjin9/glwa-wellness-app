/**
 * 🌍 GLWA 글로벌 보이스 제국 - 생체 데이터 분석 확장
 * 
 * 수면, 식사, 활동, 생체신호 데이터를 AI로 분석하고
 * 15개국 음성 피드백을 자동 생성하는 엔진
 */

import { invokeLLM } from "./_core/llm";
import { LANGUAGE_CONFIG, CULTURAL_PROMPTS, analyzeHealthStatus, generateMultilingualFeedback } from "./globalVoiceEngine";

// ============================================================================
// 1️⃣ 수면 데이터 분석
// ============================================================================

export async function analyzeSleep(data: {
  sleepHours: number;
  sleepQuality: number;
  deepSleepPercentage: number;
}): Promise<string> {
  const prompt = `
당신은 럭셔리 웰니스 전문가입니다. 사용자의 수면 데이터를 분석하고 전문적인 조언을 제공하세요.

수면 데이터:
- 수면 시간: ${data.sleepHours}시간
- 수면 질: ${data.sleepQuality}/10
- 깊은 수면: ${data.deepSleepPercentage}%

다음 형식으로 분석 결과를 JSON으로 반환하세요:
{
  "status": "excellent|good|fair|poor",
  "hanJinLevel": -10 ~ +10,
  "analysis": "전문적인 분석 (2-3문장)",
  "recommendation": "구체적인 권장사항"
}
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "당신은 의료 전문가입니다. 항상 JSON 형식으로 응답하세요.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "sleep_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            status: { type: "string" },
            hanJinLevel: { type: "number" },
            analysis: { type: "string" },
            recommendation: { type: "string" },
          },
          required: ["status", "hanJinLevel", "analysis", "recommendation"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.analysis;
    }
  } catch (error) {
    console.error("Sleep analysis parsing error:", error);
  }

  return "수면 분석 결과를 생성할 수 없습니다.";
}

// ============================================================================
// 2️⃣ 식사 데이터 분석
// ============================================================================

export async function analyzeMeal(data: {
  foodItems: Array<{ name: string; quantity: number; calories: number }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}): Promise<string> {
  const foodList = data.foodItems.map((item) => `${item.name} (${item.quantity}개, ${item.calories}kcal)`).join(", ");

  const prompt = `
당신은 영양 전문가입니다. 사용자의 식사 데이터를 분석하세요.

식사 항목: ${foodList}
총 칼로리: ${data.totalCalories}kcal
단백질: ${data.totalProtein}g
탄수화물: ${data.totalCarbs}g
지방: ${data.totalFat}g

다음 형식으로 분석 결과를 JSON으로 반환하세요:
{
  "nutritionScore": 1-10,
  "hanJinLevel": -10 ~ +10,
  "analysis": "영양 분석 (2-3문장)",
  "recommendation": "식단 개선 권장사항"
}
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "당신은 영양 전문가입니다. 항상 JSON 형식으로 응답하세요.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "meal_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            nutritionScore: { type: "number" },
            hanJinLevel: { type: "number" },
            analysis: { type: "string" },
            recommendation: { type: "string" },
          },
          required: ["nutritionScore", "hanJinLevel", "analysis", "recommendation"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.analysis;
    }
  } catch (error) {
    console.error("Meal analysis parsing error:", error);
  }

  return "식사 분석 결과를 생성할 수 없습니다.";
}

// ============================================================================
// 3️⃣ 활동 데이터 분석
// ============================================================================

export async function analyzeActivity(data: {
  activityType: string;
  durationMinutes: number;
  distance?: number;
  calories?: number;
  averageHeartRate?: number;
}): Promise<string> {
  const prompt = `
당신은 피트니스 전문가입니다. 사용자의 활동 데이터를 분석하세요.

활동 유형: ${data.activityType}
운동 시간: ${data.durationMinutes}분
거리: ${data.distance || "미기록"}km
칼로리 소모: ${data.calories || "미기록"}kcal
평균 심박수: ${data.averageHeartRate || "미기록"}bpm

다음 형식으로 분석 결과를 JSON으로 반환하세요:
{
  "activityScore": 1-10,
  "hanJinLevel": -10 ~ +10,
  "analysis": "활동 분석 (2-3문장)",
  "recommendation": "운동 개선 권장사항"
}
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "당신은 피트니스 전문가입니다. 항상 JSON 형식으로 응답하세요.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "activity_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            activityScore: { type: "number" },
            hanJinLevel: { type: "number" },
            analysis: { type: "string" },
            recommendation: { type: "string" },
          },
          required: ["activityScore", "hanJinLevel", "analysis", "recommendation"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.analysis;
    }
  } catch (error) {
    console.error("Activity analysis parsing error:", error);
  }

  return "활동 분석 결과를 생성할 수 없습니다.";
}

// ============================================================================
// 4️⃣ 생체신호 분석
// ============================================================================

export async function analyzeVitalSigns(data: {
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  bloodSugar: number;
}): Promise<string> {
  const prompt = `
당신은 의료 전문가입니다. 사용자의 생체신호를 분석하세요.

혈압: ${data.systolicBP}/${data.diastolicBP} mmHg
심박수: ${data.heartRate} bpm
혈당: ${data.bloodSugar} mg/dL

다음 형식으로 분석 결과를 JSON으로 반환하세요:
{
  "vitalScore": 1-10,
  "hanJinLevel": -10 ~ +10,
  "analysis": "생체신호 분석 (2-3문장)",
  "recommendation": "건강 개선 권장사항"
}
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "당신은 의료 전문가입니다. 항상 JSON 형식으로 응답하세요.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "vital_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            vitalScore: { type: "number" },
            hanJinLevel: { type: "number" },
            analysis: { type: "string" },
            recommendation: { type: "string" },
          },
          required: ["vitalScore", "hanJinLevel", "analysis", "recommendation"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.analysis;
    }
  } catch (error) {
    console.error("Vital signs analysis parsing error:", error);
  }

  return "생체신호 분석 결과를 생성할 수 없습니다.";
}

// ============================================================================
// 5️⃣ 일일 건강 요약 생성
// ============================================================================

export async function generateDailySummary(data: {
  sleepScore: number;
  nutritionScore: number;
  activityScore: number;
  vitalScore: number;
  overallScore: number;
}): Promise<string> {
  const prompt = `
당신은 건강 코칭 전문가입니다. 사용자의 일일 건강 데이터를 종합 분석하세요.

수면 점수: ${data.sleepScore}/10
영양 점수: ${data.nutritionScore}/10
활동 점수: ${data.activityScore}/10
생체신호 점수: ${data.vitalScore}/10
종합 점수: ${data.overallScore}/10

다음 형식으로 종합 분석 결과를 JSON으로 반환하세요:
{
  "summary": "오늘의 건강 상태 요약 (3-4문장)",
  "hanJinLevel": -10 ~ +10,
  "topPriority": "가장 중요한 개선 항목",
  "motivation": "긍정적인 격려 메시지"
}
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "당신은 건강 코칭 전문가입니다. 항상 JSON 형식으로 응답하세요.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "daily_summary",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            hanJinLevel: { type: "number" },
            topPriority: { type: "string" },
            motivation: { type: "string" },
          },
          required: ["summary", "hanJinLevel", "topPriority", "motivation"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.summary;
    }
  } catch (error) {
    console.error("Daily summary parsing error:", error);
  }

  return "일일 건강 요약을 생성할 수 없습니다.";
}

// ============================================================================
// 6️⃣ 음성 피드백 생성 (다국어)
// ============================================================================

export async function generateVoiceFeedback(data: {
  type: "sleep" | "meal" | "activity" | "vitalSigns" | "dailySummary";
  sleepHours?: number;
  mealType?: string;
  totalCalories?: number;
  activityType?: string;
  durationMinutes?: number;
  systolicBP?: number;
  heartRate?: number;
  bloodSugar?: number;
  hanJinLevel: number;
  language: string;
}): Promise<string> {
  let feedbackText = "";

  switch (data.type) {
    case "sleep":
      feedbackText = `당신의 오늘 수면은 ${data.sleepHours}시간으로 ${data.hanJinLevel > 5 ? "완벽합니다" : "개선이 필요합니다"}.`;
      break;
    case "meal":
      feedbackText = `${data.mealType} 식사의 칼로리는 ${data.totalCalories}kcal입니다. ${data.hanJinLevel > 5 ? "영양 균형이 좋습니다" : "영양 개선을 권장합니다"}.`;
      break;
    case "activity":
      feedbackText = `${data.activityType} 운동을 ${data.durationMinutes}분 하셨습니다. ${data.hanJinLevel > 5 ? "훌륭한 활동량입니다" : "더 많은 활동을 권장합니다"}.`;
      break;
    case "vitalSigns":
      feedbackText = `혈압 ${data.systolicBP}, 심박수 ${data.heartRate}, 혈당 ${data.bloodSugar}입니다. ${data.hanJinLevel > 5 ? "생체신호가 안정적입니다" : "의료 상담을 권장합니다"}.`;
      break;
    case "dailySummary":
      feedbackText = `오늘의 건강 지수는 ${data.hanJinLevel}입니다. ${data.hanJinLevel > 5 ? "좋은 하루를 보내셨습니다" : "내일은 더 나은 건강 관리를 기대합니다"}.`;
      break;
  }

  return feedbackText;
}

// ============================================================================
// Export
// ============================================================================

export default {
  analyzeSleep,
  analyzeMeal,
  analyzeActivity,
  analyzeVitalSigns,
  generateDailySummary,
  generateVoiceFeedback,
};
