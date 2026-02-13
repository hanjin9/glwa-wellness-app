import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useState } from "react";
import { Stethoscope, ChevronRight, ChevronLeft, CheckCircle, Loader2 } from "lucide-react";

const timePeriods = [
  { value: "20years" as const, label: "20년 전", desc: "장기 건강 이력" },
  { value: "10years" as const, label: "10년 전", desc: "중기 건강 변화" },
  { value: "5years" as const, label: "5년 전", desc: "근기 건강 상태" },
  { value: "3years" as const, label: "3년 전", desc: "최근 건강 추이" },
  { value: "current" as const, label: "현재", desc: "현재 건강 상태" },
];

const checklistCategories = [
  {
    name: "소화기계 (위장/대장)",
    icon: "🫁",
    questions: [
      "속쓰림이나 위산 역류가 자주 있었나요?",
      "소화 불량이나 더부룩함을 자주 느꼈나요?",
      "변비나 설사가 잦았나요?",
      "복통이 자주 발생했나요?",
    ],
  },
  {
    name: "심폐 기능",
    icon: "❤️",
    questions: [
      "계단을 오를 때 숨이 쉽게 찼나요?",
      "가슴 통증이나 두근거림이 있었나요?",
      "호흡이 얕거나 불규칙했나요?",
      "만성 기침이 있었나요?",
    ],
  },
  {
    name: "근골격계",
    icon: "🦴",
    questions: [
      "허리 통증이 자주 있었나요?",
      "관절 통증이나 뻣뻣함이 있었나요?",
      "목이나 어깨가 자주 뭉쳤나요?",
      "자세가 바르지 않다는 지적을 받았나요?",
    ],
  },
  {
    name: "정신 건강",
    icon: "🧠",
    questions: [
      "스트레스를 많이 받았나요?",
      "수면의 질이 좋지 않았나요?",
      "불안감이나 우울감을 느꼈나요?",
      "집중력 저하를 경험했나요?",
    ],
  },
  {
    name: "염증/면역",
    icon: "🛡️",
    questions: [
      "감기에 자주 걸렸나요?",
      "피부 트러블이 잦았나요?",
      "만성 피로를 느꼈나요?",
      "알레르기 증상이 있었나요?",
    ],
  },
  {
    name: "체질 분석 (동양의학)",
    icon: "☯️",
    questions: [
      "추위를 잘 타는 편인가요? (한체질)",
      "더위를 잘 타는 편인가요? (열체질)",
      "땀을 많이 흘리는 편인가요?",
      "손발이 자주 차가운가요?",
      "음식을 빨리 먹는 편인가요?",
      "스트레스 시 소화가 안 되나요?",
    ],
  },
];

export default function Diagnosis() {
  const [selectedPeriod, setSelectedPeriod] = useState<typeof timePeriods[number] | null>(null);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);

  const { data: diagnostics } = trpc.diagnosis.getAll.useQuery(undefined, { retry: false });
  const saveDiagnosis = trpc.diagnosis.save.useMutation({
    onSuccess: () => {
      toast.success("건강 진단이 저장되었습니다.");
      setIsComplete(true);
    },
    onError: () => toast.error("저장에 실패했습니다."),
  });

  const handleAnswer = (questionKey: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
  };

  const category = checklistCategories[currentCategory];
  const totalQuestions = checklistCategories.reduce((sum, c) => sum + c.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  const handleSubmit = () => {
    if (!selectedPeriod) return;
    const scores: Record<string, number> = {};
    checklistCategories.forEach((cat, ci) => {
      let total = 0;
      cat.questions.forEach((_, qi) => {
        total += answers[`${ci}-${qi}`] || 0;
      });
      const avg = Math.round((total / cat.questions.length) * 25);
      scores[cat.name] = avg;
    });

    saveDiagnosis.mutate({
      timePeriod: selectedPeriod.value,
      checklistData: answers,
      inflammationScore: scores["염증/면역"] || 50,
      cardiopulmonaryScore: scores["심폐 기능"] || 50,
      digestiveScore: scores["소화기계 (위장/대장)"] || 50,
      musculoskeletalScore: scores["근골격계"] || 50,
      mentalHealthScore: scores["정신 건강"] || 50,
      overallScore: Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length),
    });
  };

  // Period selection
  if (!selectedPeriod) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-bold mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            건강 진단
          </h1>
          <p className="text-xs text-muted-foreground">시점별 건강 상태를 진단합니다.</p>
        </div>

        {/* Existing diagnostics */}
        {diagnostics && diagnostics.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">완료된 진단</h2>
            {diagnostics.map((d: any) => (
              <Card key={d.id} className="shadow-sm border-border/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {timePeriods.find(p => p.value === d.timePeriod)?.label || d.timePeriod}
                    </p>
                    <p className="text-xs text-muted-foreground">종합 점수: {d.overallScore}/100</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">시점 선택</h2>
          {timePeriods.map((period) => {
            const done = diagnostics?.some((d: any) => d.timePeriod === period.value);
            return (
              <button
                key={period.value}
                onClick={() => { setSelectedPeriod(period); setAnswers({}); setCurrentCategory(0); setIsComplete(false); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-sm text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{period.label}</p>
                  <p className="text-xs text-muted-foreground">{period.desc}</p>
                </div>
                {done && <CheckCircle className="w-4 h-4 text-green-500" />}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Complete
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-lg font-bold mb-2">진단 완료</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {selectedPeriod.label} 시점의 건강 진단이 완료되었습니다.
        </p>
        <Button onClick={() => setSelectedPeriod(null)} className="gradient-warm text-white border-0">
          다른 시점 진단하기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setSelectedPeriod(null)} className="text-sm text-muted-foreground flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> 돌아가기
        </button>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
          {selectedPeriod.label}
        </span>
      </div>

      <Progress value={progressPercent} className="h-2" />
      <p className="text-[10px] text-muted-foreground text-center">{answeredCount}/{totalQuestions} 문항 완료</p>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span>{category.icon}</span> {category.name}
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">{currentCategory + 1}/{checklistCategories.length} 카테고리</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {category.questions.map((q, qi) => {
            const key = `${currentCategory}-${qi}`;
            return (
              <div key={qi} className="space-y-2">
                <p className="text-xs font-medium">{q}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((v) => (
                    <button
                      key={v}
                      onClick={() => handleAnswer(key, v)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        answers[key] === v
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {v === 1 ? "전혀" : v === 2 ? "가끔" : v === 3 ? "자주" : "항상"}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          disabled={currentCategory === 0}
          onClick={() => setCurrentCategory((c) => c - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> 이전
        </Button>
        {currentCategory < checklistCategories.length - 1 ? (
          <Button
            className="flex-1 gradient-warm text-white border-0"
            onClick={() => setCurrentCategory((c) => c + 1)}
          >
            다음 <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            className="flex-1 gradient-warm text-white border-0"
            onClick={handleSubmit}
            disabled={saveDiagnosis.isPending}
          >
            {saveDiagnosis.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            진단 완료
          </Button>
        )}
      </div>
    </div>
  );
}
