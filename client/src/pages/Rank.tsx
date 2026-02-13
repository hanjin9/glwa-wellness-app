import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Award, Star, ChevronLeft, Trophy, Target, Users, Flame } from "lucide-react";
import { useLocation } from "wouter";

const beltSystem = [
  {
    id: "white",
    step: 0,
    name: "White LEVEL",
    emoji: "⬜",
    daysReq: 0,
    missionReq: 0,
    participationReq: 0,
    period: "시작",
    desc: "건강 여정의 시작",
    bgColor: "bg-white",
    borderColor: "border-gray-300",
    gradient: "from-gray-100 to-gray-300",
    textColor: "text-gray-600",
    ringColor: "#d1d5db",
  },
  {
    id: "white1",
    step: 1,
    name: "Step 1 (White LEVEL)",
    emoji: "⬜",
    daysReq: 100,
    missionReq: 5,
    participationReq: 10,
    period: "100일",
    desc: "100일 수련 달성",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-400",
    gradient: "from-gray-200 to-gray-400",
    textColor: "text-gray-700",
    ringColor: "#9ca3af",
  },
  {
    id: "yellow",
    step: 2,
    name: "Step 2 (Yellow LEVEL)",
    emoji: "🟨",
    daysReq: 190,
    missionReq: 15,
    participationReq: 30,
    period: "3개월",
    desc: "3개월 수련 달성",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-400",
    gradient: "from-yellow-300 to-yellow-500",
    textColor: "text-yellow-700",
    ringColor: "#facc15",
  },
  {
    id: "green",
    step: 3,
    name: "Step 3 (Green LEVEL)",
    emoji: "🟩",
    daysReq: 370,
    missionReq: 30,
    participationReq: 60,
    period: "6개월",
    desc: "6개월 수련 달성",
    bgColor: "bg-green-50",
    borderColor: "border-green-400",
    gradient: "from-green-300 to-green-500",
    textColor: "text-green-700",
    ringColor: "#22c55e",
  },
  {
    id: "brown",
    step: 4,
    name: "Step 4 (Brown LEVEL)",
    emoji: "🟫",
    daysReq: 550,
    missionReq: 50,
    participationReq: 100,
    period: "6개월",
    desc: "1년 수련 달성",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-700",
    gradient: "from-amber-600 to-amber-800",
    textColor: "text-amber-800",
    ringColor: "#92400e",
  },
  {
    id: "purple",
    step: 5,
    name: "Step 5 (Purple LEVEL)",
    emoji: "🟪",
    daysReq: 730,
    missionReq: 75,
    participationReq: 150,
    period: "6개월",
    desc: "1년 6개월 수련 달성",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-400",
    gradient: "from-purple-400 to-purple-600",
    textColor: "text-purple-700",
    ringColor: "#a855f7",
  },
  {
    id: "blue",
    step: 6,
    name: "Step 6 (Blue LEVEL)",
    emoji: "🟦",
    daysReq: 910,
    missionReq: 100,
    participationReq: 200,
    period: "6개월",
    desc: "2년 수련 달성",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-400",
    gradient: "from-blue-400 to-blue-600",
    textColor: "text-blue-700",
    ringColor: "#3b82f6",
  },
  {
    id: "red",
    step: 7,
    name: "Step 7 (Red LEVEL)",
    emoji: "🟥",
    daysReq: 1095,
    missionReq: 130,
    participationReq: 260,
    period: "6개월",
    desc: "2년 6개월 수련 달성",
    bgColor: "bg-red-50",
    borderColor: "border-red-400",
    gradient: "from-red-400 to-red-600",
    textColor: "text-red-700",
    ringColor: "#ef4444",
  },
  {
    id: "redblack",
    step: 8,
    name: "Step 8 (Red-Black LEVEL)",
    emoji: "🔴⚫",
    daysReq: 1275,
    missionReq: 170,
    participationReq: 340,
    period: "6개월",
    desc: "3년 수련 달성",
    bgColor: "bg-gray-100",
    borderColor: "border-red-800",
    gradient: "from-red-600 to-gray-900",
    textColor: "text-red-900",
    ringColor: "#991b1b",
  },
  {
    id: "black",
    step: 9,
    name: "Step 9 · Black LEVEL (1st Dan)",
    emoji: "⬛",
    daysReq: 1640,
    missionReq: 220,
    participationReq: 440,
    period: "1년",
    desc: "4년+ 수련 달성 · Black LEVEL 1st Dan",
    bgColor: "bg-gray-900",
    borderColor: "border-black",
    gradient: "from-gray-800 to-black",
    textColor: "text-white",
    ringColor: "#000000",
  },
  {
    id: "dan2",
    step: 10,
    name: "Black LEVEL 2nd Dan",
    emoji: "🥋",
    daysReq: 2005,
    missionReq: 300,
    participationReq: 600,
    period: "1년",
    desc: "5년+ 수련 · 2nd Dan Master",
    bgColor: "bg-gray-950",
    borderColor: "border-black",
    gradient: "from-gray-900 to-black",
    textColor: "text-white",
    ringColor: "#1a1a2e",
  },
  {
    id: "dan3",
    step: 11,
    name: "Black LEVEL 3rd Dan",
    emoji: "🥋",
    daysReq: 2370,
    missionReq: 400,
    participationReq: 800,
    period: "1년",
    desc: "6년+ 수련 · 3rd Dan Master",
    bgColor: "bg-gray-950",
    borderColor: "border-black",
    gradient: "from-gray-900 via-gray-800 to-black",
    textColor: "text-white",
    ringColor: "#0f0f23",
  },
  {
    id: "dan4",
    step: 12,
    name: "4th Dan · Grand Master",
    emoji: "👑",
    daysReq: 3100,
    missionReq: 550,
    participationReq: 1100,
    period: "2년",
    desc: "8년+ 수련 · Grand Master",
    bgColor: "bg-black",
    borderColor: "border-amber-500",
    gradient: "from-amber-500 via-yellow-600 to-amber-800",
    textColor: "text-white",
    ringColor: "#b45309",
  },
  {
    id: "dan5",
    step: 13,
    name: "5th Dan · Grand Master",
    emoji: "👑",
    daysReq: 3830,
    missionReq: 700,
    participationReq: 1400,
    period: "2년",
    desc: "10년+ 수련 · Grand Master 5th Dan",
    bgColor: "bg-black",
    borderColor: "border-amber-500",
    gradient: "from-amber-600 via-yellow-500 to-amber-700",
    textColor: "text-white",
    ringColor: "#a16207",
  },
  {
    id: "dan6",
    step: 14,
    name: "6th Dan · Grand Master",
    emoji: "👑",
    daysReq: 4560,
    missionReq: 850,
    participationReq: 1700,
    period: "2년",
    desc: "12년+ 수련 · Grand Master 6th Dan",
    bgColor: "bg-black",
    borderColor: "border-amber-400",
    gradient: "from-amber-500 via-orange-500 to-amber-700",
    textColor: "text-white",
    ringColor: "#ca8a04",
  },
  {
    id: "dan7",
    step: 15,
    name: "7th Dan · Grand Master",
    emoji: "👑",
    daysReq: 5290,
    missionReq: 1000,
    participationReq: 2000,
    period: "2년",
    desc: "14년+ 수련 · Grand Master 7th Dan",
    bgColor: "bg-black",
    borderColor: "border-yellow-400",
    gradient: "from-yellow-500 via-amber-500 to-orange-600",
    textColor: "text-white",
    ringColor: "#eab308",
  },
  {
    id: "dan8",
    step: 16,
    name: "8th Dan · Grand Master",
    emoji: "👑",
    daysReq: 6020,
    missionReq: 1200,
    participationReq: 2400,
    period: "2년",
    desc: "16년+ 수련 · Grand Master 8th Dan",
    bgColor: "bg-black",
    borderColor: "border-yellow-300",
    gradient: "from-yellow-400 via-amber-400 to-yellow-600",
    textColor: "text-white",
    ringColor: "#fbbf24",
  },
  {
    id: "dan9",
    step: 17,
    name: "9th Dan · Grand Master",
    emoji: "👑",
    daysReq: 6750,
    missionReq: 1400,
    participationReq: 2800,
    period: "2년",
    desc: "18년+ 수련 · Grand Master 9th Dan",
    bgColor: "bg-black",
    borderColor: "border-yellow-200",
    gradient: "from-yellow-300 via-amber-300 to-yellow-500",
    textColor: "text-white",
    ringColor: "#fcd34d",
  },
  {
    id: "dan10",
    step: 18,
    name: "10th Dan · Big Grand Master",
    emoji: "🌟",
    daysReq: 8575,
    missionReq: 1800,
    participationReq: 3600,
    period: "5년",
    desc: "23년+ 수련 · Big Grand Master",
    bgColor: "bg-black",
    borderColor: "border-amber-300",
    gradient: "from-amber-300 via-yellow-200 to-white",
    textColor: "text-amber-900",
    ringColor: "#fde68a",
  },
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
  const totalMissions = profile?.totalMissions || 0;
  const totalParticipation = profile?.totalParticipation || 0;
  const currentBeltId = profile?.beltRank || "white";

  // Find current LEVEL index
  const currentBeltIndex = beltSystem.findIndex((b) => b.id === currentBeltId);
  const currentBelt = beltSystem[Math.max(0, currentBeltIndex)] || beltSystem[0];
  const nextBelt = beltSystem[currentBeltIndex + 1];

  // 각 기준별 진행률 계산
  const getProgress = (current: number, curReq: number, nextReq: number) => {
    if (!nextBelt) return 100;
    const range = nextReq - curReq;
    if (range <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round(((current - curReq) / range) * 100)));
  };

  const daysProgress = nextBelt ? getProgress(totalDays, currentBelt.daysReq, nextBelt.daysReq) : 100;
  const missionProgress = nextBelt ? getProgress(totalMissions, currentBelt.missionReq, nextBelt.missionReq) : 100;
  const participationProgress = nextBelt ? getProgress(totalParticipation, currentBelt.participationReq, nextBelt.participationReq) : 100;
  const overallProgress = Math.round((daysProgress + missionProgress + participationProgress) / 3);

  return (
    <div className="space-y-6 pb-4">
      <button onClick={() => setLocation("/dashboard")} className="text-sm text-muted-foreground flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> 대시보드
      </button>

      <div>
        <h1 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
          LEVEL Promotion System
        </h1>
        <p className="text-xs text-muted-foreground">Training · Mission · Participation → Lifetime Wellness Project</p>
      </div>

      {/* Current Rank Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentBelt.ringColor}dd, ${currentBelt.ringColor}88)`,
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-2 text-8xl">{typeof currentBelt.emoji === "string" && currentBelt.emoji.length <= 2 ? currentBelt.emoji : "🥋"}</div>
        </div>

        <div className="relative z-10 text-center mb-4">
          <div className="text-5xl mb-2">{currentBelt.emoji}</div>
          <h2 className="text-xl font-bold drop-shadow">{currentBelt.name}</h2>
          <p className="text-white/80 text-xs mt-1">{currentBelt.desc}</p>
        </div>

        {/* 3 Criteria Progress */}
        <div className="relative z-10 space-y-3 bg-black/20 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-xs font-semibold text-white/90 mb-2 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> LEVEL Promotion Criteria
          </h3>

          {/* 수련 누적 */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-white/80 mb-1">
              <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> 수련 누적</span>
              <span>{totalDays.toLocaleString()}일 {nextBelt ? `/ ${nextBelt.daysReq.toLocaleString()}일` : "✓ 최고 등급"}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-orange-300 rounded-full h-2 transition-all duration-500" style={{ width: `${daysProgress}%` }} />
            </div>
          </div>

          {/* 미션 누적 */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-white/80 mb-1">
              <span className="flex items-center gap-1"><Target className="w-3 h-3" /> 미션 누적</span>
              <span>{totalMissions}회 {nextBelt ? `/ ${nextBelt.missionReq}회` : "✓ 최고 등급"}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-green-300 rounded-full h-2 transition-all duration-500" style={{ width: `${missionProgress}%` }} />
            </div>
          </div>

          {/* 참여 기준 */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-white/80 mb-1">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 참여 기준</span>
              <span>{totalParticipation}회 {nextBelt ? `/ ${nextBelt.participationReq}회` : "✓ 최고 등급"}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-blue-300 rounded-full h-2 transition-all duration-500" style={{ width: `${participationProgress}%` }} />
            </div>
          </div>

          {/* Overall */}
          {nextBelt && (
            <div className="pt-2 border-t border-white/20">
              <div className="flex items-center justify-between text-[10px] text-white/90 mb-1">
                <span className="font-semibold">Overall LEVEL Progress</span>
                <span className="font-bold">{overallProgress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div className="bg-white rounded-full h-2.5 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
              </div>
              <p className="text-[10px] text-white/70 mt-2 text-center">
                다음 등급: <span className="font-semibold">{nextBelt.name}</span> ({nextBelt.period})
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Belt Journey Timeline */}
      <div>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" /> LEVEL Promotion System
        </h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-3">
            {beltSystem.map((belt, i) => {
              const achieved = i <= currentBeltIndex;
              const isCurrent = i === currentBeltIndex;
              const isNext = i === currentBeltIndex + 1;

              return (
                <motion.div
                  key={belt.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="relative pl-12"
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-3 top-3 w-5 h-5 rounded-full border-2 z-10 flex items-center justify-center ${
                      achieved
                        ? "border-white shadow-md"
                        : "border-muted-foreground/30 bg-background"
                    }`}
                    style={achieved ? { backgroundColor: belt.ringColor } : {}}
                  >
                    {achieved && <span className="text-white text-[8px] font-bold">✓</span>}
                  </div>

                  <Card className={`shadow-sm overflow-hidden transition-all ${
                    !achieved && !isNext ? "opacity-35" : ""
                  } ${isCurrent ? "ring-2 ring-primary/40 shadow-md" : "border-border/50"} ${
                    isNext ? "opacity-70 border-dashed" : ""
                  }`}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Belt color indicator */}
                        <div
                          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${belt.gradient} flex items-center justify-center shadow-sm shrink-0`}
                        >
                          <span className="text-sm">{typeof belt.emoji === "string" && belt.emoji.length <= 2 ? belt.emoji : "🥋"}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold truncate">{belt.name}</p>
                            {isCurrent && (
                              <span className="text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold shrink-0">현재</span>
                            )}
                            {isNext && (
                              <span className="text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold shrink-0">다음</span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{belt.desc}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-medium text-muted-foreground">{belt.period}</p>
                          {achieved && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 ml-auto mt-0.5" />}
                        </div>
                      </div>

                      {/* Criteria details for current and next belt */}
                      {(isCurrent || isNext) && (
                        <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-border/30">
                          <div className="text-center bg-orange-50 rounded-md p-1.5">
                            <Flame className="w-3 h-3 text-orange-500 mx-auto" />
                            <p className="text-[8px] text-muted-foreground">수련</p>
                            <p className="text-[10px] font-bold text-orange-600">{belt.daysReq.toLocaleString()}일</p>
                          </div>
                          <div className="text-center bg-green-50 rounded-md p-1.5">
                            <Target className="w-3 h-3 text-green-500 mx-auto" />
                            <p className="text-[8px] text-muted-foreground">미션</p>
                            <p className="text-[10px] font-bold text-green-600">{belt.missionReq}회</p>
                          </div>
                          <div className="text-center bg-blue-50 rounded-md p-1.5">
                            <Users className="w-3 h-3 text-blue-500 mx-auto" />
                            <p className="text-[8px] text-muted-foreground">참여</p>
                            <p className="text-[10px] font-bold text-blue-600">{belt.participationReq}회</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
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
              <Card key={m.days} className={`shadow-sm border-border/50 ${!achieved ? "opacity-50" : ""}`}>
                <CardContent className="p-3 text-center">
                  <span className="text-xl">{m.emoji}</span>
                  <p className="text-[10px] font-semibold mt-1">{m.label}</p>
                  <Progress value={progress} className="h-1 mt-1.5" />
                  <p className="text-[9px] text-muted-foreground mt-1">{progress}%</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Philosophy Quote */}
      <Card className="shadow-sm border-border/50 bg-muted/30">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground italic" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            "천리길도 한 걸음부터,<br />
            꾸준한 수련과 나눔이 진정한 마스터를 만듭니다."
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
