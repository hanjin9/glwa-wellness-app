import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Plus, History, Heart, Weight, Moon, Flame, Brain, Utensils, Cookie } from "lucide-react";

// 식사 시간대 (6시~22시)
const mealHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

// 수면 시간 (4~10시간)
const sleepOptions = [4, 5, 6, 7, 8, 9, 10];

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
    stressLevel: "5",
    painLevel: "0",
    painLocation: "",
    mood: "neutral" as "great" | "good" | "neutral" | "bad" | "terrible",
    notes: "",
  });

  // 식사 시간대 다중 선택 (최대 5번 클릭 가능)
  const [mealTimes, setMealTimes] = useState<number[]>([]);
  // 간식 시간대 다중 선택
  const [snackTimes, setSnackTimes] = useState<number[]>([]);

  const toggleMealTime = (hour: number) => {
    setMealTimes((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour]
    );
  };

  const toggleSnackTime = (hour: number) => {
    setSnackTimes((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour]
    );
  };

  const handleSave = () => {
    // 식사 정보를 notes에 포함
    const mealInfo = mealTimes.length > 0
      ? `식사: ${mealTimes.sort((a, b) => a - b).map(h => `${h}시`).join(", ")}`
      : "";
    const snackInfo = snackTimes.length > 0
      ? `간식: ${snackTimes.sort((a, b) => a - b).map(h => `${h}시`).join(", ")}`
      : "";
    const fullNotes = [form.notes, mealInfo, snackInfo].filter(Boolean).join(" | ");

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
      stressLevel: parseInt(form.stressLevel),
      painLevel: parseInt(form.painLevel),
      painLocation: form.painLocation || undefined,
      mood: form.mood,
      notes: fullNotes || undefined,
    });
  };

  const moodEmoji: Record<string, string> = {
    great: "😄", good: "🙂", neutral: "😐", bad: "😟", terrible: "😢",
  };

  const formatHour = (h: number) => {
    if (h < 12) return `${h}시`;
    if (h === 12) return "12시";
    return `${h}시`;
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

          {/* Activity - 운동 + 수면 */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> 활동
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {/* 수면 시간 - 점 클릭 방식 */}
              <div>
                <Label className="text-[10px] flex items-center gap-1.5 mb-2">
                  <Moon className="w-3 h-3 text-indigo-400" /> 수면 시간
                </Label>
                <div className="flex items-center gap-1">
                  {sleepOptions.map((h) => (
                    <button
                      key={h}
                      onClick={() => setForm({ ...form, sleepHours: h.toString() })}
                      className="flex flex-col items-center gap-1 flex-1"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
                          form.sleepHours === h.toString()
                            ? "bg-indigo-500 text-white ring-2 ring-indigo-300 ring-offset-1 scale-110"
                            : "bg-secondary text-muted-foreground hover:bg-indigo-100"
                        }`}
                      >
                        {h}
                      </div>
                      <span className="text-[8px] text-muted-foreground">시간</span>
                    </button>
                  ))}
                </div>
                {form.sleepHours && (
                  <p className="text-center text-xs text-indigo-600 font-medium mt-1">
                    {form.sleepHours}시간 수면
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 식사 - 시간대 클릭 + 간식 */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-600" /> 식사 (시간대 / 횟수)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 식사 시간대 */}
              <div>
                <Label className="text-[10px] mb-2 block">식사 시간 (클릭하여 선택, 복수 선택 가능)</Label>
                <div className="flex flex-wrap gap-1">
                  {mealHours.map((h) => (
                    <button
                      key={h}
                      onClick={() => toggleMealTime(h)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-medium transition-all duration-200 ${
                        mealTimes.includes(h)
                          ? "bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-1 scale-105"
                          : "bg-secondary text-muted-foreground hover:bg-amber-100"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                {mealTimes.length > 0 && (
                  <p className="text-xs text-amber-700 font-medium mt-2">
                    식사 {mealTimes.length}회: {mealTimes.sort((a, b) => a - b).map(h => formatHour(h)).join(", ")}
                  </p>
                )}
              </div>

              {/* 간식 시간대 */}
              <div>
                <Label className="text-[10px] mb-2 flex items-center gap-1.5">
                  <Cookie className="w-3 h-3 text-pink-400" /> 간식 시간 (클릭하여 선택)
                </Label>
                <div className="flex flex-wrap gap-1">
                  {mealHours.map((h) => (
                    <button
                      key={h}
                      onClick={() => toggleSnackTime(h)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-medium transition-all duration-200 ${
                        snackTimes.includes(h)
                          ? "bg-pink-400 text-white ring-2 ring-pink-300 ring-offset-1 scale-105"
                          : "bg-secondary text-muted-foreground hover:bg-pink-50"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                {snackTimes.length > 0 && (
                  <p className="text-xs text-pink-600 font-medium mt-2">
                    간식 {snackTimes.length}회: {snackTimes.sort((a, b) => a - b).map(h => formatHour(h)).join(", ")}
                  </p>
                )}
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
              {/* 스트레스 - 무지개 그라데이션 점 클릭 */}
              <div>
                <Label className="text-[10px] mb-2 block">스트레스 정도 ({form.stressLevel}/10)</Label>
                <div className="relative mt-2">
                  <div
                    className="h-3 rounded-full w-full"
                    style={{
                      background: 'linear-gradient(to right, #FEFCBF, #FDE68A, #BEF264, #4ADE80, #166534, #92400E, #78350F, #60A5FA, #3B82F6, #FB923C, #EF4444)',
                    }}
                  />
                  <div className="absolute top-0 left-0 w-full" style={{ height: '12px' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                      const isActive = form.stressLevel === level.toString();
                      const position = (level / 10) * 100;
                      return (
                        <button
                          key={level}
                          type="button"
                          className="absolute"
                          style={{ left: `${position}%`, transform: 'translateX(-50%)', top: '-2px' }}
                          onClick={() => setForm({...form, stressLevel: level.toString()})}
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
                  <div className="mt-4 relative" style={{ height: '14px' }}>
                    {[0, 2, 4, 6, 8, 10].map((level) => {
                      const position = (level / 10) * 100;
                      return (
                        <span key={level} className="text-[8px] text-muted-foreground absolute" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
                          {level}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between text-[8px] text-muted-foreground">
                  <span>편안 ✨</span>
                  <span>보통</span>
                  <span>높음 🔥</span>
                </div>
              </div>

              {/* 통증 - 무지개 그라데이션 점 클릭 */}
              <div>
                <Label className="text-[10px] mb-2 block">통증 정도 ({form.painLevel}/10)</Label>
                <div className="relative mt-2">
                  <div
                    className="h-3 rounded-full w-full"
                    style={{
                      background: 'linear-gradient(to right, #FEFCBF, #FDE68A, #BEF264, #4ADE80, #166534, #92400E, #78350F, #60A5FA, #3B82F6, #FB923C, #EF4444)',
                    }}
                  />
                  <div className="absolute top-0 left-0 w-full" style={{ height: '12px' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                      const isActive = form.painLevel === level.toString();
                      const position = (level / 10) * 100;
                      return (
                        <button
                          key={level}
                          type="button"
                          className="absolute"
                          style={{ left: `${position}%`, transform: 'translateX(-50%)', top: '-2px' }}
                          onClick={() => setForm({...form, painLevel: level.toString()})}
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
                  <div className="mt-4 relative" style={{ height: '14px' }}>
                    {[0, 2, 4, 6, 8, 10].map((level) => {
                      const position = (level / 10) * 100;
                      return (
                        <span key={level} className="text-[8px] text-muted-foreground absolute" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
                          {level}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between text-[8px] text-muted-foreground">
                  <span>없음 😊</span>
                  <span>중간</span>
                  <span>심함 😖</span>
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
                    </div>
                    {r.notes && (
                      <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/30 pt-2">{r.notes}</p>
                    )}
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
