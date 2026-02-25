import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Droplets,
  Weight,
  Moon,
  Activity,
  Flame,
  TrendingUp,
  Plus,
  ChevronRight,
  Stethoscope,
  Zap,
  Crown,
  Coins,
  Ticket,
  Shield,
  Star,
  Diamond,
  UtensilsCrossed,
  Clock,
  Hash,
} from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import LuxuryDashboard from "@/components/LuxuryDashboard";
import WorkoutPoseAnalyzer from "@/components/WorkoutPoseAnalyzer";
import BreathingAnalyzer from "@/components/BreathingAnalyzer";
import RealtimeNotificationCenter from "@/components/RealtimeNotificationCenter";

// 무지개 그라데이션 색상 (0~10 레벨에 따른 색상 반환)
function rainbowColor(level: number): string {
  const colors = [
    '#FEFCBF', // 0 - 연노랑
    '#FDE68A', // 1 - 노랑
    '#BEF264', // 2 - 연초록
    '#4ADE80', // 3 - 초록
    '#166534', // 4 - 진초록
    '#92400E', // 5 - 밤색
    '#78350F', // 6 - 진밤색
    '#60A5FA', // 7 - 연파랑
    '#3B82F6', // 8 - 파랑
    '#FB923C', // 9 - 주황
    '#EF4444', // 10 - 빨강
  ];
  return colors[Math.min(Math.max(level, 0), 10)];
}

// notes 필드에서 "식사: 7시, 12시, 18시" 형식의 식사 시간대를 파싱
function parseMealTimesFromNotes(notes?: string | null): number[] {
  if (!notes) return [];
  const match = notes.match(/\uc2dd\uc0ac:\s*([\d\uc2dc,\s]+)/);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);
}

const quickActions = [
  { icon: Plus, label: "건강 기록", path: "/record", color: "bg-primary/10 text-primary" },
  { icon: Stethoscope, label: "체질체크", path: "/diagnosis", color: "bg-chart-2/10 text-chart-2" },
  { icon: Activity, label: "프로그램", path: "/programs", color: "bg-chart-3/10 text-chart-3" },
  { icon: Zap, label: "미션", path: "/missions", color: "bg-chart-1/10 text-chart-1" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile } = trpc.profile.get.useQuery(undefined, { retry: false });
  const { data: todayRecord } = trpc.health.getToday.useQuery(undefined, { retry: false });
  const { data: recentRecords } = trpc.health.getRecent.useQuery({ limit: 7 }, { retry: false });
  const { data: membershipData } = trpc.membership.getMyMembership.useQuery(undefined, { retry: false });
  const { data: pointsData } = trpc.points.getBalance.useQuery(undefined, { retry: false });
  const { data: couponsData } = trpc.coupon.getMyCoupons.useQuery(undefined, { retry: false });

  const tierIcons: Record<string, any> = {
    silver: Shield, gold: Star, blue_sapphire: Diamond, green_emerald: Diamond,
    diamond: Diamond, blue_diamond: Diamond, platinum: Crown, black_platinum: Crown,
  };
  const tierNames: Record<string, string> = {
    silver: "실버", gold: "골드", blue_sapphire: "블루사파이어", green_emerald: "그린에메랄드",
    diamond: "다이아몬드", blue_diamond: "블루다이아몬드", platinum: "플래티넘", black_platinum: "블랙플래티넘",
  };
  const tierColors: Record<string, string> = {
    silver: "from-gray-400 to-gray-500", gold: "from-amber-400 to-amber-600",
    blue_sapphire: "from-blue-400 to-indigo-600", green_emerald: "from-emerald-400 to-teal-600",
    diamond: "from-sky-400 to-blue-600", blue_diamond: "from-violet-500 to-purple-700",
    platinum: "from-slate-500 to-slate-800", black_platinum: "from-gray-800 to-black",
  };
  const currentMemberTier = membershipData?.membership?.tier || "silver";
  const MemberTierIcon = tierIcons[currentMemberTier] || Shield;

  const beltInfo: Record<string, { label: string; emoji: string }> = {
    white: { label: "White LEVEL", emoji: "⬜" },
    white1: { label: "Step 1 (White LEVEL)", emoji: "⬜" },
    yellow: { label: "Yellow LEVEL", emoji: "🟨" },
    green: { label: "Green LEVEL", emoji: "🟩" },
    brown: { label: "Brown LEVEL", emoji: "🟫" },
    purple: { label: "Purple LEVEL", emoji: "🟪" },
    blue: { label: "Blue LEVEL", emoji: "🟦" },
    red: { label: "Red LEVEL", emoji: "🟥" },
    redblack: { label: "Red-Black LEVEL", emoji: "🔴⚫" },
    black: { label: "Black LEVEL", emoji: "⬛" },
    dan2: { label: "Black LEVEL 2nd Dan", emoji: "🥋" },
    dan3: { label: "Black LEVEL 3rd Dan", emoji: "🥋" },
    dan4: { label: "4th Dan · Grand Master", emoji: "👑" },
    dan5: { label: "5th Dan · Grand Master", emoji: "👑" },
    dan6: { label: "6th Dan · Grand Master", emoji: "👑" },
    dan7: { label: "7th Dan · Grand Master", emoji: "👑" },
    dan8: { label: "8th Dan · Grand Master", emoji: "👑" },
    dan9: { label: "9th Dan · Grand Master", emoji: "👑" },
    dan10: { label: "10th Dan · Big Grand Master", emoji: "🌟" },
  };

  const currentBelt = beltInfo[profile?.beltRank || "white"] || beltInfo.white;

  return (
    <div className="space-y-5">
      <RealtimeNotificationCenter userId={user?.id} />
      {/* Welcome Banner - Luxury Black & Gold */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#d4af37]/30 rounded-2xl p-5 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-[#d4af37] via-transparent to-[#d4af37]" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[#d4af37]/60 text-[10px] tracking-[0.2em] uppercase font-light">Welcome Back</p>
            <h1 className="text-2xl font-bold font-display mt-1 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4d03f]">
              {user?.name || "회원"}님
            </h1>
            <p className="text-[#d4af37]/70 text-xs font-light mt-1">
              오늘도 건강한 하루를 시작하세요
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl">{currentBelt.emoji}</span>
            <p className="text-white/60 text-[10px] mt-1 font-light">{currentBelt.label}</p>
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-2 bg-[#d4af37]/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-[#d4af37]/30">
          <TrendingUp className="w-4 h-4 text-[#d4af37]" />
          <span className="text-xs text-[#d4af37]/90 font-light">
            누적 {profile?.totalDays || 0}일째 건강 관리 중
          </span>
        </div>
      </motion.div>

      {/* Luxury 6-Panel Dashboard */}
      <LuxuryDashboard />

      {/* Workout Pose Analyzer - Real-time Exercise Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <WorkoutPoseAnalyzer
          exerciseName="스쿼트"
          targetPose="standing"
          duration={30}
          onAnalysisComplete={(result) => {
            console.log("운동 분석 완료:", result);
          }}
        />
      </motion.div>

      {/* Breathing Analyzer - AI Breathing Recognition */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <BreathingAnalyzer
          duration={60}
          onAnalysisComplete={(result) => {
            console.log("호띡 분석 완료:", result);
          }}
        />
      </motion.div>

      {/* Membership & Points Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setLocation("/membership")}
      >
        <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-black">
          <MemberTierIcon className="w-5 h-5" />
          <div className="flex-1">
            <p className="text-[10px] text-black/70">멤버십</p>
            <p className="text-sm font-bold">{tierNames[currentMemberTier]}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm">
          <Coins className="w-5 h-5 text-amber-500" />
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground">포인트</p>
            <p className="text-sm font-bold">{(pointsData?.currentPoints || 0).toLocaleString()}P</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm">
          <Ticket className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-[10px] text-muted-foreground">쿠폰</p>
            <p className="text-sm font-bold">{couponsData?.length || 0}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            onClick={() => setLocation(action.path)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-foreground">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Today's Health Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm">오늘의 건강 지표</h2>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setLocation("/record")}>
            기록하기 <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* 기본 건강 수치 - 2열 그리드 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground">혈압</span>
              </div>
              <p className="text-lg font-bold">
                {todayRecord?.systolicBP && todayRecord?.diastolicBP
                  ? `${todayRecord.systolicBP}/${todayRecord.diastolicBP}`
                  : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">mmHg</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">혈당</span>
              </div>
              <p className="text-lg font-bold">
                {todayRecord?.bloodSugar ? `${todayRecord.bloodSugar}` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">mg/dL</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Weight className="w-4 h-4 text-green-600" />
                <span className="text-xs text-muted-foreground">체중</span>
              </div>
              <p className="text-lg font-bold">
                {todayRecord?.weight ? `${todayRecord.weight}` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">kg</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">운동</span>
              </div>
              <p className="text-lg font-bold">
                {todayRecord?.exerciseMinutes ? `${todayRecord.exerciseMinutes}` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">분</p>
            </CardContent>
          </Card>
        </div>

        {/* 가로 막대형 지표: 식사시간대 / 식사횟수 / 수면시간 */}
        <div className="space-y-3">
          {/* 식사 시간대 */}
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold">식사 시간대</span>
                {parseMealTimesFromNotes(todayRecord?.notes).length > 0 && (
                  <span className="ml-auto text-[10px] text-amber-600 font-medium">
                    {parseMealTimesFromNotes(todayRecord?.notes).map(h => `${h}시`).join(", ")}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="h-2 bg-muted rounded-full w-full" />
                <div className="absolute top-0 left-0 w-full flex justify-between items-center" style={{ height: '8px' }}>
                  {[7, 9, 12, 14, 18, 20, 22].map((hour) => {
                    const isActive = parseMealTimesFromNotes(todayRecord?.notes).includes(hour);
                    const position = ((hour - 6) / (22 - 6)) * 100;
                    return (
                      <button
                        key={hour}
                        className="absolute flex flex-col items-center"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                        onClick={() => setLocation("/record")}
                        title={`${hour}시`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                          isActive
                            ? 'bg-amber-500 border-amber-600 shadow-md shadow-amber-200 scale-110'
                            : 'bg-background border-muted-foreground/30 hover:border-amber-400 hover:scale-110'
                        }`} />
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 px-0">
                  {[7, 9, 12, 14, 18, 20, 22].map((hour) => {
                    const position = ((hour - 6) / (22 - 6)) * 100;
                    return (
                      <span
                        key={hour}
                        className="text-[9px] text-muted-foreground absolute"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)', top: '20px' }}
                      >
                        {hour}시
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="h-4" />
            </CardContent>
          </Card>

          {/* 식사 횟수 */}
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold">식사 횟수</span>
                {parseMealTimesFromNotes(todayRecord?.notes).length > 0 && (
                  <span className="ml-auto text-[10px] text-emerald-600 font-medium">
                    {parseMealTimesFromNotes(todayRecord?.notes).length}회
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="h-2 bg-muted rounded-full w-full" />
                <div className="absolute top-0 left-0 w-full flex justify-between items-center" style={{ height: '8px' }}>
                  {[2, 3, 4, 5].map((count) => {
                    const mealCount = parseMealTimesFromNotes(todayRecord?.notes).length;
                    const isActive = mealCount >= count;
                    const isCurrent = mealCount === count;
                    const position = ((count - 1) / (5 - 1)) * 100;
                    return (
                      <button
                        key={count}
                        className="absolute flex flex-col items-center"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                        onClick={() => setLocation("/record")}
                        title={`${count}회`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                          isCurrent
                            ? 'bg-emerald-500 border-emerald-600 shadow-md shadow-emerald-200 scale-125'
                            : isActive
                            ? 'bg-emerald-400 border-emerald-500 scale-105'
                            : 'bg-background border-muted-foreground/30 hover:border-emerald-400 hover:scale-110'
                        }`} />
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 px-0">
                  {[2, 3, 4, 5].map((count) => {
                    const position = ((count - 1) / (5 - 1)) * 100;
                    return (
                      <span
                        key={count}
                        className="text-[9px] text-muted-foreground absolute"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)', top: '20px' }}
                      >
                        {count}회
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="h-4" />
            </CardContent>
          </Card>

          {/* 수면 시간 */}
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold">수면 시간</span>
                {todayRecord?.sleepHours && (
                  <span className="ml-auto text-[10px] text-indigo-500 font-medium">
                    {todayRecord.sleepHours}시간
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="h-2 bg-muted rounded-full w-full" />
                {/* 적정 수면 범위 표시 (7~8시간) */}
                <div
                  className="absolute top-0 h-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full"
                  style={{
                    left: `${((7 - 4) / (10 - 4)) * 100}%`,
                    width: `${((8 - 7) / (10 - 4)) * 100}%`,
                  }}
                />
                <div className="absolute top-0 left-0 w-full flex justify-between items-center" style={{ height: '8px' }}>
                  {[4, 5, 6, 7, 8, 9, 10].map((hour) => {
                    const isActive = todayRecord?.sleepHours === hour;
                    const position = ((hour - 4) / (10 - 4)) * 100;
                    return (
                      <button
                        key={hour}
                        className="absolute flex flex-col items-center"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                        onClick={() => setLocation("/record")}
                        title={`${hour}시간`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                          isActive
                            ? 'bg-indigo-500 border-indigo-600 shadow-md shadow-indigo-200 scale-125'
                            : 'bg-background border-muted-foreground/30 hover:border-indigo-400 hover:scale-110'
                        }`} />
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 px-0">
                  {[4, 5, 6, 7, 8, 9, 10].map((hour) => {
                    const position = ((hour - 4) / (10 - 4)) * 100;
                    return (
                      <span
                        key={hour}
                        className="text-[9px] text-muted-foreground absolute"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)', top: '20px' }}
                      >
                        {hour}h
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="h-4" />
              {/* 적정 범위 범례 */}
              <div className="flex items-center gap-1 mt-1">
                <div className="w-3 h-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30" />
                <span className="text-[9px] text-muted-foreground">적정 수면 7~8시간</span>
              </div>
            </CardContent>
          </Card>

          {/* 스트레스 레벨 - 무지개 그라데이션 점 클릭 */}
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">스트레스</span>
                {todayRecord?.stressLevel != null && (
                  <span className="ml-auto text-[10px] font-medium" style={{ color: rainbowColor(todayRecord.stressLevel) }}>
                    {todayRecord.stressLevel}/10
                  </span>
                )}
              </div>
              <div className="relative">
                <div
                  className="h-3 rounded-full w-full"
                  style={{
                    background: 'linear-gradient(to right, #FEFCBF, #FDE68A, #BEF264, #4ADE80, #166534, #92400E, #78350F, #60A5FA, #3B82F6, #FB923C, #EF4444)',
                  }}
                />
                <div className="absolute top-0 left-0 w-full" style={{ height: '12px' }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                    const isActive = todayRecord?.stressLevel === level;
                    const position = (level / 10) * 100;
                    return (
                      <button
                        key={level}
                        className="absolute"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)', top: '-2px' }}
                        onClick={() => setLocation("/record")}
                        title={`스트레스 ${level}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                          isActive
                            ? 'bg-white border-gray-800 shadow-lg scale-150 ring-2 ring-gray-400'
                            : 'bg-white/80 border-white/60 hover:scale-125 hover:bg-white'
                        }`} />
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                    const position = (level / 10) * 100;
                    return (
                      <span
                        key={level}
                        className="text-[8px] text-muted-foreground absolute"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)', top: '22px' }}
                      >
                        {level}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="h-5" />
              <div className="flex justify-between text-[8px] text-muted-foreground mt-1">
                <span>편안 ✨</span>
                <span>보통</span>
                <span>높음 🔥</span>
              </div>
            </CardContent>
          </Card>

          {/* 통증 레벨 - 무지개 그라데이션 점 클릭 */}
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-semibold">통증</span>
                {todayRecord?.painLevel != null && (
                  <span className="ml-auto text-[10px] font-medium" style={{ color: rainbowColor(todayRecord.painLevel) }}>
                    {todayRecord.painLevel}/10
                    {todayRecord.painLocation && ` (${todayRecord.painLocation})`}
                  </span>
                )}
              </div>
              <div className="relative">
                <div
                  className="h-3 rounded-full w-full"
                  style={{
                    background: 'linear-gradient(to right, #FEFCBF, #FDE68A, #BEF264, #4ADE80, #166534, #92400E, #78350F, #60A5FA, #3B82F6, #FB923C, #EF4444)',
                  }}
                />
                <div className="absolute top-0 left-0 w-full" style={{ height: '12px' }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                    const isActive = todayRecord?.painLevel === level;
                    const position = (level / 10) * 100;
                    return (
                      <button
                        key={level}
                        className="absolute"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)', top: '-2px' }}
                        onClick={() => setLocation("/record")}
                        title={`통증 ${level}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                          isActive
                            ? 'bg-white border-gray-800 shadow-lg scale-150 ring-2 ring-gray-400'
                            : 'bg-white/80 border-white/60 hover:scale-125 hover:bg-white'
                        }`} />
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                    const position = (level / 10) * 100;
                    return (
                      <span
                        key={level}
                        className="text-[8px] text-muted-foreground absolute"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)', top: '22px' }}
                      >
                        {level}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="h-5" />
              <div className="flex justify-between text-[8px] text-muted-foreground mt-1">
                <span>없음 😊</span>
                <span>중간</span>
                <span>심함 😖</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Trend */}
      {recentRecords && recentRecords.length > 0 && (
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              최근 7일 트렌드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-24">
              {recentRecords.map((r: any, i: number) => {
                const maxWeight = Math.max(...recentRecords.map((rec: any) => rec.weight || 0));
                const minWeight = Math.min(...recentRecords.filter((rec: any) => rec.weight).map((rec: any) => rec.weight));
                const range = maxWeight - minWeight || 1;
                const height = r.weight ? ((r.weight - minWeight) / range * 60 + 20) : 10;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md gradient-warm opacity-80"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[8px] text-muted-foreground">
                      {r.recordDate?.slice(5) || ""}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">체중 변화 (kg)</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="space-y-2">
        {[
          { label: "건강 상담 채팅", desc: "AI 건강 매니저와 1:1 상담", path: "/chat", icon: "💬" },
          { label: "건강 리포트", desc: "주간/월간 건강 분석 리포트", path: "/goals", icon: "📊" },
          { label: "건강 기록 히스토리", desc: "과거 건강 데이터 조회", path: "/record", icon: "📋" },
        ].map((link) => (
          <button
            key={link.path + link.label}
            onClick={() => setLocation(link.path)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 hover:border-border/60 hover:shadow-sm transition-all text-left"
          >
            <span className="text-xl">{link.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{link.label}</p>
              <p className="text-xs text-muted-foreground">{link.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
