import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Heart, Zap, TrendingUp } from "lucide-react";
import { getHanJinLevelInfo, formatHanJinLevel } from "@/utils/hanJinLevel";

interface BreathingAnalysisResult {
  breathingRate: number; // 분당 호흡 수
  breathingDepth: number; // 호흡 깊이 (0-100)
  stressLevel: number; // 스트레스 수준 (-10 ~ +10)
  hanJinLevel: number; // HanJin Level (-10 ~ +10)
  feedback: string;
  timestamp: number;
}

interface BreathingAnalyzerProps {
  onAnalysisComplete?: (result: BreathingAnalysisResult) => void;
  duration?: number; // 초 단위
}

export default function BreathingAnalyzer({
  onAnalysisComplete,
  duration = 60,
}: BreathingAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentBreathing, setCurrentBreathing] =
    useState<BreathingAnalysisResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [cameraReady, setCameraReady] = useState(false);
  const breathingDataRef = useRef<number[]>([]); // 호흡 데이터 저장
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

  // 호흡 분석 (시뮬레이션)
  useEffect(() => {
    if (!isAnalyzing || !cameraReady) return;

    const analyzeBreathing = () => {
      try {
        // 호흡 속도 시뮬레이션 (분당 12-20회)
        const baseRate = 16;
        const variation = Math.sin(Date.now() / 1000) * 4;
        const breathingRate = Math.round(baseRate + variation);

        // 호흡 깊이 시뮬레이션 (0-100)
        const breathingDepth = Math.round(Math.random() * 30 + 60); // 60-90

        // 스트레스 수준 계산 (호흡 속도 기반)
        const normalRate = 16;
        const stressLevel = Math.round(
          ((breathingRate - normalRate) / normalRate) * 10
        );
        const clampedStress = Math.max(-10, Math.min(10, stressLevel));

        // HanJin Level 계산 (호흡 깊이 + 스트레스)
        const hanJinLevel = Math.round(
          (breathingDepth / 100) * 20 - 10 - clampedStress / 2
        );

        // 피드백 생성
        let feedback = "";
        if (clampedStress < -5) {
          feedback = "매우 안정적인 호흡입니다. 계속 유지하세요.";
        } else if (clampedStress < 0) {
          feedback = "안정적인 호흡 패턴입니다.";
        } else if (clampedStress < 5) {
          feedback = "약간의 긴장이 감지됩니다. 천천히 숨을 쉬세요.";
        } else {
          feedback = "스트레스가 높습니다. 깊게 숨을 쉬어보세요.";
        }

        const result: BreathingAnalysisResult = {
          breathingRate,
          breathingDepth,
          stressLevel: clampedStress,
          hanJinLevel,
          feedback,
          timestamp: Date.now(),
        };

        setCurrentBreathing(result);
        breathingDataRef.current.push(breathingRate);

        // 캔버스에 호흡 파형 그리기
        drawBreathingWave(breathingRate, breathingDepth);
      } catch (error) {
        console.error("호흡 분석 오류:", error);
      }

      animationFrameRef.current = requestAnimationFrame(analyzeBreathing);
    };

    analyzeBreathing();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnalyzing, cameraReady]);

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
    if (timeLeft === 0 && currentBreathing && onAnalysisComplete) {
      onAnalysisComplete(currentBreathing);
      setIsAnalyzing(false);
      setTimeLeft(duration);
    }
  }, [timeLeft, currentBreathing, onAnalysisComplete, duration]);

  // 호흡 파형 그리기
  const drawBreathingWave = (breathingRate: number, breathingDepth: number) => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    // 배경 투명화
    ctx.clearRect(0, 0, width, height);

    // 호흡 파형 그리기
    const centerY = height / 2;
    const waveHeight = (breathingDepth / 100) * (height / 4);
    const frequency = (breathingRate / 60) * 2 * Math.PI; // 분당 호흡 수를 라디안으로 변환

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let x = 0; x < width; x += 5) {
      const time = (Date.now() / 1000 + x / width) * frequency;
      const y = centerY + Math.sin(time) * waveHeight;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // 호흡 정보 표시
    const infoX = 20;
    const infoY = 40;

    // 배경
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(infoX, infoY, 300, 120);

    // 테두리
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    ctx.strokeRect(infoX, infoY, 300, 120);

    // 텍스트
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 16px Arial";
    ctx.fillText("호흡 분석", infoX + 10, infoY + 30);

    ctx.font = "14px Arial";
    ctx.fillStyle = "#f4d03f";
    ctx.fillText(`호흡 속도: ${breathingRate}회/분`, infoX + 10, infoY + 55);
    ctx.fillText(`호흡 깊이: ${breathingDepth}%`, infoX + 10, infoY + 75);
    ctx.fillText(`스트레스: ${currentBreathing?.stressLevel || 0}`, infoX + 10, infoY + 95);

    // 상태 표시기
    const statusX = width - 150;
    const statusY = 40;

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(statusX, statusY, 130, 60);

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    ctx.strokeRect(statusX, statusY, 130, 60);

    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 12px Arial";
    ctx.fillText("상태", statusX + 10, statusY + 20);

    const stressLevel = currentBreathing?.stressLevel || 0;
    let statusColor = "#22c55e"; // 초록
    let statusText = "안정";

    if (stressLevel < -5) {
      statusColor = "#1e40af"; // 진파랑
      statusText = "최고";
    } else if (stressLevel < 0) {
      statusColor = "#22c55e"; // 초록
      statusText = "좋음";
    } else if (stressLevel < 5) {
      statusColor = "#eab308"; // 노랑
      statusText = "주의";
    } else {
      statusColor = "#ef4444"; // 빨강
      statusText = "높음";
    }

    ctx.fillStyle = statusColor;
    ctx.font = "bold 16px Arial";
    ctx.fillText(statusText, statusX + 30, statusY + 40);
  };

  const breathingInfo = currentBreathing
    ? getHanJinLevelInfo(currentBreathing.hanJinLevel)
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
          <Wind className="w-6 h-6 text-[#d4af37]" />
          <div>
            <h3 className="text-white font-semibold">호흡 분석</h3>
            <p className="text-xs text-[#d4af37]/60">AI 호흡 패턴 인식</p>
          </div>
        </div>
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

      {/* 호흡 분석 결과 */}
      <AnimatePresence>
        {currentBreathing && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`border rounded-lg p-4 ${breathingInfo?.borderColor} ${breathingInfo?.bgColor}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  호흡 분석 결과
                </h4>
              </div>
              <span className={`text-sm font-bold ${breathingInfo?.color}`}>
                {formatHanJinLevel(currentBreathing.hanJinLevel)}
              </span>
            </div>

            <div className="space-y-3 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#d4af37]/70">호흡 속도</span>
                <span className="text-white font-semibold">
                  {currentBreathing.breathingRate}회/분
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#d4af37]/70">호흡 깊이</span>
                <span className="text-white font-semibold">
                  {currentBreathing.breathingDepth}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#d4af37]/70">스트레스 수준</span>
                <span className="text-white font-semibold">
                  {currentBreathing.stressLevel > 0 ? "+" : ""}
                  {currentBreathing.stressLevel}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#d4af37]/80">{currentBreathing.feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 컨트롤 */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsAnalyzing(!isAnalyzing);
            if (!isAnalyzing) {
              setTimeLeft(duration);
              setCurrentBreathing(null);
              breathingDataRef.current = [];
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
