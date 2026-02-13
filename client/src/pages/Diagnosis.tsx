import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useMemo, useCallback } from "react";
import { CheckCircle, Loader2, Save, RotateCcw, ChevronDown, ChevronUp, Mic, MicOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BodyMap, { BODY_PARTS } from "@/components/BodyMap";
import { MediaInputToolbar } from "@/components/MediaInputToolbar";

// 시점: 4개
const timePeriods = [
  { value: "10years" as const, label: "10년 전" },
  { value: "5years" as const, label: "5년 전" },
  { value: "2years" as const, label: "2년 전" },
  { value: "current" as const, label: "현재" },
];

// 6색 동그라미 점
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
type BodyPartNote = { partId: string; note: string; mediaUrls: string[] };

export default function Diagnosis() {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [activeCategory, setActiveCategory] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // 인체 이미지 관련 state
  const [selectedBodyParts, setSelectedBodyParts] = useState<Set<string>>(new Set());
  const [bodyPartNotes, setBodyPartNotes] = useState<Record<string, BodyPartNote>>({});
  const [expandedPart, setExpandedPart] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);

  const { data: diagnostics } = trpc.diagnosis.getAll.useQuery(undefined, { retry: false });
  const saveDiagnosis = trpc.diagnosis.save.useMutation({
    onSuccess: () => {
      toast.success("상세 건강/체질 체크가 저장되었습니다.");
      setIsSaved(true);
    },
    onError: () => toast.error("저장에 실패했습니다."),
  });

  const category = checklistCategories[activeCategory];

  const totalCells = useMemo(() => {
    return checklistCategories.reduce((sum, c) => sum + c.questions.length * timePeriods.length, 0);
  }, []);
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalCells > 0 ? Math.round((answeredCount / totalCells) * 100) : 0;

  const handleDotClick = (catIdx: number, qIdx: number, periodValue: string, dotValue: number) => {
    const key = `${catIdx}-${qIdx}-${periodValue}`;
    setAnswers((prev) => {
      if (prev[key] === dotValue) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: dotValue };
    });
  };

  // 인체 부위 클릭 핸들러
  const handleBodyPartClick = useCallback((partId: string) => {
    setSelectedBodyParts((prev) => {
      const next = new Set(prev);
      if (next.has(partId)) {
        next.delete(partId);
        // 노트도 제거
        setBodyPartNotes((notes) => {
          const updated = { ...notes };
          delete updated[partId];
          return updated;
        });
        if (expandedPart === partId) setExpandedPart(null);
      } else {
        next.add(partId);
        // 기본 노트 생성
        setBodyPartNotes((notes) => ({
          ...notes,
          [partId]: { partId, note: "", mediaUrls: [] },
        }));
        setExpandedPart(partId);
      }
      return next;
    });
  }, [expandedPart]);

  // 부위 노트 업데이트
  const updatePartNote = useCallback((partId: string, note: string) => {
    setBodyPartNotes((prev) => ({
      ...prev,
      [partId]: { ...prev[partId], partId, note, mediaUrls: prev[partId]?.mediaUrls || [] },
    }));
  }, []);

  // 미디어 URL 추가
  const addMediaToNote = useCallback((partId: string, url: string) => {
    setBodyPartNotes((prev) => ({
      ...prev,
      [partId]: {
        ...prev[partId],
        partId,
        note: prev[partId]?.note || "",
        mediaUrls: [...(prev[partId]?.mediaUrls || []), url],
      },
    }));
  }, []);

  // 음성 텍스트 추가
  const appendVoiceText = useCallback((partId: string, text: string) => {
    setBodyPartNotes((prev) => ({
      ...prev,
      [partId]: {
        ...prev[partId],
        partId,
        note: (prev[partId]?.note || "") + (prev[partId]?.note ? " " : "") + text,
        mediaUrls: prev[partId]?.mediaUrls || [],
      },
    }));
  }, []);

  const handleSaveAll = () => {
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
    setSelectedBodyParts(new Set());
    setBodyPartNotes({});
    setExpandedPart(null);
    setIsSaved(false);
    toast.info("체크리스트가 초기화되었습니다.");
  };

  // 선택된 부위 목록 (정렬)
  const selectedPartsList = useMemo(() => {
    return BODY_PARTS.filter((p) => selectedBodyParts.has(p.id));
  }, [selectedBodyParts]);

  // 저장 완료 화면
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
          상세 건강/체질 체크리스트가 저장되었습니다.<br />
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
    <div className="space-y-5 pb-24">
      {/* ===== SECTION 1: 인체 이미지 통증 부위 선택 ===== */}
      <div>
        <h1 className="text-lg font-bold mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>
          상세 건강/체질 체크 리스트
        </h1>
        <p className="text-xs text-muted-foreground">
          먼저 아프거나 이상이 있는 부위를 인체 이미지에서 선택한 후, 아래 체크리스트를 작성하세요.
        </p>
      </div>

      {/* 인체 이미지 카드 */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-border/50 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            🏥 통증/이상 부위 선택
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            인체 이미지에서 아픈 부위를 터치하세요 (전면/후면 모두 확인)
          </p>
        </div>
        <div className="p-3">
          <BodyMap selectedParts={selectedBodyParts} onPartClick={handleBodyPartClick} />
        </div>
      </div>

      {/* 선택된 부위 상세 입력 */}
      <AnimatePresence>
        {selectedPartsList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              📋 선택된 부위 상세 기록
              <span className="text-xs font-normal text-muted-foreground">
                ({selectedPartsList.length}개 부위)
              </span>
            </h3>

            {selectedPartsList.map((part) => {
              const isExpanded = expandedPart === part.id;
              const note = bodyPartNotes[part.id];

              return (
                <motion.div
                  key={part.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card rounded-xl border border-red-200/50 shadow-sm overflow-hidden"
                >
                  {/* 부위 헤더 */}
                  <button
                    onClick={() => setExpandedPart(isExpanded ? null : part.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm font-medium">{part.label}</span>
                      <span className="text-[10px] text-muted-foreground">({part.labelEn})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {note?.note && (
                        <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                          기록됨
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* 상세 입력 영역 */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-2 border-t border-border/30">
                          <div className="pt-2">
                            <label className="text-[10px] text-muted-foreground font-medium mb-1 block">
                              증상 및 사유를 기재해 주세요 (음성 입력 가능)
                            </label>
                            <textarea
                              value={note?.note || ""}
                              onChange={(e) => updatePartNote(part.id, e.target.value)}
                              placeholder={`${part.label} 부위의 증상, 통증 정도, 발생 시기 등을 자세히 적어주세요...`}
                              className="w-full min-h-[80px] p-2.5 text-xs rounded-lg border border-border/50 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                            <MediaInputToolbar
                              onTextFromVoice={(text: string) => appendVoiceText(part.id, text)}
                              onMediaAttached={(files) => {
                                files.forEach((f) => addMediaToNote(part.id, f.url));
                              }}
                              compact
                            />
                          </div>

                          {/* 첨부된 미디어 미리보기 */}
                          {note?.mediaUrls && note.mediaUrls.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {note.mediaUrls.map((url, idx) => (
                                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border/50">
                                  {url.match(/\.(mp4|webm|mov)/i) ? (
                                    <video src={url} className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                  )}
                                  <button
                                    onClick={() => {
                                      setBodyPartNotes((prev) => ({
                                        ...prev,
                                        [part.id]: {
                                          ...prev[part.id],
                                          mediaUrls: prev[part.id].mediaUrls.filter((_, i) => i !== idx),
                                        },
                                      }));
                                    }}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"
                                  >
                                    <X className="w-2.5 h-2.5 text-white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 부위 제거 버튼 */}
                          <button
                            onClick={() => handleBodyPartClick(part.id)}
                            className="text-[10px] text-red-500 hover:text-red-600 underline underline-offset-2"
                          >
                            이 부위 선택 해제
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 구분선 ===== */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <button
            onClick={() => setShowChecklist(!showChecklist)}
            className="px-4 py-1.5 bg-card border border-border/50 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            {showChecklist ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            상세 체크리스트 {showChecklist ? "접기" : "펼치기"}
          </button>
        </div>
      </div>

      {/* ===== SECTION 2: 기존 체크리스트 ===== */}
      <AnimatePresence>
        {showChecklist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
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
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 저장/초기화 버튼 ===== */}
      <div className="space-y-3 pt-2">
        <Button
          className="w-full gradient-warm text-white border-0 h-12 text-sm font-bold"
          onClick={handleSaveAll}
          disabled={saveDiagnosis.isPending || (answeredCount === 0 && selectedBodyParts.size === 0)}
        >
          {saveDiagnosis.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          전체 저장하기
        </Button>

        <div className="text-center">
          <button
            onClick={handleReset}
            className="text-xs text-muted-foreground underline underline-offset-2"
          >
            전체 초기화
          </button>
        </div>
      </div>

      {/* 이전 체크 기록 */}
      {diagnostics && diagnostics.length > 0 && (
        <div className="space-y-2 mt-6">
          <h2 className="text-sm font-semibold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            이전 체크 기록
          </h2>
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
