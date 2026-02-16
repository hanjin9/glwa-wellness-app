import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  LayoutDashboard, Bell, BellOff, DollarSign, Users, Package,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Archive,
  Eye, EyeOff, ChevronRight, Shield, Activity, BarChart3,
  Truck, RefreshCw, CreditCard, UserCheck, Star, Filter,
  Settings, Zap, Mail, ArrowUpRight, ArrowDownRight, Minus,
  Brain, MessageSquare, Send, Calendar, User, Heart,
  FileText, Target, Sparkles, ChevronDown, ChevronUp,
  Play, Pause, AlertCircle, Search, X,
} from "lucide-react";

// ─── 알림 카테고리 설정 ─────────────────────────────────────────
const NOTIF_CATEGORIES = [
  { key: "urgent" as const, label: "🚨 긴급", desc: "VIP 레벨업 신청, 긴급 상담 요청", color: "bg-red-500", textColor: "text-red-600", badgeVariant: "destructive" as const },
  { key: "important" as const, label: "⚡ 중요", desc: "결제 완료, 정산 요청, 환불 요청", color: "bg-orange-500", textColor: "text-orange-600", badgeVariant: "default" as const },
  { key: "normal" as const, label: "📋 일반", desc: "미션 완료, 건강 기록, 게시글 신고", color: "bg-blue-500", textColor: "text-blue-600", badgeVariant: "secondary" as const },
  { key: "low" as const, label: "💬 낮음", desc: "좋아요, 댓글, 출석 체크", color: "bg-gray-400", textColor: "text-gray-500", badgeVariant: "outline" as const },
];

const PIPELINE_OPTIONS = [
  { value: "instant", label: "즉시 알림", icon: Zap },
  { value: "batch_6h", label: "6시간 모아보기", icon: Clock },
  { value: "daily", label: "일일 모아보기", icon: Mail },
  { value: "weekly", label: "주간 모아보기", icon: BarChart3 },
];

const COACHING_CATEGORIES = [
  { value: "health_analysis", label: "건강 분석" },
  { value: "exercise", label: "운동" },
  { value: "nutrition", label: "영양/식단" },
  { value: "mental", label: "정신건강" },
  { value: "lifestyle", label: "생활습관" },
  { value: "motivation", label: "동기부여" },
  { value: "general", label: "일반" },
];

const RISK_COLORS: Record<string, string> = {
  normal: "bg-green-100 text-green-700 border-green-300",
  caution: "bg-yellow-100 text-yellow-700 border-yellow-300",
  warning: "bg-orange-100 text-orange-700 border-orange-300",
  critical: "bg-red-100 text-red-700 border-red-300",
};
const RISK_LABELS: Record<string, string> = { normal: "정상", caution: "주의", warning: "경고", critical: "위험" };

export default function AdminDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [notifCategory, setNotifCategory] = useState<"all" | "urgent" | "important" | "normal" | "low">("all");
  const [notifReadStatus, setNotifReadStatus] = useState<"all" | "unread" | "read">("all");
  const [financialPeriod, setFinancialPeriod] = useState<"today" | "week" | "month" | "year">("month");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // 코칭 센터 상태
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [coachingTitle, setCoachingTitle] = useState("");
  const [coachingContent, setCoachingContent] = useState("");
  const [coachingCategory, setCoachingCategory] = useState("general");
  const [coachingScheduledAt, setCoachingScheduledAt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [expandedAnalysis, setExpandedAnalysis] = useState<number | null>(null);

  // ─── 데이터 쿼리 ─────────────────────────────────────────────
  const statsQuery = trpc.admin.getDashboardStats.useQuery(undefined, { enabled: user?.role === "admin" });
  const notifsQuery = trpc.admin.getNotifications.useQuery({ category: notifCategory, readStatus: notifReadStatus, limit: 50 }, { enabled: user?.role === "admin" && activeTab === "notifications" });
  const notifSettingsQuery = trpc.admin.getNotificationSettings.useQuery(undefined, { enabled: user?.role === "admin" && activeTab === "notifications" });
  const financialQuery = trpc.admin.getFinancialStats.useQuery({ period: financialPeriod }, { enabled: user?.role === "admin" && activeTab === "finance" });
  const membersQuery = trpc.admin.getMembers.useQuery({ limit: 100 }, { enabled: user?.role === "admin" });
  const ordersQuery = trpc.admin.getAllOrders.useQuery({ status: orderStatusFilter, limit: 50 }, { enabled: user?.role === "admin" && activeTab === "orders" });
  const activityQuery = trpc.admin.getActivityLog.useQuery({ limit: 30 }, { enabled: user?.role === "admin" && activeTab === "activity" });
  const analysesQuery = trpc.admin.getAiAnalyses.useQuery({ limit: 50 }, { enabled: user?.role === "admin" && (activeTab === "coaching" || activeTab === "overview") });
  const coachingQuery = trpc.admin.getCoachingMessages.useQuery({ limit: 50 }, { enabled: user?.role === "admin" && activeTab === "coaching" });

  // ─── 뮤테이션 ─────────────────────────────────────────────────
  const markRead = trpc.admin.markNotificationRead.useMutation({ onSuccess: () => { notifsQuery.refetch(); statsQuery.refetch(); } });
  const markAllRead = trpc.admin.markAllRead.useMutation({ onSuccess: () => { notifsQuery.refetch(); statsQuery.refetch(); toast.success("모두 읽음 처리 완료"); } });
  const archiveNotif = trpc.admin.archiveNotification.useMutation({ onSuccess: () => { notifsQuery.refetch(); toast.success("알림 보관 완료"); } });
  const updateNotifSetting = trpc.admin.updateNotificationSetting.useMutation({ onSuccess: () => { notifSettingsQuery.refetch(); toast.success("알림 설정 저장 완료"); } });
  const updateGrade = trpc.admin.updateMemberGrade.useMutation({ onSuccess: () => { membersQuery.refetch(); toast.success("등급 변경 완료"); } });
  const updateOrderStatus = trpc.admin.updateOrderStatus.useMutation({ onSuccess: () => { ordersQuery.refetch(); toast.success("주문 상태 변경 완료"); } });
  const runAiAnalysis = trpc.admin.runAiAnalysis.useMutation({ onSuccess: (data) => { analysesQuery.refetch(); toast.success(`AI 분석 완료: ${RISK_LABELS[data?.riskLevel || "normal"]}`); setAiGenerating(false); }, onError: () => { setAiGenerating(false); toast.error("AI 분석 실패"); } });
  const sendCoaching = trpc.admin.sendCoaching.useMutation({ onSuccess: () => { coachingQuery.refetch(); setCoachingTitle(""); setCoachingContent(""); setCoachingScheduledAt(""); toast.success("코칭 메시지 전송 완료"); } });
  const addNotes = trpc.admin.addAdminNotes.useMutation({ onSuccess: () => { analysesQuery.refetch(); toast.success("관리자 메모 저장 완료"); } });

  // ─── 알림 설정 맵 ─────────────────────────────────────────────
  const settingsMap = useMemo(() => {
    const map: Record<string, { enabled: boolean; pipeline: string }> = {};
    (notifSettingsQuery.data || []).forEach((s: any) => {
      map[s.category] = { enabled: s.enabled === 1, pipeline: s.pipeline };
    });
    return map;
  }, [notifSettingsQuery.data]);

  // 회원 검색 필터
  const filteredMembers = useMemo(() => {
    const items = membersQuery.data?.items || [];
    if (!memberSearch) return items;
    const q = memberSearch.toLowerCase();
    return items.filter((m: any) => (m.name || "").toLowerCase().includes(q) || (m.email || "").toLowerCase().includes(q));
  }, [membersQuery.data, memberSearch]);

  // 위험 알림 카운트
  const criticalAnalyses = useMemo(() => {
    return (analysesQuery.data || []).filter((a: any) => a.analysis.riskLevel === "critical" || a.analysis.riskLevel === "warning");
  }, [analysesQuery.data]);

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="w-16 h-16 text-muted-foreground/30" />
        <p className="text-lg font-medium text-muted-foreground">관리자 권한이 필요합니다</p>
      </div>
    );
  }

  const stats = statsQuery.data;
  const gradeLabels: Record<string, string> = { silver: "Silver", gold: "Gold", blue_sapphire: "Blue Sapphire", green_emerald: "Green Emerald", diamond: "Diamond", blue_diamond: "Blue Diamond", platinum: "Platinum", black_platinum: "Black Platinum" };
  const gradeColors: Record<string, string> = { silver: "bg-gray-200 text-gray-700", gold: "bg-yellow-100 text-yellow-700", blue_sapphire: "bg-blue-100 text-blue-700", green_emerald: "bg-emerald-100 text-emerald-700", diamond: "bg-cyan-100 text-cyan-700", blue_diamond: "bg-blue-200 text-blue-800", platinum: "bg-purple-100 text-purple-700", black_platinum: "bg-gray-800 text-white" };
  const gradeBgColors: Record<string, string> = { silver: "bg-gray-300", gold: "bg-yellow-400", blue_sapphire: "bg-blue-400", green_emerald: "bg-emerald-400", diamond: "bg-cyan-400", blue_diamond: "bg-blue-600", platinum: "bg-purple-500", black_platinum: "bg-gray-800" };

  return (
    <div className="space-y-4 pb-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            AI 관리자 대시보드
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">GLWA 통합 AI 관리 시스템</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { statsQuery.refetch(); analysesQuery.refetch(); }} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          새로고침
        </Button>
      </div>

      {/* 탭 네비게이션 - 8개 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="inline-flex w-auto min-w-full h-auto gap-0.5">
            <TabsTrigger value="overview" className="text-[10px] py-1.5 px-2 gap-0.5 flex-col">
              <LayoutDashboard className="w-3.5 h-3.5" />
              현황
            </TabsTrigger>
            <TabsTrigger value="coaching" className="text-[10px] py-1.5 px-2 gap-0.5 flex-col relative">
              <Brain className="w-3.5 h-3.5" />
              AI코칭
              {criticalAnalyses.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                  {criticalAnalyses.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-[10px] py-1.5 px-2 gap-0.5 flex-col relative">
              <Bell className="w-3.5 h-3.5" />
              알림
              {(stats?.unreadNotifications || 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                  {stats!.unreadNotifications > 99 ? "99+" : stats!.unreadNotifications}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="members" className="text-[10px] py-1.5 px-2 gap-0.5 flex-col">
              <Users className="w-3.5 h-3.5" />
              회원
            </TabsTrigger>
            <TabsTrigger value="finance" className="text-[10px] py-1.5 px-2 gap-0.5 flex-col">
              <DollarSign className="w-3.5 h-3.5" />
              재정
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-[10px] py-1.5 px-2 gap-0.5 flex-col">
              <Package className="w-3.5 h-3.5" />
              주문
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-[10px] py-1.5 px-2 gap-0.5 flex-col">
              <Activity className="w-3.5 h-3.5" />
              로그
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ═══ 종합 현황 ═══ */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* KPI 카드 */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">전체 회원</p>
                    <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                    <p className="text-[10px] text-green-600 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />+{stats?.weeklyNewUsers || 0} 이번 주
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">월 매출</p>
                    <p className="text-2xl font-bold">₩{(stats?.monthlyRevenue || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{stats?.totalOrders || 0}건 주문</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">위험 알림</p>
                    <p className="text-2xl font-bold text-red-600">{criticalAnalyses.length}</p>
                    <p className="text-[10px] text-muted-foreground">AI 분석 경고</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">오늘 건강기록</p>
                    <p className="text-2xl font-bold">{stats?.todayHealthRecords || 0}</p>
                    <p className="text-[10px] text-muted-foreground">건 기록됨</p>
                  </div>
                  <Heart className="w-8 h-8 text-purple-500/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI 위험 알림 요약 */}
          {criticalAnalyses.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  AI 위험 감지 ({criticalAnalyses.length}건)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {criticalAnalyses.slice(0, 3).map((a: any) => (
                  <div key={a.analysis.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-red-200">
                    <div className="flex items-center gap-2">
                      <Badge className={RISK_COLORS[a.analysis.riskLevel]}>{RISK_LABELS[a.analysis.riskLevel]}</Badge>
                      <span className="text-xs font-medium">{a.userName || "회원"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[120px]">{a.analysis.summary}</span>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-600" onClick={() => { setActiveTab("coaching"); setSelectedMember({ id: a.analysis.userId, name: a.userName }); }}>
                        코칭 <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 등급별 회원 분포 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                등급별 회원 분포
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(stats?.gradeStats || []).map((g: any) => {
                  const total = (stats?.totalUsers || 1);
                  const pct = Math.round((g.count / total) * 100);
                  return (
                    <div key={g.grade} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${gradeBgColors[g.grade] || "bg-gray-300"}`} />
                      <span className="text-xs w-28 truncate">{gradeLabels[g.grade] || g.grade}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${gradeBgColors[g.grade] || "bg-gray-300"}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                      <span className="text-xs font-medium w-12 text-right">{g.count}명</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 빠른 액션 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                빠른 액션
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start gap-2 h-10" onClick={() => setActiveTab("coaching")}>
                  <Brain className="w-4 h-4 text-purple-500" /> AI 코칭 센터
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2 h-10" onClick={() => setActiveTab("notifications")}>
                  <Bell className="w-4 h-4 text-red-500" /> 알림 확인
                  {(stats?.unreadNotifications || 0) > 0 && <Badge variant="destructive" className="ml-auto text-[9px] px-1.5">{stats!.unreadNotifications}</Badge>}
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2 h-10" onClick={() => setActiveTab("orders")}>
                  <Package className="w-4 h-4 text-orange-500" /> 주문 관리
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2 h-10" onClick={() => setActiveTab("finance")}>
                  <DollarSign className="w-4 h-4 text-green-500" /> 재정 현황
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ AI 코칭 센터 ═══ */}
        <TabsContent value="coaching" className="space-y-4 mt-4">
          {/* 회원 선택 + AI 분석 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                AI 건강 분석 & 코칭
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">회원을 선택하여 AI 분석을 실행하고 코칭 메시지를 전송합니다</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 회원 검색 */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="회원 이름 또는 이메일 검색..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="h-8 text-xs pl-8"
                />
                {memberSearch && (
                  <Button variant="ghost" size="sm" className="absolute right-1 top-0.5 h-7 w-7 p-0" onClick={() => setMemberSearch("")}>
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* 회원 목록 (검색 시 표시) */}
              {memberSearch && (
                <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-2">
                  {filteredMembers.slice(0, 10).map((m: any) => {
                    const grade = m.profile?.memberGrade || "silver";
                    return (
                      <div
                        key={m.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedMember?.id === m.id ? "bg-blue-50 border border-blue-200" : "hover:bg-muted/50"}`}
                        onClick={() => { setSelectedMember({ id: m.id, name: m.name, email: m.email, grade }); setMemberSearch(""); }}
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                          {(m.name || "?")[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{m.name || "미입력"}</p>
                          <p className="text-[9px] text-muted-foreground truncate">{m.email}</p>
                        </div>
                        <Badge className={`text-[8px] px-1 py-0 ${gradeColors[grade] || ""}`}>{gradeLabels[grade] || grade}</Badge>
                      </div>
                    );
                  })}
                  {filteredMembers.length === 0 && <p className="text-xs text-center text-muted-foreground py-2">검색 결과 없음</p>}
                </div>
              )}

              {/* 선택된 회원 */}
              {selectedMember && (
                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {(selectedMember.name || "?")[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{selectedMember.name}</p>
                        <Badge className={`text-[8px] px-1 py-0 ${gradeColors[selectedMember.grade] || ""}`}>{gradeLabels[selectedMember.grade] || selectedMember.grade}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-7 text-[10px] gap-1 bg-purple-600 hover:bg-purple-700"
                        disabled={aiGenerating}
                        onClick={() => { setAiGenerating(true); runAiAnalysis.mutate({ userId: selectedMember.id, type: "daily" }); }}
                      >
                        {aiGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        AI 분석
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedMember(null)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 코칭 메시지 작성 */}
              {selectedMember && (
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-medium">코칭 메시지 전송</span>
                  </div>
                  <Input
                    placeholder="코칭 제목..."
                    value={coachingTitle}
                    onChange={(e) => setCoachingTitle(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Textarea
                    placeholder="코칭 내용을 작성하세요... (AI 분석 결과를 참고하여 맞춤 코칭을 제공합니다)"
                    value={coachingContent}
                    onChange={(e) => setCoachingContent(e.target.value)}
                    className="text-xs min-h-[80px]"
                  />
                  <div className="flex items-center gap-2">
                    <Select value={coachingCategory} onValueChange={setCoachingCategory}>
                      <SelectTrigger className="h-7 text-[10px] w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COACHING_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="datetime-local"
                      value={coachingScheduledAt}
                      onChange={(e) => setCoachingScheduledAt(e.target.value)}
                      className="h-7 text-[10px] flex-1"
                      placeholder="예약 전송 (선택)"
                    />
                    <Button
                      size="sm"
                      className="h-7 text-[10px] gap-1"
                      disabled={!coachingTitle || !coachingContent}
                      onClick={() => {
                        sendCoaching.mutate({
                          userId: selectedMember.id,
                          title: coachingTitle,
                          content: coachingContent,
                          category: coachingCategory as any,
                          scheduledAt: coachingScheduledAt || undefined,
                        });
                      }}
                    >
                      {coachingScheduledAt ? <Calendar className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                      {coachingScheduledAt ? "예약" : "전송"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI 분석 결과 목록 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                AI 분석 결과 ({analysesQuery.data?.length || 0}건)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(analysesQuery.data || []).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Brain className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">AI 분석 결과가 없습니다</p>
                  <p className="text-[10px]">회원을 선택하고 AI 분석을 실행해보세요</p>
                </div>
              )}
              {(analysesQuery.data || []).map((a: any) => {
                const isExpanded = expandedAnalysis === a.analysis.id;
                const details = a.analysis.details || {};
                const recommendations = a.analysis.recommendations || [];
                return (
                  <Card key={a.analysis.id} className={`border ${a.analysis.riskLevel === "critical" ? "border-red-300 bg-red-50/30" : a.analysis.riskLevel === "warning" ? "border-orange-300 bg-orange-50/30" : ""}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between" onClick={() => setExpandedAnalysis(isExpanded ? null : a.analysis.id)}>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[9px] ${RISK_COLORS[a.analysis.riskLevel]}`}>{RISK_LABELS[a.analysis.riskLevel]}</Badge>
                          <span className="text-xs font-medium">{a.userName || "회원"}</span>
                          <span className="text-[9px] text-muted-foreground">{new Date(a.analysis.createdAt).toLocaleDateString("ko-KR")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {a.analysis.isReviewedByAdmin === 1 && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{a.analysis.summary}</p>

                      {isExpanded && (
                        <div className="mt-3 space-y-3 border-t pt-3">
                          {/* 상세 분석 */}
                          {Object.keys(details).length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">상세 분석</p>
                              {Object.entries(details).map(([key, val]) => {
                                const labels: Record<string, string> = { bloodPressure: "혈압", heartRate: "심박수", bloodSugar: "혈당", exercise: "운동", sleep: "수면", mental: "정신건강" };
                                return (
                                  <div key={key} className="flex gap-2 text-[10px]">
                                    <span className="font-medium w-14 shrink-0">{labels[key] || key}</span>
                                    <span className="text-muted-foreground">{String(val)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* 권고사항 */}
                          {recommendations.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">AI 권고사항</p>
                              {recommendations.map((r: string, i: number) => (
                                <div key={i} className="flex items-start gap-1.5 text-[10px]">
                                  <Target className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                                  <span>{r}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 관리자 메모 + 코칭 전송 */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] gap-1"
                              onClick={() => {
                                setSelectedMember({ id: a.analysis.userId, name: a.userName, grade: "silver" });
                                setCoachingTitle(`[AI분석] ${a.userName}님 건강 코칭`);
                                setCoachingContent(`AI 분석 결과: ${a.analysis.summary}\n\n권고사항:\n${recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}\n\n코치 의견:\n`);
                              }}
                            >
                              <Send className="w-3 h-3" /> 코칭 전송
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] gap-1"
                              onClick={() => {
                                const notes = prompt("관리자 메모를 입력하세요:", a.analysis.adminNotes || "");
                                if (notes !== null) addNotes.mutate({ analysisId: a.analysis.id, notes });
                              }}
                            >
                              <FileText className="w-3 h-3" /> 메모
                            </Button>
                          </div>
                          {a.analysis.adminNotes && (
                            <div className="p-2 rounded bg-blue-50 border border-blue-200">
                              <p className="text-[9px] font-medium text-blue-700">관리자 메모</p>
                              <p className="text-[10px] text-blue-600">{a.analysis.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>

          {/* 최근 코칭 메시지 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                최근 코칭 메시지
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(coachingQuery.data || []).length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">코칭 메시지가 없습니다</p>
              )}
              {(coachingQuery.data || []).slice(0, 10).map((c: any) => {
                const catLabel = COACHING_CATEGORIES.find(cc => cc.value === c.msg.category)?.label || c.msg.category;
                return (
                  <div key={c.msg.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 border">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] ${c.msg.type === "ai_auto" ? "bg-purple-500" : c.msg.type === "scheduled" ? "bg-blue-500" : "bg-green-500"}`}>
                      {c.msg.type === "ai_auto" ? <Sparkles className="w-3 h-3" /> : c.msg.type === "scheduled" ? <Calendar className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate">{c.msg.title}</span>
                        <Badge variant="outline" className="text-[8px] px-1 py-0">{catLabel}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">→ {c.userName || "회원"}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {c.msg.sentAt ? new Date(c.msg.sentAt).toLocaleString("ko-KR") : "예약: " + (c.msg.scheduledAt ? new Date(c.msg.scheduledAt).toLocaleString("ko-KR") : "미정")}
                      </p>
                    </div>
                    <Badge variant={c.msg.isRead === 1 ? "secondary" : "outline"} className="text-[8px]">
                      {c.msg.isRead === 1 ? "읽음" : "안읽음"}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ 알림 센터 ═══ */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          {/* 알림 파이프라인 설정 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                알림 파이프라인 설정
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">카테고리별 알림 ON/OFF 및 수신 주기를 설정합니다</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {NOTIF_CATEGORIES.map((cat) => {
                const setting = settingsMap[cat.key] || { enabled: true, pipeline: "instant" };
                return (
                  <div key={cat.key} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border">
                    <div className={`w-2 h-8 rounded-full ${cat.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{cat.label}</span>
                        <span className="text-[9px] text-muted-foreground">{cat.desc}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Select
                          value={setting.pipeline}
                          onValueChange={(v) => updateNotifSetting.mutate({ category: cat.key, enabled: setting.enabled, pipeline: v as any })}
                        >
                          <SelectTrigger className="h-7 text-[10px] w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PIPELINE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(v) => updateNotifSetting.mutate({ category: cat.key, enabled: v, pipeline: setting.pipeline as any })}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* 알림 필터 */}
          <div className="flex items-center gap-2">
            <Select value={notifCategory} onValueChange={(v: any) => setNotifCategory(v)}>
              <SelectTrigger className="h-8 text-xs w-28">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="urgent">🚨 긴급</SelectItem>
                <SelectItem value="important">⚡ 중요</SelectItem>
                <SelectItem value="normal">📋 일반</SelectItem>
                <SelectItem value="low">💬 낮음</SelectItem>
              </SelectContent>
            </Select>
            <Select value={notifReadStatus} onValueChange={(v: any) => setNotifReadStatus(v)}>
              <SelectTrigger className="h-8 text-xs w-24">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="unread">안읽음</SelectItem>
                <SelectItem value="read">읽음</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 text-xs ml-auto gap-1" onClick={() => markAllRead.mutate({ category: notifCategory })}>
              <CheckCircle className="w-3 h-3" /> 모두 읽음
            </Button>
          </div>

          {/* 알림 목록 */}
          <div className="space-y-2">
            {(notifsQuery.data?.items || []).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BellOff className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">알림이 없습니다</p>
              </div>
            )}
            {(notifsQuery.data?.items || []).map((notif: any) => {
              const cat = NOTIF_CATEGORIES.find(c => c.key === notif.category);
              return (
                <Card key={notif.id} className={`${notif.isRead === 0 ? "border-l-4" : "opacity-70"}`} style={{ borderLeftColor: notif.isRead === 0 ? undefined : undefined }}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${cat?.color || "bg-gray-300"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={cat?.badgeVariant || "outline"} className="text-[9px] px-1.5 py-0">{cat?.label || notif.category}</Badge>
                          <span className="text-[9px] text-muted-foreground">{new Date(notif.createdAt).toLocaleString("ko-KR")}</span>
                        </div>
                        <p className="text-xs font-medium mt-1">{notif.title}</p>
                        {notif.content && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{notif.content}</p>}
                      </div>
                      <div className="flex gap-1">
                        {notif.isRead === 0 && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => markRead.mutate({ id: notif.id })}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => archiveNotif.mutate({ id: notif.id })}>
                          <Archive className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ═══ 회원 관리 (360도 뷰) ═══ */}
        <TabsContent value="members" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">전체 {membersQuery.data?.total || 0}명</p>
            <div className="relative w-40">
              <Search className="absolute left-2 top-1.5 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="검색..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="h-7 text-[10px] pl-7"
              />
            </div>
          </div>
          <div className="space-y-2">
            {filteredMembers.map((member: any) => {
              const grade = member.profile?.memberGrade || "silver";
              return (
                <Card key={member.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {(member.name || "?")[0]}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{member.name || "미입력"}</p>
                          <p className="text-[10px] text-muted-foreground">{member.email || "이메일 없음"}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge className={`text-[8px] px-1 py-0 ${gradeColors[grade] || ""}`}>{gradeLabels[grade] || grade}</Badge>
                            <span className="text-[9px] text-muted-foreground">{new Date(member.createdAt).toLocaleDateString("ko-KR")} 가입</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Select value={grade} onValueChange={(v) => updateGrade.mutate({ userId: member.id, grade: v })}>
                          <SelectTrigger className="h-6 text-[9px] w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(gradeLabels).map(([k, v]) => (
                              <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-[8px] px-1.5 gap-0.5"
                            onClick={() => { setActiveTab("coaching"); setSelectedMember({ id: member.id, name: member.name, email: member.email, grade }); }}
                          >
                            <Brain className="w-2.5 h-2.5" /> AI분석
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-[8px] px-1.5 gap-0.5"
                            onClick={() => { setActiveTab("coaching"); setSelectedMember({ id: member.id, name: member.name, email: member.email, grade }); }}
                          >
                            <Send className="w-2.5 h-2.5" /> 코칭
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ═══ 재정 관리 ═══ */}
        <TabsContent value="finance" className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            {(["today", "week", "month", "year"] as const).map((p) => {
              const labels: Record<string, string> = { today: "오늘", week: "이번 주", month: "이번 달", year: "올해" };
              return (
                <Button key={p} variant={financialPeriod === p ? "default" : "outline"} size="sm" className="h-8 text-xs" onClick={() => setFinancialPeriod(p)}>
                  {labels[p]}
                </Button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">총 매출</p>
                <p className="text-xl font-bold text-green-600">₩{(financialQuery.data?.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{financialQuery.data?.totalOrderCount || 0}건 결제</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">미정산</p>
                <p className="text-xl font-bold text-orange-600">₩{(financialQuery.data?.pendingSettlementAmount || 0).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{financialQuery.data?.pendingSettlementCount || 0}건 대기</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4" />
                주문 상태 요약
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                  <Clock className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                  <p className="text-lg font-bold text-yellow-700">{financialQuery.data?.pendingOrders || 0}</p>
                  <p className="text-[9px] text-yellow-600">대기중</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <Truck className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-lg font-bold text-blue-700">{financialQuery.data?.shippingOrders || 0}</p>
                  <p className="text-[9px] text-blue-600">배송중</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
                  <RefreshCw className="w-5 h-5 mx-auto text-red-600 mb-1" />
                  <p className="text-lg font-bold text-red-700">{financialQuery.data?.refundedOrders || 0}</p>
                  <p className="text-[9px] text-red-600">환불</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">최근 주문</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(financialQuery.data?.recentOrders || []).slice(0, 5).map((order: any) => {
                  const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", paid: "bg-green-100 text-green-700", shipping: "bg-blue-100 text-blue-700", delivered: "bg-gray-100 text-gray-700", cancelled: "bg-red-100 text-red-700", refunded: "bg-orange-100 text-orange-700" };
                  const statusLabels: Record<string, string> = { pending: "대기", paid: "결제완료", shipping: "배송중", delivered: "배송완료", cancelled: "취소", refunded: "환불" };
                  return (
                    <div key={order.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border">
                      <div>
                        <p className="text-xs font-medium">{order.orderNumber}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("ko-KR")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">₩{(order.totalAmount || 0).toLocaleString()}</span>
                        <Badge className={`text-[9px] ${statusColors[order.status] || ""}`}>{statusLabels[order.status] || order.status}</Badge>
                      </div>
                    </div>
                  );
                })}
                {(financialQuery.data?.recentOrders || []).length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">주문 내역이 없습니다</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ 주문 관리 ═══ */}
        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            {["all", "pending", "paid", "shipping", "delivered", "cancelled", "refunded"].map((s) => {
              const labels: Record<string, string> = { all: "전체", pending: "대기", paid: "결제완료", shipping: "배송중", delivered: "배송완료", cancelled: "취소", refunded: "환불" };
              return (
                <Button key={s} variant={orderStatusFilter === s ? "default" : "outline"} size="sm" className="h-7 text-[10px]" onClick={() => setOrderStatusFilter(s)}>
                  {labels[s]}
                </Button>
              );
            })}
          </div>
          <div className="space-y-2">
            {(ordersQuery.data?.items || []).map((order: any) => {
              const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", paid: "bg-green-100 text-green-700", shipping: "bg-blue-100 text-blue-700", delivered: "bg-gray-100 text-gray-700", cancelled: "bg-red-100 text-red-700", refunded: "bg-orange-100 text-orange-700" };
              const statusLabels: Record<string, string> = { pending: "대기", paid: "결제완료", shipping: "배송중", delivered: "배송완료", cancelled: "취소", refunded: "환불" };
              return (
                <Card key={order.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">{order.orderNumber}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleString("ko-KR")}</p>
                        <p className="text-xs font-bold mt-0.5">₩{(order.totalAmount || 0).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[9px] ${statusColors[order.status] || ""}`}>{statusLabels[order.status] || order.status}</Badge>
                        <Select value={order.status} onValueChange={(v) => updateOrderStatus.mutate({ orderId: order.id, status: v as any })}>
                          <SelectTrigger className="h-7 text-[9px] w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["pending", "paid", "shipping", "delivered", "cancelled", "refunded"].map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">{statusLabels[s]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {(ordersQuery.data?.items || []).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">주문 내역이 없습니다</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ═══ 활동 로그 ═══ */}
        <TabsContent value="activity" className="space-y-4 mt-4">
          <div className="space-y-2">
            {(activityQuery.data || []).map((log: any) => {
              const actionLabels: Record<string, string> = { update_grade: "등급 변경", update_order_status: "주문 상태 변경", approve_upgrade: "업그레이드 승인", process_refund: "환불 처리", send_coaching: "코칭 전송", run_ai_analysis: "AI 분석 실행" };
              const actionIcons: Record<string, any> = { update_grade: Star, update_order_status: Package, approve_upgrade: UserCheck, process_refund: RefreshCw, send_coaching: MessageSquare, run_ai_analysis: Brain };
              const Icon = actionIcons[log.action] || Activity;
              return (
                <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/20 border">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{actionLabels[log.action] || log.action}</p>
                    {log.details && <p className="text-[10px] text-muted-foreground">{log.details}</p>}
                    <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(log.createdAt).toLocaleString("ko-KR")}</p>
                  </div>
                </div>
              );
            })}
            {(activityQuery.data || []).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">활동 로그가 없습니다</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
