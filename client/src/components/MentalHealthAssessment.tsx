import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Moon, Zap, AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import { getHanJinLevelInfo, getHanJinGradient, formatHanJinLevel } from "@/utils/hanJinLevel";

interface MentalHealthData {
  stressLevel: number; // HanJin Level: -10 ~ +10
  sleepQuality: number; // HanJin Level: -10 ~ +10
  fatigueLevel: number; // 0-10
  anxietyLevel: number; // 0-10
  mentalState: "good" | "normal" | "bad";
  notes: string;
}

interface MentalHealthAssessmentProps {
  onSave?: (data: MentalHealthData) => void;
  initialData?: Partial<MentalHealthData>;
}

export default function MentalHealthAssessment({
  onSave,
  initialData,
}: MentalHealthAssessmentProps) {
  const [stressLevel, setStressLevel] = useState(initialData?.stressLevel ?? 0); // HanJin Level
  const [sleepQuality, setSleepQuality] = useState(initialData?.sleepQuality ?? 0); // HanJin Level
  const [fatigueLevel, setFatigueLevel] = useState(initialData?.fatigueLevel ?? 5);
  const [anxietyLevel, setAnxietyLevel] = useState(initialData?.anxietyLevel ?? 5);
  const [mentalState, setMentalState] = useState<"good" | "normal" | "bad">(
    initialData?.mentalState ?? "normal"
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const handleSave = () => {
    onSave?.({
      stressLevel,
      sleepQuality,
      fatigueLevel,
      anxietyLevel,
      mentalState,
      notes,
    });
  };

  // HanJin Level 색상 결정
  const getHanJinColor = (value: number) => {
    const info = getHanJinLevelInfo(value);
    return info.color;
  };

  // HanJin Level 배경색
  const getHanJinBgColor = (value: number) => {
    const info = getHanJinLevelInfo(value);
    return `${info.bgColor} border ${info.borderColor}`;
  };

  // HanJin Level 라벨
  const getHanJinLabel = (value: number) => {
    const info = getHanJinLevelInfo(value);
    return `${info.label} (${info.category})`;
  };

  // 정신건강 종합 점수 계산
  const mentalHealthScore = Math.round(
    (Math.max(stressLevel, 0) * 0.3 +
      Math.max(sleepQuality, 0) * 0.3 +
      (10 - fatigueLevel) * 0.2 +
      (10 - anxietyLevel) * 0.2) /
      10
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8" />
              정신건강 평가
            </h1>
            <p className="text-sm opacity-90">
              스트레스, 수면, 피로도를 통해 정신건강을 종합 평가합니다
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{mentalHealthScore}</div>
            <p className="text-sm opacity-90">정신건강 점수</p>
          </div>
        </div>
      </motion.div>

      {/* 1. 스트레스 지수 (HanJin Level) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl border p-6 ${getHanJinBgColor(stressLevel)}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-lg font-bold text-white">스트레스 지수</h2>
              <p className="text-xs text-purple-400/70">
                현재 스트레스 수준을 평가하세요
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getHanJinColor(stressLevel)}`}>
              {stressLevel > 0 ? "+" : ""}{stressLevel}
            </div>
            <p className="text-xs text-purple-400/70">
              {getHanJinLabel(stressLevel)}
            </p>
          </div>
        </div>

            {/* HanJin 슬라이더 */}
            <div className="space-y-3">
              <input
                type="range"
                min="-10"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: getHanJinGradient(),
                }}
              />
              <div className="flex justify-between text-xs text-purple-400/60">
                <span>-10 (최악악화)</span>
                <span>0 (정상)</span>
                <span>+10 (최고)</span>
              </div>
            </div>
      </motion.div>

      {/* 2. 수면 질 (HanJin Level) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`rounded-2xl border p-6 ${getHanJinBgColor(sleepQuality)}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Moon className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-white">수면 질</h2>
              <p className="text-xs text-blue-400/70">
                수면의 질과 깊이를 평가하세요
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getHanJinColor(sleepQuality)}`}>
              {sleepQuality > 0 ? "+" : ""}{sleepQuality}
            </div>
            <p className="text-xs text-blue-400/70">
              {getHanJinLabel(sleepQuality)}
            </p>
          </div>
        </div>

            {/* HanJin 슬라이더 */}
            <div className="space-y-3">
              <input
                type="range"
                min="-10"
                max="10"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: getHanJinGradient(),
                }}
              />
              <div className="flex justify-between text-xs text-blue-400/60">
                <span>-10 (최악악화)</span>
                <span>0 (정상)</span>
                <span>+10 (최고)</span>
              </div>
            </div>
      </motion.div>

      {/* 3. 피로도 (0-10) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-orange-500/20 border border-orange-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-orange-400" />
            <div>
              <h2 className="text-lg font-bold text-white">피로도</h2>
              <p className="text-xs text-orange-400/70">
                현재 피로 수준을 평가하세요
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-400">{fatigueLevel}</div>
            <p className="text-xs text-orange-400/70">
              {fatigueLevel <= 3 ? "낮음" : fatigueLevel <= 6 ? "중간" : "높음"}
            </p>
          </div>
        </div>

        {/* 슬라이더 */}
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="10"
            value={fatigueLevel}
            onChange={(e) => setFatigueLevel(Number(e.target.value))}
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                #22c55e 0%, 
                #eab308 50%, 
                #ef4444 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-orange-400/60">
            <span>0 (없음)</span>
            <span>5 (중간)</span>
            <span>10 (극심함)</span>
          </div>
        </div>
      </motion.div>

      {/* 4. 불안감 (0-10) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <h2 className="text-lg font-bold text-white">불안감</h2>
              <p className="text-xs text-red-400/70">
                현재 불안 수준을 평가하세요
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-red-400">{anxietyLevel}</div>
            <p className="text-xs text-red-400/70">
              {anxietyLevel <= 3 ? "낮음" : anxietyLevel <= 6 ? "중간" : "높음"}
            </p>
          </div>
        </div>

        {/* 슬라이더 */}
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="10"
            value={anxietyLevel}
            onChange={(e) => setAnxietyLevel(Number(e.target.value))}
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                #22c55e 0%, 
                #eab308 50%, 
                #ef4444 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-red-400/60">
            <span>0 (없음)</span>
            <span>5 (중간)</span>
            <span>10 (극심함)</span>
          </div>
        </div>
      </motion.div>

      {/* 5. 정신 상태 선택 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#d4af37]/20 rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold text-white mb-4">정신 상태</h2>
        <div className="grid grid-cols-3 gap-3">
          {(["good", "normal", "bad"] as const).map((state) => (
            <motion.button
              key={state}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMentalState(state)}
              className={`py-3 rounded-lg font-semibold transition-all ${
                mentalState === state
                  ? state === "good"
                    ? "bg-green-500/30 border-2 border-green-500 text-green-400"
                    : state === "normal"
                      ? "bg-yellow-500/30 border-2 border-yellow-500 text-yellow-400"
                      : "bg-red-500/30 border-2 border-red-500 text-red-400"
                  : "bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37]/70 hover:border-[#d4af37]/40"
              }`}
            >
              {state === "good" ? "😊 좋음" : state === "normal" ? "😐 보통" : "😔 나쁨"}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 6. 추가 메모 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#d4af37]/20 rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold text-white mb-4">추가 메모</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="스트레스의 원인, 수면 방해 요인 등을 자유롭게 기록하세요..."
          className="w-full h-24 bg-black/50 border border-[#d4af37]/20 rounded-lg p-3 text-white placeholder-[#d4af37]/40 focus:border-[#d4af37]/50 focus:outline-none resize-none"
        />
      </motion.div>

      {/* 스트레스-수면 연관성 분석 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold text-white mb-4">🔗 스트레스-수면 연관성</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white">스트레스 지수</span>
            <span className={`font-bold ${getHanJinColor(stressLevel)}`}>
              {stressLevel > 0 ? "+" : ""}{stressLevel}
            </span>
          </div>
          <div className="h-1 bg-gradient-to-r from-red-500 via-gray-500 to-green-500 rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-white">수면 질</span>
            <span className={`font-bold ${getHanJinColor(sleepQuality)}`}>
              {sleepQuality > 0 ? "+" : ""}{sleepQuality}
            </span>
          </div>
        </div>

        {/* AI 분석 */}
        <div className="mt-4 p-3 bg-black/50 border border-purple-500/20 rounded-lg">
          <p className="text-sm text-purple-400">
            {stressLevel > 3 && sleepQuality < -3
              ? "⚠️ 높은 스트레스가 수면을 방해하고 있습니다. 명상이나 요가를 추천합니다."
              : stressLevel < -3 && sleepQuality > 3
                ? "✅ 스트레스가 감소하면서 수면의 질이 개선되고 있습니다!"
                : "📊 스트레스와 수면의 균형을 유지하세요."}
          </p>
        </div>
      </motion.div>

      {/* 저장 버튼 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
      >
        정신건강 평가 저장
      </motion.button>
    </div>
  );
}
