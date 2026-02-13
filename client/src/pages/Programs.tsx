import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, CheckCircle, Play, ChevronRight } from "lucide-react";
import { useState } from "react";

const stages = [
  {
    id: "breathing_awareness" as const,
    step: 1,
    name: "숨과 알아차림",
    subtitle: "호흡을 통한 몸과 마음의 인지",
    emoji: "🌬️",
    color: "from-sky-400 to-sky-600",
    description: "올바른 호흡은 건강의 시작입니다. 자신의 호흡을 알아차리고, 복식호흡과 4-7-8 호흡법을 배워 일상에 적용합니다.",
    lessons: [
      "호흡 알아차림 훈련",
      "복식호흡 기초",
      "4-7-8 호흡법",
      "호흡과 자율신경 연결",
      "일상 호흡 습관화",
    ],
  },
  {
    id: "rest_peace" as const,
    step: 2,
    name: "숨과 진정한 쉼/정",
    subtitle: "호흡을 통한 깊은 이완과 고요",
    emoji: "🕊️",
    color: "from-indigo-400 to-indigo-600",
    description: "호흡과 함께 몸과 마음을 진정으로 쉬게 하고, 고요함(정)의 상태를 경험합니다.",
    lessons: [
      "이완 호흡법",
      "바디스캔 이완",
      "마음의 고요 찾기",
      "정(靜)의 수련",
      "일상 속 쉼의 기술",
    ],
  },
  {
    id: "good_sleep" as const,
    step: 3,
    name: "좋은 잠",
    subtitle: "양질의 수면으로 회복력 극대화",
    emoji: "🌙",
    color: "from-violet-400 to-violet-600",
    description: "수면의 질을 높여 신체와 정신의 회복력을 극대화합니다. 수면 위생과 환경 최적화를 배웁니다.",
    lessons: [
      "수면 위생 기초",
      "수면 환경 최적화",
      "수면 리듬 조절",
      "숙면을 위한 이완법",
      "디지털 디톡스와 수면",
    ],
  },
  {
    id: "stretching_yoga" as const,
    step: 4,
    name: "스트레칭/요가",
    subtitle: "유연성과 균형 강화",
    emoji: "🧘",
    color: "from-emerald-400 to-emerald-600",
    description: "스트레칭과 요가로 유연성을 높이고 근골격계를 강화하며 몸의 균형을 잡습니다.",
    lessons: [
      "기초 스트레칭 루틴",
      "목/어깨 이완",
      "허리/골반 스트레칭",
      "하체 유연성 강화",
      "요가 기초 동작",
    ],
  },
  {
    id: "meditation" as const,
    step: 5,
    name: "명상 (감사, 균형, 절제)",
    subtitle: "마음 수양을 통한 내면의 성장",
    emoji: "☯️",
    color: "from-amber-400 to-amber-600",
    description: "감사, 균형, 절제를 주제로 한 명상 수련을 통해 내면의 평화와 성장을 이룹니다.",
    lessons: [
      "마음챙김 명상 기초",
      "감사 명상",
      "균형의 명상",
      "절제의 명상",
      "통합 명상 수련",
    ],
  },
  {
    id: "posture_walking" as const,
    step: 6,
    name: "좋은 자세/건강 걸음 자세",
    subtitle: "바른 자세와 건강한 보행",
    emoji: "🚶",
    color: "from-teal-400 to-teal-600",
    description: "바른 자세는 근골격계 건강과 중력 관리의 핵심입니다. 앉기, 서기, 걷기를 교정합니다.",
    lessons: [
      "바른 앉기 자세",
      "서기와 중력 균형",
      "올바른 걷기 자세",
      "발바닥과 중력 관리",
      "일상 자세 교정 습관",
    ],
  },
  {
    id: "exercise_social" as const,
    step: 7,
    name: "운동/취미/교류 생활",
    subtitle: "활동적인 삶과 사회적 교류",
    emoji: "🏃",
    color: "from-orange-400 to-orange-600",
    description: "규칙적인 운동, 취미 활동, 사회적 교류를 통해 활력 있는 삶을 만들어갑니다.",
    lessons: [
      "나에게 맞는 운동 찾기",
      "주 3회 운동 습관화",
      "취미 활동과 건강",
      "사회적 교류의 힘",
      "활동적 라이프스타일 완성",
    ],
  },
  {
    id: "food_therapy" as const,
    step: 8,
    name: "식치 (염증 관리)",
    subtitle: "음식으로 다스리는 건강",
    emoji: "🍃",
    color: "from-lime-500 to-green-600",
    description: "동양의학의 식치(食治) 원리에 따라 염증을 관리하고, 체질에 맞는 식이요법을 실천합니다.",
    lessons: [
      "식치의 기본 원리",
      "염증 유발 식품 이해",
      "항염증 식단 구성",
      "체질별 맞춤 식이",
      "식치 생활 습관화",
    ],
  },
  {
    id: "hormone_bone" as const,
    step: 9,
    name: "호르몬/골·관절 케어",
    subtitle: "호르몬 균형과 근골격 건강",
    emoji: "💪",
    color: "from-rose-400 to-rose-600",
    description: "호르몬 균형을 유지하고, 골밀도와 관절 건강을 관리하여 장기적 건강 기반을 다집니다.",
    lessons: [
      "호르몬 균형의 이해",
      "골밀도 관리법",
      "관절 건강 운동",
      "근력 강화 프로그램",
      "통합 근골격 케어",
    ],
  },
  {
    id: "return_breath" as const,
    step: 10,
    name: "다시 돌아온 깊고 고운 숨과, 진정한 쉼",
    subtitle: "모든 수련의 완성, 원점으로의 회귀",
    emoji: "🌸",
    color: "from-pink-400 to-purple-600",
    description: "10단계의 여정을 마무리하며, 처음의 숨과 쉼으로 돌아갑니다. 모든 수련이 하나로 통합되는 완성의 단계입니다.",
    lessons: [
      "깊은 호흡의 재발견",
      "통합 이완 수련",
      "몸과 마음의 조화",
      "일상 속 완전한 쉼",
      "평생 건강의 완성",
    ],
  },
];

export default function Programs() {
  const { data: progressData } = trpc.programs.getProgress.useQuery(undefined, { retry: false });
  const startLesson = trpc.programs.startLesson.useMutation({
    onSuccess: () => {
      toast.success("레슨을 시작합니다!");
      utils.programs.getProgress.invalidate();
    },
    onError: () => toast.error("레슨 시작에 실패했습니다."),
  });
  const utils = trpc.useUtils();
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const getStageProgress = (stageId: string) => {
    if (!progressData) return { progress: 0, isCompleted: false, currentLesson: 0 };
    const p = progressData.find((p: any) => p.stage === stageId);
    return {
      progress: p?.progress || 0,
      isCompleted: p?.isCompleted === 1,
      currentLesson: p?.lessonId || 0,
    };
  };

  const isStageUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevStage = stages[index - 1];
    return getStageProgress(prevStage.id).isCompleted;
  };

  const overallProgress = Math.round(
    stages.reduce((acc, s) => acc + getStageProgress(s.id).progress, 0) / stages.length
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
          10단계 건강 수련 프로그램
        </h1>
        <p className="text-xs text-muted-foreground">숨에서 시작하여 숨으로 돌아오는 평생 건강의 여정</p>
      </div>

      {/* Overall Progress */}
      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary">전체 수련 진행률</span>
            <span className="text-xs font-bold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">
              {stages.filter((s) => getStageProgress(s.id).isCompleted).length} / {stages.length} 단계 완료
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stage Journey Path */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const { progress, isCompleted, currentLesson } = getStageProgress(stage.id);
          const unlocked = isStageUnlocked(index);
          const isExpanded = expandedStage === stage.id;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Card
                className={`shadow-sm border-border/50 overflow-hidden cursor-pointer transition-all ${
                  !unlocked ? "opacity-50" : isExpanded ? "ring-1 ring-primary/30" : ""
                }`}
                onClick={() => unlocked && setExpandedStage(isExpanded ? null : stage.id)}
              >
                <CardContent className="p-0">
                  {/* Stage Header */}
                  <div className="p-4 flex items-center gap-3">
                    {/* Step Number Circle */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                      {isCompleted ? "✓" : stage.step}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{stage.emoji}</span>
                        <h3 className="font-bold text-sm truncate">{stage.name}</h3>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{stage.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {!unlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      {unlocked && !isCompleted && (
                        <span className="text-[10px] font-medium text-primary">{progress}%</span>
                      )}
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {unlocked && (
                    <div className="px-4 pb-1">
                      <div className="w-full bg-muted rounded-full h-1">
                        <div
                          className={`h-1 rounded-full bg-gradient-to-r ${stage.color} transition-all`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expanded Content */}
                  {isExpanded && unlocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-3 border-t border-border/30 mt-2"
                    >
                      <p className="text-xs text-muted-foreground mb-4">{stage.description}</p>

                      {/* Lessons */}
                      <div className="space-y-2 mb-4">
                        {stage.lessons.map((lesson, li) => (
                          <div
                            key={li}
                            className={`flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg ${
                              li < currentLesson
                                ? "text-green-600 bg-green-50"
                                : li === currentLesson
                                ? "text-primary font-medium bg-primary/5"
                                : "text-muted-foreground"
                            }`}
                          >
                            {li < currentLesson ? (
                              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                                li === currentLesson ? "border-primary bg-primary/20" : "border-muted-foreground/30"
                              }`} />
                            )}
                            <span>레슨 {li + 1}: {lesson}</span>
                          </div>
                        ))}
                      </div>

                      {!isCompleted && (
                        <Button
                          size="sm"
                          className={`w-full text-xs h-9 text-white border-0 bg-gradient-to-r ${stage.color}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            startLesson.mutate({ stage: stage.id, lessonId: currentLesson });
                          }}
                          disabled={startLesson.isPending}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          {currentLesson === 0 ? "수련 시작하기" : "계속 수련하기"}
                        </Button>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Journey Message */}
      <Card className="shadow-sm border-border/50 bg-muted/30">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground italic" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            "숨에서 시작하여 숨으로 돌아오는 여정,<br />
            그 안에 건강의 모든 비밀이 담겨 있습니다."
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
