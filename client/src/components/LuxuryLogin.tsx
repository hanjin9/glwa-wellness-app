import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Chrome, Apple } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function LuxuryLogin() {
  const loginUrl = getLoginUrl();
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  // 자동 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  return (
    <div className="min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-[#d4af37]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-radial from-[#f4d03f]/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center shadow-2xl">
            <span className="text-4xl font-bold text-black font-display">G</span>
          </div>
        </motion.div>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-widest text-[#d4af37] uppercase mb-2 font-light">
            Global Leaders Wellness Association
          </p>
          <h1 className="text-3xl font-bold text-white mb-2 font-display">
            GLWA
          </h1>
          <p className="text-sm text-[#d4af37]/70">
            365일 개인 맞춤 헬스케어 매니저
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center mb-8 space-y-2"
        >
          <p className="text-sm text-[#d4af37]/80 leading-relaxed">
            성공한 리더들을 위한 프리미엄 웰니스 플랫폼
          </p>
          <p className="text-xs text-[#d4af37]/60">
            AI 기반 맞춤 건강 관리와 럭셔리 경험
          </p>
        </motion.div>

        {/* Login Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-3"
        >
          {/* Google Login */}
          <motion.a
            href={loginUrl}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-white text-black font-semibold rounded-lg hover:shadow-2xl transition-all duration-300"
          >
            <Chrome className="w-5 h-5" />
            Google로 시작하기
          </motion.a>

          {/* Apple Login (Placeholder) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-black border-2 border-[#d4af37] text-[#d4af37] font-semibold rounded-lg hover:bg-[#d4af37]/10 transition-all duration-300"
          >
            <Apple className="w-5 h-5" />
            Apple로 시작하기
          </motion.button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center gap-3 my-6"
        >
          <div className="flex-1 h-px bg-[#d4af37]/20" />
          <span className="text-xs text-[#d4af37]/50">또는</span>
          <div className="flex-1 h-px bg-[#d4af37]/20" />
        </motion.div>

        {/* Email Login (Placeholder) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-6 py-4 bg-gradient-to-r from-[#d4af37]/20 to-[#f4d03f]/20 border border-[#d4af37]/40 text-[#d4af37] font-semibold rounded-lg hover:border-[#d4af37]/60 transition-all duration-300"
        >
          이메일로 로그인
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-center mt-8 text-xs text-[#d4af37]/50 space-y-1"
        >
          <p>계속 진행하면 서비스 약관에 동의합니다</p>
          <p className="text-[#d4af37]/40">
            개인정보 보호정책 · 이용약관
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
