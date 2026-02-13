import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, Star, Package, Search, ChevronRight, ChevronLeft,
  Sparkles, Heart, Leaf, Pill, Dumbbell, Activity,
  TrendingUp, Clock, Eye, Filter, X, ArrowUpDown,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { motion, AnimatePresence } from "framer-motion";

/* ─── 4대 카테고리 정의 ─── */
const MAIN_CATEGORIES = [
  {
    id: "greenfarm",
    name: "그린팜",
    subtitle: "유기농 제품 · 식재료",
    icon: Leaf,
    gradient: "from-green-600 via-emerald-600 to-teal-700",
    lightBg: "from-green-50 to-emerald-50",
    accentColor: "text-green-700",
    borderColor: "border-green-200",
    badgeColor: "bg-green-100 text-green-800",
    description: "자연에서 온 신선한 유기농 식재료와 건강 식품",
  },
  {
    id: "supplement",
    name: "프리미엄 건강보조제품",
    subtitle: "건강기능식품 · 영양제",
    icon: Pill,
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
    lightBg: "from-violet-50 to-purple-50",
    accentColor: "text-violet-700",
    borderColor: "border-violet-200",
    badgeColor: "bg-violet-100 text-violet-800",
    description: "과학적으로 검증된 프리미엄 건강보조식품",
  },
  {
    id: "fitness",
    name: "운동 · 재활용품",
    subtitle: "아이디어 제품 · 신기술 소형 제품",
    icon: Dumbbell,
    gradient: "from-orange-500 via-amber-600 to-yellow-700",
    lightBg: "from-orange-50 to-amber-50",
    accentColor: "text-orange-700",
    borderColor: "border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800",
    description: "혁신적인 운동기구와 재활 전문 용품",
  },
  {
    id: "medicare",
    name: "메디케어",
    subtitle: "생활케어 · 디바이스 · 중대형 기기",
    icon: Activity,
    gradient: "from-sky-600 via-blue-600 to-indigo-700",
    lightBg: "from-sky-50 to-blue-50",
    accentColor: "text-sky-700",
    borderColor: "border-sky-200",
    badgeColor: "bg-sky-100 text-sky-800",
    description: "스마트 헬스케어 디바이스와 의료급 기기",
  },
];

/* ─── 카테고리별 샘플 상품 ─── */
const SAMPLE_PRODUCTS = [
  // 그린팜
  { id: 1, categoryId: "greenfarm", name: "유기농 녹즙 세트 30포", description: "GAP 인증 유기농 케일·시금치·브로콜리 착즙", price: 89000, salePrice: 69000, imageUrl: "", rating: 4.9, reviewCount: 324, tags: ["BEST", "유기농"], seller: "그린팜 직영" },
  { id: 2, categoryId: "greenfarm", name: "6년근 홍삼 진액 스틱", description: "풍기 인삼 100% 6년근 농축 홍삼액 30포", price: 128000, salePrice: 98000, imageUrl: "", rating: 4.8, reviewCount: 512, tags: ["인기", "홍삼"], seller: "정관장 파트너" },
  { id: 3, categoryId: "greenfarm", name: "제주 감귤 콜드프레스 주스", description: "무농약 제주 감귤 100% 착즙 주스 12병", price: 48000, salePrice: 38000, imageUrl: "", rating: 4.7, reviewCount: 189, tags: ["NEW"], seller: "제주팜" },
  { id: 4, categoryId: "greenfarm", name: "프리미엄 견과류 선물세트", description: "호두·아몬드·캐슈넛·마카다미아 7종 세트", price: 45000, salePrice: 35000, imageUrl: "", rating: 4.6, reviewCount: 267, tags: ["선물"], seller: "넛츠팜" },
  // 프리미엄 건강보조제품
  { id: 5, categoryId: "supplement", name: "프로바이오틱스 유산균 60캡슐", description: "100억 CFU 장건강 프리미엄 유산균", price: 52000, salePrice: 39000, imageUrl: "", rating: 4.9, reviewCount: 876, tags: ["BEST", "장건강"], seller: "바이오랩" },
  { id: 6, categoryId: "supplement", name: "비타민D 5000IU + 아연", description: "면역력 강화 고함량 비타민D·아연 복합제", price: 38000, salePrice: 28000, imageUrl: "", rating: 4.8, reviewCount: 445, tags: ["면역"], seller: "뉴트리원" },
  { id: 7, categoryId: "supplement", name: "오메가3 rTG 1200mg", description: "초임계 추출 rTG 오메가3 90캡슐", price: 65000, salePrice: 49000, imageUrl: "", rating: 4.7, reviewCount: 623, tags: ["인기"], seller: "오메가팜" },
  { id: 8, categoryId: "supplement", name: "콜라겐 펩타이드 파우더", description: "저분자 피쉬콜라겐 3000mg 30포", price: 42000, salePrice: 32000, imageUrl: "", rating: 4.8, reviewCount: 334, tags: ["피부"], seller: "뷰티랩" },
  // 운동·재활용품
  { id: 9, categoryId: "fitness", name: "프리미엄 요가매트 TPE 8mm", description: "친환경 TPE 소재 미끄럼방지 양면 요가매트", price: 69000, salePrice: 49000, imageUrl: "", rating: 4.8, reviewCount: 234, tags: ["BEST"], seller: "요가플러스" },
  { id: 10, categoryId: "fitness", name: "근막이완 폼롤러 3종 세트", description: "고밀도 EVA 폼롤러 + 마사지볼 + 스틱", price: 45000, salePrice: 35000, imageUrl: "", rating: 4.7, reviewCount: 178, tags: ["재활"], seller: "핏케어" },
  { id: 11, categoryId: "fitness", name: "스마트 밴드 저항 세트", description: "5단계 강도 라텍스프리 저항밴드 세트", price: 32000, salePrice: 24000, imageUrl: "", rating: 4.6, reviewCount: 145, tags: ["NEW"], seller: "핏케어" },
  { id: 12, categoryId: "fitness", name: "EMS 복부 자극기", description: "미세전류 EMS 근육 자극 패드 (충전식)", price: 89000, salePrice: 69000, imageUrl: "", rating: 4.5, reviewCount: 98, tags: ["신기술"], seller: "테크핏" },
  // 메디케어
  { id: 13, categoryId: "medicare", name: "스마트 혈압계 (블루투스)", description: "앱 연동 자동 혈압 측정기 팔뚝형", price: 89000, salePrice: 69000, imageUrl: "", rating: 4.9, reviewCount: 567, tags: ["BEST", "필수"], seller: "오므론 파트너" },
  { id: 14, categoryId: "medicare", name: "체성분 분석 스마트 체중계", description: "BIA 방식 12항목 측정 앱 연동 체중계", price: 59000, salePrice: 45000, imageUrl: "", rating: 4.8, reviewCount: 423, tags: ["인기"], seller: "인바디 파트너" },
  { id: 15, categoryId: "medicare", name: "적외선 온열 찜질기", description: "원적외선 탄소섬유 히팅 패드 (허리/어깨)", price: 78000, salePrice: 59000, imageUrl: "", rating: 4.7, reviewCount: 289, tags: ["통증"], seller: "메디웜" },
  { id: 16, categoryId: "medicare", name: "산소포화도 측정기", description: "의료급 SpO2 측정 핑거 옥시미터", price: 35000, salePrice: 25000, imageUrl: "", rating: 4.8, reviewCount: 345, tags: ["필수"], seller: "메디체크" },
];

type SortOption = "popular" | "price_low" | "price_high" | "rating" | "newest";

export default function Shop() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [recentViewed, setRecentViewed] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof SAMPLE_PRODUCTS[0] | null>(null);

  const addToCart = trpc.shop.addToCart.useMutation({
    onSuccess: () => toast.success("장바구니에 추가되었습니다"),
    onError: () => toast.error("장바구니 추가에 실패했습니다"),
  });

  const selectedCategory = MAIN_CATEGORIES.find(c => c.id === selectedCategoryId);

  const filteredProducts = useMemo(() => {
    let products = SAMPLE_PRODUCTS;
    if (selectedCategoryId) products = products.filter(p => p.categoryId === selectedCategoryId);
    if (searchQuery) products = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // 정렬
    switch (sortBy) {
      case "price_low": return [...products].sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      case "price_high": return [...products].sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      case "rating": return [...products].sort((a, b) => b.rating - a.rating);
      case "newest": return [...products].sort((a, b) => b.id - a.id);
      default: return [...products].sort((a, b) => b.reviewCount - a.reviewCount);
    }
  }, [selectedCategoryId, searchQuery, sortBy]);

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    addToCart.mutate({ productId, quantity: 1 });
  };

  const toggleWishlist = (productId: number) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
    toast.success(wishlist.includes(productId) ? "위시리스트에서 제거했습니다" : "위시리스트에 추가했습니다");
  };

  const viewProduct = (product: typeof SAMPLE_PRODUCTS[0]) => {
    setSelectedProduct(product);
    setRecentViewed(prev => [product.id, ...prev.filter(id => id !== product.id)].slice(0, 10));
  };

  const formatPrice = (price: number) => price.toLocaleString() + "원";
  const getDiscount = (price: number, salePrice: number) => Math.round((1 - salePrice / price) * 100);

  const sortLabels: Record<SortOption, string> = {
    popular: "인기순", price_low: "낮은 가격순", price_high: "높은 가격순",
    rating: "평점순", newest: "최신순",
  };

  /* ─── 상품 상세 모달 ─── */
  if (selectedProduct) {
    const p = selectedProduct;
    const cat = MAIN_CATEGORIES.find(c => c.id === p.categoryId);
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* 상품 이미지 영역 */}
        <div className={`relative bg-gradient-to-br ${cat?.lightBg || "from-gray-50 to-gray-100"} pt-12 pb-8`}>
          <button
            onClick={() => setSelectedProduct(null)}
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => toggleWishlist(p.id)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <Heart className={`w-5 h-5 ${wishlist.includes(p.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>
          <div className="flex items-center justify-center h-48">
            <Package className={`w-24 h-24 ${cat?.accentColor || "text-gray-300"} opacity-30`} />
          </div>
          {p.tags.length > 0 && (
            <div className="absolute bottom-4 left-4 flex gap-1.5">
              {p.tags.map(tag => (
                <Badge key={tag} className={`${cat?.badgeColor || "bg-gray-100 text-gray-800"} text-[10px] font-semibold`}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="px-5 pt-5 space-y-5">
          <div>
            <p className={`text-[11px] font-medium ${cat?.accentColor || "text-gray-500"} mb-1`}>{p.seller}</p>
            <h1 className="text-xl font-bold leading-tight">{p.name}</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.description}</p>
          </div>

          {/* 평점 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(p.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-sm font-semibold">{p.rating}</span>
            <span className="text-xs text-muted-foreground">리뷰 {p.reviewCount.toLocaleString()}개</span>
          </div>

          {/* 가격 */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border">
            {p.salePrice && (
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-red-500 text-white text-xs font-bold px-2">{getDiscount(p.price, p.salePrice)}% OFF</Badge>
                <span className="text-sm text-muted-foreground line-through">{formatPrice(p.price)}</span>
              </div>
            )}
            <p className="text-2xl font-bold tracking-tight">{formatPrice(p.salePrice || p.price)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">GLWA 회원 특별가 · 무료배송</p>
          </div>

          {/* 배송/혜택 정보 */}
          <div className="space-y-2.5">
            {[
              { icon: "🚚", label: "배송", value: "무료배송 · 오늘 출발" },
              { icon: "🔄", label: "교환/반품", value: "30일 이내 무료 반품" },
              { icon: "💳", label: "결제혜택", value: "카드 최대 5% 추가 할인" },
              { icon: "🎁", label: "적립", value: "구매 시 1% GLWA 포인트 적립" },
            ].map(info => (
              <div key={info.label} className="flex items-center gap-3 text-xs">
                <span className="text-base">{info.icon}</span>
                <span className="text-muted-foreground w-16 shrink-0">{info.label}</span>
                <span className="font-medium">{info.value}</span>
              </div>
            ))}
          </div>

          {/* 리뷰 미리보기 */}
          <div className="border-t pt-5">
            <h3 className="font-bold text-sm mb-3">구매 후기 ({p.reviewCount})</h3>
            <div className="space-y-3">
              {[
                { name: "김*영", date: "2026.02.10", rating: 5, text: "품질이 정말 좋습니다. 꾸준히 재구매하고 있어요!" },
                { name: "이*수", date: "2026.02.08", rating: 5, text: "GLWA 회원 할인으로 합리적인 가격에 구매했습니다. 추천합니다." },
              ].map((review, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{review.name}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 고정 구매 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t px-4 py-3 flex gap-3 z-50 max-w-lg mx-auto">
          <Button
            variant="outline" size="icon"
            className="shrink-0 h-12 w-12"
            onClick={() => toggleWishlist(p.id)}
          >
            <Heart className={`w-5 h-5 ${wishlist.includes(p.id) ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button
            className="flex-1 h-12 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-semibold text-sm rounded-xl shadow-lg"
            onClick={() => handleAddToCart(p.id)}
            disabled={addToCart.isPending}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            장바구니 담기
          </Button>
          <Button
            className="flex-1 h-12 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-semibold text-sm rounded-xl shadow-lg"
            onClick={() => {
              handleAddToCart(p.id);
              navigate("/cart");
            }}
          >
            바로 구매
          </Button>
        </div>
      </div>
    );
  }

  /* ─── 카테고리 내부 상품 목록 ─── */
  if (selectedCategory) {
    const CatIcon = selectedCategory.icon;
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* 카테고리 헤더 */}
        <div className={`bg-gradient-to-br ${selectedCategory.gradient} text-white px-5 pt-12 pb-6`}>
          <button
            onClick={() => { setSelectedCategoryId(null); setSearchQuery(""); setSortBy("popular"); }}
            className="flex items-center gap-1.5 text-white/80 text-xs mb-3"
          >
            <ChevronLeft className="w-4 h-4" /> GLWA 마켓
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CatIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{selectedCategory.name}</h1>
              <p className="text-white/70 text-xs">{selectedCategory.subtitle}</p>
            </div>
          </div>

          {/* 검색 */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text" placeholder={`${selectedCategory.name}에서 검색...`}
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/15 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>

        {/* 정렬 & 필터 */}
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <span className="text-xs text-muted-foreground">
            총 <span className="font-semibold text-foreground">{filteredProducts.length}</span>개 상품
          </span>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 text-xs font-medium"
            >
              <ArrowUpDown className="w-3.5 h-3.5" /> {sortLabels[sortBy]}
            </button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-7 bg-white rounded-xl shadow-xl border z-50 py-1 min-w-[120px]"
                >
                  {(Object.keys(sortLabels) as SortOption[]).map(key => (
                    <button
                      key={key}
                      onClick={() => { setSortBy(key); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 ${sortBy === key ? "font-bold text-amber-700" : ""}`}
                    >
                      {sortLabels[key]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 상품 그리드 */}
        <div className="px-4 pt-3 grid grid-cols-2 gap-3">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => viewProduct(product)}
              >
                <div className={`aspect-square bg-gradient-to-br ${selectedCategory.lightBg} relative flex items-center justify-center`}>
                  <Package className={`w-12 h-12 ${selectedCategory.accentColor} opacity-20 group-hover:scale-110 transition-transform`} />
                  {product.salePrice && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 font-bold">
                      {getDiscount(product.price, product.salePrice)}%
                    </Badge>
                  )}
                  {product.tags[0] && (
                    <Badge className={`absolute top-2 right-2 ${selectedCategory.badgeColor} text-[9px] font-semibold`}>
                      {product.tags[0]}
                    </Badge>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                  </button>
                </div>
                <CardContent className="p-3">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{product.seller}</p>
                  <h3 className="font-semibold text-xs line-clamp-2 leading-tight mb-1.5">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-semibold">{product.rating}</span>
                    <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
                  </div>
                  {product.salePrice && (
                    <p className="text-[10px] text-muted-foreground line-through">{formatPrice(product.price)}</p>
                  )}
                  <p className="text-sm font-bold">{formatPrice(product.salePrice || product.price)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">검색 결과가 없습니다</p>
            <p className="text-xs mt-1">다른 키워드로 검색해 보세요</p>
          </div>
        )}
      </div>
    );
  }

  /* ─── 메인 마켓 (카테고리 선택 화면) ─── */
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 럭셔리 헤더 */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-amber-400 text-[10px] font-semibold tracking-[0.2em] uppercase mb-1">Global Leaders Wellness</p>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              GLWA 마켓
            </h1>
            <p className="text-gray-400 text-xs mt-1">프리미엄 건강 라이프스타일 마켓플레이스</p>
          </div>
          <Button
            variant="outline" size="icon"
            className="border-gray-600 text-gray-300 bg-gray-800/50 hover:bg-gray-700 relative"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text" placeholder="건강식품, 운동용품, 디바이스 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) setSelectedCategoryId(null);
            }}
            className="w-full pl-11 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* 검색 결과 */}
      {searchQuery && !selectedCategoryId && (
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">
              "<span className="font-semibold text-foreground">{searchQuery}</span>" 검색 결과 {filteredProducts.length}개
            </span>
            <button onClick={() => setSearchQuery("")} className="text-xs text-muted-foreground flex items-center gap-1">
              <X className="w-3 h-3" /> 초기화
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(product => {
              const cat = MAIN_CATEGORIES.find(c => c.id === product.categoryId);
              return (
                <Card
                  key={product.id}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => viewProduct(product)}
                >
                  <div className={`aspect-square bg-gradient-to-br ${cat?.lightBg || "from-gray-50 to-gray-100"} relative flex items-center justify-center`}>
                    <Package className={`w-12 h-12 ${cat?.accentColor || "text-gray-300"} opacity-20`} />
                    {product.salePrice && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 font-bold">
                        {getDiscount(product.price, product.salePrice)}%
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground">{product.seller}</p>
                    <h3 className="font-semibold text-xs line-clamp-2 mb-1">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-semibold">{product.rating}</span>
                    </div>
                    {product.salePrice && <p className="text-[10px] text-muted-foreground line-through">{formatPrice(product.price)}</p>}
                    <p className="text-sm font-bold">{formatPrice(product.salePrice || product.price)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      )}

      {/* 메인 카테고리 (검색 중이 아닐 때) */}
      {!searchQuery && (
        <>
          {/* 4대 카테고리 */}
          <div className="px-4 pt-6 pb-2">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              <Sparkles className="w-4 h-4 text-amber-600" />
              카테고리
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {MAIN_CATEGORIES.map((cat, idx) => {
                const CatIcon = cat.icon;
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`relative overflow-hidden rounded-2xl p-4 text-left bg-gradient-to-br ${cat.lightBg} border ${cat.borderColor} hover:shadow-lg transition-all group`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform`}>
                      <CatIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-sm leading-tight mb-0.5">{cat.name}</h3>
                    <p className="text-[10px] text-muted-foreground leading-snug">{cat.subtitle}</p>
                    <ChevronRight className="absolute top-4 right-3 w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 오늘의 추천 */}
          <div className="px-4 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                <TrendingUp className="w-4 h-4 text-amber-600" />
                오늘의 추천
              </h2>
              <span className="text-[10px] text-muted-foreground">GLWA 큐레이션</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {SAMPLE_PRODUCTS.filter(p => p.tags.includes("BEST")).map(product => {
                const cat = MAIN_CATEGORIES.find(c => c.id === product.categoryId);
                return (
                  <button
                    key={product.id}
                    onClick={() => viewProduct(product)}
                    className="min-w-[160px] rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow text-left"
                  >
                    <div className={`h-28 bg-gradient-to-br ${cat?.lightBg || "from-gray-50 to-gray-100"} flex items-center justify-center relative`}>
                      <Package className={`w-10 h-10 ${cat?.accentColor || "text-gray-300"} opacity-20`} />
                      {product.salePrice && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1.5 font-bold">
                          {getDiscount(product.price, product.salePrice)}%
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[9px] text-muted-foreground">{product.seller}</p>
                      <p className="text-xs font-semibold line-clamp-1 mt-0.5">{product.name}</p>
                      <p className="text-sm font-bold mt-1">{formatPrice(product.salePrice || product.price)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 최근 본 상품 */}
          {recentViewed.length > 0 && (
            <div className="px-4 pt-5">
              <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                최근 본 상품
              </h2>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                {recentViewed.map(pid => {
                  const p = SAMPLE_PRODUCTS.find(pr => pr.id === pid);
                  if (!p) return null;
                  return (
                    <button
                      key={p.id}
                      onClick={() => viewProduct(p)}
                      className="min-w-[100px] flex flex-col items-center text-center"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-1">
                        <Package className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-[10px] font-medium line-clamp-1 w-20">{p.name}</p>
                      <p className="text-[10px] font-bold">{formatPrice(p.salePrice || p.price)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 셀러 입점 안내 */}
          <div className="px-4 pt-6 pb-4">
            <button
              onClick={() => {
                if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                toast.info("셀러 입점 신청 기능은 곧 오픈됩니다", { description: "Coming Soon" });
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/60 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-sm text-amber-900">셀러 입점 신청</p>
                <p className="text-[11px] text-amber-700/80 mt-0.5">건강식품·용품을 GLWA 마켓에서 판매하세요</p>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          {/* 결제 수단 안내 */}
          <div className="px-4 pb-6">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <h3 className="font-semibold text-xs mb-3 text-center text-muted-foreground">지원 결제 수단</h3>
              <div className="grid grid-cols-3 gap-2">
                {["카드결제", "카카오페이", "네이버페이", "토스페이", "휴대폰결제", "PayPal"].map(method => (
                  <div key={method} className="text-center py-2 px-1 rounded-xl bg-white border border-gray-100 text-[10px] font-medium text-muted-foreground shadow-sm">
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
