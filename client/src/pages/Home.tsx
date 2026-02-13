import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Heart,
  Shield,
  Target,
  Award,
  ArrowRight,
  Sparkles,
  Activity,
  Brain,
  Leaf,
} from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const features = [
  {
    icon: Heart,
    title: "365일 건강 관리",
    desc: "매일 혈압, 혈당, 체중 등 핵심 건강 지표를 기록하고 추적합니다.",
  },
  {
    icon: Brain,
    title: "동양의학 체질 분석",
    desc: "20년 전부터 현재까지 시점별 건강 진단과 체질 분석을 제공합니다.",
  },
  {
    icon: Target,
    title: "맞춤형 건강 미션",
    desc: "개인 건강 상태에 맞춘 미션을 수행하고 AI가 분석합니다.",
  },
  {
    icon: Shield,
    title: "근골격계 집중 관리",
    desc: "통증, 협착, 재활을 위한 맞춤 운동 프로그램을 제공합니다.",
  },
  {
    icon: Leaf,
    title: "5단계 건강 프로그램",
    desc: "숨 → 쉼 → 자세 → 스트레칭 → 정신건강 단계별 커리큘럼",
  },
  {
    icon: Award,
    title: "승급 시스템",
    desc: "화이트벨트에서 그랜드마스터까지, 평생 건강 프로젝트를 추적합니다.",
  },
];

const grades = [
  { name: "평회원", price: "무료", payback: "50%", color: "bg-secondary" },
  { name: "정회원", price: "월 3~10만원", payback: "60%", color: "gradient-warm" },
  { name: "VIP", price: "월 30~100만원", payback: "70%", color: "gradient-gold" },
  { name: "플래티넘", price: "월 300만원", payback: "최대 100%", color: "gradient-warm" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const handleStart = () => {
    if (user) {
      setLocation("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-warm opacity-95" />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, oklch(0.95 0.05 80) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, oklch(0.90 0.08 60) 0%, transparent 40%)`,
          }}
        />
        <div className="relative px-6 pt-12 pb-16 max-w-lg mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-xl font-bold text-white" style={{ fontFamily: "'Noto Serif KR', serif" }}>G</span>
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium tracking-wider">GLOBAL LEADERS WELLNESS</p>
              <p className="text-white text-sm font-semibold">GLWA 웰니스 협회</p>
            </div>
          </motion.div>

          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              365일<br />
              당신만의<br />
              <span className="text-white/90">건강 주치의</span>
            </h1>
            <p className="text-white/80 text-sm leading-relaxed mb-8">
              동양 철학과 현대 의학의 조화로운 만남.<br />
              개인 맞춤형 헬스케어 매니저가<br />
              당신의 건강한 삶을 설계합니다.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex gap-3"
          >
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg flex-1 font-semibold"
            >
              {user ? "대시보드로 이동" : "시작하기"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 grid grid-cols-3 gap-4"
          >
            {[
              { value: "365일", label: "건강 관리" },
              { value: "5단계", label: "프로그램" },
              { value: "1:1", label: "전담 매니저" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-white text-lg font-bold">{stat.value}</p>
                <p className="text-white/60 text-xs">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-12 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            핵심 기능
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Program Steps */}
      <section className="px-6 py-12 bg-accent/30 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            5단계 건강 프로그램
          </h2>
        </div>
        <div className="space-y-3">
          {[
            { step: 1, name: "숨 (呼吸)", desc: "호흡 인지 → 호흡 훈련", icon: "🌬️" },
            { step: 2, name: "쉼 (休息)", desc: "수면과 휴식의 질 향상", icon: "🌙" },
            { step: 3, name: "자세 (姿勢)", desc: "앉기, 서기, 걷기 교정", icon: "🧘" },
            { step: 4, name: "스트레칭/요가", desc: "유연성과 균형 강화", icon: "🌿" },
            { step: 5, name: "정신건강 (精神)", desc: "균형, 절제, 감사, 선(善)", icon: "☯️" },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
                {s.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    STEP {s.step}
                  </span>
                  <h3 className="font-semibold text-sm">{s.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Membership Grades */}
      <section className="px-6 py-12 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            회원 등급
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {grades.map((g) => (
            <div key={g.name} className="p-4 rounded-xl bg-card border border-border/50 shadow-sm text-center">
              <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center ${g.color}`}>
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm mb-1">{g.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{g.price}</p>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                페이백 {g.payback}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-6 py-12 max-w-lg mx-auto">
        <div className="gradient-warm rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            건강한 삶의 시작
          </h2>
          <p className="text-white/80 text-sm mb-6">
            지금 GLWA 웰니스와 함께<br />평생 건강 프로젝트를 시작하세요.
          </p>
          <Button
            onClick={handleStart}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold"
          >
            {user ? "대시보드로 이동" : "무료로 시작하기"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border/50 max-w-lg mx-auto">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            GLWA 글로벌 리더스 웰니스 멤버 협회
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            본 서비스는 의료 행위가 아닌 생활 건강 관리 서비스입니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
