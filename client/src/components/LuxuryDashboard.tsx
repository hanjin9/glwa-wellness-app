import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";
import { Activity, Moon, Heart, Utensils, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";

// 샘플 데이터
const walkingData = {
  steps: 8250,
  distance: 5.2,
  calories: 420,
  activity: 75,
};

const missionData = [
  { period: "1일", progress: 85 },
  { period: "3일", progress: 72 },
  { period: "7일", progress: 68 },
  { period: "2주", progress: 65 },
  { period: "1달", progress: 58 },
  { period: "3개월", progress: 52 },
  { period: "6개월", progress: 48 },
  { period: "1년", progress: 42 },
];

const sleepData = {
  hours: 7.5,
  quality: 85, // 0-100
};

const exerciseChartData = [
  { period: "1일", minutes: 45 },
  { period: "7일", minutes: 280 },
  { period: "14일", minutes: 560 },
  { period: "1달", minutes: 1200 },
  { period: "3개월", minutes: 3600 },
  { period: "6개월", minutes: 7200 },
  { period: "1년", minutes: 14400 },
];

const healthData = {
  systolic: 120,
  diastolic: 80,
  bloodSugar: 95,
};

const nutritionData = [
  { day: "월", protein: 65, carbs: 280, fat: 75, fiber: 25, calcium: 800 },
  { day: "화", protein: 72, carbs: 290, fat: 78, fiber: 28, calcium: 850 },
  { day: "수", protein: 68, carbs: 275, fat: 72, fiber: 26, calcium: 820 },
  { day: "목", protein: 75, carbs: 300, fat: 80, fiber: 30, calcium: 880 },
  { day: "금", protein: 70, carbs: 285, fat: 76, fiber: 27, calcium: 840 },
  { day: "토", protein: 78, carbs: 310, fat: 82, fiber: 32, calcium: 900 },
  { day: "일", protein: 72, carbs: 295, fat: 78, fiber: 29, calcium: 860 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

// 반투명 카드 래퍼
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={cardVariants}
      className={`backdrop-blur-xl bg-white/5 border border-[#d4af37]/20 rounded-2xl p-5 hover:border-[#d4af37]/40 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function LuxuryDashboard() {
  const [selectedNutritionPeriod, setSelectedNutritionPeriod] = useState("week");
  const [selectedExercisePeriod, setSelectedExercisePeriod] = useState("month");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* 6분할 계기판 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 상좌: 보행 데이터 */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#d4af37]/20">
                <Activity className="w-5 h-5 text-[#d4af37]" />
              </div>
              <h3 className="font-semibold text-white">보행 활동</h3>
            </div>
            <span className="text-xs text-[#d4af37]/60">오늘</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-[#d4af37]/60">보행 수</p>
                <p className="text-2xl font-bold text-[#d4af37]">{walkingData.steps.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#d4af37]/60">거리</p>
                <p className="text-xl font-bold text-[#d4af37]">{walkingData.distance}km</p>
              </div>
            </div>

            <div className="h-px bg-[#d4af37]/10" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#d4af37]/60">칼로리</p>
                <p className="text-lg font-bold text-[#f4d03f]">{walkingData.calories}</p>
                <p className="text-xs text-[#d4af37]/50">kcal</p>
              </div>
              <div>
                <p className="text-xs text-[#d4af37]/60">활동량</p>
                <p className="text-lg font-bold text-[#f4d03f]">{walkingData.activity}%</p>
                <div className="w-full h-1 bg-[#d4af37]/20 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f]" style={{ width: `${walkingData.activity}%` }} />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 상우: 미션 진행률 표 */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#d4af37]/20">
                <TrendingUp className="w-5 h-5 text-[#d4af37]" />
              </div>
              <h3 className="font-semibold text-white">미션 진행률</h3>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {missionData.map((mission, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-[#d4af37]/70 w-12">{mission.period}</span>
                <div className="flex-1 mx-2 h-1.5 bg-[#d4af37]/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mission.progress}%` }}
                    transition={{ delay: idx * 0.05, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
                  />
                </div>
                <span className="text-[#d4af37] font-semibold w-10 text-right">{mission.progress}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 중좌: 수면 데이터 */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#d4af37]/20">
                <Moon className="w-5 h-5 text-[#d4af37]" />
              </div>
              <h3 className="font-semibold text-white">수면</h3>
            </div>
            <span className="text-xs text-[#d4af37]/60">어제</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#d4af37]/70">수면 시간</span>
                <span className="text-2xl font-bold text-[#d4af37]">{sleepData.hours}h</span>
              </div>
              <div className="w-full h-2 bg-[#d4af37]/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f]" style={{ width: `${(sleepData.hours / 10) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#d4af37]/70">수면 질</span>
                <span className="text-2xl font-bold text-[#f4d03f]">{sleepData.quality}%</span>
              </div>
              <div className="w-full h-2 bg-[#d4af37]/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#f4d03f] to-[#d4af37]" style={{ width: `${sleepData.quality}%` }} />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 중우: 운동 시간 차트 */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#d4af37]/20">
                <Activity className="w-5 h-5 text-[#d4af37]" />
              </div>
              <h3 className="font-semibold text-white">운동 시간</h3>
            </div>
            <select
              value={selectedExercisePeriod}
              onChange={(e) => setSelectedExercisePeriod(e.target.value)}
              className="text-xs bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] rounded px-2 py-1"
            >
              <option value="week">주간</option>
              <option value="month">월간</option>
              <option value="year">연간</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={exerciseChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4af37/20" />
              <XAxis dataKey="period" stroke="#d4af37/50" style={{ fontSize: "12px" }} />
              <YAxis stroke="#d4af37/50" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 10, 10, 0.9)",
                  border: "1px solid #d4af37/30",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#d4af37" }}
              />
              <Bar dataKey="minutes" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#f4d03f" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* 하좌: 혈압/혈당 */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#d4af37]/20">
                <Heart className="w-5 h-5 text-[#d4af37]" />
              </div>
              <h3 className="font-semibold text-white">건강 지표</h3>
            </div>
            <span className="text-xs text-[#d4af37]/60">정상</span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#d4af37]/70 mb-2">혈압</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#d4af37]">{healthData.systolic}</span>
                <span className="text-xs text-[#d4af37]/60">/</span>
                <span className="text-2xl font-bold text-[#d4af37]">{healthData.diastolic}</span>
                <span className="text-xs text-[#d4af37]/50">mmHg</span>
              </div>
            </div>

            <div className="h-px bg-[#d4af37]/10" />

            <div>
              <p className="text-sm text-[#d4af37]/70 mb-2">혈당</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#f4d03f]">{healthData.bloodSugar}</span>
                <span className="text-xs text-[#d4af37]/50">mg/dL</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 하우: 식단 영양 차트 */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#d4af37]/20">
                <Utensils className="w-5 h-5 text-[#d4af37]" />
              </div>
              <h3 className="font-semibold text-white">식단 영양</h3>
            </div>
            <select
              value={selectedNutritionPeriod}
              onChange={(e) => setSelectedNutritionPeriod(e.target.value)}
              className="text-xs bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] rounded px-2 py-1"
            >
              <option value="week">주간</option>
              <option value="month">월간</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={nutritionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4af37/20" />
              <XAxis dataKey="day" stroke="#d4af37/50" style={{ fontSize: "12px" }} />
              <YAxis stroke="#d4af37/50" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 10, 10, 0.9)",
                  border: "1px solid #d4af37/30",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#d4af37" }}
              />
              <Line type="monotone" dataKey="protein" stroke="#FF6B6B" strokeWidth={2} dot={false} name="단백질" />
              <Line type="monotone" dataKey="carbs" stroke="#4ECDC4" strokeWidth={2} dot={false} name="탄수화물" />
              <Line type="monotone" dataKey="fat" stroke="#FFE66D" strokeWidth={2} dot={false} name="지방" />
              <Line type="monotone" dataKey="fiber" stroke="#95E1D3" strokeWidth={2} dot={false} name="식이섬유" />
              <Line type="monotone" dataKey="calcium" stroke="#C7CEEA" strokeWidth={2} dot={false} name="칼슘" />
            </ComposedChart>
          </ResponsiveContainer>

          {/* 범례 */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
              <span className="text-[#d4af37]/70">단백질</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#4ECDC4]" />
              <span className="text-[#d4af37]/70">탄수화물</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FFE66D]" />
              <span className="text-[#d4af37]/70">지방</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#95E1D3]" />
              <span className="text-[#d4af37]/70">식이섬유</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
