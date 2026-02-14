import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  Home,
  ShoppingBag,
  MessageCircle,
  Users,
  User,
  Loader2,
  Sparkles,
  Settings,
} from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import TopInfoBar from "./TopInfoBar";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: User, label: t.nav.my, path: "/profile" },
    { icon: Sparkles, label: t.nav.mission, path: "/missions" },
    { icon: ShoppingBag, label: t.nav.shop, path: "/shop" },
    { icon: Users, label: t.nav.community, path: "/community" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-resort flex items-center justify-center shadow-lg">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground/60 tracking-wider font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-8 max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-2xl gradient-resort flex items-center justify-center shadow-xl">
            <span className="text-2xl font-medium text-white font-resort tracking-wider">G</span>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase mb-2">Global Leaders Wellness</p>
            <h1 className="text-xl font-medium font-resort tracking-tight mb-3">GLWA Wellness</h1>
            <p className="text-sm text-muted-foreground/70 font-light leading-relaxed">
              365일 개인 맞춤 헬스케어 매니저에<br />접속하려면 로그인이 필요합니다.
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            size="lg"
            className="w-full gradient-resort text-white border-0 shadow-lg rounded-xl h-12 font-medium tracking-wide"
          >
            {t.common.login || "로그인하기"}
          </Button>
        </div>
      </div>
    );
  }

  const pagesWithOwnHeader = ["/shop", "/cart", "/community"];
  const hideTopHeader = pagesWithOwnHeader.some(p => location.startsWith(p));
  const isHomePage = location === "/dashboard" || location === "/";

  return (
    <div className="min-h-screen bg-background">
      {/* Top header - 방안 B: 홈 버튼(좌상단) + 설정 버튼(우상단) */}
      {!hideTopHeader && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg shadow-sm border-b border-border/30">
          <div className="flex items-center justify-between px-4 h-14">
            {/* 실시간 시간, 비트코인, 날씨 */}
            <TopInfoBar />
            
            {/* 설정 버튼 (좌상단) - 귀여운 톱니바퀴 */}
            <button
              onClick={() => setLocation("/settings")}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 duration-300 hover:rotate-90"
              title="설정"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {!isHomePage && (
              <button 
                onClick={() => setLocation("/dashboard")} 
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-bold">{t.nav.home}</span>
              </button>
            )}
            
            {/* 홈 화면일 때는 로고 표시 */}
            {isHomePage && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg gradient-resort flex items-center justify-center">
                  <span className="text-[10px] font-medium text-white font-resort tracking-wider">G</span>
                </div>
                <div>
                  <span className="font-medium text-sm font-resort tracking-tight">GLWA</span>
                  <span className="text-[8px] text-muted-foreground/40 ml-1.5 tracking-wider uppercase font-light">Wellness</span>
                </div>
              </div>
            )}
            
            <div className="flex-1"></div>
            
            {/* 설정 버튼 (우상단) - 항상 표시 */}
            <button
              onClick={() => setLocation("/settings")}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:rotate-90 duration-300"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-bold">{t.nav.settings}</span>
            </button>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={hideTopHeader ? "" : "px-4 py-4 pb-20"}>
        {children}
      </main>

      {/* Bottom navigation - Resort Style */}
      <nav className="mobile-nav">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const isActive = location === item.path || location.startsWith(item.path + "/");
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                <span className={`text-[10px] ${isActive ? "font-medium" : "font-light"}`}>{item.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
