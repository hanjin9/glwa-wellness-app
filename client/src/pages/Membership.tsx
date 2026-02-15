import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import {
  Crown, Diamond, Star, Shield, Gift, Ticket, Coins,
  TrendingUp, ChevronRight, Sparkles, Award, Zap,
  Calendar, Users, ArrowUp, Check, Heart, Gem,
  Lock, Globe, Phone, UserCheck, Briefcase, Wine
} from "lucide-react";
import { motion } from "framer-motion";

// ═══════════════════════════════════════════════════════════════════
// 8등급 프리미엄 멤버십 설정
// ═══════════════════════════════════════════════════════════════════
const TIER_CONFIG: Record<string, {
  name: string; nameEn: string; icon: any; color: string; textColor: string;
  bgColor: string; borderColor: string; badgeColor: string; accentColor: string;
  cardBg: string; order: number;
}> = {
  silver: {
    name: "실버", nameEn: "Silver", icon: Shield, order: 1,
    color: "from-gray-300 to-gray-500", textColor: "text-gray-600",
    bgColor: "bg-gradient-to-br from-gray-50 to-gray-100", borderColor: "border-gray-300",
    badgeColor: "bg-gray-200 text-gray-700", accentColor: "#9CA3AF",
    cardBg: "from-gray-400 to-gray-600",
  },
  gold: {
    name: "골드", nameEn: "Gold", icon: Star, order: 2,
    color: "from-amber-400 to-amber-600", textColor: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100", borderColor: "border-amber-400",
    badgeColor: "bg-amber-100 text-amber-700", accentColor: "#D97706",
    cardBg: "from-amber-500 to-amber-700",
  },
  blue_sapphire: {
    name: "블루사파이어", nameEn: "Blue Sapphire", icon: Gem, order: 3,
    color: "from-blue-400 to-indigo-600", textColor: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100", borderColor: "border-blue-500",
    badgeColor: "bg-blue-100 text-blue-700", accentColor: "#3B82F6",
    cardBg: "from-blue-500 to-indigo-700",
  },
  green_emerald: {
    name: "그린에메랄드", nameEn: "Green Emerald", icon: Award, order: 4,
    color: "from-emerald-400 to-teal-600", textColor: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100", borderColor: "border-emerald-500",
    badgeColor: "bg-emerald-100 text-emerald-700", accentColor: "#059669",
    cardBg: "from-emerald-500 to-teal-700",
  },
  diamond: {
    name: "다이아몬드", nameEn: "Diamond", icon: Diamond, order: 5,
    color: "from-sky-400 to-blue-600", textColor: "text-sky-600",
    bgColor: "bg-gradient-to-br from-sky-50 to-blue-100", borderColor: "border-sky-500",
    badgeColor: "bg-sky-100 text-sky-700", accentColor: "#0284C7",
    cardBg: "from-sky-500 to-blue-700",
  },
  blue_diamond: {
    name: "블루다이아몬드", nameEn: "Blue Diamond", icon: Diamond, order: 6,
    color: "from-violet-500 to-purple-700", textColor: "text-violet-600",
    bgColor: "bg-gradient-to-br from-violet-50 to-purple-100", borderColor: "border-violet-500",
    badgeColor: "bg-violet-100 text-violet-700", accentColor: "#7C3AED",
    cardBg: "from-violet-600 to-purple-800",
  },
  platinum: {
    name: "플래티넘", nameEn: "Platinum", icon: Crown, order: 7,
    color: "from-slate-500 to-slate-800", textColor: "text-slate-700",
    bgColor: "bg-gradient-to-br from-slate-50 to-slate-200", borderColor: "border-slate-500",
    badgeColor: "bg-slate-200 text-slate-700", accentColor: "#475569",
    cardBg: "from-slate-600 to-slate-900",
  },
  black_platinum: {
    name: "블랙플래티넘", nameEn: "Black Platinum", icon: Crown, order: 8,
    color: "from-gray-800 to-black", textColor: "text-gray-900",
    bgColor: "bg-gradient-to-br from-gray-100 to-gray-300", borderColor: "border-gray-800",
    badgeColor: "bg-gray-800 text-white", accentColor: "#111827",
    cardBg: "from-gray-800 to-black",
  },
};

const TIER_ORDER = ["silver", "gold", "blue_sapphire", "green_emerald", "diamond", "blue_diamond", "platinum", "black_platinum"];

// 등급별 상세 혜택 (글로벌 프리미엄 벤치마킹)
const TIER_DETAILS: Record<string, {
  annualFee: string; initiationFee: string; discount: string; payback: string;
  pointMultiplier: string; benefits: string[]; exclusive: string[];
}> = {
  silver: {
    annualFee: "무료", initiationFee: "없음", discount: "0%", payback: "50%", pointMultiplier: "1x",
    benefits: ["기본 건강 체크리스트", "커뮤니티 접근", "주간 건강 리포트", "기본 미션 참여", "온라인 건강 콘텐츠"],
    exclusive: [],
  },
  gold: {
    annualFee: "월 5만원", initiationFee: "없음", discount: "5%", payback: "55%", pointMultiplier: "1.5x",
    benefits: ["모든 실버 혜택", "포인트 1.5배 적립", "월간 전문 상담 1회", "골드 전용 이벤트", "쇼핑 5% 할인", "프리미엄 콘텐츠 접근"],
    exclusive: ["월 1회 전문가 화상 상담"],
  },
  blue_sapphire: {
    annualFee: "월 15만원", initiationFee: "50만원", discount: "8%", payback: "60%", pointMultiplier: "2x",
    benefits: ["모든 골드 혜택", "포인트 2배 적립", "격주 전문 상담", "쇼핑 8% 할인", "프리미엄 프로그램 접근", "전용 웰니스 리포트"],
    exclusive: ["격주 1:1 전문 상담", "분기별 건강 분석 리포트", "블루사파이어 전용 커뮤니티"],
  },
  green_emerald: {
    annualFee: "월 30만원", initiationFee: "100만원", discount: "10%", payback: "65%", pointMultiplier: "2.5x",
    benefits: ["모든 블루사파이어 혜택", "포인트 2.5배 적립", "주간 전문 상담", "쇼핑 10% 할인", "전담 건강 코디네이터", "프리미엄 건강기기 대여"],
    exclusive: ["전담 건강 코디네이터 배정", "월간 프리미엄 건강식품 박스", "에메랄드 전용 오프라인 세미나"],
  },
  diamond: {
    annualFee: "월 50만원", initiationFee: "300만원", discount: "12%", payback: "70%", pointMultiplier: "3x",
    benefits: ["모든 그린에메랄드 혜택", "포인트 3배 적립", "무제한 전문 상담", "쇼핑 12% 할인", "1:1 전담 매니저", "VIP 라운지 접근"],
    exclusive: ["1:1 전담 웰니스 매니저", "VIP 라운지 이용권", "연 2회 프리미엄 건강검진", "다이아몬드 전용 이벤트 초대"],
  },
  blue_diamond: {
    annualFee: "월 100만원", initiationFee: "1,000만원", discount: "15%", payback: "80%", pointMultiplier: "4x",
    benefits: ["모든 다이아몬드 혜택", "포인트 4배 적립", "쇼핑 15% 할인", "컨시어지 서비스", "글로벌 파트너 시설 이용", "프리미엄 기기 무료 제공"],
    exclusive: ["24시간 컨시어지 서비스", "글로벌 파트너 웰니스 센터 이용", "연 4회 프리미엄 건강검진", "해외 웰니스 리트릿 초대", "연간 프리미엄 기프트 패키지"],
  },
  platinum: {
    annualFee: "월 300만원", initiationFee: "5,000만원", discount: "20%", payback: "90%", pointMultiplier: "5x",
    benefits: ["모든 블루다이아몬드 혜택", "포인트 5배 적립", "쇼핑 20% 할인", "전용 비서 서비스", "프라이빗 이벤트", "우선 예약권"],
    exclusive: ["전용 웰니스 비서", "프라이빗 이벤트 주최 가능", "글로벌 VIP 네트워크 접근", "연간 해외 웰니스 투어 1회", "프리미엄 멤버십 카드 (티타늄)", "가족 2인 동반 혜택"],
  },
  black_platinum: {
    annualFee: "초대 전용", initiationFee: "1억원~", discount: "25%", payback: "100%", pointMultiplier: "10x",
    benefits: ["모든 플래티넘 혜택", "포인트 10배 적립", "쇼핑 25% 할인", "무제한 컨시어지", "프라이빗 제트 웰니스 투어", "최우선 모든 서비스"],
    exclusive: ["초대 전용 (Invitation Only)", "프라이빗 제트 웰니스 투어", "글로벌 최고급 리조트 무제한 이용", "전담 의료진 팀 배정", "연간 무제한 해외 프로그램", "가족 전원 동반 혜택", "블랙 멤버십 카드 (24K 골드)", "GLWA 이사회 참여 자격"],
  },
};

export default function Membership() {
  const { user, isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTierDetail, setSelectedTierDetail] = useState<string | null>(null);

  const membershipQuery = trpc.membership.getMyMembership.useQuery(undefined, { enabled: isAuthenticated });
  const tiersQuery = trpc.membership.getTiers.useQuery();
  const pointsQuery = trpc.points.getBalance.useQuery(undefined, { enabled: isAuthenticated });
  const pointsHistoryQuery = trpc.points.getHistory.useQuery(undefined, { enabled: isAuthenticated });
  const myCouponsQuery = trpc.coupon.getMyCoupons.useQuery(undefined, { enabled: isAuthenticated });
  const eventsQuery = trpc.event.getActive.useQuery();

  const registerCoupon = trpc.coupon.register.useMutation({
    onSuccess: (data) => { toast.success(`쿠폰 등록 완료: ${data.couponName}`); setCouponCode(""); myCouponsQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const joinEvent = trpc.event.join.useMutation({
    onSuccess: () => { toast.success("이벤트 참여 완료!"); eventsQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const upgradeMembership = trpc.membership.upgrade.useMutation({
    onSuccess: () => { toast.success("멤버십이 업그레이드되었습니다!"); membershipQuery.refetch(); pointsQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const currentTier = (membershipQuery.data?.membership?.tier || "silver") as string;
  const tierConfig = TIER_CONFIG[currentTier] || TIER_CONFIG.silver;
  const TierIcon = tierConfig.icon;
  const currentTierIdx = TIER_ORDER.indexOf(currentTier);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 bg-gray-900/80 border-gray-700">
          <Crown className="w-16 h-16 mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">GLWA 프리미엄 멤버십</h2>
          <p className="text-gray-400 mb-6">로그인하여 8등급 프리미엄 멤버십 혜택을 확인하세요</p>
          <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-amber-600">
            <a href={getLoginUrl()}>로그인</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Hero Section - 프리미엄 멤버십 카드 */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${tierConfig.cardBg} px-4 pt-12 pb-8`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative w-full max-w-full mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-xs font-medium tracking-widest uppercase">GLWA PREMIUM MEMBERSHIP</p>
              <h1 className="text-white text-2xl font-bold mt-1">{tierConfig.name}</h1>
              <p className="text-white/50 text-xs mt-0.5">{tierConfig.nameEn} Member</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <TierIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/50 text-xs">보유 포인트</p>
                <p className="text-white text-2xl font-bold">{(pointsQuery.data?.currentPoints || 0).toLocaleString()} P</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs">마일리지</p>
                <p className="text-white text-lg font-semibold">{(pointsQuery.data?.totalMileage || 0).toLocaleString()} M</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white/50 text-[10px]">총 적립</p>
              <p className="text-white font-bold text-sm">{(pointsQuery.data?.totalEarned || 0).toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white/50 text-[10px]">총 사용</p>
              <p className="text-white font-bold text-sm">{(pointsQuery.data?.totalUsed || 0).toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white/50 text-[10px]">쿠폰</p>
              <p className="text-white font-bold text-sm">{myCouponsQuery.data?.length || 0}장</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white/50 text-[10px]">적립배율</p>
              <p className="text-white font-bold text-sm">{TIER_DETAILS[currentTier]?.pointMultiplier || "1x"}</p>
            </div>
          </div>

          {/* 등급 진행 바 */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              {TIER_ORDER.map((t, i) => (
                <div key={t} className={`w-2.5 h-2.5 rounded-full ${i <= currentTierIdx ? "bg-white" : "bg-white/20"} ${i === currentTierIdx ? "ring-2 ring-white/50 ring-offset-1 ring-offset-transparent" : ""}`} />
              ))}
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 rounded-full transition-all duration-500" style={{ width: `${((currentTierIdx + 1) / TIER_ORDER.length) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-white/30 text-[8px]">Silver</span>
              <span className="text-white/30 text-[8px]">Black Platinum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="w-full mx-auto px-4 -mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-full bg-white shadow-lg rounded-2xl h-12 p-1">
            <TabsTrigger value="overview" className="rounded-xl text-xs flex-1">혜택</TabsTrigger>
            <TabsTrigger value="tiers" className="rounded-xl text-xs flex-1">등급</TabsTrigger>
            <TabsTrigger value="points" className="rounded-xl text-xs flex-1">포인트</TabsTrigger>
            <TabsTrigger value="coupons" className="rounded-xl text-xs flex-1">쿠폰</TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl text-xs flex-1">이벤트</TabsTrigger>
          </TabsList>

          {/* ═══ 혜택 탭 ═══ */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* 현재 등급 혜택 */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  나의 {tierConfig.name} 혜택
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(TIER_DETAILS[currentTier]?.benefits || []).map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${tierConfig.color} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                {(TIER_DETAILS[currentTier]?.exclusive || []).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" /> 전용 혜택
                    </p>
                    {TIER_DETAILS[currentTier].exclusive.map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="text-xs text-amber-700">{ex}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 핵심 수치 요약 */}
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-center">
                    <p className="text-xs text-blue-600 mb-1">쇼핑 할인</p>
                    <p className="text-xl font-bold text-blue-700">{TIER_DETAILS[currentTier]?.discount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-center">
                    <p className="text-xs text-emerald-600 mb-1">미션 페이백</p>
                    <p className="text-xl font-bold text-emerald-700">{TIER_DETAILS[currentTier]?.payback}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-center">
                    <p className="text-xs text-amber-600 mb-1">포인트 적립</p>
                    <p className="text-xl font-bold text-amber-700">{TIER_DETAILS[currentTier]?.pointMultiplier}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 text-center">
                    <p className="text-xs text-purple-600 mb-1">연회비</p>
                    <p className="text-lg font-bold text-purple-700">{TIER_DETAILS[currentTier]?.annualFee}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 본사 추천 */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-600" />
                  본사 추천
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <Gift className="w-8 h-8 text-emerald-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">이달의 추천 프로그램</p>
                      <p className="text-xs text-muted-foreground">숨과 알아차림 - 호흡 인지 훈련</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <Zap className="w-8 h-8 text-amber-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">추천 건강식품</p>
                      <p className="text-xs text-muted-foreground">유기농 그린팜 베스트셀러</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ 8등급 체계 탭 ═══ */}
          <TabsContent value="tiers" className="mt-4">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg">GLWA 프리미엄 멤버십 8등급</h3>
              <p className="text-xs text-muted-foreground">글로벌 프리미엄 클럽 수준의 차별화된 혜택</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {TIER_ORDER.map((tier, idx) => {
              const cfg = TIER_CONFIG[tier];
              const details = TIER_DETAILS[tier];
              const Icon = cfg.icon;
              const isCurrentTier = tier === currentTier;
              const isLowerTier = idx < currentTierIdx;
              const isHigherTier = idx > currentTierIdx;
              const isExpanded = selectedTierDetail === tier;

              return (
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={`border-2 overflow-hidden cursor-pointer transition-all ${
                      isCurrentTier ? cfg.borderColor + " shadow-lg" : "border-gray-100 hover:border-gray-200"
                    }`}
                    onClick={() => setSelectedTierDetail(isExpanded ? null : tier)}
                  >
                    {isCurrentTier && <div className={`h-1 bg-gradient-to-r ${cfg.color}`} />}
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm">{cfg.name}</h3>
                              <span className="text-[10px] text-muted-foreground">{cfg.nameEn}</span>
                              {isCurrentTier && <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0">현재</Badge>}
                              {isLowerTier && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">완료</Badge>}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">연회비: {details.annualFee}</span>
                              <span className="text-[10px] text-muted-foreground">할인: {details.discount}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </div>

                      {/* 확장 상세 */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t"
                        >
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-[10px] text-muted-foreground">할인율</p>
                              <p className="font-bold text-xs">{details.discount}</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-[10px] text-muted-foreground">페이백</p>
                              <p className="font-bold text-xs">{details.payback}</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-[10px] text-muted-foreground">적립배율</p>
                              <p className="font-bold text-xs">{details.pointMultiplier}</p>
                            </div>
                          </div>

                          {details.initiationFee !== "없음" && (
                            <div className="mb-2 p-2 bg-amber-50 rounded-lg">
                              <p className="text-[10px] text-amber-700 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> 입회비: {details.initiationFee}
                              </p>
                            </div>
                          )}

                          <div className="space-y-1">
                            {details.benefits.map((b, i) => (
                              <div key={i} className="flex items-center gap-2 py-0.5">
                                <Check className={`w-3 h-3 flex-shrink-0 ${isLowerTier || isCurrentTier ? "text-emerald-500" : "text-gray-300"}`} />
                                <span className="text-xs">{b}</span>
                              </div>
                            ))}
                          </div>

                          {details.exclusive.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-dashed">
                              <p className="text-[10px] font-semibold text-amber-600 mb-1 flex items-center gap-1">
                                <Crown className="w-3 h-3" /> 전용 프리미엄 혜택
                              </p>
                              {details.exclusive.map((ex, i) => (
                                <div key={i} className="flex items-center gap-2 py-0.5">
                                  <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                  <span className="text-xs text-amber-700">{ex}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {isHigherTier && tier !== "black_platinum" && (
                            <Button
                              className={`w-full mt-3 bg-gradient-to-r ${cfg.color} text-white text-sm`}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                upgradeMembership.mutate({ tier: tier as any });
                              }}
                              disabled={upgradeMembership.isPending}
                            >
                              <ArrowUp className="w-4 h-4 mr-1" />
                              {cfg.name}으로 업그레이드
                            </Button>
                          )}
                          {tier === "black_platinum" && isHigherTier && (
                            <div className="mt-3 p-3 bg-gray-900 rounded-xl text-center">
                              <Lock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                              <p className="text-white text-xs font-bold">초대 전용 (Invitation Only)</p>
                              <p className="text-gray-400 text-[10px] mt-0.5">GLWA 본사의 초대를 통해서만 가입 가능합니다</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            </div>

            {/* 등급 비교표 */}
            <Card className="border-0 shadow-md mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  등급별 핵심 비교
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full text-[10px] min-w-[500px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-2 font-semibold">등급</th>
                        <th className="text-center py-2 px-1">연회비</th>
                        <th className="text-center py-2 px-1">할인</th>
                        <th className="text-center py-2 px-1">페이백</th>
                        <th className="text-center py-2 px-1">적립</th>
                        <th className="text-center py-2 px-1">전담</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TIER_ORDER.map((tier) => {
                        const cfg = TIER_CONFIG[tier];
                        const d = TIER_DETAILS[tier];
                        const isCurrent = tier === currentTier;
                        return (
                          <tr key={tier} className={`border-b last:border-0 ${isCurrent ? "bg-amber-50" : ""}`}>
                            <td className="py-2 pr-2">
                              <span className={`font-semibold ${cfg.textColor}`}>{cfg.name}</span>
                            </td>
                            <td className="text-center py-2 px-1">{d.annualFee}</td>
                            <td className="text-center py-2 px-1 font-semibold">{d.discount}</td>
                            <td className="text-center py-2 px-1 font-semibold">{d.payback}</td>
                            <td className="text-center py-2 px-1">{d.pointMultiplier}</td>
                            <td className="text-center py-2 px-1">
                              {["diamond", "blue_diamond", "platinum", "black_platinum"].includes(tier)
                                ? <Check className="w-3 h-3 text-emerald-500 mx-auto" />
                                : <span className="text-gray-300">-</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ 포인트 탭 ═══ */}
          <TabsContent value="points" className="mt-4 space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  포인트 내역
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pointsHistoryQuery.data && pointsHistoryQuery.data.length > 0 ? (
                  <div className="space-y-3">
                    {pointsHistoryQuery.data.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? "bg-emerald-100" : "bg-red-100"}`}>
                            {tx.amount > 0 ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <ArrowUp className="w-4 h-4 text-red-600 rotate-180" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("ko-KR")}</p>
                          </div>
                        </div>
                        <span className={`font-bold ${tx.amount > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} P
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Coins className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-muted-foreground text-sm">포인트 내역이 없습니다</p>
                    <p className="text-xs text-muted-foreground mt-1">미션 완수, 구매, 이벤트 참여로 포인트를 적립하세요</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  포인트 적립 방법
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "출석 체크", points: "10P/일" },
                    { label: "건강 기록 입력", points: "20P/일" },
                    { label: "미션 완수", points: "50~200P" },
                    { label: "상품 리뷰 작성", points: "30P" },
                    { label: "커뮤니티 글 작성", points: "15P" },
                    { label: "쇼핑 구매", points: "결제액 1~3%" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5">
                      <span className="text-muted-foreground">{item.label}</span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">{item.points}</Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  현재 {tierConfig.name} 등급 적립 배율: {TIER_DETAILS[currentTier]?.pointMultiplier}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ 쿠폰 탭 ═══ */}
          <TabsContent value="coupons" className="mt-4 space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Input placeholder="쿠폰 코드 입력" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1" />
                  <Button onClick={() => registerCoupon.mutate({ code: couponCode })} disabled={!couponCode || registerCoupon.isPending} className="bg-gradient-to-r from-amber-500 to-amber-600">
                    <Ticket className="w-4 h-4 mr-1" />등록
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-500" />
                  보유 쿠폰 ({myCouponsQuery.data?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myCouponsQuery.data && myCouponsQuery.data.length > 0 ? (
                  <div className="space-y-3">
                    {myCouponsQuery.data.map((uc: any) => (
                      <div key={uc.id} className={`relative overflow-hidden rounded-xl border-2 ${uc.status === "used" ? "border-gray-200 opacity-60" : "border-purple-200"}`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${uc.status === "used" ? "bg-gray-300" : "bg-gradient-to-b from-purple-400 to-purple-600"}`} />
                        <div className="pl-5 pr-4 py-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm">{uc.coupon?.name || "쿠폰"}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {uc.coupon?.discountType === "percentage" ? `${uc.coupon.discountValue}% 할인` : `${uc.coupon?.discountValue?.toLocaleString()}원 할인`}
                              </p>
                            </div>
                            <Badge variant={uc.status === "used" ? "secondary" : "default"} className={uc.status !== "used" ? "bg-purple-100 text-purple-700" : ""}>
                              {uc.status === "used" ? "사용완료" : uc.status === "expired" ? "만료" : "사용가능"}
                            </Badge>
                          </div>
                          {uc.expiresAt && <p className="text-xs text-muted-foreground mt-2">~{new Date(uc.expiresAt).toLocaleDateString("ko-KR")} 까지</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-muted-foreground text-sm">보유 쿠폰이 없습니다</p>
                    <p className="text-xs text-muted-foreground mt-1">쿠폰 코드를 입력하거나 이벤트에 참여하세요</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ 이벤트 탭 ═══ */}
          <TabsContent value="events" className="mt-4 space-y-4">
            {eventsQuery.data && eventsQuery.data.length > 0 ? (
              eventsQuery.data.map((event: any) => (
                <Card key={event.id} className="border-0 shadow-md overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${
                    event.eventType === "tier_exclusive" ? "from-purple-500 to-indigo-600" :
                    event.eventType === "seasonal" ? "from-emerald-500 to-teal-600" :
                    event.eventType === "challenge" ? "from-orange-500 to-red-600" :
                    "from-blue-500 to-cyan-600"
                  }`} />
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{event.title}</h3>
                          {event.requiredTier && TIER_CONFIG[event.requiredTier] && (
                            <Badge className={TIER_CONFIG[event.requiredTier].badgeColor}>
                              {TIER_CONFIG[event.requiredTier].name} 전용
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{event.startDate ? new Date(event.startDate).toLocaleDateString("ko-KR") : "상시"}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{event.currentParticipants || 0}명 참여</span>
                      </div>
                      <Button size="sm" onClick={() => joinEvent.mutate({ eventId: event.id })} disabled={joinEvent.isPending} className="bg-gradient-to-r from-blue-500 to-blue-600">참여하기</Button>
                    </div>
                    {event.rewardType && (
                      <div className="mt-3 p-2 bg-amber-50 rounded-lg flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-700">
                          보상: {event.rewardType === "points" ? `${event.rewardValue?.toLocaleString()}P` : event.rewardType === "coupon" ? "할인 쿠폰" : event.rewardType === "mileage" ? `${event.rewardValue?.toLocaleString()}M` : "특별 보상"}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="py-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground text-sm">진행 중인 이벤트가 없습니다</p>
                  <p className="text-xs text-muted-foreground mt-1">새로운 이벤트가 곧 시작됩니다</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
