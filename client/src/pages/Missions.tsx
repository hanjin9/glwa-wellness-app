import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { Zap, Camera, CheckCircle, Clock, Trophy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  breathing: { label: "호흡", emoji: "🌬️" },
  rest: { label: "휴식", emoji: "🌙" },
  posture: { label: "자세", emoji: "🧘" },
  stretching: { label: "스트레칭", emoji: "🌿" },
  mental: { label: "정신건강", emoji: "☯️" },
  exercise: { label: "운동", emoji: "💪" },
  nutrition: { label: "영양", emoji: "🥗" },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "진행 중", color: "bg-blue-100 text-blue-700" },
  submitted: { label: "제출됨", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "완료", color: "bg-green-100 text-green-700" },
  failed: { label: "미완료", color: "bg-red-100 text-red-700" },
};

export default function Missions() {
  const { data: missions, isLoading } = trpc.missions.list.useQuery(undefined, { retry: false });
  const generateMissions = trpc.missions.generate.useMutation({
    onSuccess: () => {
      toast.success("새로운 미션이 생성되었습니다!");
      utils.missions.list.invalidate();
    },
    onError: () => toast.error("미션 생성에 실패했습니다."),
  });
  const submitMission = trpc.missions.submit.useMutation({
    onSuccess: () => {
      toast.success("미션이 제출되었습니다! AI가 분석 중입니다.");
      utils.missions.list.invalidate();
    },
    onError: () => toast.error("제출에 실패했습니다."),
  });
  const utils = trpc.useUtils();
  const [selectedMission, setSelectedMission] = useState<number | null>(null);

  const activeMissions = missions?.filter((m: any) => m.status !== "completed" && m.status !== "failed") || [];
  const completedMissions = missions?.filter((m: any) => m.status === "completed") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            건강 미션
          </h1>
          <p className="text-xs text-muted-foreground">주 2회 맞춤형 미션을 수행하세요</p>
        </div>
        <Button
          size="sm"
          className="gradient-warm text-white border-0 text-xs"
          onClick={() => generateMissions.mutate()}
          disabled={generateMissions.isPending}
        >
          {generateMissions.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
          미션 생성
        </Button>
      </div>

      {/* Payback Info */}
      <Card className="shadow-sm border-border/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs font-semibold">미션 완수 페이백</p>
              <p className="text-[10px] text-muted-foreground">
                모든 미션 완수 시 최대 100% 환급! AI가 사진을 분석하여 완수율을 판정합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Missions */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> 진행 중인 미션
        </h2>
        {activeMissions.length > 0 ? (
          <div className="space-y-3">
            {activeMissions.map((mission: any, i: number) => {
              const cat = categoryLabels[mission.category] || { label: mission.category, emoji: "📋" };
              const status = statusLabels[mission.status] || statusLabels.pending;
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Card className="shadow-sm border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                          {cat.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold">{mission.title}</h3>
                            <Badge variant="secondary" className={`text-[10px] ${status.color}`}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{mission.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                              {cat.label}
                            </span>
                            {mission.dueDate && (
                              <span className="text-[10px] text-muted-foreground">
                                마감: {mission.dueDate}
                              </span>
                            )}
                          </div>
                          {(mission.status === "pending" || mission.status === "in_progress") && (
                            <Button
                              size="sm"
                              className="mt-3 text-xs gradient-warm text-white border-0"
                              onClick={() => submitMission.mutate({ missionId: mission.id })}
                              disabled={submitMission.isPending}
                            >
                              <Camera className="w-3 h-3 mr-1" /> 미션 인증하기
                            </Button>
                          )}
                          {mission.status === "completed" && mission.completionRate !== null && (
                            <div className="mt-2 p-2 rounded-lg bg-green-50 border border-green-200">
                              <p className="text-xs font-medium text-green-700">
                                완수율: {mission.completionRate}% | 페이백: {mission.paybackRate}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">진행 중인 미션이 없습니다.</p>
            <p className="text-xs mt-1">"미션 생성" 버튼을 눌러 새 미션을 받아보세요.</p>
          </div>
        )}
      </div>

      {/* Completed Missions */}
      {completedMissions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" /> 완료된 미션
          </h2>
          <div className="space-y-2">
            {completedMissions.map((mission: any) => {
              const cat = categoryLabels[mission.category] || { label: mission.category, emoji: "📋" };
              return (
                <Card key={mission.id} className="shadow-sm border-border/50 opacity-80">
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="text-lg">{cat.emoji}</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{mission.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        완수율 {mission.completionRate}% · 페이백 {mission.paybackRate}%
                      </p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
