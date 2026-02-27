import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, X } from "lucide-react";

interface OnboardingVideoPlayerProps {
  videoUrl: string;
  title: string;
  category: "intro" | "health_check" | "sleep_tracking" | "meal_tracking" | "activity_tracking" | "vip_membership" | "dashboard" | "points_rewards" | "missions" | "community";
  duration: number;
  autoPlay?: boolean;
  muted?: boolean;
  onSkip?: () => void;
  onComplete?: () => void;
  showSkipButton?: boolean;
  skipButtonStyle?: "hologram" | "solid" | "gradient" | "glass";
  backgroundColor?: string;
  accentColor?: string;
}

/**
 * 온보딩 영상 플레이어 컴포넌트
 * 투명 홀로그램 스타일의 [+] 스킵 버튼 포함
 * 
 * 사용 예시:
 * <OnboardingVideoPlayer
 *   videoUrl="https://example.com/video.mp4"
 *   title="Healthcare Widget Guide"
 *   category="health_check"
 *   duration={30}
 *   autoPlay={true}
 *   onSkip={() => navigate("/health-check")}
 *   onComplete={() => navigate("/health-check")}
 * />
 */
export const OnboardingVideoPlayer: React.FC<OnboardingVideoPlayerProps> = ({
  videoUrl,
  title,
  category,
  duration,
  autoPlay = true,
  muted = false,
  onSkip,
  onComplete,
  showSkipButton = true,
  skipButtonStyle = "hologram",
  backgroundColor = "#000000",
  accentColor = "#FFD700",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch((err) => console.error("Play error:", err));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);
    setProgress((current / total) * 100);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onComplete?.();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * videoRef.current.duration;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 스킵 버튼 스타일 정의
  const skipButtonClasses = {
    hologram: `
      absolute bottom-8 left-1/2 -translate-x-1/2 
      w-16 h-16 rounded-full
      bg-gradient-to-br from-white/20 to-white/5
      border border-white/30
      backdrop-blur-md
      hover:from-white/30 hover:to-white/10
      hover:border-white/50
      transition-all duration-300
      flex items-center justify-center
      shadow-lg shadow-white/20
      cursor-pointer
      group
    `,
    solid: `
      absolute bottom-8 left-1/2 -translate-x-1/2
      w-16 h-16 rounded-full
      bg-white
      hover:bg-gray-100
      transition-all duration-300
      flex items-center justify-center
      shadow-lg
      cursor-pointer
    `,
    gradient: `
      absolute bottom-8 left-1/2 -translate-x-1/2
      w-16 h-16 rounded-full
      bg-gradient-to-br from-yellow-400 to-yellow-600
      hover:from-yellow-300 hover:to-yellow-500
      transition-all duration-300
      flex items-center justify-center
      shadow-lg shadow-yellow-500/50
      cursor-pointer
    `,
    glass: `
      absolute bottom-8 left-1/2 -translate-x-1/2
      w-16 h-16 rounded-full
      bg-white/10
      border-2 border-white/20
      backdrop-blur-xl
      hover:bg-white/20
      hover:border-white/40
      transition-all duration-300
      flex items-center justify-center
      shadow-lg
      cursor-pointer
    `,
  };

  const skipIconColor = skipButtonStyle === "hologram" || skipButtonStyle === "glass" ? "text-white" : "text-black";

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor }}
      onMouseMove={handleMouseMove}
    >
      {/* 영상 배경 */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        muted={isMuted}
      />

      {/* 어두운 오버레이 (선택사항) */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* 제목 및 카테고리 표시 */}
      <div className="absolute top-8 left-8 text-white z-10">
        <h2 className="text-2xl font-bold" style={{ color: accentColor }}>
          {title}
        </h2>
        <p className="text-sm text-white/60 mt-2">{category.replace(/_/g, " ").toUpperCase()}</p>
      </div>

      {/* 플레이어 컨트롤 */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* 진행 바 */}
        <div
          className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-4 hover:h-2 transition-all"
          onClick={handleProgressClick}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          />
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            {/* 재생/일시정지 버튼 */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="hover:opacity-80 transition-opacity"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            {/* 음소거 버튼 */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="hover:opacity-80 transition-opacity"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>

            {/* 시간 표시 */}
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* 진행률 표시 */}
          <div className="text-sm">{Math.round(progress)}%</div>
        </div>
      </div>

      {/* 투명 홀로그램 [+] 스킵 버튼 */}
      {showSkipButton && (
        <button
          onClick={onSkip}
          className={skipButtonClasses[skipButtonStyle]}
          aria-label="Skip video"
          title="Skip to feature"
        >
          <X className={`${skipIconColor} w-8 h-8 group-hover:scale-110 transition-transform`} />
        </button>
      )}

      {/* 로딩 상태 표시 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <video
          ref={videoRef}
          onLoadStart={() => {
            // 로딩 시작
          }}
          onCanPlay={() => {
            // 재생 가능
          }}
        />
      </div>
    </div>
  );
};

/**
 * 인트로 영상 플레이어 (1분 40초 풀스크린)
 * 앱 최초 실행 시 사용
 */
export const IntroVideoPlayer: React.FC<Omit<OnboardingVideoPlayerProps, "category">> = (props) => {
  return <OnboardingVideoPlayer {...props} category="intro" />;
};

/**
 * 기능별 가이드 영상 플레이어 (30초)
 * 각 기능 진입 시 사용
 */
export const FeatureGuideVideoPlayer: React.FC<OnboardingVideoPlayerProps> = (props) => {
  return <OnboardingVideoPlayer {...props} />;
};

export default OnboardingVideoPlayer;
