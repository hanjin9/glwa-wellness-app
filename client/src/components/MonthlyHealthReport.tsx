import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Target, Download, Share2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";

interface HealthMetric {
  name: string;
  baselineValue: number;
  currentValue: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
}

interface MonthlyHealthReportProps {
  month: string;
  year: number;
  metrics: HealthMetric[];
  trendData: Array<{ month: string; score: number }>;
  goals: Array<{ title: string; progress: number; completed: boolean }>;
}

export default function MonthlyHealthReport({
  month,
  year,
  metrics,
  trendData,
  goals,
}: MonthlyHealthReportProps) {
  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case "down":
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case "stable":
        return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-green-400";
      case "down":
        return "text-red-400";
      case "stable":
        return "text-yellow-400";
    }
  };

  const getTrendLabel = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "개선됨";
      case "down":
        return "악화됨";
      case "stable":
        return "유지";
    }
  };

  const overallScore = Math.round(
    metrics.reduce((sum, m) => sum + m.currentValue, 0) / metrics.length
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] rounded-2xl p-8 text-black"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {year}년 {month} 건강 종합 리포트
            </h1>
            <p className="text-sm opacity-80">
              초기 베이스값 대비 현재 건강 상태 분석
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{overallScore}</div>
            <p className="text-sm opacity-80">종합 건강도</p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 rounded-lg font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF 다운로드
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 rounded-lg font-semibold transition-colors"
          >
            <Share2 className="w-4 h-4" />
            공유
          </motion.button>
        </div>
      </motion.div>

      {/* 1. 베이스값 vs 현재 상태 비교 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border border-[#d4af37]/20 p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-[#d4af37] to-[#f4d03f] rounded" />
          베이스값 vs 현재 상태
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="bg-black/50 border border-[#d4af37]/10 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{metric.name}</h3>
                  <p className="text-xs text-[#d4af37]/60">
                    초기값: {metric.baselineValue} {metric.unit}
                  </p>
                </div>
                {getTrendIcon(metric.trend)}
              </div>

              <div className="flex items-end gap-4 mb-3">
                <div>
                  <p className="text-2xl font-bold text-[#d4af37]">
                    {metric.currentValue}
                  </p>
                  <p className="text-xs text-[#d4af37]/60">{metric.unit}</p>
                </div>
                <div className={`text-sm font-semibold ${getTrendColor(metric.trend)}`}>
                  {metric.trend === "up" ? "+" : ""}
                  {metric.change}% ({getTrendLabel(metric.trend)})
                </div>
              </div>

              {/* 진행 바 */}
              <div className="w-full h-2 bg-[#d4af37]/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((metric.currentValue / 100) * 100, 100)}%`,
                  }}
                  transition={{ delay: 0.3, duration: 1 }}
                  className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 2. 장기 건강 트렌드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border border-[#d4af37]/20 p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-[#d4af37] to-[#f4d03f] rounded" />
          장기 건강 트렌드 (3개월)
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d4af37/20" />
            <XAxis dataKey="month" stroke="#d4af37/50" style={{ fontSize: "12px" }} />
            <YAxis stroke="#d4af37/50" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.9)",
                border: "1px solid #d4af37/30",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#d4af37" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#d4af37"
              strokeWidth={3}
              dot={{ fill: "#f4d03f", r: 5 }}
              activeDot={{ r: 7 }}
              name="건강도"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* 트렌드 분석 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-black/50 border border-green-500/30 rounded-lg p-4 text-center">
            <p className="text-xs text-green-400/60 mb-2">최고 기록</p>
            <p className="text-2xl font-bold text-green-400">
              {Math.max(...trendData.map((d) => d.score))}
            </p>
          </div>
          <div className="bg-black/50 border border-yellow-500/30 rounded-lg p-4 text-center">
            <p className="text-xs text-yellow-400/60 mb-2">평균</p>
            <p className="text-2xl font-bold text-yellow-400">
              {Math.round(
                trendData.reduce((sum, d) => sum + d.score, 0) / trendData.length
              )}
            </p>
          </div>
          <div className="bg-black/50 border border-blue-500/30 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-400/60 mb-2">최근</p>
            <p className="text-2xl font-bold text-blue-400">
              {trendData[trendData.length - 1]?.score || 0}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3. 다음 달 목표 설정 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border border-[#d4af37]/20 p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#d4af37]" />
          다음 달 목표 설정
        </h2>

        <div className="space-y-3">
          {goals.map((goal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="bg-black/50 border border-[#d4af37]/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    className="w-5 h-5 rounded border-[#d4af37]/30 bg-black checked:bg-[#d4af37] cursor-pointer"
                  />
                  <span
                    className={`font-semibold ${
                      goal.completed
                        ? "text-[#d4af37]/50 line-through"
                        : "text-white"
                    }`}
                  >
                    {goal.title}
                  </span>
                </div>
                <span className="text-sm font-bold text-[#d4af37]">
                  {goal.progress}%
                </span>
              </div>

              {/* 진행 바 */}
              <div className="w-full h-2 bg-[#d4af37]/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ delay: 0.4, duration: 1 }}
                  className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 새 목표 추가 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-6 py-3 border-2 border-dashed border-[#d4af37]/30 hover:border-[#d4af37]/60 text-[#d4af37] font-semibold rounded-lg transition-colors"
        >
          + 새 목표 추가
        </motion.button>
      </motion.div>

      {/* 4. AI 처방 피드백 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border border-[#d4af37]/20 p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6">🤖 AI 처방 피드백</h2>

        <div className="space-y-4">
          {/* 운동 추천 */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">💪 추천 운동</h3>
            <p className="text-sm text-blue-400/80 mb-3">
              현재 건강 상태를 고려한 맞춤 운동 프로그램입니다.
            </p>
            <ul className="text-sm text-blue-400/70 space-y-1">
              <li>• 가벼운 스트레칭 (매일 10분)</li>
              <li>• 산책 (주 3회, 30분)</li>
              <li>• 요가 (주 2회, 20분)</li>
            </ul>
          </div>

          {/* 식단 조언 */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">🥗 식단 조언</h3>
            <p className="text-sm text-green-400/80 mb-3">
              부족한 영양소를 보충하기 위한 식단 가이드입니다.
            </p>
            <ul className="text-sm text-green-400/70 space-y-1">
              <li>• 단백질 섭취 증가 (계란, 생선, 두부)</li>
              <li>• 비타민 C 풍부한 음식 (오렌지, 브로콜리)</li>
              <li>• 수분 섭취 (하루 2L 이상)</li>
            </ul>
          </div>

          {/* 의료 상담 권고 */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">⚕️ 의료 상담 권고</h3>
            <p className="text-sm text-yellow-400/80">
              지속적인 가슴 통증이 감지되었습니다. 심장 전문의 상담을 권장합니다.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-3 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold rounded-lg transition-colors"
            >
              전문가 상담 예약
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
