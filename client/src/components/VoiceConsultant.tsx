/**
 * GLWA 글로벌 보이스 제국 - 음성 컨설턴트 UI
 * 
 * 사용자의 건강 데이터를 분석하여 AI 음성 피드백을 제공하는 컴포넌트
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Loader } from "lucide-react";

interface VoiceConsultantProps {
  userId: string;
  healthData?: {
    steps: number;
    exerciseMinutes: number;
    sleepHours: number;
    bloodPressure: string;
    bloodSugar: number;
    moodLevel: number;
    stressLevel: number;
  };
  language?: string;
}

export function VoiceConsultant({
  userId,
  healthData = {
    steps: 8500,
    exerciseMinutes: 45,
    sleepHours: 7.5,
    bloodPressure: "120/80",
    bloodSugar: 95,
    moodLevel: 6,
    stressLevel: -3,
  },
  language = "ko",
}: VoiceConsultantProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  const handleGenerateVoice = async () => {
    setIsLoading(true);
    try {
      // API 호출 (실제 구현에서는 tRPC 라우터 사용)
      const response = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          healthData,
          language,
        }),
      });

      const data = (await response.json()) as {
        audioUrl: string;
        text: string;
        emotion: string;
      };
      setAudioUrl(data.audioUrl);
      setFeedbackText(data.text);
    } catch (error) {
      console.error("음성 생성 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-600/30 rounded-2xl p-6 shadow-2xl"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-400">AI 음성 컨설턴트</h3>
            <p className="text-sm text-gray-400">개인 건강 비서가 당신을 위해 준비했습니다</p>
          </div>
        </div>
      </div>

      {/* 건강 데이터 요약 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">보행 수</p>
          <p className="text-lg font-bold text-yellow-400">{healthData.steps.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">운동 시간</p>
          <p className="text-lg font-bold text-yellow-400">{healthData.exerciseMinutes}분</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">수면 시간</p>
          <p className="text-lg font-bold text-yellow-400">{healthData.sleepHours}시간</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400">혈당</p>
          <p className="text-lg font-bold text-yellow-400">{healthData.bloodSugar} mg/dL</p>
        </div>
      </div>

      {/* 피드백 텍스트 */}
      {feedbackText && (
        <div className="bg-gray-800/30 rounded-lg p-4 mb-6 border border-yellow-500/20">
          <p className="text-sm text-gray-200 leading-relaxed">{feedbackText}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateVoice}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              음성 생성
            </>
          )}
        </motion.button>

        {audioUrl && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 text-yellow-400 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isPlaying ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                재생 중...
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                재생
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* 럭셔리 데코레이션 */}
      <div className="mt-6 pt-6 border-t border-yellow-600/20">
        <p className="text-xs text-gray-500 text-center">
          🎙️ ElevenLabs AI 음성 기술 · Whisper 음성 인식 · DeepL 번역
        </p>
      </div>
    </motion.div>
  );
}
