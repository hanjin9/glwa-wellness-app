import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { User, Heart, Shield, Award, ChevronRight, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = trpc.profile.get.useQuery(undefined, { retry: false });
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("프로필이 저장되었습니다.");
      utils.profile.get.invalidate();
    },
    onError: () => toast.error("저장에 실패했습니다."),
  });
  const utils = trpc.useUtils();

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

  const gradeInfo: Record<string, { label: string; color: string }> = {
    free: { label: "평회원", color: "bg-secondary text-secondary-foreground" },
    standard: { label: "정회원", color: "gradient-warm text-white" },
    vip: { label: "VIP", color: "gradient-gold text-white" },
    platinum: { label: "플래티넘", color: "gradient-warm text-white" },
  };

  const grade = gradeInfo[profile?.memberGrade || "free"] || gradeInfo.free;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center shadow-lg">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{user?.name || "회원"}</h1>
          <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
          <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${grade.color}`}>
            {grade.label}
          </span>
        </div>
      </div>

      {/* Quick Menu */}
      <div className="space-y-2">
        {[
          { icon: Heart, label: "건강 진단 결과", path: "/diagnosis" },
          { icon: Award, label: "승급 현황", path: "/rank" },
          { icon: Shield, label: "회원 등급 관리", path: "/dashboard" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setLocation(item.path)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm"
          >
            <item.icon className="w-5 h-5 text-primary" />
            <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Profile Form */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-bold">기본 건강 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">생년월일</Label>
              <Input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">성별</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as any })}>
                <SelectTrigger className="mt-1 text-sm">
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
              <Label className="text-xs">키 (cm)</Label>
              <Input
                type="number"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                placeholder="170"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">체중 (kg)</Label>
              <Input
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="65"
                className="mt-1 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">혈액형</Label>
            <Select value={form.bloodType} onValueChange={(v) => setForm({ ...form, bloodType: v })}>
              <SelectTrigger className="mt-1 text-sm">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">병력 (쉼표로 구분)</Label>
            <Textarea
              value={form.medicalHistory}
              onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
              placeholder="고혈압, 당뇨 등"
              className="mt-1 text-sm min-h-[60px]"
            />
          </div>
          <div>
            <Label className="text-xs">알레르기 (쉼표로 구분)</Label>
            <Input
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              placeholder="꽃가루, 견과류 등"
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">복용 약물 (쉼표로 구분)</Label>
            <Input
              value={form.medications}
              onChange={(e) => setForm({ ...form, medications: e.target.value })}
              placeholder="혈압약, 비타민 등"
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">비상 연락처</Label>
            <Input
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              placeholder="010-0000-0000"
              className="mt-1 text-sm"
            />
          </div>
          <Button
            onClick={handleSave}
            className="w-full gradient-warm text-white border-0"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "저장 중..." : "프로필 저장"}
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full text-destructive border-destructive/30"
        onClick={logout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        로그아웃
      </Button>
    </div>
  );
}
