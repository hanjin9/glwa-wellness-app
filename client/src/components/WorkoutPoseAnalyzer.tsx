import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  AlertCircle,
  CheckCircle,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";
import { getHanJinLevelInfo, formatHanJinLevel } from "@/utils/hanJinLevel";

interface PoseAnalysisResult {
  poseName: string;
  accuracy: number; // 0-100
  hanJinLevel: number; // -10 ~ +10
  feedback: string;
  isCorrect: boolean;
  timestamp: number;
}

interface WorkoutPoseAnalyzerProps {
  exerciseName: string;
  targetPose?: string;
  onAnalysisComplete?: (result: PoseAnalysisResult) => void;
  duration?: number; // 초 단위
}

export default function WorkoutPoseAnalyzer({
  exerciseName,
  targetPose = "standing",
  onAnalysisComplete,
  duration = 30,
}: WorkoutPoseAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPose, setCurrentPose] = useState<PoseAnalysisResult | null>(
    null
  );
  const [feedback, setFeedback] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [cameraReady, setCameraReady] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // 카메라 시작
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
          };
        }
      } catch (error) {
        console.error("카메라 접근 실패:", error);
        setFeedback("카메라를 사용할 수 없습니다.");
      }
    };

    if (isAnalyzing && !cameraReady) {
      startCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isAnalyzing, cameraReady]);

  // 자세 분석 (시뮬레이션)
  useEffect(() => {
    if (!isAnalyzing || !cameraReady || !videoRef.current) return;

    const analyzeFrame = () => {
      try {
        // 실시간 자세 정확도 시뮬레이션 (0-100)
        const accuracy = Math.round(Math.random() * 40 + 60); // 60-100%

        // HanJin Level 변환 (-10 ~ +10)
        const hanJinLevel = Math.round((accuracy / 100) * 20 - 10);

        // 피드백 생성
        const isCorrect = accuracy >= 80;
        const feedbackText = isCorrect
          ? `완벽한 ${targetPose} 자세입니다! 계속 유지하세요.`
          : `자세를 조정하세요. 정확도: ${accuracy}%`;

        const result: PoseAnalysisResult = {
          poseName: exerciseName,
          accuracy,
          hanJinLevel,
          feedback: feedbackText,
          isCorrect,
          timestamp: Date.now(),
        };

        setCurrentPose(result);
        setFeedback(feedbackText);

        // 음성 피드백
        if (soundEnabled) {
          playAudioFeedback(isCorrect ? "correct" : "incorrect");
        }

        // 캔버스에 자세 그리기
        drawPoseOnCanvas(accuracy, isCorrect);
      } catch (error) {
        console.error("자세 분석 오류:", error);
      }

      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnalyzing, cameraReady, targetPose, exerciseName, soundEnabled]);

  // 타이머
  useEffect(() => {
    if (!isAnalyzing || timeLeft === 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isAnalyzing]);

  // 분석 완료
  useEffect(() => {
    if (timeLeft === 0 && currentPose && onAnalysisComplete) {
      onAnalysisComplete(currentPose);
      setIsAnalyzing(false);
      setTimeLeft(duration);
    }
  }, [timeLeft, currentPose, onAnalysisComplete, duration]);

  // 캔버스에 자세 그리기
  const drawPoseOnCanvas = (accuracy: number, isCorrect: boolean) => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    // 배경 투명화
    ctx.clearRect(0, 0, width, height);

    // 신체 부위 시뮬레이션 (간단한 원 표시)
    const bodyParts = [
      { x: 0.5, y: 0.15, label: "머리" },
      { x: 0.5, y: 0.35, label: "가슴" },
      { x: 0.35, y: 0.5, label: "왼쪽 팔" },
      { x: 0.65, y: 0.5, label: "오른쪽 팔" },
      { x: 0.5, y: 0.65, label: "복부" },
      { x: 0.35, y: 0.85, label: "왼쪽 다리" },
      { x: 0.65, y: 0.85, label: "오른쪽 다리" },
    ];

    // 신체 부위 그리기
    bodyParts.forEach((part) => {
      const x = part.x * width;
      const y = part.y * height;
      const radius = 15;

      // 원 그리기
      ctx.fillStyle = isCorrect ? "#22c55e" : "#ef4444";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // 테두리
      ctx.strokeStyle = isCorrect ? "#16a34a" : "#dc2626";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 라벨
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(part.label, x, y + 4);
    });

    // 신체 연결선 그리기
    const connections = [
      [0, 1], // 머리-가슴
      [1, 2], // 가슴-왼팔
      [1, 3], // 가슴-오른팔
      [1, 4], // 가슴-복부
      [4, 5], // 복부-왼다리
      [4, 6], // 복부-오른다리
    ];

    ctx.strokeStyle = isCorrect ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;

    connections.forEach(([from, to]) => {
      const fromPart = bodyParts[from];
      const toPart = bodyParts[to];

      ctx.beginPath();
      ctx.moveTo(fromPart.x * width, fromPart.y * height);
      ctx.lineTo(toPart.x * width, toPart.y * height);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // 정확도 게이지
    const gaugeX = width - 100;
    const gaugeY = 20;
    const gaugeWidth = 80;
    const gaugeHeight = 20;

    // 배경
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);

    // 진행 바
    ctx.fillStyle = isCorrect ? "#22c55e" : "#ef4444";
    ctx.fillRect(gaugeX, gaugeY, (accuracy / 100) * gaugeWidth, gaugeHeight);

    // 테두리
    ctx.strokeStyle = isCorrect ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.strokeRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);

    // 텍스트
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${accuracy}%`, gaugeX + gaugeWidth / 2, gaugeY + 15);
  };

  // 음성 피드백
  const playAudioFeedback = (type: "correct" | "incorrect") => {
    if (!soundEnabled) return;

    try {
      const AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === "correct") {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } else {
        oscillator.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch (error) {
      console.error("음성 피드백 오류:", error);
    }
  };

  const poseInfo = currentPose
    ? getHanJinLevelInfo(currentPose.hanJinLevel)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/50 border border-[#d4af37]/20 rounded-xl p-6 space-y-4"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6 text-[#d4af37]" />
          <div>
            <h3 className="text-white font-semibold">{exerciseName} 자세 분석</h3>
            <p className="text-xs text-[#d4af37]/60">실시간 운동 모니터링</p>
          </div>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-[#d4af37]" />
          ) : (
            <VolumeX className="w-5 h-5 text-[#d4af37]/50" />
          )}
        </button>
      </div>

      {/* 비디오 & 캔버스 */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* 타이머 */}
        {isAnalyzing && (
          <div className="absolute top-4 right-4 bg-black/80 px-4 py-2 rounded-lg">
            <p className="text-[#d4af37] font-bold text-lg">{timeLeft}초</p>
          </div>
        )}
      </div>

      {/* 현재 자세 정보 */}
      <AnimatePresence>
        {currentPose && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`border rounded-lg p-4 ${poseInfo?.borderColor} ${poseInfo?.bgColor}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-semibold flex items-center gap-2">
                  {currentPose.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  자세 분석 결과
                </h4>
              </div>
              <span className={`text-sm font-bold ${poseInfo?.color}`}>
                {formatHanJinLevel(currentPose.hanJinLevel)}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#d4af37]/70">정확도</span>
                <span className="text-white font-semibold">
                  {currentPose.accuracy}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#d4af37]/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentPose.accuracy}%` }}
                  className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
                />
              </div>
            </div>

            <p className="text-sm text-[#d4af37]/80">{currentPose.feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 피드백 */}
      {feedback && !currentPose && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-sm text-blue-400">{feedback}</p>
        </div>
      )}

      {/* 컨트롤 */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsAnalyzing(!isAnalyzing);
            if (!isAnalyzing) {
              setTimeLeft(duration);
              setCurrentPose(null);
            }
          }}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
            isAnalyzing
              ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
              : "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
          }`}
        >
          {isAnalyzing ? "분석 중지" : "분석 시작"}
        </motion.button>
      </div>
    </motion.div>
  );
}
