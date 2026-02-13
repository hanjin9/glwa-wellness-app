import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useState, useMemo } from "react";
import {
  Crown, Diamond, Star, Shield, Gift, Ticket, Coins,
  TrendingUp, ChevronRight, Sparkles, Award, Zap,
  Calendar, Users, ArrowUp, Check, Lock, Heart, Gem
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TIER_CONFIG = {
  silver: {
    name: "실버",
    icon: Shield,
    color: "from-gray-300 to-gray-500",
    textColor: "text-gray-600",
    bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
    borderColor: "border-gray-300",
    badgeColor: "bg-gray-200 text-gray-700",
    accentColor: "#9CA3AF",
  },
  gold: {
    name: "골드",
    icon: Star,
    color: "from-amber-400 to-amber-600",
    textColor: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
    borderColor: "border-amber-400",
    badgeColor: "bg-amber-100 text-amber-700",
    accentColor: "#D97706",
  },
  diamond: {
    name: "다이아몬드",
    icon: Diamond,
    color: "from-sky-400 to-blue-600",
    textColor: "text-blue-600",
    bgColor: "bg-gradient-to-br from-sky-50 to-blue-100",
    borderColor: "border-blue-400",
    badgeColor: "bg-blue-100 text-blue-700",
    accentColor: "#2563EB",
  },
  platinum: {
    name: "플래티넘",
    icon: Crown,
    color: "from-purple-500 to-indigo-700",
    textColor: "text-purple-700",
    bgColor: "bg-gradient-to-br from-purple-50 to-indigo-100",
    borderColor: "border-purple-500",
    badgeColor: "bg-purple-100 text-purple-700",
    accentColor: "#7C3AED",
  },
};

const TIER_BENEFITS = {
  silver: ["기본 건강 체크리스트", "커뮤니티 접근", "주간 건강 리포트", "기본 미션 참여"],
  gold: ["모든 실버 혜택", "포인트 1.5배 적립", "월간 전문 상담 1회", "골드 전용 이벤트", "쇼핑 5% 할인", "프리미엄 콘텐츠 접근"],
  diamond: ["모든 골드 혜택", "포인트 2배 적립", "주간 전문 상담", "다이아몬드 전용 프로그램", "쇼핑 10% 할인", "우선 예약권", "전용 커뮤니티"],
  platinum: ["모든 다이아몬드 혜택", "포인트 3배 적립", "무제한 전문 상담", "1:1 전담 매니저", "쇼핑 15% 할인", "VIP 이벤트 초대", "프리미엄 기기 무료 대여", "해외 웰니스 투어"],
};

export default function Membership() {
  const { user, isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const membershipQuery = trpc.membership.getMyMembership.useQuery(undefined, { enabled: isAuthenticated });
  const tiersQuery = trpc.membership.getTiers.useQuery();
  const pointsQuery = trpc.points.getBalance.useQuery(undefined, { enabled: isAuthenticated });
  const pointsHistoryQuery = trpc.points.getHistory.useQuery(undefined, { enabled: isAuthenticated });
  const myCouponsQuery = trpc.coupon.getMyCoupons.useQuery(undefined, { enabled: isAuthenticated });
  const eventsQuery = trpc.event.getActive.useQuery();

  const registerCoupon = trpc.coupon.register.useMutation({
    onSuccess: (data) => {
      toast.success(`쿠폰 등록 완료: ${data.couponName}`);
      setCouponCode("");
      myCouponsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const joinEvent = trpc.event.join.useMutation({
    onSuccess: () => {
      toast.success("이벤트 참여 완료!");
      eventsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const upgradeMembership = trpc.membership.upgrade.useMutation({
    onSuccess: () => {
      toast.success("멤버십이 업그레이드되었습니다!");
      membershipQuery.refetch();
      pointsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const currentTier = (membershipQuery.data?.membership?.tier || "silver") as keyof typeof TIER_CONFIG;
  const tierConfig = TIER_CONFIG[currentTier];
  const TierIcon = tierConfig.icon;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Crown className="w-16 h-16 mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">GLWA 멤버십</h2>
          <p className="text-muted-foreground mb-6">로그인하여 멤버십 혜택을 확인하세요</p>
          <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-amber-600">
            <a href={getLoginUrl()}>로그인</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Hero Section - 멤버십 카드 */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${tierConfig.color} px-4 pt-12 pb-8`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
        </div>
        <div className="relative max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/80 text-sm font-medium">GLWA WELLNESS</p>
              <h1 className="text-white text-2xl font-bold">{tierConfig.name} 멤버</h1>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TierIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/70 text-xs">보유 포인트</p>
                <p className="text-white text-2xl font-bold">{(pointsQuery.data?.currentPoints || 0).toLocaleString()} P</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs">마일리지</p>
                <p className="text-white text-lg font-semibold">{(pointsQuery.data?.totalMileage || 0).toLocaleString()} M</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-white/70 text-xs">총 적립</p>
              <p className="text-white font-bold">{(pointsQuery.data?.totalEarned || 0).toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-white/70 text-xs">총 사용</p>
              <p className="text-white font-bold">{(pointsQuery.data?.totalUsed || 0).toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-white/70 text-xs">쿠폰</p>
              <p className="text-white font-bold">{myCouponsQuery.data?.length || 0}장</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-md mx-auto px-4 -mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-white shadow-lg rounded-2xl h-12 p-1">
            <TabsTrigger value="overview" className="rounded-xl text-xs flex-1">혜택</TabsTrigger>
            <TabsTrigger value="points" className="rounded-xl text-xs flex-1">포인트</TabsTrigger>
            <TabsTrigger value="coupons" className="rounded-xl text-xs flex-1">쿠폰</TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl text-xs flex-1">이벤트</TabsTrigger>
            <TabsTrigger value="upgrade" className="rounded-xl text-xs flex-1">등급</TabsTrigger>
          </TabsList>

          {/* 혜택 탭 */}
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
                  {TIER_BENEFITS[currentTier].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${tierConfig.color} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
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

            {/* 포인트 적립 배율 */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  포인트 적립 배율
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {(["silver", "gold", "diamond", "platinum"] as const).map((tier) => {
                    const cfg = TIER_CONFIG[tier];
                    const multipliers = { silver: "1x", gold: "1.5x", diamond: "2x", platinum: "3x" };
                    const isCurrentOrLower = ["silver", "gold", "diamond", "platinum"].indexOf(tier) <= ["silver", "gold", "diamond", "platinum"].indexOf(currentTier);
                    return (
                      <div key={tier} className={`text-center p-3 rounded-xl ${isCurrentOrLower ? cfg.bgColor : "bg-gray-50"} ${tier === currentTier ? "ring-2 ring-offset-1" : ""}`}
                        style={tier === currentTier ? { borderColor: cfg.accentColor } : {}}>
                        <p className="text-xs text-muted-foreground mb-1">{cfg.name}</p>
                        <p className={`text-lg font-bold ${isCurrentOrLower ? cfg.textColor : "text-gray-400"}`}>{multipliers[tier]}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 포인트 탭 */}
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
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString("ko-KR")}
                            </p>
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

            {/* 포인트 적립 방법 */}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* 쿠폰 탭 */}
          <TabsContent value="coupons" className="mt-4 space-y-4">
            {/* 쿠폰 등록 */}
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="쿠폰 코드 입력"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => registerCoupon.mutate({ code: couponCode })}
                    disabled={!couponCode || registerCoupon.isPending}
                    className="bg-gradient-to-r from-amber-500 to-amber-600"
                  >
                    <Ticket className="w-4 h-4 mr-1" />
                    등록
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 보유 쿠폰 */}
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
                                {uc.coupon?.discountType === "percentage"
                                  ? `${uc.coupon.discountValue}% 할인`
                                  : `${uc.coupon?.discountValue?.toLocaleString()}원 할인`}
                              </p>
                            </div>
                            <Badge variant={uc.status === "used" ? "secondary" : "default"}
                              className={uc.status !== "used" ? "bg-purple-100 text-purple-700" : ""}>
                              {uc.status === "used" ? "사용완료" : uc.status === "expired" ? "만료" : "사용가능"}
                            </Badge>
                          </div>
                          {uc.expiresAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              ~{new Date(uc.expiresAt).toLocaleDateString("ko-KR")} 까지
                            </p>
                          )}
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

          {/* 이벤트 탭 */}
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
                          {event.requiredTier && (
                            <Badge className={TIER_CONFIG[event.requiredTier as keyof typeof TIER_CONFIG]?.badgeColor || ""}>
                              {TIER_CONFIG[event.requiredTier as keyof typeof TIER_CONFIG]?.name} 전용
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {event.startDate ? new Date(event.startDate).toLocaleDateString("ko-KR") : "상시"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {event.currentParticipants || 0}명 참여
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => joinEvent.mutate({ eventId: event.id })}
                        disabled={joinEvent.isPending}
                        className="bg-gradient-to-r from-blue-500 to-blue-600"
                      >
                        참여하기
                      </Button>
                    </div>
                    {event.rewardType && (
                      <div className="mt-3 p-2 bg-amber-50 rounded-lg flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-700">
                          보상: {event.rewardType === "points" ? `${event.rewardValue?.toLocaleString()}P` :
                            event.rewardType === "coupon" ? "할인 쿠폰" :
                            event.rewardType === "mileage" ? `${event.rewardValue?.toLocaleString()}M` : "특별 보상"}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground text-sm">진행 중인 이벤트가 없습니다</p>
                  <p className="text-xs text-muted-foreground mt-1">새로운 이벤트가 곧 시작됩니다</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 등급 업그레이드 탭 */}
          <TabsContent value="upgrade" className="mt-4 space-y-4">
            {(["silver", "gold", "diamond", "platinum"] as const).map((tier) => {
              const cfg = TIER_CONFIG[tier];
              const Icon = cfg.icon;
              const tierOrder = ["silver", "gold", "diamond", "platinum"];
              const isCurrentTier = tier === currentTier;
              const isLowerTier = tierOrder.indexOf(tier) < tierOrder.indexOf(currentTier);
              const isHigherTier = tierOrder.indexOf(tier) > tierOrder.indexOf(currentTier);
              const monthlyFees = { silver: 0, gold: 50000, diamond: 300000, platinum: 3000000 };
              const discountRates = { silver: "0%", gold: "5%", diamond: "10%", platinum: "15%" };
              const paybackRates = { silver: "50%", gold: "60%", diamond: "70%", platinum: "100%" };

              return (
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tierOrder.indexOf(tier) * 0.1 }}
                >
                  <Card className={`border-2 overflow-hidden ${isCurrentTier ? cfg.borderColor + " shadow-lg" : "border-gray-100"}`}>
                    {isCurrentTier && (
                      <div className={`h-1.5 bg-gradient-to-r ${cfg.color}`} />
                    )}
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${cfg.color} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg">{cfg.name}</h3>
                              {isCurrentTier && <Badge className="bg-emerald-100 text-emerald-700">현재</Badge>}
                              {isLowerTier && <Badge variant="secondary">완료</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {monthlyFees[tier] === 0 ? "무료" : `월 ${monthlyFees[tier].toLocaleString()}원`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">할인율</p>
                          <p className="font-bold text-sm">{discountRates[tier]}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">페이백</p>
                          <p className="font-bold text-sm">{paybackRates[tier]}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">적립 배율</p>
                          <p className="font-bold text-sm">{tier === "silver" ? "1x" : tier === "gold" ? "1.5x" : tier === "diamond" ? "2x" : "3x"}</p>
                        </div>
                      </div>

                      {isHigherTier && (
                        <Button
                          className={`w-full bg-gradient-to-r ${cfg.color} text-white`}
                          onClick={() => { if (tier !== "silver") upgradeMembership.mutate({ tier: tier as "gold" | "diamond" | "platinum" }); }}
                          disabled={upgradeMembership.isPending}
                        >
                          <ArrowUp className="w-4 h-4 mr-1" />
                          {cfg.name}으로 업그레이드
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
