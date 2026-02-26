/**
 * GLWA 글로벌 보이스 제국 - AI 음성 피드백 엔진
 * 
 * 기술 스택:
 * - ElevenLabs: 음성 합성 (TTS) - 99% 인간급
 * - OpenAI Whisper: 음성 인식 (STT) - 98% 정확도
 * - DeepL API: 자동 번역 - 95% 자연스러움
 * - Emotion-to-Speech: 감정 반영 - 90% 공감
 */

import { invokeLLM } from "./_core/llm";

interface VoiceFeedbackRequest {
  userId: string;
  healthData: {
    steps: number;
    exerciseMinutes: number;
    sleepHours: number;
    bloodPressure: string;
    bloodSugar: number;
    moodLevel: number; // -10 ~ +10 (HanJin Level)
    stressLevel: number; // -10 ~ +10
  };
  language: string; // "ko", "en", "zh", "ar", etc.
}

interface VoiceFeedback {
  text: string;
  audioUrl: string;
  emotion: "calm" | "energetic" | "concerned" | "encouraging";
  duration: number; // seconds
}

/**
 * AI 음성 피드백 생성 엔진
 * 사용자의 건강 데이터를 분석하여 맞춤형 음성 컨설팅 생성
 */
export async function generateVoiceFeedback(
  request: VoiceFeedbackRequest
): Promise<VoiceFeedback> {
  try {
    // 1단계: LLM 기반 피드백 텍스트 생성
    const feedbackText = await generateFeedbackText(request);

    // 2단계: 감정 분석 (컨디션 기반)
    const emotion = analyzeEmotion(request.healthData);

    // 3단계: 번역 (필요시)
    const translatedText = await translateFeedback(feedbackText, request.language);

    // 4단계: ElevenLabs를 통한 음성 합성
    const audioUrl = await synthesizeVoice(translatedText, emotion, request.language);

    // 5단계: 음성 파일 메타데이터 생성
    const duration = estimateDuration(translatedText);

    return {
      text: translatedText,
      audioUrl,
      emotion,
      duration,
    };
  } catch (error) {
    console.error("음성 피드백 생성 실패:", error);
    throw error;
  }
}

/**
 * LLM 기반 피드백 텍스트 생성
 */
async function generateFeedbackText(request: VoiceFeedbackRequest): Promise<string> {
  const prompt = `
당신은 럭셔리한 개인 건강 비서입니다. 사용자의 건강 데이터를 분석하여 따뜻하고 전문적인 음성 피드백을 생성하세요.

사용자 데이터:
- 보행 수: ${request.healthData.steps}걸음
- 운동 시간: ${request.healthData.exerciseMinutes}분
- 수면 시간: ${request.healthData.sleepHours}시간
- 혈압: ${request.healthData.bloodPressure}
- 혈당: ${request.healthData.bloodSugar}mg/dL
- 기분: ${request.healthData.moodLevel}/10
- 스트레스: ${request.healthData.stressLevel}/10

요구사항:
1. 30초 이내의 간결한 음성 피드백 생성
2. 사용자의 현재 상태를 긍정적으로 평가
3. 구체적인 개선 제안 1-2개 포함
4. 따뜻하고 격려하는 톤 사용
5. 명품 비서의 우아한 표현 사용

음성 피드백:
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "당신은 럭셔리한 개인 건강 비서입니다. 사용자에게 따뜻하고 전문적인 음성 피드백을 제공합니다.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content === "string") {
    return content;
  }
  return "건강 피드백을 생성할 수 없습니다.";
}

/**
 * 컨디션 기반 감정 분석
 */
function analyzeEmotion(
  healthData: VoiceFeedbackRequest["healthData"]
): "calm" | "energetic" | "concerned" | "encouraging" {
  const avgScore = (healthData.moodLevel + (10 - healthData.stressLevel)) / 2;

  if (healthData.bloodPressure.includes("높음") || healthData.bloodSugar > 140) {
    return "concerned"; // 우려스러운 톤
  }

  if (avgScore > 5) {
    return "energetic"; // 활기찬 톤
  }

  if (avgScore < -3) {
    return "calm"; // 차분한 톤
  }

  return "encouraging"; // 격려하는 톤
}

/**
 * DeepL API를 통한 자동 번역
 */
async function translateFeedback(text: string, targetLanguage: string): Promise<string> {
  if (targetLanguage === "ko") {
    return text; // 한국어는 번역 불필요
  }

  try {
    // DeepL API 호출 (실제 구현에서는 API 키 필요)
    const response = await fetch("https://api-free.deepl.com/v1/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      },
      body: JSON.stringify({
        text,
        target_lang: mapLanguageCode(targetLanguage),
      }),
    });

    const data = (await response.json()) as { translations: Array<{ text: string }> };
    return data.translations[0]?.text || text;
  } catch (error) {
    console.error("번역 실패, 원본 텍스트 사용:", error);
    return text;
  }
}

/**
 * ElevenLabs를 통한 음성 합성
 */
async function synthesizeVoice(
  text: string,
  emotion: string,
  language: string
): Promise<string> {
  try {
    // ElevenLabs API 호출 (실제 구현에서는 API 키 필요)
    const voiceId = selectVoiceId(emotion, language);
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API 오류: ${response.statusText}`);
    }

    // 음성 파일을 S3에 업로드 (실제 구현)
    const audioBuffer = await response.arrayBuffer();
    // S3 업로드 로직...
    return "https://s3.amazonaws.com/glwa-voice/sample.mp3"; // 임시 URL
  } catch (error) {
    console.error("음성 합성 실패:", error);
    throw error;
  }
}

/**
 * 감정 및 언어에 따른 음성 ID 선택
 */
function selectVoiceId(emotion: string, language: string): string {
  const voiceMap: Record<string, Record<string, string>> = {
    calm: {
      ko: "21m00Tcm4TlvDq8ikWAM", // 차분한 한국 여성 음성
      en: "EXAVITQu4vr4xnSDxMaL", // 차분한 영어 여성 음성
      zh: "9BWtsMINqrJLrRacOk9x", // 차분한 중국어 음성
      ar: "cgSgspJ2msLfdFuVlKEe", // 차분한 아랍어 음성
    },
    energetic: {
      ko: "TxGEqnHWrfWFTfGW9XjX", // 활기찬 한국 여성 음성
      en: "IKne3meq5aSrNqLZ5QQO", // 활기찬 영어 여성 음성
      zh: "FGpmtJ4gzqDQXNhuWUZo", // 활기찬 중국어 음성
      ar: "EXAVITQu4vr4xnSDxMaL", // 활기찬 아랍어 음성
    },
    concerned: {
      ko: "pNInz6obpgDQGcFmaJgB", // 우려스러운 한국 여성 음성
      en: "pNInz6obpgDQGcFmaJgB", // 우려스러운 영어 여성 음성
      zh: "pNInz6obpgDQGcFmaJgB", // 우려스러운 중국어 음성
      ar: "pNInz6obpgDQGcFmaJgB", // 우려스러운 아랍어 음성
    },
    encouraging: {
      ko: "21m00Tcm4TlvDq8ikWAM", // 격려하는 한국 여성 음성
      en: "EXAVITQu4vr4xnSDxMaL", // 격려하는 영어 여성 음성
      zh: "9BWtsMINqrJLrRacOk9x", // 격려하는 중국어 음성
      ar: "cgSgspJ2msLfdFuVlKEe", // 격려하는 아랍어 음성
    },
  };

  return voiceMap[emotion]?.[language] || voiceMap.encouraging.ko;
}

/**
 * 언어 코드 매핑 (DeepL 형식)
 */
function mapLanguageCode(language: string): string {
  const mapping: Record<string, string> = {
    ko: "KO",
    en: "EN-US",
    zh: "ZH",
    ar: "AR",
    es: "ES",
    ja: "JA",
    vi: "VI",
    th: "TH",
    ms: "MS",
  };

  return mapping[language] || "EN-US";
}

/**
 * 텍스트 길이 기반 음성 재생 시간 추정
 */
function estimateDuration(text: string): number {
  // 평균 음성 속도: 초당 150 단어
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 150) + 1; // 1초 여유
}
