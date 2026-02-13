import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingBag,
  MessageCircle,
  Users,
  User,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";

const navItems = [
  { icon: LayoutDashboard, label: "홈", path: "/dashboard" },
  { icon: ShoppingBag, label: "쇼핑", path: "/shop" },
  { icon: MessageCircle, label: "상담", path: "/chat" },
  { icon: Users, label: "커뮤니티", path: "/community" },
  { icon: User, label: "MY", path: "/profile" },
];

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full gradient-warm flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-full gradient-warm flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white font-serif">G</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold mb-2">GLWA 웰니스</h1>
            <p className="text-sm text-muted-foreground">
              365일 개인 맞춤 헬스케어 매니저에 접속하려면 로그인이 필요합니다.
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            size="lg"
            className="w-full gradient-warm text-white border-0 shadow-lg"
          >
            로그인하기
          </Button>
        </div>
      </div>
    );
  }

  // Determine if current page should hide the top header (pages with their own headers)
  const pagesWithOwnHeader = ["/shop", "/cart", "/community"];
  const hideTopHeader = pagesWithOwnHeader.some(p => location.startsWith(p));

  return (
    <div className="min-h-screen bg-background">
      {/* Top header - only show on pages without custom headers */}
      {!hideTopHeader && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => setLocation("/dashboard")} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-warm flex items-center justify-center">
                <span className="text-xs font-bold text-white font-serif">G</span>
              </div>
              <span className="font-semibold text-sm">GLWA 웰니스</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLocation("/rank")}
                className="text-xs px-3 py-1.5 rounded-full bg-accent text-accent-foreground font-medium"
              >
                승급 현황
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={hideTopHeader ? "" : "px-4 py-4 pb-20"}>
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="mobile-nav">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const isActive = location === item.path || location.startsWith(item.path + "/");
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
