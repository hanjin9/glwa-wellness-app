/**
 * 🎬 시네마틱 인트로 엔진
 * 
 * 풀스크린 영상 배경 + 홀로그램 로그인 UI
 * - 헬스케어 위젯 + 메디컬 HUD + 골든 슬라이드 통합
 * - 투명 홀로그램 로그인 버튼 (Pulse 애니메이션)
 * - 음악 가변성 (교체형 모듈)
 * - 무결점 진입 로직
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Play, Volume2, VolumeX } from "lucide-react";
import { useRouter, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export interface CinematicIntroProps {
  videoSources: string[]; // [healthcare, medical-hud, golden-slide]
  audioSource?: string;
  logoImage?: string;
  onLoginClick?: () => void;
  autoPlay?: boolean;
}

export function CinematicIntro({
  videoSources,
  audioSource,
  logoImage,
  onLoginClick,
  autoPlay = true,
}: CinematicIntroProps) {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showLoginButton, setShowLoginButton] = useState(true);
  const [progress, setProgress] = useState(0);

  // 사용자 상태에 따른 진입 로직
  useEffect(() => {
    if (user) {
      // 기존 회원: 즉시 대시보드로 진입
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // 영상 재생 관리
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };
    const handleEnded = () => {
      // 다음 영상으로 전환
      if (currentVideoIndex < videoSources.length - 1) {
        setCurrentVideoIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    if (autoPlay) {
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [autoPlay, currentVideoIndex, videoSources]);


  // 오디오 동기화
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video || !audio) return;

    const syncAudio = () => {
      audio.currentTime = video.currentTime;
    };

    video.addEventListener("timeupdate", syncAudio);
    return () => video.removeEventListener("timeupdate", syncAudio);
  }, []);

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      setLocation("/auth/login");
    }
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (user) {
      setLocation("/dashboard");
    } else {
      handleLoginClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* 풀스크린 영상 배경 */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={videoSources[currentVideoIndex]}
          crossOrigin="anonymous"
          muted={isMuted}
        />

        {/* 오디오 트랙 (분리 관리) */}
        <audio
          ref={audioRef}
          src={audioSource}
          crossOrigin="anonymous"
          loop
        />

        {/* 어두운 오버레이 (선택적) */}
        <motion.div
          className="absolute inset-0 bg-black/20"
          animate={{ opacity: isPlaying ? 0.2 : 0.4 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* 로고 (상단 좌측) */}
      {logoImage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute top-8 left-8 z-10"
        >
          <img
            src={logoImage}
            alt="GLWA Empire"
            className="h-12 drop-shadow-lg"
          />
        </motion.div>
      )}

      {/* 홀로그램 로그인 버튼 (하단 중앙) */}
      <AnimatePresence>
        {showLoginButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20"
          >
            {/* 홀로그램 글로우 효과 */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0) 70%)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />

            {/* 메인 버튼 */}
            <motion.button
              onClick={handleLoginClick}
              className="relative px-12 py-4 rounded-full font-bold text-lg transition-all"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)",
                border: "2px solid rgba(255, 215, 0, 0.5)",
                color: "#FFD700",
                backdropFilter: "blur(10px)",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(255, 215, 0, 0.6)",
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(255, 215, 0, 0.3)",
                  "0 0 40px rgba(255, 215, 0, 0.6)",
                  "0 0 20px rgba(255, 215, 0, 0.3)",
                ],
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                },
              }}
            >
              <LogIn className="inline mr-2 w-5 h-5" />
              로그인
            </motion.button>

            {/* 스킵 텍스트 */}
            <motion.p
              className="text-center text-xs text-gray-400 mt-3"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              또는 영상 끝까지 감상하세요
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 컨트롤 바 (상단 우측) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute top-8 right-8 z-10 flex items-center gap-3"
      >
        {/* 재생/일시정지 */}
        <motion.button
          onClick={() => {
            if (videoRef.current) {
              isPlaying
                ? videoRef.current.pause()
                : videoRef.current.play();
            }
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? (
            <Play className="w-5 h-5 text-white fill-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </motion.button>

        {/* 음소거 */}
        <motion.button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </motion.button>

        {/* 스킵 버튼 */}
        <motion.button
          onClick={handleSkip}
          className="px-4 py-2 rounded-full bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-500 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          건너뛰기
        </motion.button>
      </motion.div>

      {/* 진행률 바 */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
          style={{ width: `${progress}%` }}
        />
      </motion.div>

      {/* 비디오 인덱스 표시 */}
      <motion.div
        className="absolute bottom-8 right-8 text-sm text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {currentVideoIndex + 1} / {videoSources.length}
      </motion.div>

      {/* 배경 장식 (우측 상단) */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      />

      {/* 배경 장식 (좌측 하단) */}
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
}

export default CinematicIntro;
