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
} from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

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
    white: { label: "화이트벨트", emoji: "⬜" },
    yellow: { label: "옐로우벨트", emoji: "🟨" },
    green: { label: "그린벨트", emoji: "🟩" },
    blue: { label: "블루벨트", emoji: "🟦" },
    red: { label: "레드벨트", emoji: "🟥" },
    black: { label: "블랙벨트", emoji: "⬛" },
    master2: { label: "사범 2단", emoji: "🥋" },
    master3: { label: "사범 3단", emoji: "🥋" },
    grandmaster: { label: "그랜드마스터", emoji: "👑" },
  };

  const currentBelt = beltInfo[profile?.beltRank || "white"] || beltInfo.white;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-warm rounded-2xl p-5 text-white"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs mb-1">안녕하세요,</p>
            <h1 className="text-lg font-bold mb-1">
              {user?.name || "회원"}님
            </h1>
            <p className="text-white/80 text-xs">
              오늘도 건강한 하루를 시작하세요
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl">{currentBelt.emoji}</span>
            <p className="text-white/80 text-[10px] mt-1">{currentBelt.label}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
          <TrendingUp className="w-4 h-4 text-white/80" />
          <span className="text-xs text-white/90">
            누적 {profile?.totalDays || 0}일째 건강 관리 중
          </span>
        </div>
      </motion.div>

      {/* Membership & Points Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setLocation("/membership")}
      >
        <div className={`flex-1 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${tierColors[currentMemberTier]} text-white`}>
          <MemberTierIcon className="w-5 h-5" />
          <div className="flex-1">
            <p className="text-[10px] text-white/70">멤버십</p>
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
        <div className="grid grid-cols-2 gap-3">
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
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs text-muted-foreground">수면</span>
              </div>
              <p className="text-lg font-bold">
                {todayRecord?.sleepHours ? `${todayRecord.sleepHours}` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">시간</p>
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
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">스트레스</span>
              </div>
              <p className="text-lg font-bold">
                {todayRecord?.stressLevel ? `${todayRecord.stressLevel}/10` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">레벨</p>
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
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-sm text-left"
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
