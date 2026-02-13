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
  Crown,
  Diamond,
  Star,
  Gem,
  ChevronRight,
} from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const features = [
  {
    icon: Heart,
    title: "365일 건강 관리",
    desc: "매일의 건강 지표를 기록하고 추적하는 맞춤형 케어",
    detail: "혈압 · 혈당 · 체중 · 수면 · 식사",
  },
  {
    icon: Brain,
    title: "건강 및 체질 체크",
    desc: "10년 전부터 현재까지 시점별 건강 변화 분석",
    detail: "체질 분석 · 시점별 체크리스트",
  },
  {
    icon: Target,
    title: "AI 맞춤 건강 미션",
    desc: "개인 건강 상태에 맞춘 미션과 AI 분석",
    detail: "사진 인증 · AI 피드백 · 포인트 적립",
  },
  {
    icon: Leaf,
    title: "10단계 수련 프로그램",
    desc: "숨과 알아차림에서 시작하는 통합 웰니스",
    detail: "호흡 · 명상 · 요가 · 식치 · 케어",
  },
  {
    icon: Award,
    title: "승급 시스템",
    desc: "화이트벨트에서 그랜드마스터까지",
    detail: "9단계 벨트 · 10단 체계",
  },
  {
    icon: Shield,
    title: "1:1 전담 매니저",
    desc: "전문 건강 매니저의 맞춤형 상담",
    detail: "실시간 상담 · 맞춤 프로그램",
  },
];

const tierShowcase = [
  { name: "Silver", kr: "실버", icon: Shield, gradient: "from-gray-300 to-gray-400", text: "text-gray-700" },
  { name: "Gold", kr: "골드", icon: Star, gradient: "from-amber-400 to-amber-600", text: "text-amber-800" },
  { name: "Blue Sapphire", kr: "블루사파이어", icon: Gem, gradient: "from-blue-400 to-blue-600", text: "text-blue-800" },
  { name: "Diamond", kr: "다이아몬드", icon: Diamond, gradient: "from-cyan-300 to-blue-500", text: "text-blue-800" },
  { name: "Platinum", kr: "플래티넘", icon: Crown, gradient: "from-purple-400 to-purple-700", text: "text-purple-800" },
  { name: "Black Platinum", kr: "블랙플래티넘", icon: Crown, gradient: "from-gray-800 to-black", text: "text-gray-200" },
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
      {/* ═══ Hero Section - Resort Style ═══ */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-end">
        {/* Background layers */}
        <div className="absolute inset-0 gradient-resort" />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 70% 20%, oklch(0.95 0.03 75) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 20% 80%, oklch(0.90 0.05 60) 0%, transparent 50%)
            `,
          }}
        />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, oklch(1 0 0 / 5%) 40px, oklch(1 0 0 / 5%) 41px)`,
          }}
        />

        <div className="relative w-full px-6 pt-16 pb-12 max-w-lg mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15">
                <span className="text-lg font-semibold text-white/90 font-resort">G</span>
              </div>
              <div>
                <p className="text-white/50 text-[10px] font-light tracking-[0.25em] uppercase">Global Leaders Wellness Association</p>
                <p className="text-white/80 text-xs font-light tracking-wider mt-0.5">GLWA 웰니스 협회</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Text - Aman-style minimal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12"
          >
            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-4 font-light">Your Personal Wellness Concierge</p>
            <h1 className="text-4xl font-light text-white leading-[1.3] tracking-tight font-resort mb-6">
              365일,<br />
              당신만의<br />
              <span className="font-medium italic">건강 주치의</span>
            </h1>
            <p className="text-white/55 text-sm leading-relaxed font-light max-w-[280px]">
              동양 철학과 현대 의학의 조화.<br />
              개인 맞춤형 헬스케어 매니저가<br />
              당신의 건강한 삶을 설계합니다.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-10"
          >
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-white/95 text-foreground hover:bg-white shadow-lg font-medium tracking-wide px-8 h-12 rounded-xl"
            >
              {user ? "대시보드로 이동" : "시작하기"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Stats - minimal resort style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-8"
          >
            {[
              { value: "365", unit: "일", label: "건강 관리" },
              { value: "10", unit: "단계", label: "수련 프로그램" },
              { value: "1:1", unit: "", label: "전담 매니저" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-white/90 text-xl font-light font-resort">
                  {stat.value}<span className="text-sm text-white/50 ml-0.5">{stat.unit}</span>
                </p>
                <p className="text-white/35 text-[10px] tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Philosophy Section ═══ */}
      <section className="py-16 px-6 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-muted-foreground/50 text-[10px] tracking-[0.3em] uppercase mb-3">Philosophy</p>
          <h2 className="text-2xl font-light text-foreground font-resort mb-4 tracking-tight">
            진정한 <span className="italic">웰니스</span>의 시작
          </h2>
          <div className="divider-resort w-12 mx-auto mb-6" />
          <p className="text-muted-foreground text-sm leading-relaxed font-light">
            몸과 마음의 균형을 찾는 여정.<br />
            숨과 알아차림에서 시작하여<br />
            다시 깊고 고운 숨으로 돌아오는<br />
            10단계 통합 웰니스 프로그램.
          </p>
        </motion.div>
      </section>

      {/* ═══ Features Section - Resort Grid ═══ */}
      <section className="py-12 px-6 max-w-lg mx-auto">
        <div className="mb-8">
          <p className="text-muted-foreground/50 text-[10px] tracking-[0.3em] uppercase mb-2">Services</p>
          <h2 className="text-xl font-light text-foreground font-resort tracking-tight">
            프리미엄 <span className="italic">서비스</span>
          </h2>
        </div>
        <div className="space-y-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="group flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/40 hover:border-border/80 hover:shadow-sm transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl gradient-warm flex items-center justify-center shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1 text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5 tracking-wide">{f.detail}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 mt-1 shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ 10-Step Program - Resort Timeline ═══ */}
      <section className="py-16 gradient-sand">
        <div className="px-6 max-w-lg mx-auto">
          <div className="mb-10 text-center">
            <p className="text-muted-foreground/50 text-[10px] tracking-[0.3em] uppercase mb-2">Program</p>
            <h2 className="text-xl font-light text-foreground font-resort tracking-tight">
              10단계 <span className="italic">수련 프로그램</span>
            </h2>
            <div className="divider-resort w-12 mx-auto mt-4" />
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border/60" />
            <div className="space-y-4">
              {[
                { step: 1, name: "숨과 알아차림", icon: "🌬️" },
                { step: 2, name: "숨과 진정한 쉼/정", icon: "🕊️" },
                { step: 3, name: "좋은 잠", icon: "🌙" },
                { step: 4, name: "스트레칭/요가", icon: "🧘" },
                { step: 5, name: "명상", icon: "☯️" },
                { step: 6, name: "좋은 자세/건강 걸음", icon: "🚶" },
                { step: 7, name: "운동/취미/교류", icon: "🏃" },
                { step: 8, name: "식치 (염증 관리)", icon: "🍃" },
                { step: 9, name: "호르몬/골·관절 케어", icon: "💪" },
                { step: 10, name: "다시 돌아온 깊고 고운 숨", icon: "🌸" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-4 relative">
                  <div className="w-11 h-11 rounded-full bg-card border border-border/60 flex items-center justify-center text-base shrink-0 z-10 shadow-sm">
                    {s.icon}
                  </div>
                  <div className="flex-1 py-2">
                    <span className="text-[9px] font-medium text-primary/60 tracking-[0.2em] uppercase">Step {s.step}</span>
                    <p className="text-sm font-medium text-foreground mt-0.5">{s.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Mission Center - Core Content Banner ═══ */}
      <section className="py-16 px-6">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8 text-center">
              <p className="text-muted-foreground/50 text-[10px] tracking-[0.3em] uppercase mb-2">Core Mission</p>
              <h2 className="text-xl font-light text-foreground font-resort tracking-tight">
                건강 <span className="italic">미션 센터</span>
              </h2>
              <div className="divider-resort w-12 mx-auto mt-4 mb-3" />
              <p className="text-xs text-muted-foreground font-light">기간별 맞춤형 미션으로 건강한 습관을 만들어보세요</p>
            </div>

            {/* Mission Period Cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { period: "오늘의 미션", icon: "⚡", color: "from-amber-400 to-orange-500", pts: "10P" },
                { period: "주간 미션", icon: "📅", color: "from-blue-400 to-blue-600", pts: "50P" },
                { period: "2주간 미션", icon: "🎯", color: "from-teal-400 to-emerald-600", pts: "100P" },
              ].map((m) => (
                <div key={m.period} className="text-center p-3 rounded-xl bg-card border border-border/40 hover:border-border/80 hover:shadow-sm transition-all cursor-pointer" onClick={() => setLocation('/missions')}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mx-auto mb-2 text-lg shadow-sm`}>
                    {m.icon}
                  </div>
                  <p className="text-[11px] font-medium text-foreground">{m.period}</p>
                  <p className="text-[9px] text-primary/70 font-medium mt-0.5">{m.pts}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { period: "1개월", icon: "🏆", color: "from-violet-400 to-purple-600", pts: "200P" },
                { period: "3개월", icon: "💎", color: "from-pink-400 to-rose-600", pts: "500P" },
                { period: "6개월", icon: "👑", color: "from-amber-500 to-yellow-600", pts: "1,000P" },
                { period: "1년", icon: "⭐", color: "from-gray-700 to-gray-900", pts: "2,000P" },
              ].map((m) => (
                <div key={m.period} className="text-center p-3 rounded-xl bg-card border border-border/40 hover:border-border/80 hover:shadow-sm transition-all cursor-pointer" onClick={() => setLocation('/missions')}>
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center mx-auto mb-2 text-base shadow-sm`}>
                    {m.icon}
                  </div>
                  <p className="text-[10px] font-medium text-foreground">{m.period}</p>
                  <p className="text-[9px] text-primary/70 font-medium mt-0.5">{m.pts}</p>
                </div>
              ))}
            </div>

            {/* CTA to Mission Page */}
            <Button
              onClick={() => setLocation('/missions')}
              className="w-full gradient-warm text-white border-0 h-12 rounded-xl font-medium tracking-wide shadow-md"
            >
              <Target className="w-4 h-4 mr-2" />
              미션 센터 바로가기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══ Membership Tiers - Luxury Showcase ═══ */}
      <section className="py-16 px-6 max-w-lg mx-auto">
        <div className="mb-10 text-center">
          <p className="text-muted-foreground/50 text-[10px] tracking-[0.3em] uppercase mb-2">Membership</p>
          <h2 className="text-xl font-light text-foreground font-resort tracking-tight">
            프리미엄 <span className="italic">멤버십</span>
          </h2>
          <div className="divider-resort w-12 mx-auto mt-4 mb-4" />
          <p className="text-xs text-muted-foreground font-light">8등급 프리미엄 멤버십으로 차별화된 혜택을 경험하세요</p>
        </div>

        {/* Tier cards - horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tierShowcase.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="snap-center shrink-0 w-[140px]"
            >
              <div className={`h-[180px] rounded-2xl bg-gradient-to-br ${tier.gradient} p-4 flex flex-col justify-between shadow-lg`}>
                <tier.icon className={`w-6 h-6 ${tier.name === 'Black Platinum' ? 'text-white/70' : 'text-white/80'}`} />
                <div>
                  <p className={`text-[9px] tracking-[0.15em] uppercase ${tier.name === 'Black Platinum' ? 'text-white/50' : 'text-white/60'}`}>{tier.name}</p>
                  <p className={`text-sm font-medium mt-0.5 ${tier.name === 'Black Platinum' ? 'text-white' : 'text-white'}`}>{tier.kr}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full mt-6 h-11 rounded-xl border-border/60 text-sm font-light tracking-wide"
          onClick={() => setLocation("/membership")}
        >
          멤버십 센터 바로가기
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </section>

      {/* ═══ CTA Footer - Resort Style ═══ */}
      <section className="py-16 px-6 max-w-lg mx-auto">
        <div className="gradient-resort rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 30px, oklch(1 0 0 / 8%) 30px, oklch(1 0 0 / 8%) 31px)`,
            }}
          />
          <div className="relative">
            <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-3">Begin Your Journey</p>
            <h2 className="text-2xl font-light text-white font-resort mb-3 tracking-tight">
              건강한 삶의 <span className="italic">시작</span>
            </h2>
            <p className="text-white/50 text-sm mb-8 font-light">
              지금 GLWA 웰니스와 함께<br />평생 건강 프로젝트를 시작하세요.
            </p>
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-white/95 text-foreground hover:bg-white shadow-lg font-medium tracking-wide px-8 h-12 rounded-xl"
            >
              {user ? "대시보드로 이동" : "무료로 시작하기"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-10 border-t border-border/30 max-w-lg mx-auto px-6">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground/40 tracking-[0.2em] uppercase">
            GLWA Global Leaders Wellness Association
          </p>
          <p className="text-[9px] text-muted-foreground/30 mt-2 font-light">
            본 서비스는 의료 행위가 아닌 생활 건강 관리 서비스입니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
