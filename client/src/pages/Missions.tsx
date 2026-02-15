import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Zap, Camera, CheckCircle, Clock, Trophy, Loader2,
  Target, TrendingUp, BarChart3, Flame, Award, Star,
  ChevronRight, Calendar, Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MissionSlotMachine } from "@/components/MissionSlotMachine";
import { RequiredMissions } from "@/components/RequiredMissions";

const periodTabs = [
  { key: "daily", label: "오늘", icon: "⚡", color: "from-amber-400 to-orange-500", pts: 10, days: "1일" },
  { key: "weekly", label: "주간", icon: "📅", color: "from-blue-400 to-blue-600", pts: 50, days: "7일" },
  { key: "biweekly", label: "2주간", icon: "🎯", color: "from-teal-400 to-emerald-600", pts: 100, days: "14일" },
  { key: "monthly", label: "1개월", icon: "🏆", color: "from-violet-400 to-purple-600", pts: 200, days: "30일" },
  { key: "quarterly", label: "3개월", icon: "💎", color: "from-pink-400 to-rose-600", pts: 500, days: "90일" },
  { key: "semiannual", label: "6개월", icon: "👑", color: "from-amber-500 to-yellow-600", pts: 1000, days: "180일" },
  { key: "annual", label: "1년", icon: "⭐", color: "from-gray-700 to-gray-900", pts: 2000, days: "365일" },
];

const categoryLabels: Record<string, { label: string; emoji: string; color: string }> = {
  breathing: { label: "호흡", emoji: "🌬️", color: "from-sky-400 to-sky-600" },
  rest: { label: "휴식", emoji: "🌙", color: "from-indigo-400 to-indigo-600" },
  posture: { label: "자세", emoji: "🧘", color: "from-emerald-400 to-emerald-600" },
  stretching: { label: "스트레칭", emoji: "🌿", color: "from-green-400 to-green-600" },
  mental: { label: "정신건강", emoji: "☯️", color: "from-purple-400 to-purple-600" },
  exercise: { label: "운동", emoji: "💪", color: "from-orange-400 to-orange-600" },
  nutrition: { label: "영양", emoji: "🥗", color: "from-lime-400 to-lime-600" },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "진행 중", color: "bg-blue-100 text-blue-700" },
  submitted: { label: "제출됨", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "완료", color: "bg-green-100 text-green-700" },
  failed: { label: "미완료", color: "bg-red-100 text-red-700" },
};

function StatsChart({ stats }: { stats: any }) {
  if (!stats) return null;
  const { total, completed, pending, avgCompletion, byPeriod, byCategory } = stats;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Category bar chart data
  const catEntries = Object.entries(byCategory as Record<string, { total: number; completed: number }>);

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-border/40">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-light font-resort text-primary">{total}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">전체 미션</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-light font-resort text-green-600">{completed}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">완료</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-light font-resort text-amber-600">{pending}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">진행 중</p>
          </CardContent>
        </Card>
      </div>

      {/* Circular Progress */}
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#progressGrad)" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={`${completionPct * 2.64} ${264 - completionPct * 2.64}`} />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="oklch(0.75 0.15 145)" />
                    <stop offset="100%" stopColor="oklch(0.65 0.18 175)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold">{completionPct}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">전체 달성률</p>
              <p className="text-xs text-muted-foreground mb-2">평균 완수율 {avgCompletion}%</p>
              <div className="w-full h-2 rounded-full bg-muted/20 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700"
                  style={{ width: `${completionPct}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {catEntries.length > 0 && (
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-primary" /> 카테고리별 달성률
            </p>
            <div className="space-y-2.5">
              {catEntries.map(([cat, data]) => {
                const info = categoryLabels[cat] || { label: cat, emoji: "📋", color: "from-gray-400 to-gray-600" };
                const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] flex items-center gap-1.5">
                        <span>{info.emoji}</span> {info.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{data.completed}/{data.total} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted/20 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${info.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Period Breakdown */}
      {Object.keys(byPeriod as Record<string, any>).length > 0 && (
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" /> 기간별 달성 현황
            </p>
            <div className="grid grid-cols-2 gap-2">
              {periodTabs.map((pt) => {
                const data = (byPeriod as Record<string, any>)[pt.key];
                if (!data) return null;
                const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                return (
                  <div key={pt.key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/10">
                    <span className="text-base">{pt.icon}</span>
                    <div className="flex-1">
                      <p className="text-[10px] font-medium">{pt.label}</p>
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${pt.color}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] text-muted-foreground">{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Missions() {
  const [activePeriod, setActivePeriod] = useState("daily");
  const [showStats, setShowStats] = useState(false);
  const periodInput = useMemo(() => ({ period: activePeriod }), [activePeriod]);

  const { data: missions, isLoading } = trpc.missions.list.useQuery(periodInput, { retry: false });
  const { data: allMissions } = trpc.missions.list.useQuery(undefined, { retry: false });
  const { data: stats } = trpc.missions.stats.useQuery(undefined, { retry: false });

  const generateMissions = trpc.missions.generate.useMutation({
    onSuccess: () => {
      toast.success("새로운 미션이 생성되었습니다!");
      utils.missions.list.invalidate();
      utils.missions.stats.invalidate();
    },
    onError: () => toast.error("미션 생성에 실패했습니다."),
  });
  const submitMission = trpc.missions.submit.useMutation({
    onSuccess: (data) => {
      toast.success(`미션 완료! 완수율 ${data.completionRate}% · 페이백 ${data.paybackRate}%`);
      utils.missions.list.invalidate();
      utils.missions.stats.invalidate();
    },
    onError: () => toast.error("제출에 실패했습니다."),
  });
  const utils = trpc.useUtils();

  const activeMissions = missions?.filter((m: any) => m.status !== "completed" && m.status !== "failed") || [];
  const completedMissions = missions?.filter((m: any) => m.status === "completed") || [];
  const currentTab = periodTabs.find(t => t.key === activePeriod) || periodTabs[0];

  // Streak calculation (consecutive days with completed missions)
  const streak = useMemo(() => {
    if (!allMissions) return 0;
    const completed = allMissions.filter((m: any) => m.status === "completed");
    const dates = Array.from(new Set(completed.map((m: any) => m.dueDate).filter(Boolean))).sort().reverse();
    let count = 0;
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      if (dates[i] === expected || (i === 0 && dates[0] === today)) {
        count++;
      } else break;
    }
    return count;
  }, [allMissions]);

  return (
    <div className="space-y-5">
      {/* 부여된 미션 - 슬롯머신 */}
      <MissionSlotMachine onSelectMission={(mission, difficulty) => {
        toast.success(`"${mission}" 미션을 선택했습니다! (${difficulty})`);
      }} />

      {/* 필수 미션 */}
      <RequiredMissions />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-resort">건강 미션 센터</h1>
          <p className="text-[10px] text-muted-foreground">기간별 맞춤 미션으로 건강한 습관을 만드세요</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showStats ? "default" : "outline"}
            className={`text-xs h-8 ${showStats ? 'gradient-warm text-white border-0' : ''}`}
            onClick={() => setShowStats(!showStats)}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            통계
          </Button>
        </div>
      </div>

      {/* Streak & Quick Stats */}
      <div className="flex gap-2">
        <Card className="flex-1 border-border/40 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-sm">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold font-resort text-orange-600">{streak}일</p>
              <p className="text-[9px] text-muted-foreground">연속 달성</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 border-border/40 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold font-resort text-emerald-600">{stats?.completed || 0}개</p>
              <p className="text-[9px] text-muted-foreground">총 완료</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 border-border/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold font-resort text-blue-600">{stats?.avgCompletion || 0}%</p>
              <p className="text-[9px] text-muted-foreground">평균 완수율</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StatsChart stats={stats} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Period Tabs - Scrollable */}
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-1.5 min-w-max pb-1">
          {periodTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActivePeriod(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all whitespace-nowrap ${
                activePeriod === tab.key
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-sm`
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Period Info + Generate */}
      <Card className={`border-border/40 overflow-hidden`}>
        <div className={`h-1 bg-gradient-to-r ${currentTab.color}`} />
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentTab.color} flex items-center justify-center text-xl shadow-sm`}>
                {currentTab.icon}
              </div>
              <div>
                <h2 className="text-sm font-semibold">{currentTab.label} 미션</h2>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Timer className="w-3 h-3" /> 기간: {currentTab.days} · 보상: {currentTab.pts}P
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="gradient-warm text-white border-0 text-xs h-9"
              onClick={() => generateMissions.mutate({ period: activePeriod })}
              disabled={generateMissions.isPending}
            >
              {generateMissions.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
              미션 생성
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Missions */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> 진행 중인 미션
          {activeMissions.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{activeMissions.length}개</Badge>
          )}
        </h2>
        {activeMissions.length > 0 ? (
          <div className="space-y-3">
            {activeMissions.map((mission: any, i: number) => {
              const cat = categoryLabels[mission.category] || { label: mission.category, emoji: "📋", color: "from-gray-400 to-gray-600" };
              const status = statusLabels[mission.status] || statusLabels.pending;
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Card className="shadow-sm border-border/40 hover:border-border/60 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg shrink-0 shadow-sm`}>
                          {cat.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold">{mission.title}</h3>
                            <Badge variant="secondary" className={`text-[10px] ${status.color}`}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{mission.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                              {cat.label}
                            </span>
                            {mission.dueDate && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" /> {mission.dueDate}
                              </span>
                            )}
                            {mission.pointReward > 0 && (
                              <span className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5" /> {mission.pointReward}P
                              </span>
                            )}
                          </div>
                          {(mission.status === "pending" || mission.status === "in_progress") && (
                            <Button
                              size="sm"
                              className="mt-3 text-xs gradient-warm text-white border-0"
                              onClick={() => submitMission.mutate({ missionId: mission.id })}
                              disabled={submitMission.isPending}
                            >
                              <Camera className="w-3 h-3 mr-1" /> 미션 인증하기
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="border-border/40 border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentTab.color} flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm opacity-60`}>
                {currentTab.icon}
              </div>
              <p className="text-sm font-medium mb-1">{currentTab.label} 미션이 없습니다</p>
              <p className="text-xs text-muted-foreground/70">"미션 생성" 버튼을 눌러 새 미션을 받아보세요</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Missions */}
      {completedMissions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" /> 완료된 미션
            <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">{completedMissions.length}개</Badge>
          </h2>
          <div className="space-y-2">
            {completedMissions.map((mission: any) => {
              const cat = categoryLabels[mission.category] || { label: mission.category, emoji: "📋", color: "from-gray-400 to-gray-600" };
              return (
                <Card key={mission.id} className="shadow-sm border-border/40 bg-green-50/30 dark:bg-green-950/10">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-base shrink-0 opacity-80`}>
                      {cat.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{mission.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-green-600 font-medium">
                          완수율 {mission.completionRate}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-primary font-medium">
                          페이백 {mission.paybackRate}%
                        </span>
                        {mission.pointReward > 0 && (
                          <>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] text-amber-600 font-medium">
                              +{mission.pointReward}P
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Payback Info */}
      <Card className="shadow-sm border-border/40 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary shrink-0" />
            <div>
              <p className="text-xs font-semibold">미션 완수 페이백 시스템</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                미션 완수 시 등급에 따라 최대 100% 환급! 장기 미션일수록 높은 포인트 보상.
                AI가 사진을 분석하여 완수율을 판정합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
