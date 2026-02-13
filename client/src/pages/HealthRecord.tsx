import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Plus, History, Heart, Droplets, Weight, Moon, Flame, Brain } from "lucide-react";

export default function HealthRecord() {
  const utils = trpc.useUtils();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(today);

  const { data: records } = trpc.health.getRecent.useQuery({ limit: 30 }, { retry: false });
  const addRecord = trpc.health.create.useMutation({
    onSuccess: () => {
      toast.success("건강 기록이 저장되었습니다.");
      utils.health.getRecent.invalidate();
      utils.health.getToday.invalidate();
    },
    onError: () => toast.error("저장에 실패했습니다."),
  });

  const [form, setForm] = useState({
    systolicBP: "",
    diastolicBP: "",
    heartRate: "",
    bloodSugar: "",
    weight: "",
    bodyFat: "",
    exerciseMinutes: "",
    exerciseType: "",
    sleepHours: "",
    sleepQuality: "3",
    waterIntake: "",
    stressLevel: "5",
    painLevel: "0",
    painLocation: "",
    mood: "neutral" as "great" | "good" | "neutral" | "bad" | "terrible",
    notes: "",
  });

  const handleSave = () => {
    addRecord.mutate({
      recordDate: date,
      systolicBP: form.systolicBP ? parseInt(form.systolicBP) : undefined,
      diastolicBP: form.diastolicBP ? parseInt(form.diastolicBP) : undefined,
      heartRate: form.heartRate ? parseInt(form.heartRate) : undefined,
      bloodSugar: form.bloodSugar ? parseFloat(form.bloodSugar) : undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
      exerciseMinutes: form.exerciseMinutes ? parseInt(form.exerciseMinutes) : undefined,
      exerciseType: form.exerciseType || undefined,
      sleepHours: form.sleepHours ? parseFloat(form.sleepHours) : undefined,
      sleepQuality: parseInt(form.sleepQuality),
      waterIntake: form.waterIntake ? parseFloat(form.waterIntake) : undefined,
      stressLevel: parseInt(form.stressLevel),
      painLevel: parseInt(form.painLevel),
      painLocation: form.painLocation || undefined,
      mood: form.mood,
      notes: form.notes || undefined,
    });
  };

  const moodEmoji: Record<string, string> = {
    great: "😄", good: "🙂", neutral: "😐", bad: "😟", terrible: "😢",
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
        건강 기록
      </h1>

      <Tabs defaultValue="record">
        <TabsList className="w-full">
          <TabsTrigger value="record" className="flex-1 text-xs">
            <Plus className="w-3 h-3 mr-1" /> 기록하기
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 text-xs">
            <History className="w-3 h-3 mr-1" /> 히스토리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-4 mt-4">
          <div>
            <Label className="text-xs">기록 날짜</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 text-sm" />
          </div>

          {/* Vital Signs */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" /> 활력 징후
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px]">수축기 혈압</Label>
                  <Input type="number" value={form.systolicBP} onChange={(e) => setForm({...form, systolicBP: e.target.value})} placeholder="120" className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-[10px]">이완기 혈압</Label>
                  <Input type="number" value={form.diastolicBP} onChange={(e) => setForm({...form, diastolicBP: e.target.value})} placeholder="80" className="mt-1 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px]">심박수 (bpm)</Label>
                  <Input type="number" value={form.heartRate} onChange={(e) => setForm({...form, heartRate: e.target.value})} placeholder="72" className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-[10px]">혈당 (mg/dL)</Label>
                  <Input type="number" value={form.bloodSugar} onChange={(e) => setForm({...form, bloodSugar: e.target.value})} placeholder="100" className="mt-1 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Body */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Weight className="w-4 h-4 text-green-600" /> 신체 지표
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px]">체중 (kg)</Label>
                  <Input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} placeholder="65.0" className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-[10px]">체지방률 (%)</Label>
                  <Input type="number" step="0.1" value={form.bodyFat} onChange={(e) => setForm({...form, bodyFat: e.target.value})} placeholder="20.0" className="mt-1 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> 활동
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px]">운동 시간 (분)</Label>
                  <Input type="number" value={form.exerciseMinutes} onChange={(e) => setForm({...form, exerciseMinutes: e.target.value})} placeholder="30" className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-[10px]">운동 종류</Label>
                  <Input value={form.exerciseType} onChange={(e) => setForm({...form, exerciseType: e.target.value})} placeholder="걷기, 요가 등" className="mt-1 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px]">수면 시간</Label>
                  <Input type="number" step="0.5" value={form.sleepHours} onChange={(e) => setForm({...form, sleepHours: e.target.value})} placeholder="7.5" className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-[10px]">수분 섭취 (L)</Label>
                  <Input type="number" step="0.1" value={form.waterIntake} onChange={(e) => setForm({...form, waterIntake: e.target.value})} placeholder="2.0" className="mt-1 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wellness */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-500" /> 웰니스
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-[10px]">기분</Label>
                <div className="flex gap-2 mt-1">
                  {(["great", "good", "neutral", "bad", "terrible"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setForm({...form, mood: m})}
                      className={`flex-1 py-2 rounded-lg text-center text-lg transition-all ${form.mood === m ? "bg-primary/10 ring-2 ring-primary" : "bg-secondary"}`}
                    >
                      {moodEmoji[m]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px]">스트레스 (1-10)</Label>
                  <Input type="range" min="1" max="10" value={form.stressLevel} onChange={(e) => setForm({...form, stressLevel: e.target.value})} className="mt-1" />
                  <p className="text-center text-xs text-muted-foreground">{form.stressLevel}/10</p>
                </div>
                <div>
                  <Label className="text-[10px]">통증 (0-10)</Label>
                  <Input type="range" min="0" max="10" value={form.painLevel} onChange={(e) => setForm({...form, painLevel: e.target.value})} className="mt-1" />
                  <p className="text-center text-xs text-muted-foreground">{form.painLevel}/10</p>
                </div>
              </div>
              {parseInt(form.painLevel) > 0 && (
                <div>
                  <Label className="text-[10px]">통증 부위</Label>
                  <Input value={form.painLocation} onChange={(e) => setForm({...form, painLocation: e.target.value})} placeholder="허리, 무릎 등" className="mt-1 text-sm" />
                </div>
              )}
              <div>
                <Label className="text-[10px]">메모</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="오늘의 건강 상태 메모..." className="mt-1 text-sm min-h-[60px]" />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full gradient-warm text-white border-0" disabled={addRecord.isPending}>
            {addRecord.isPending ? "저장 중..." : "건강 기록 저장"}
          </Button>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="space-y-3">
            {records && records.length > 0 ? (
              records.map((r: any) => (
                <Card key={r.id} className="shadow-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{r.recordDate}</span>
                      <span className="text-lg">{moodEmoji[r.mood || "neutral"]}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {r.systolicBP && <div><span className="text-muted-foreground">혈압</span> <span className="font-medium">{r.systolicBP}/{r.diastolicBP}</span></div>}
                      {r.bloodSugar && <div><span className="text-muted-foreground">혈당</span> <span className="font-medium">{r.bloodSugar}</span></div>}
                      {r.weight && <div><span className="text-muted-foreground">체중</span> <span className="font-medium">{r.weight}kg</span></div>}
                      {r.sleepHours && <div><span className="text-muted-foreground">수면</span> <span className="font-medium">{r.sleepHours}h</span></div>}
                      {r.exerciseMinutes && <div><span className="text-muted-foreground">운동</span> <span className="font-medium">{r.exerciseMinutes}분</span></div>}
                      {r.waterIntake && <div><span className="text-muted-foreground">수분</span> <span className="font-medium">{r.waterIntake}L</span></div>}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">아직 건강 기록이 없습니다.</p>
                <p className="text-xs mt-1">첫 번째 건강 기록을 시작해보세요.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
