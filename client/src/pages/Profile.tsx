import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { MediaInputToolbar, type MediaFile } from "@/components/MediaInputToolbar";
import {
  User, Heart, Shield, Award, ChevronRight, LogOut, Crown, Diamond, Star, Gem,
  Wallet, QrCode, CreditCard, Coins, ArrowRight, Copy, Eye, EyeOff, Sparkles,
} from "lucide-react";
import { useLocation } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";

// ═══ Tier Card Design System ═══
const tierCardStyles: Record<string, {
  label: string; en: string; gradient: string; textColor: string; accentColor: string;
  icon: any; chipColor: string; pattern: string;
}> = {
  silver: {
    label: "실버", en: "SILVER", gradient: "linear-gradient(135deg, #8E9196 0%, #A8A9AD 35%, #C0C0C0 60%, #A8A9AD 100%)",
    textColor: "text-white", accentColor: "#E8E8E8", icon: Shield, chipColor: "#D4D4D4",
    pattern: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)",
  },
  gold: {
    label: "골드", en: "GOLD", gradient: "linear-gradient(135deg, #B8860B 0%, #DAA520 30%, #FFD700 55%, #DAA520 80%, #B8860B 100%)",
    textColor: "text-white", accentColor: "#FFE066", icon: Star, chipColor: "#FFD700",
    pattern: "radial-gradient(ellipse at 80% 20%, rgba(255,215,0,0.15) 0%, transparent 50%)",
  },
  blue_sapphire: {
    label: "블루사파이어", en: "BLUE SAPPHIRE", gradient: "linear-gradient(135deg, #0F3460 0%, #1A5276 30%, #2471A3 55%, #1A5276 80%, #0F3460 100%)",
    textColor: "text-white", accentColor: "#5DADE2", icon: Gem, chipColor: "#3498DB",
    pattern: "radial-gradient(ellipse at 70% 30%, rgba(93,173,226,0.12) 0%, transparent 50%)",
  },
  green_emerald: {
    label: "그린에메랄드", en: "GREEN EMERALD", gradient: "linear-gradient(135deg, #0B5345 0%, #148F77 30%, #1ABC9C 55%, #148F77 80%, #0B5345 100%)",
    textColor: "text-white", accentColor: "#76D7C4", icon: Gem, chipColor: "#1ABC9C",
    pattern: "radial-gradient(ellipse at 30% 70%, rgba(118,215,196,0.12) 0%, transparent 50%)",
  },
  diamond: {
    label: "다이아몬드", en: "DIAMOND", gradient: "linear-gradient(135deg, #1B2631 0%, #2E4053 25%, #5B7D9A 50%, #85C1E9 70%, #5B7D9A 90%, #2E4053 100%)",
    textColor: "text-white", accentColor: "#AED6F1", icon: Diamond, chipColor: "#85C1E9",
    pattern: "radial-gradient(ellipse at 50% 50%, rgba(174,214,241,0.15) 0%, transparent 60%)",
  },
  blue_diamond: {
    label: "블루다이아몬드", en: "BLUE DIAMOND", gradient: "linear-gradient(135deg, #0C1445 0%, #1A237E 25%, #283593 50%, #5C6BC0 70%, #283593 90%, #0C1445 100%)",
    textColor: "text-white", accentColor: "#9FA8DA", icon: Diamond, chipColor: "#7986CB",
    pattern: "radial-gradient(ellipse at 60% 40%, rgba(159,168,218,0.15) 0%, transparent 50%)",
  },
  platinum: {
    label: "플래티넘", en: "PLATINUM", gradient: "linear-gradient(135deg, #2C2C54 0%, #474787 25%, #706FD3 50%, #474787 75%, #2C2C54 100%)",
    textColor: "text-white", accentColor: "#A29BFE", icon: Crown, chipColor: "#706FD3",
    pattern: "radial-gradient(ellipse at 40% 60%, rgba(162,155,254,0.12) 0%, transparent 50%)",
  },
  black_platinum: {
    label: "블랙플래티넘", en: "BLACK PLATINUM", gradient: "linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 25%, #16213E 50%, #1A1A2E 75%, #0A0A0A 100%)",
    textColor: "text-white", accentColor: "#E2E2E2", icon: Crown, chipColor: "#333333",
    pattern: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.05) 0%, transparent 50%)",
  },
};

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = trpc.profile.get.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("프로필이 저장되었습니다.");
      utils.profile.get.invalidate();
    },
    onError: () => toast.error("저장에 실패했습니다."),
  });

  const [form, setForm] = useState({
    birthDate: "",
    gender: "male" as "male" | "female" | "other",
    height: "",
    weight: "",
    bloodType: "",
    medicalHistory: "",
    allergies: "",
    medications: "",
    emergencyContact: "",
  });

  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<"card" | "wallet" | "profile">("card");

  useEffect(() => {
    if (profile) {
      setForm({
        birthDate: profile.birthDate || "",
        gender: (profile.gender as "male" | "female" | "other") || "male",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        bloodType: profile.bloodType || "",
        medicalHistory: Array.isArray(profile.medicalHistory) ? (profile.medicalHistory as string[]).join(", ") : "",
        allergies: Array.isArray(profile.allergies) ? (profile.allergies as string[]).join(", ") : "",
        medications: Array.isArray(profile.medications) ? (profile.medications as string[]).join(", ") : "",
        emergencyContact: profile.emergencyContact || "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate({
      birthDate: form.birthDate || undefined,
      gender: form.gender,
      height: form.height ? parseFloat(form.height) : undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      bloodType: form.bloodType || undefined,
      medicalHistory: form.medicalHistory ? form.medicalHistory.split(",").map(s => s.trim()) : [],
      allergies: form.allergies ? form.allergies.split(",").map(s => s.trim()) : [],
      medications: form.medications ? form.medications.split(",").map(s => s.trim()) : [],
      emergencyContact: form.emergencyContact || undefined,
    });
  };

  const membershipQuery = trpc.membership.getMyMembership.useQuery(undefined, { retry: false });
  const walletQuery = trpc.wallet.getMyWallet.useQuery(undefined, { retry: false });
  const walletTxQuery = trpc.wallet.getTransactions.useQuery(undefined, { retry: false });

  const currentTier = membershipQuery.data?.membership?.tier || "silver";
  const cardStyle = tierCardStyles[currentTier] || tierCardStyles.silver;
  const wallet = walletQuery.data;
  const cardNumber = wallet?.cardNumber || "GLWA-0000-0000-0000";
  const maskedCard = showCardNumber ? cardNumber : cardNumber.replace(/(\d{4})-(\d{4})-(\d{4})/, "****-****-$3");

  const qrData = useMemo(() => JSON.stringify({
    type: "glwa_pay",
    card: cardNumber,
    user: user?.name || "",
    tier: currentTier,
    ts: Date.now(),
  }), [cardNumber, user?.name, currentTier]);

  const copyCardNumber = () => {
    navigator.clipboard.writeText(cardNumber);
    toast.success("카드번호가 복사되었습니다.");
  };

  return (
    <div className="space-y-5 pb-4">
      {/* ═══ Profile Header - Resort Style ═══ */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-resort flex items-center justify-center shadow-lg">
          <User className="w-8 h-8 text-white/90" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-medium font-resort tracking-tight">{user?.name || "회원"}</h1>
          <p className="text-xs text-muted-foreground font-light">{user?.email || ""}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full"
              style={{ background: cardStyle.chipColor + "22", color: cardStyle.chipColor }}>
              {cardStyle.label} 멤버
            </span>
          </div>
        </div>
      </div>

      {/* ═══ Tab Navigation ═══ */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
        {[
          { key: "card" as const, icon: CreditCard, label: "멤버십 카드" },
          { key: "wallet" as const, icon: Wallet, label: "지갑" },
          { key: "profile" as const, icon: User, label: "프로필" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Tab: Membership Card ═══ */}
      {activeTab === "card" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Premium Membership Card */}
          <div className="relative">
            <div
              className="relative w-full rounded-2xl p-6 overflow-hidden"
              style={{
                background: cardStyle.gradient,
                aspectRatio: "1.586/1",
                boxShadow: "0 25px 60px rgba(0,0,0,0.25), 0 10px 25px rgba(0,0,0,0.12)",
              }}
            >
              {/* Pattern overlay */}
              <div className="absolute inset-0" style={{ background: cardStyle.pattern }} />
              {/* Shimmer effect */}
              <div className="absolute inset-0 shimmer" />

              {/* Card Content */}
              <div className="relative h-full flex flex-col justify-between">
                {/* Top Row */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/40 text-[8px] tracking-[0.3em] uppercase font-light">Global Leaders Wellness</p>
                    <p className="text-white/90 text-sm font-medium tracking-[0.1em] mt-0.5 font-resort">{cardStyle.en}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Chip */}
                    <div className="w-9 h-7 rounded-md border border-white/20"
                      style={{ background: `linear-gradient(135deg, ${cardStyle.chipColor}88, ${cardStyle.chipColor}44)` }}
                    />
                  </div>
                </div>

                {/* Card Number */}
                <div className="my-auto">
                  <div className="flex items-center gap-2">
                    <p className="text-white/90 text-base tracking-[0.15em] font-light" style={{ fontFamily: "'Courier New', monospace" }}>
                      {maskedCard}
                    </p>
                    <button onClick={() => setShowCardNumber(!showCardNumber)} className="text-white/40 hover:text-white/70 transition-colors">
                      {showCardNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={copyCardNumber} className="text-white/40 hover:text-white/70 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white/35 text-[8px] tracking-wider uppercase">Member Name</p>
                    <p className="text-white/90 text-sm font-medium tracking-wide mt-0.5">{user?.name || "MEMBER"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/35 text-[8px] tracking-wider uppercase">Since</p>
                    <p className="text-white/70 text-xs font-light mt-0.5">
                      {membershipQuery.data?.membership?.startDate
                        ? new Date(membershipQuery.data.membership.startDate).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit" })
                        : new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="text-center">
            <button
              onClick={() => setShowQR(!showQR)}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <QrCode className="w-4 h-4" />
              {showQR ? "QR코드 숨기기" : "QR코드 결제"}
            </button>
          </div>

          {showQR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 p-6 bg-card rounded-2xl border border-border/40 shadow-sm"
            >
              <p className="text-[10px] text-muted-foreground/60 tracking-[0.2em] uppercase">Scan to Pay</p>
              <div className="qr-container">
                <QRCodeSVG
                  value={qrData}
                  size={160}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#1A1A2E"
                  style={{ borderRadius: "8px" }}
                />
              </div>
              <p className="text-xs text-muted-foreground font-light">
                이 QR코드로 결제, 이벤트 입장, 포인트 적립이 가능합니다
              </p>
              <div className="flex gap-2 text-[10px] text-muted-foreground/50">
                <span className="px-2 py-0.5 bg-muted/50 rounded-full">쇼핑 결제</span>
                <span className="px-2 py-0.5 bg-muted/50 rounded-full">이벤트 입장</span>
                <span className="px-2 py-0.5 bg-muted/50 rounded-full">포인트 적립</span>
                <span className="px-2 py-0.5 bg-muted/50 rounded-full">외부 결제</span>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            {[
              { icon: Crown, label: "멤버십 센터", desc: "등급 혜택 및 업그레이드", path: "/membership" },
              { icon: Award, label: "LEVEL Status", desc: "LEVEL Grade & Training Records", path: "/rank" },
              { icon: Heart, label: "건강 진단 결과", desc: "체질 분석 및 건강 체크", path: "/diagnosis" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setLocation(item.path)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/30 hover:border-border/60 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary/70" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium">{item.label}</span>
                  <p className="text-[10px] text-muted-foreground font-light">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ Tab: Wallet ═══ */}
      {activeTab === "wallet" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "포인트", value: wallet?.pointBalance || 0, unit: "P", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "적립금", value: wallet?.cashBalance || 0, unit: "원", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "코인", value: wallet?.coinBalance || 0, unit: "C", icon: Coins, color: "text-blue-600", bg: "bg-blue-50" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-2xl bg-card border border-border/30 text-center">
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mx-auto mb-2`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <p className="text-[10px] text-muted-foreground mb-1">{item.label}</p>
                <p className="text-sm font-semibold">{item.value.toLocaleString()}<span className="text-[10px] text-muted-foreground ml-0.5">{item.unit}</span></p>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          <div>
            <p className="text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase mb-3">결제 수단</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: QrCode, label: "QR 결제", desc: "매장 결제", action: () => { setActiveTab("card"); setShowQR(true); } },
                { icon: CreditCard, label: "카드 결제", desc: "Stripe 연동", action: () => toast.info("카드 결제는 쇼핑 시 이용 가능합니다") },
                { icon: Coins, label: "코인 결제", desc: "암호화폐", action: () => toast.info("코인 결제 기능이 곧 출시됩니다") },
                { icon: Wallet, label: "적립금 충전", desc: "송금/충전", action: () => toast.info("적립금 충전 기능이 곧 출시됩니다") },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/30 hover:border-border/60 transition-all text-left"
                >
                  <item.icon className="w-5 h-5 text-primary/60 shrink-0" />
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground/60">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <p className="text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase mb-3">최근 거래 내역</p>
            {(walletTxQuery.data && walletTxQuery.data.length > 0) ? (
              <div className="space-y-2">
                {walletTxQuery.data.slice(0, 10).map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/20">
                    <div>
                      <p className="text-xs font-medium">{tx.description || tx.type}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("ko-KR")}</p>
                    </div>
                    <span className={`text-sm font-medium ${tx.amount > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground/40">
                <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">아직 거래 내역이 없습니다</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ Tab: Profile ═══ */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <Card className="shadow-sm border-border/30 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium font-resort">기본 건강 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">생년월일</Label>
                  <Input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    className="mt-1 text-sm rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">성별</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as any })}>
                    <SelectTrigger className="mt-1 text-sm rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">남성</SelectItem>
                      <SelectItem value="female">여성</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">키 (cm)</Label>
                  <Input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="170" className="mt-1 text-sm rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">체중 (kg)</Label>
                  <Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="65" className="mt-1 text-sm rounded-xl" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">혈액형</Label>
                <Select value={form.bloodType} onValueChange={(v) => setForm({ ...form, bloodType: v })}>
                  <SelectTrigger className="mt-1 text-sm rounded-xl"><SelectValue placeholder="선택" /></SelectTrigger>
                  <SelectContent>
                    {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bt => (
                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">병력 (쉼표로 구분)</Label>
                <Textarea value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} placeholder="고혈압, 당뇨 등" className="mt-1 text-sm min-h-[60px] rounded-xl" />
                <MediaInputToolbar
                  compact
                  className="mt-1"
                  onTextFromVoice={(text) => setForm(prev => ({ ...prev, medicalHistory: prev.medicalHistory ? prev.medicalHistory + ", " + text : text }))}
                  attachedMedia={[]}
                  onMediaAttached={() => {}}
                  onRemoveMedia={() => {}}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">알레르기 (쉼표로 구분)</Label>
                <Input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="꽃가루, 견과류 등" className="mt-1 text-sm rounded-xl" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">복용 약물 (쉼표로 구분)</Label>
                <Input value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} placeholder="혈압약, 비타민 등" className="mt-1 text-sm rounded-xl" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">비상 연락처</Label>
                <Input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="010-0000-0000" className="mt-1 text-sm rounded-xl" />
              </div>
              <Button
                onClick={handleSave}
                className="w-full gradient-resort text-white border-0 rounded-xl h-11"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? "저장 중..." : "프로필 저장"}
              </Button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/20 rounded-xl h-11"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </motion.div>
      )}
    </div>
  );
}
