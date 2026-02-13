import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart, Star, Package, Search, Store, ChevronRight,
  Sparkles, TrendingUp, Heart, ArrowLeft,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

// 샘플 데이터 (DB에 상품이 없을 때 표시)
const SAMPLE_PRODUCTS = [
  { id: 1, sellerId: 1, name: "유기농 녹즙 세트", description: "신선한 유기농 채소로 만든 건강 녹즙 30포", price: 89000, salePrice: 69000, imageUrl: "", category: "건강식품", rating: 4.8, reviewCount: 124, tags: ["유기농", "베스트"], storeName: "그린팜 건강식품" },
  { id: 2, sellerId: 1, name: "홍삼 진액 스틱", description: "6년근 홍삼 농축액 30포", price: 120000, salePrice: 98000, imageUrl: "", category: "건강식품", rating: 4.9, reviewCount: 256, tags: ["홍삼", "인기"], storeName: "그린팜 건강식품" },
  { id: 3, sellerId: 2, name: "프로바이오틱스 유산균", description: "장 건강을 위한 프리미엄 유산균 60캡슐", price: 45000, salePrice: 35000, imageUrl: "", category: "건강식품", rating: 4.7, reviewCount: 89, tags: ["장건강"], storeName: "바이오헬스" },
  { id: 4, sellerId: 3, name: "요가 매트 프리미엄", description: "친환경 TPE 소재 8mm 두께 요가매트", price: 65000, salePrice: 49000, imageUrl: "", category: "운동용품", rating: 4.6, reviewCount: 67, tags: ["요가"], storeName: "웰니스 스포츠" },
  { id: 5, sellerId: 3, name: "폼롤러 마사지 세트", description: "근막 이완을 위한 3종 폼롤러 세트", price: 38000, salePrice: 29000, imageUrl: "", category: "운동용품", rating: 4.5, reviewCount: 45, tags: ["마사지"], storeName: "웰니스 스포츠" },
  { id: 6, sellerId: 4, name: "디지털 혈압계", description: "가정용 자동 혈압 측정기 (팔뚝형)", price: 79000, salePrice: 59000, imageUrl: "", category: "건강기기", rating: 4.8, reviewCount: 198, tags: ["혈압", "필수"], storeName: "메디케어 디바이스" },
  { id: 7, sellerId: 4, name: "체성분 분석 체중계", description: "BIA 방식 체지방/근육량 측정 스마트 체중계", price: 55000, salePrice: 42000, imageUrl: "", category: "건강기기", rating: 4.7, reviewCount: 156, tags: ["체중"], storeName: "메디케어 디바이스" },
  { id: 8, sellerId: 2, name: "견과류 믹스 선물세트", description: "호두, 아몬드, 캐슈넛 등 7종 견과 세트", price: 32000, salePrice: 25000, imageUrl: "", category: "건강간식", rating: 4.6, reviewCount: 78, tags: ["견과류"], storeName: "바이오헬스" },
];

const SAMPLE_STORES = [
  { id: 1, storeName: "그린팜 건강식품", storeDescription: "유기농 건강식품 전문", productCount: 24, rating: 4.8 },
  { id: 2, storeName: "바이오헬스", storeDescription: "프리미엄 건강기능식품", productCount: 18, rating: 4.7 },
  { id: 3, storeName: "웰니스 스포츠", storeDescription: "운동/재활 용품 전문", productCount: 32, rating: 4.6 },
  { id: 4, storeName: "메디케어 디바이스", storeDescription: "가정용 건강 측정기기", productCount: 15, rating: 4.8 },
];

const CATEGORIES = ["전체", "건강식품", "운동용품", "건강기기", "건강간식"];

type ViewMode = "marketplace" | "store";

export default function Shop() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("marketplace");
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const addToCart = trpc.shop.addToCart.useMutation({
    onSuccess: () => toast.success("장바구니에 추가되었습니다"),
    onError: () => toast.error("장바구니 추가에 실패했습니다"),
  });

  const filteredProducts = useMemo(() => {
    let products = SAMPLE_PRODUCTS;
    if (selectedStoreId) products = products.filter(p => p.sellerId === selectedStoreId);
    if (selectedCategory !== "전체") products = products.filter(p => p.category === selectedCategory);
    if (searchQuery) products = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return products;
  }, [selectedCategory, searchQuery, selectedStoreId]);

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    addToCart.mutate({ productId, quantity: 1 });
  };

  const formatPrice = (price: number) => price.toLocaleString() + "원";
  const getDiscount = (price: number, salePrice: number) => Math.round((1 - salePrice / price) * 100);

  const openStore = (storeId: number) => {
    setSelectedStoreId(storeId);
    setViewMode("store");
  };

  const backToMarketplace = () => {
    setSelectedStoreId(null);
    setViewMode("marketplace");
    setSelectedCategory("전체");
  };

  const selectedStore = SAMPLE_STORES.find(s => s.id === selectedStoreId);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          {viewMode === "store" ? (
            <button onClick={backToMarketplace} className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <div>
                <p className="text-xs text-emerald-200">마켓플레이스</p>
                <h1 className="text-lg font-bold">{selectedStore?.storeName || "스토어"}</h1>
              </div>
            </button>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-200" />
                <h1 className="text-xl font-bold">GLWA 마켓</h1>
              </div>
              <p className="text-emerald-200 text-xs mt-1">건강식품 몰인몰 마켓플레이스</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="icon"
              className="border-emerald-400 text-emerald-100 bg-emerald-800/50 hover:bg-emerald-700"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300" />
          <input
            type="text" placeholder="건강식품, 운동용품 검색..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-emerald-900/50 border border-emerald-600 rounded-xl text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* Marketplace View */}
      {viewMode === "marketplace" && (
        <>
          {/* 입점 스토어 */}
          <div className="px-4 pt-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-700" />
                입점 스토어
              </h2>
              <span className="text-xs text-muted-foreground">{SAMPLE_STORES.length}개 스토어</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {SAMPLE_STORES.map(store => (
                <button
                  key={store.id}
                  onClick={() => openStore(store.id)}
                  className="min-w-[140px] p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-left hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                    <Store className="w-5 h-5 text-emerald-700" />
                  </div>
                  <p className="font-semibold text-xs line-clamp-1">{store.storeName}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{store.storeDescription}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-medium">{store.rating}</span>
                    <span className="text-[10px] text-muted-foreground">· 상품 {store.productCount}개</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 셀러 입점 안내 */}
          <div className="px-4 mb-4">
            <button
              onClick={() => {
                if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                navigate("/seller-apply");
                toast.info("셀러 입점 신청 기능은 곧 오픈됩니다", { description: "Coming Soon" });
              }}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-sm text-amber-900">셀러 입점 신청</p>
                <p className="text-[10px] text-amber-700">건강식품/용품을 판매하고 싶으신가요?</p>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </>
      )}

      {/* Store View - Store Info */}
      {viewMode === "store" && selectedStore && (
        <div className="px-4 pt-4 pb-2">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Store className="w-7 h-7 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold">{selectedStore.storeName}</h2>
                <p className="text-xs text-muted-foreground">{selectedStore.storeDescription}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{selectedStore.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">· 상품 {selectedStore.productCount}개</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-700 text-white shadow-md"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 relative flex items-center justify-center">
              <Package className="w-12 h-12 text-emerald-200" />
              {product.salePrice && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5">
                  {getDiscount(product.price, product.salePrice)}%
                </Badge>
              )}
            </div>
            <CardContent className="p-3">
              {/* 셀러 정보 */}
              {viewMode === "marketplace" && (
                <button
                  onClick={() => openStore(product.sellerId)}
                  className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mb-1 hover:underline"
                >
                  <Store className="w-3 h-3" />
                  {product.storeName}
                </button>
              )}
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-medium">{product.rating}</span>
                <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
              </div>
              <div className="space-y-0.5">
                {product.salePrice && (
                  <p className="text-[10px] text-muted-foreground line-through">{formatPrice(product.price)}</p>
                )}
                <p className="text-sm font-bold text-emerald-800">{formatPrice(product.salePrice || product.price)}</p>
              </div>
              <Button
                size="sm"
                className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8"
                onClick={() => handleAddToCart(product.id)}
                disabled={addToCart.isPending}
              >
                <ShoppingCart className="w-3 h-3 mr-1" /> 담기
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">검색 결과가 없습니다</p>
        </div>
      )}

      {/* 결제 수단 안내 */}
      <div className="px-4 mt-6 mb-4">
        <div className="p-4 rounded-xl bg-muted/50 border">
          <h3 className="font-semibold text-xs mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            지원 결제 수단
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {["카드결제", "카카오페이", "네이버페이", "토스페이", "휴대폰결제", "PayPal"].map(method => (
              <div key={method} className="text-center py-2 px-1 rounded-lg bg-white border text-[10px] font-medium text-muted-foreground">
                {method}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
