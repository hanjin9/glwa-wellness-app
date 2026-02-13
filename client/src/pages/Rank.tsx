import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Award, Star, ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

const beltSystem = [
  { id: "white", name: "화이트벨트", emoji: "⬜", years: 0, days: 0, color: "bg-gray-100 border-gray-300", desc: "건강 여정의 시작" },
  { id: "yellow", name: "옐로우벨트", emoji: "🟨", years: 0, days: 100, color: "bg-yellow-50 border-yellow-300", desc: "100일 달성" },
  { id: "green", name: "그린벨트", emoji: "🟩", years: 0, days: 365, color: "bg-green-50 border-green-300", desc: "1년 달성" },
  { id: "blue", name: "블루벨트", emoji: "🟦", years: 1, days: 730, color: "bg-blue-50 border-blue-300", desc: "2년 달성" },
  { id: "red", name: "레드벨트", emoji: "🟥", years: 2, days: 1000, color: "bg-red-50 border-red-300", desc: "1,000일 달성" },
  { id: "black", name: "블랙벨트 (1단)", emoji: "⬛", years: 3, days: 1095, color: "bg-gray-800 border-gray-900 text-white", desc: "3년 달성" },
  { id: "master2", name: "사범 2단", emoji: "🥋", years: 4, days: 1460, color: "bg-gray-900 border-black text-white", desc: "4년 달성" },
  { id: "master3", name: "사범 3단", emoji: "🥋", years: 5, days: 1825, color: "bg-gray-950 border-black text-white", desc: "5년 달성" },
  { id: "grandmaster", name: "그랜드마스터", emoji: "👑", years: 10, days: 3650, color: "gradient-gold text-white", desc: "10년 달성" },
];

const milestones = [
  { days: 100, label: "100일", emoji: "🌱" },
  { days: 365, label: "1년", emoji: "🌿" },
  { days: 1000, label: "1,000일", emoji: "🌳" },
  { days: 3650, label: "10년", emoji: "🏔️" },
  { days: 10000, label: "10,000일", emoji: "⭐" },
  { days: 30000, label: "30,000일", emoji: "🌟" },
];

export default function Rank() {
  const [, setLocation] = useLocation();
  const { data: profile } = trpc.profile.get.useQuery(undefined, { retry: false });

  const totalDays = profile?.totalDays || 0;
  const currentBeltId = profile?.beltRank || "white";
  const currentBeltIndex = beltSystem.findIndex((b) => b.id === currentBeltId);
  const currentBelt = beltSystem[currentBeltIndex] || beltSystem[0];
  const nextBelt = beltSystem[currentBeltIndex + 1];

  const progressToNext = nextBelt
    ? Math.min(100, Math.round(((totalDays - currentBelt.days) / (nextBelt.days - currentBelt.days)) * 100))
    : 100;

  return (
    <div className="space-y-6">
      <button onClick={() => setLocation("/dashboard")} className="text-sm text-muted-foreground flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> 대시보드
      </button>

      <div>
        <h1 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
          승급 시스템
        </h1>
        <p className="text-xs text-muted-foreground">평생 건강 프로젝트 트래킹</p>
      </div>

      {/* Current Rank */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="gradient-warm rounded-2xl p-6 text-white text-center"
      >
        <div className="text-5xl mb-3">{currentBelt.emoji}</div>
        <h2 className="text-xl font-bold mb-1">{currentBelt.name}</h2>
        <p className="text-white/80 text-sm mb-4">누적 {totalDays.toLocaleString()}일</p>
        {nextBelt && (
          <div>
            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
              <span>{currentBelt.name}</span>
              <span>{nextBelt.name}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="text-xs text-white/70 mt-2">
              다음 승급까지 {(nextBelt.days - totalDays).toLocaleString()}일
            </p>
          </div>
        )}
      </motion.div>

      {/* Belt System */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" /> 벨트 등급
        </h2>
        <div className="space-y-2">
          {beltSystem.map((belt, i) => {
            const achieved = i <= currentBeltIndex;
            return (
              <Card key={belt.id} className={`shadow-sm border-border/50 ${!achieved ? "opacity-50" : ""}`}>
                <CardContent className="p-3 flex items-center gap-3">
                  <span className="text-2xl">{belt.emoji}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold">{belt.name}</p>
                    <p className="text-[10px] text-muted-foreground">{belt.desc}</p>
                  </div>
                  {achieved && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Long-term Milestones */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" /> 장기 프로젝트 마일스톤
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {milestones.map((m) => {
            const achieved = totalDays >= m.days;
            const progress = Math.min(100, Math.round((totalDays / m.days) * 100));
            return (
              <Card key={m.days} className={`shadow-sm border-border/50 ${!achieved ? "opacity-60" : ""}`}>
                <CardContent className="p-3 text-center">
                  <span className="text-2xl">{m.emoji}</span>
                  <p className="text-xs font-semibold mt-1">{m.label}</p>
                  <Progress value={progress} className="h-1 mt-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{progress}%</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
