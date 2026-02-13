import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { CheckCircle, Loader2, Save, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

// 시점: 20년전 삭제, 4개만
const timePeriods = [
  { value: "10years" as const, label: "10년 전" },
  { value: "5years" as const, label: "5년 전" },
  { value: "2years" as const, label: "2년 전" },
  { value: "current" as const, label: "현재" },
];

// 6색 동그라미 점 (빨강, 주황, 노랑, 연두, 진한녹색, 진한파랑)
const colorDots = [
  { value: 1, color: "#EF4444", label: "매우 심함" },
  { value: 2, color: "#F97316", label: "심함" },
  { value: 3, color: "#EAB308", label: "보통" },
  { value: 4, color: "#84CC16", label: "약간" },
  { value: 5, color: "#16A34A", label: "거의 없음" },
  { value: 6, color: "#2563EB", label: "전혀 없음" },
];

const checklistCategories = [
  {
    name: "소화기계 (위장/대장)",
    icon: "🫁",
    questions: [
      "속쓰림이나 위산 역류가 있었나요?",
      "소화 불량이나 더부룩함을 느꼈나요?",
      "변비나 설사가 잦았나요?",
      "복통이 자주 발생했나요?",
      "식후 가스가 많이 차나요?",
      "식욕이 불규칙했나요?",
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
      "가벼운 운동에도 쉽게 지쳤나요?",
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
      "손목이나 발목에 통증이 있었나요?",
      "무릎에 불편함을 느꼈나요?",
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
      "감정 기복이 심했나요?",
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
      "상처 회복이 느렸나요?",
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
      "체중 변화가 잦은 편인가요?",
    ],
  },
];

type AnswerMap = Record<string, number>;

export default function Diagnosis() {
  // answers: key = "catIdx-qIdx-periodValue", value = dot value (1-6)
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [activeCategory, setActiveCategory] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const { data: diagnostics } = trpc.diagnosis.getAll.useQuery(undefined, { retry: false });
  const saveDiagnosis = trpc.diagnosis.save.useMutation({
    onSuccess: () => {
      toast.success("건강 및 체질 체크가 저장되었습니다.");
      setIsSaved(true);
    },
    onError: () => toast.error("저장에 실패했습니다."),
  });

  const category = checklistCategories[activeCategory];

  // Count total and answered
  const totalCells = useMemo(() => {
    return checklistCategories.reduce((sum, c) => sum + c.questions.length * timePeriods.length, 0);
  }, []);
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalCells > 0 ? Math.round((answeredCount / totalCells) * 100) : 0;

  const handleDotClick = (catIdx: number, qIdx: number, periodValue: string, dotValue: number) => {
    const key = `${catIdx}-${qIdx}-${periodValue}`;
    setAnswers((prev) => {
      // Toggle off if same value clicked
      if (prev[key] === dotValue) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: dotValue };
    });
  };

  const handleSaveAll = () => {
    // Save each time period separately
    timePeriods.forEach((period) => {
      const periodAnswers: Record<string, number> = {};
      checklistCategories.forEach((cat, ci) => {
        cat.questions.forEach((_, qi) => {
          const key = `${ci}-${qi}-${period.value}`;
          if (answers[key]) {
            periodAnswers[`${ci}-${qi}`] = answers[key];
          }
        });
      });

      // Calculate scores
      const scores: Record<string, number> = {};
      checklistCategories.forEach((cat, ci) => {
        let total = 0;
        let count = 0;
        cat.questions.forEach((_, qi) => {
          const key = `${ci}-${qi}-${period.value}`;
          if (answers[key]) {
            total += answers[key];
            count++;
          }
        });
        if (count > 0) {
          scores[cat.name] = Math.round((total / count / 6) * 100);
        }
      });

      if (Object.keys(periodAnswers).length > 0) {
        saveDiagnosis.mutate({
          timePeriod: period.value,
          checklistData: periodAnswers,
          inflammationScore: scores["염증/면역"] || 50,
          cardiopulmonaryScore: scores["심폐 기능"] || 50,
          digestiveScore: scores["소화기계 (위장/대장)"] || 50,
          musculoskeletalScore: scores["근골격계"] || 50,
          mentalHealthScore: scores["정신 건강"] || 50,
          overallScore: Math.round(
            Object.values(scores).reduce((a, b) => a + b, 0) / Math.max(Object.values(scores).length, 1)
          ),
        });
      }
    });
  };

  const handleReset = () => {
    setAnswers({});
    setIsSaved(false);
    toast.info("체크리스트가 초기화되었습니다.");
  };

  // Saved complete screen
  if (isSaved) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
        </motion.div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
          체크 완료
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          건강 및 체질 체크리스트가 저장되었습니다.<br />
          대시보드에서 분석 결과를 확인하세요.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsSaved(false)}>
            <RotateCcw className="w-4 h-4 mr-2" /> 수정하기
          </Button>
          <Button className="gradient-warm text-white border-0" onClick={() => window.history.back()}>
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
          건강 및 체질 체크
        </h1>
        <p className="text-xs text-muted-foreground">
          각 질문에 대해 시점별로 해당하는 정도를 색상 점으로 선택하세요.
        </p>
      </div>

      {/* Color Legend */}
      <div className="bg-card rounded-xl border border-border/50 p-3 shadow-sm">
        <p className="text-[10px] text-muted-foreground mb-2 font-medium">색상 범례</p>
        <div className="flex items-center justify-between gap-1">
          {colorDots.map((dot) => (
            <div key={dot.value} className="flex flex-col items-center gap-1">
              <div
                className="w-5 h-5 rounded-full shadow-sm"
                style={{ backgroundColor: dot.color }}
              />
              <span className="text-[8px] text-muted-foreground whitespace-nowrap">{dot.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full gradient-warm rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{progressPercent}%</span>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {checklistCategories.map((cat, idx) => {
          // Count answers for this category
          const catAnswered = cat.questions.reduce((sum, _, qi) => {
            return sum + timePeriods.filter((p) => answers[`${idx}-${qi}-${p.value}`]).length;
          }, 0);
          const catTotal = cat.questions.length * timePeriods.length;
          const catComplete = catAnswered === catTotal;

          return (
            <button
              key={idx}
              onClick={() => setActiveCategory(idx)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                activeCategory === idx
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : catComplete
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <span>{cat.icon}</span>
              <span className="whitespace-nowrap">{cat.name.split(" (")[0]}</span>
              {catComplete && <CheckCircle className="w-3 h-3" />}
            </button>
          );
        })}
      </div>

      {/* Checklist Table */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-border/50 bg-accent/30">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span>{category.icon}</span> {category.name}
          </h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[10px] font-semibold text-muted-foreground p-3 min-w-[140px] bg-accent/20">
                  질문 항목
                </th>
                {timePeriods.map((period) => (
                  <th
                    key={period.value}
                    className="text-center text-[10px] font-semibold text-muted-foreground p-2 min-w-[80px] bg-accent/20"
                  >
                    {period.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {category.questions.map((question, qi) => (
                <tr key={qi} className="border-b border-border/30 last:border-0">
                  <td className="p-3 text-xs leading-relaxed text-foreground align-top">
                    <span className="text-muted-foreground mr-1">{qi + 1}.</span>
                    {question}
                  </td>
                  {timePeriods.map((period) => {
                    const key = `${activeCategory}-${qi}-${period.value}`;
                    const selectedValue = answers[key];
                    return (
                      <td key={period.value} className="p-2 align-middle">
                        <div className="flex flex-wrap justify-center gap-1">
                          {colorDots.map((dot) => (
                            <button
                              key={dot.value}
                              onClick={() => handleDotClick(activeCategory, qi, period.value, dot.value)}
                              className="relative group"
                              title={dot.label}
                            >
                              <div
                                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                                  selectedValue === dot.value
                                    ? "ring-2 ring-offset-1 ring-gray-400 scale-125"
                                    : "opacity-40 hover:opacity-80 hover:scale-110"
                                }`}
                                style={{ backgroundColor: dot.color }}
                              />
                            </button>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          disabled={activeCategory === 0}
          onClick={() => setActiveCategory((c) => c - 1)}
        >
          이전 카테고리
        </Button>
        {activeCategory < checklistCategories.length - 1 ? (
          <Button
            className="flex-1 gradient-warm text-white border-0"
            onClick={() => setActiveCategory((c) => c + 1)}
          >
            다음 카테고리
          </Button>
        ) : (
          <Button
            className="flex-1 gradient-warm text-white border-0"
            onClick={handleSaveAll}
            disabled={saveDiagnosis.isPending || answeredCount === 0}
          >
            {saveDiagnosis.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            저장하기
          </Button>
        )}
      </div>

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={handleReset}
          className="text-xs text-muted-foreground underline underline-offset-2"
        >
          체크리스트 초기화
        </button>
      </div>

      {/* Existing diagnostics summary */}
      {diagnostics && diagnostics.length > 0 && (
        <div className="space-y-2 mt-6">
          <h2 className="text-sm font-semibold">이전 체크 기록</h2>
          <div className="grid grid-cols-2 gap-2">
            {diagnostics.map((d: any) => (
              <div key={d.id} className="p-3 rounded-xl bg-accent/30 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <p className="text-xs font-medium">
                    {timePeriods.find((p) => p.value === d.timePeriod)?.label || d.timePeriod}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground">종합: {d.overallScore}/100</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
