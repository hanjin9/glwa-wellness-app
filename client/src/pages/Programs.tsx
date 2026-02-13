import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, CheckCircle, Play } from "lucide-react";

const stages = [
  {
    id: "breathing" as const,
    step: 1,
    name: "숨 (呼吸)",
    subtitle: "호흡 인지 → 호흡 훈련",
    emoji: "🌬️",
    description: "올바른 호흡은 건강의 시작입니다. 복식호흡, 4-7-8 호흡법 등을 배우고 일상에 적용합니다.",
    lessons: [
      "호흡 인지 훈련",
      "복식호흡 기초",
      "4-7-8 호흡법",
      "호흡과 자율신경",
      "일상 호흡 습관화",
    ],
  },
  {
    id: "rest" as const,
    step: 2,
    name: "쉼 (休息)",
    subtitle: "수면과 휴식의 질 향상",
    emoji: "🌙",
    description: "양질의 수면과 적절한 휴식이 회복력을 높입니다.",
    lessons: [
      "수면 위생 기초",
      "수면 환경 최적화",
      "낮잠과 마이크로 휴식",
      "수면 리듬 조절",
      "디지털 디톡스",
    ],
  },
  {
    id: "posture" as const,
    step: 3,
    name: "자세 (姿勢)",
    subtitle: "앉기, 서기, 걷기 교정",
    emoji: "🧘",
    description: "바른 자세는 근골격계 건강과 중력 관리의 핵심입니다.",
    lessons: [
      "바른 앉기 자세",
      "서기와 중력 균형",
      "올바른 걷기",
      "발바닥과 중력 관리",
      "일상 자세 교정",
    ],
  },
  {
    id: "stretching" as const,
    step: 4,
    name: "스트레칭/요가",
    subtitle: "유연성과 균형 강화",
    emoji: "🌿",
    description: "스트레칭과 요가로 유연성을 높이고 근골격계를 강화합니다.",
    lessons: [
      "기초 스트레칭 루틴",
      "목/어깨 이완",
      "허리/골반 스트레칭",
      "하체 유연성 강화",
      "요가 기초 동작",
    ],
  },
  {
    id: "mental" as const,
    step: 5,
    name: "정신건강 (精神)",
    subtitle: "균형, 절제, 감사, 선(善)",
    emoji: "☯️",
    description: "동양 철학에 기반한 마음 수양으로 정신 건강을 다집니다.",
    lessons: [
      "마음챙김 명상",
      "감사 일기 습관",
      "절제와 균형의 삶",
      "선(善)의 실천",
      "통합 웰니스 마스터",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
          5단계 건강 프로그램
        </h1>
        <p className="text-xs text-muted-foreground">단계별 커리큘럼을 따라 건강을 완성하세요</p>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const { progress, isCompleted, currentLesson } = getStageProgress(stage.id);
          const unlocked = isStageUnlocked(index);

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={`shadow-sm border-border/50 ${!unlocked ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                      {stage.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          STEP {stage.step}
                        </span>
                        {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {!unlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <h3 className="font-bold text-sm">{stage.name}</h3>
                      <p className="text-[10px] text-muted-foreground mb-2">{stage.subtitle}</p>
                      <p className="text-xs text-muted-foreground mb-3">{stage.description}</p>

                      {unlocked && (
                        <>
                          <Progress value={progress} className="h-1.5 mb-2" />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">{progress}% 완료</span>
                            {!isCompleted && (
                              <Button
                                size="sm"
                                className="text-[10px] h-7 gradient-warm text-white border-0"
                                onClick={() => startLesson.mutate({ stage: stage.id, lessonId: currentLesson })}
                                disabled={startLesson.isPending}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                {currentLesson === 0 ? "시작하기" : "계속하기"}
                              </Button>
                            )}
                          </div>

                          {/* Lesson list */}
                          <div className="mt-3 space-y-1">
                            {stage.lessons.map((lesson, li) => (
                              <div
                                key={li}
                                className={`flex items-center gap-2 text-xs py-1 ${
                                  li < currentLesson
                                    ? "text-green-600"
                                    : li === currentLesson
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {li < currentLesson ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <div className={`w-3 h-3 rounded-full border ${li === currentLesson ? "border-primary bg-primary/20" : "border-muted-foreground/30"}`} />
                                )}
                                {lesson}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
