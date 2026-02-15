import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle, Camera, CheckCircle, Clock, Upload,
  ChevronDown, Shield, Calendar, ImagePlus, Loader2
} from "lucide-react";

// 필수 미션 데이터 (회사에서 부여)
const REQUIRED_MISSIONS = {
  daily: [
    { id: "req-d1", title: "아침 체조 10분", description: "기상 후 가벼운 체조로 하루를 시작하세요", points: 20, emoji: "🌅" },
    { id: "req-d2", title: "건강 식단 사진 기록", description: "오늘 먹은 건강식을 사진으로 기록하세요", points: 15, emoji: "🥗" },
  ],
  weekly: [
    { id: "req-w1", title: "주간 건강 리포트 작성", description: "이번 주 건강 상태를 기록하고 제출하세요", points: 100, emoji: "📊" },
    { id: "req-w2", title: "유산소 운동 3회 이상", description: "이번 주 유산소 운동 3회 이상 인증하세요", points: 80, emoji: "🏃" },
  ],
};

interface MissionPhotoUploadProps {
  missionId: string;
  missionTitle: string;
  onComplete: () => void;
}

function MissionPhotoUpload({ missionId, missionTitle, onComplete }: MissionPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ base64: string; contentType: string } | null>(null);

  const submitMission = trpc.missions.submitRequiredMission.useMutation({
    onSuccess: () => {
      toast.success("미션 인증이 완료되었습니다! 관리자에게 전송되었습니다.");
      onComplete();
    },
    onError: () => {
      toast.error("미션 인증 제출에 실패했습니다. 다시 시도해주세요.");
      setUploading(false);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB 이하만 가능합니다.");
      return;
    }

    // 미리보기
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreview(result);
      // base64 데이터 추출
      const base64 = result.split(",")[1];
      setFileData({ base64, contentType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!fileData) {
      toast.error("사진을 먼저 선택해주세요");
      return;
    }
    setUploading(true);
    submitMission.mutate({
      missionTitle,
      difficulty: "일반",
      photoBase64: fileData.base64,
      photoContentType: fileData.contentType,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3"
    >
      <div className="p-3 rounded-lg bg-muted/20 border border-dashed border-border/50 space-y-2">
        <p className="text-[10px] font-semibold flex items-center gap-1">
          <Camera className="w-3 h-3" /> 미션 인증 사진 업로드
        </p>
        
        {preview ? (
          <div className="relative">
            <img src={preview} alt="미션 인증" className="w-full h-32 object-cover rounded-lg" />
            <button
              onClick={() => { setPreview(null); setFileData(null); }}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-[10px]"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-24 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
            <ImagePlus className="w-6 h-6 text-primary/50 mb-1" />
            <span className="text-[10px] text-primary/70">사진 선택 (5MB 이하)</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
          </label>
        )}

        <Button
          size="sm"
          className="w-full text-xs gradient-warm text-white border-0"
          onClick={handleSubmit}
          disabled={!fileData || uploading || submitMission.isPending}
        >
          {uploading || submitMission.isPending ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> 전송 중...
            </>
          ) : (
            <>
              <CheckCircle className="w-3 h-3 mr-1" /> 미션 완료 제출
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export function RequiredMissions() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const missions = REQUIRED_MISSIONS[activeTab];

  return (
    <Card className="border-border/40 overflow-hidden shadow-sm">
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold">⚡ 필수 미션</p>
            <p className="text-[9px] opacity-80">회사 지정 의무 미션을 완수하세요</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-white/20 text-white text-[9px] border-0">
            {completedIds.size}/{REQUIRED_MISSIONS.daily.length + REQUIRED_MISSIONS.weekly.length}
          </Badge>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="p-3">
              {/* 당일/주간 탭 */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setActiveTab("daily")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                    activeTab === "daily"
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <Clock className="w-3 h-3" /> 당일 미션
                </button>
                <button
                  onClick={() => setActiveTab("weekly")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                    activeTab === "weekly"
                      ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-sm"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <Calendar className="w-3 h-3" /> 주간 미션
                </button>
              </div>

              {/* 미션 목록 */}
              <div className="space-y-2">
                {missions.map((mission) => {
                  const isCompleted = completedIds.has(mission.id);
                  const isUploading = uploadingId === mission.id;

                  return (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border transition-all ${
                        isCompleted
                          ? "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800"
                          : "bg-background border-border/30 hover:border-border/60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl mt-0.5">{mission.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold">{mission.title}</h4>
                            {isCompleted && (
                              <Badge className="bg-green-100 text-green-700 text-[9px] border-0">
                                <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> 완료
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{mission.description}</p>
                          <p className="text-[10px] text-primary font-medium mt-1">+{mission.points}P 보상</p>

                          {!isCompleted && !isUploading && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 text-[10px] h-7"
                              onClick={() => setUploadingId(mission.id)}
                            >
                              <Camera className="w-3 h-3 mr-1" /> 사진 인증하기
                            </Button>
                          )}

                          <AnimatePresence>
                            {isUploading && !isCompleted && (
                              <MissionPhotoUpload
                                missionId={mission.id}
                                missionTitle={mission.title}
                                onComplete={() => {
                                  setCompletedIds(prev => { const next = new Set(Array.from(prev)); next.add(mission.id); return next; });
                                  setUploadingId(null);
                                }}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 안내 */}
              <div className="mt-3 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[9px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    필수 미션은 GLWA 본사에서 지정한 의무 미션입니다. 
                    미완수 시 등급 유지에 영향을 줄 수 있습니다.
                    사진 인증은 관리자가 확인 후 승인합니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
