/**
 * 🏛️ GLWA 첫 화면 (Landing Page)
 * 
 * Healthcare Widget 영상 배경
 * 블랙 & 골드 럭셔리 테마
 * - 영상 루프 배경
 * - 로그인/회원가입 버튼
 * - 앱 소개 텍스트
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Zap, Heart, Smartphone } from "lucide-react";
import { useLocation } from "wouter";

export function LandingPage() {
  const [, setLocation] = useLocation();
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    // 비디오 미리 로드
    const video = document.getElementById("intro-video") as HTMLVideoElement;
    if (video) {
      video.addEventListener("canplay", () => setVideoReady(true));
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-black overflow-hidden">
      {/* 배경 영상 */}
      <div className="absolute inset-0 w-full h-full">
        {/* 영상 배경 */}
        <video
          id="intro-video"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/videos/clip_01_intro.mp4"
        />

        {/* 오버레이 그래디언트 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

        {/* 블랙 마블 효과 */}
        <div className="absolute inset-0 marble-effect opacity-20" />
      </div>

      {/* 콘텐츠 */}
      <div className="relative w-full h-full flex flex-col items-center justify-center px-4 py-8">
        {/* 로고 & 제목 */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
              G
            </span>
            <span className="text-white">LWA</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4 drop-shadow-lg">
            글로벌 리더스 웰니스
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow-md">
            AI 정밀 분석으로 당신의 건강을 관리합니다
          </p>

          {/* 특징 아이콘 */}
          <div className="flex justify-center gap-8 mb-12 flex-wrap">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-sm text-gray-300">정밀 분석</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-sm text-gray-300">모바일 최적화</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-sm text-gray-300">실시간 피드백</span>
            </motion.div>
          </div>
        </motion.div>

        {/* 버튼 그룹 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 mb-12"
        >
          <button
            onClick={() => setLocation("/login")}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            로그인
          </button>

          <button
            onClick={() => setLocation("/signup")}
            className="px-8 py-4 bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold rounded-lg transition-all transform hover:scale-105"
          >
            회원가입
          </button>
        </motion.div>

        {/* 소개 텍스트 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl text-center text-gray-300 mb-12"
        >
          <p className="text-sm md:text-base leading-relaxed">
            GLWA는 AI 기반의 정밀한 건강 분석 시스템입니다.
            <br />
            당신의 건강 데이터를 실시간으로 분석하고,
            <br />
            맞춤형 건강 관리 프로그램을 제공합니다.
          </p>
        </motion.div>

        {/* 스크롤 힌트 */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-yellow-400" />
        </motion.div>
      </div>

      {/* 하단 정보 섹션 */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full py-20 px-4 bg-gradient-to-t from-black/80 to-transparent"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 기능 1 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <Heart className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">건강 분석</h3>
            <p className="text-gray-400">
              AI가 당신의 건강 데이터를 정밀하게 분석합니다.
            </p>
          </div>

          {/* 기능 2 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">맞춤형 코칭</h3>
            <p className="text-gray-400">
              당신의 상태에 맞는 맞춤형 건강 코칭을 받습니다.
            </p>
          </div>

          {/* 기능 3 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">실시간 추적</h3>
            <p className="text-gray-400">
              언제 어디서나 실시간으로 건강을 추적합니다.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
