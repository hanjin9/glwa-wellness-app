import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Zap, Target, Flame, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// 난이도별 미션 목록
const EASY_MISSIONS = [
  "걷기 15분 🚶",
  "물 8잔 마시기 💧",
  "스트레칭 5분 🧘",
  "심호흡 3분 🌬️",
  "과일 1개 먹기 🍎",
  "계단 3층 오르기 🪜",
  "감사일기 쓰기 📝",
  "허브차 마시기 🍵",
  "10분 명상 🧘‍♂️",
  "바른자세 30분 💺",
];

const MEDIUM_MISSIONS = [
  "조깅 30분 🏃",
  "건강식 요리 🥗",
  "요가 20분 🧘‍♀️",
  "독서 30분 📖",
  "플랭크 3세트 💪",
  "자전거 20분 🚴",
  "줄넘기 100회 🤸",
  "수영 30분 🏊",
  "등산 1시간 ⛰️",
  "건강검진 예약 🏥",
];

const HARD_MISSIONS = [
  "마라톤 5km 🏅",
  "단식 16시간 ⏰",
  "새벽 5시 기상 🌅",
  "운동 1시간 🏋️",
  "설탕 완전 금지 🚫",
  "냉수 샤워 🚿",
  "디지털 디톡스 📵",
  "10km 걷기 🥾",
  "근력운동 1시간 💪",
  "건강 강의 수강 🎓",
];

interface MissionSlotMachineProps {
  onSelectMission?: (mission: string, difficulty: string) => void;
}

function SlotColumn({ missions, speed, label, icon: Icon, color, onSelect }: {
  missions: string[];
  speed: number;
  label: string;
  icon: any;
  color: string;
  onSelect: (mission: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => {
      setOffset(prev => (prev + 1) % missions.length);
    }, speed);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [missions.length, speed, isPaused]);

  const getVisibleMissions = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(missions[(offset + i) % missions.length]);
    }
    return visible;
  };

  return (
    <div className="flex-1">
      <div className={`text-center mb-2 px-1 py-1 rounded-lg bg-gradient-to-r ${color}`}>
        <div className="flex items-center justify-center gap-1">
          <Icon className="w-3 h-3 text-white" />
          <span className="text-[10px] font-bold text-white">{label}</span>
        </div>
      </div>
      <div className="relative h-[120px] overflow-hidden rounded-lg bg-background/50 border border-border/30">
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent z-10 pointer-events-none" />
        
        <AnimatePresence mode="popLayout">
          <motion.div
            key={offset}
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ duration: speed / 2000, ease: "easeInOut" }}
            className="space-y-1 p-1"
          >
            {getVisibleMissions().map((mission, i) => (
              <motion.button
                key={`${offset}-${i}`}
                className={`w-full text-left p-2 rounded-md text-[10px] leading-tight transition-all
                  ${i === 1 ? 'bg-primary/10 border border-primary/20 font-semibold scale-[1.02]' : 'opacity-60 hover:opacity-80'}
                `}
                onClick={() => {
                  setIsPaused(true);
                  onSelect(mission);
                }}
                whileTap={{ scale: 0.95 }}
              >
                {mission}
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      {isPaused && (
        <Button
          size="sm"
          variant="ghost"
          className="w-full mt-1 text-[10px] h-6"
          onClick={() => setIsPaused(false)}
        >
          다시 돌리기 ↻
        </Button>
      )}
    </div>
  );
}

export function MissionSlotMachine({ onSelectMission }: MissionSlotMachineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<{ text: string; difficulty: string } | null>(null);

  const handleSelect = (mission: string, difficulty: string) => {
    setSelectedMission({ text: mission, difficulty });
    onSelectMission?.(mission, difficulty);
  };

  return (
    <Card className="border-border/40 overflow-hidden shadow-sm">
      {/* Header Bar - 클릭하면 펼쳐짐 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold">🎰 부여된 미션</p>
            <p className="text-[9px] opacity-80">회사에서 부여한 미션을 선택하세요</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Slot Machine Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="p-3">
              {/* 선택된 미션 표시 */}
              {selectedMission && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-2.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-[10px] text-green-600 font-bold">선택된 미션</p>
                      <p className="text-xs font-semibold">{selectedMission.text}</p>
                      <p className="text-[9px] text-muted-foreground">난이도: {selectedMission.difficulty}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3칸 슬롯머신 */}
              <div className="flex gap-2">
                <SlotColumn
                  missions={EASY_MISSIONS}
                  speed={2500}
                  label="쉬움"
                  icon={Zap}
                  color="from-green-400 to-emerald-500"
                  onSelect={(m) => handleSelect(m, "쉬움")}
                />
                <SlotColumn
                  missions={MEDIUM_MISSIONS}
                  speed={2000}
                  label="보통"
                  icon={Target}
                  color="from-amber-400 to-orange-500"
                  onSelect={(m) => handleSelect(m, "보통")}
                />
                <SlotColumn
                  missions={HARD_MISSIONS}
                  speed={1500}
                  label="도전"
                  icon={Flame}
                  color="from-red-400 to-rose-600"
                  onSelect={(m) => handleSelect(m, "도전")}
                />
              </div>

              <p className="text-[9px] text-center text-muted-foreground mt-2">
                원하는 미션을 터치하여 선택하세요
              </p>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
