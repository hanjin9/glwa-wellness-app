import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Store, Package, BarChart3, DollarSign, ArrowLeft, Plus, Edit, Trash2,
  TrendingUp, ShoppingBag, Clock, CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function SellerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", description: "", price: 0, salePrice: 0, category: "건강식품", stock: 100,
  });

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const { data: sellerInfo } = trpc.seller.myStore.useQuery();
  const { data: stats } = trpc.seller.stats.useQuery(undefined, { enabled: !!sellerInfo });
  const { data: products = [] } = trpc.seller.products.useQuery(undefined, { enabled: !!sellerInfo }) as { data: any[] };
  const { data: orderItems = [] } = trpc.seller.orderItems.useQuery(undefined, { enabled: !!sellerInfo }) as { data: any[] };

  const utils = trpc.useUtils();
  const addProduct = trpc.shop.createProduct.useMutation({
    onSuccess: () => {
      utils.seller.products.invalidate();
      setShowAddProduct(false);
      setNewProduct({ name: "", description: "", price: 0, salePrice: 0, category: "건강식품", stock: 100 });
      toast.success("상품이 등록되었습니다");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const formatPrice = (price: number) => price.toLocaleString() + "원";

  // 셀러가 아닌 경우 입점 신청 안내
  if (!sellerInfo) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="bg-white border-b px-4 pt-12 pb-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/shop")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">셀러 센터</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <Store className="w-20 h-20 text-emerald-200 mb-6" />
          <h2 className="text-xl font-bold mb-2">GLWA 마켓에 입점하세요</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            건강식품, 운동용품, 건강기기 등을 판매하고 GLWA 회원들에게 건강한 상품을 제공하세요.
          </p>
          <div className="w-full max-w-sm space-y-4 text-left">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <h3 className="font-semibold text-sm mb-2">입점 혜택</h3>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> GLWA 프리미엄 회원 대상 판매</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> 낮은 수수료 (5~10%)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> 자동 정산 시스템</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> 마케팅 지원</li>
              </ul>
            </div>
            <Button
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white h-12"
              onClick={() => toast.info("셀러 입점 신청 기능은 곧 오픈됩니다", { description: "Coming Soon" })}
            >
              <Store className="w-4 h-4 mr-2" /> 입점 신청하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-emerald-700" onClick={() => navigate("/shop")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">{sellerInfo.storeName}</h1>
            <p className="text-xs text-emerald-200">셀러 대시보드</p>
          </div>
          <Badge className={`ml-auto ${sellerInfo.status === "approved" ? "bg-emerald-500" : "bg-amber-500"}`}>
            {sellerInfo.status === "approved" ? "운영중" : sellerInfo.status === "pending" ? "심사중" : sellerInfo.status}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-emerald-200" />
            <p className="text-lg font-bold">{formatPrice(stats?.totalSales || 0)}</p>
            <p className="text-[10px] text-emerald-200">총 매출</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur text-center">
            <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-emerald-200" />
            <p className="text-lg font-bold">{stats?.totalOrders || 0}</p>
            <p className="text-[10px] text-emerald-200">총 주문</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-emerald-200" />
            <p className="text-lg font-bold">{formatPrice(stats?.pendingSettlement || 0)}</p>
            <p className="text-[10px] text-emerald-200">정산 대기</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" className="px-4 pt-4">
        <TabsList className="w-full">
          <TabsTrigger value="products" className="flex-1 text-xs">상품 관리</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1 text-xs">주문 내역</TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 text-xs">매출 분석</TabsTrigger>
        </TabsList>

        {/* 상품 관리 */}
        <TabsContent value="products" className="mt-4 space-y-3">
          <Button
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
            onClick={() => setShowAddProduct(!showAddProduct)}
          >
            <Plus className="w-4 h-4 mr-2" /> 새 상품 등록
          </Button>

          {showAddProduct && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label className="text-xs">상품명</Label>
                  <Input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="상품명을 입력하세요" />
                </div>
                <div>
                  <Label className="text-xs">설명</Label>
                  <Input value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} placeholder="상품 설명" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">정가 (원)</Label>
                    <Input type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label className="text-xs">할인가 (원)</Label>
                    <Input type="number" value={newProduct.salePrice} onChange={e => setNewProduct(p => ({ ...p, salePrice: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">카테고리</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border text-sm"
                      value={newProduct.category}
                      onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                    >
                      <option>건강식품</option>
                      <option>운동용품</option>
                      <option>건강기기</option>
                      <option>건강간식</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">재고</Label>
                    <Input type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: Number(e.target.value) }))} />
                  </div>
                </div>
                <Button
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => addProduct.mutate({ ...newProduct, sellerId: sellerInfo?.id || 0, categoryId: 1 })}
                  disabled={addProduct.isPending || !newProduct.name || !newProduct.price}
                >
                  {addProduct.isPending ? "등록 중..." : "상품 등록"}
                </Button>
              </CardContent>
            </Card>
          )}

          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">등록된 상품이 없습니다</p>
            </div>
          ) : (
            products.map((product: any) => (
              <Card key={product.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <p className="text-sm font-bold text-emerald-800 mt-0.5">{formatPrice(product.salePrice || product.price)}</p>
                  </div>
                  <Badge variant={product.isActive ? "default" : "secondary"} className="text-[10px]">
                    {product.isActive ? "판매중" : "비활성"}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* 주문 내역 */}
        <TabsContent value="orders" className="mt-4 space-y-3">
          {orderItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">주문 내역이 없습니다</p>
            </div>
          ) : (
            orderItems.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{item.productName}</h3>
                    <Badge variant="outline" className="text-[10px]">
                      {item.sellerSettled ? "정산완료" : "정산대기"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">수량: {item.quantity}개</p>
                  <p className="text-sm font-bold text-emerald-800">{formatPrice(item.price * item.quantity)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* 매출 분석 */}
        <TabsContent value="stats" className="mt-4 space-y-3">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-700" /> 매출 요약
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">총 매출</span>
                  <span className="font-bold text-emerald-800">{formatPrice(stats?.totalSales || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">총 주문 수</span>
                  <span className="font-bold">{stats?.totalOrders || 0}건</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">정산 대기</span>
                  <span className="font-bold text-amber-600">{formatPrice(stats?.pendingSettlement || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">수수료율</span>
                  <span className="font-bold">10%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-800">
              정산은 매월 15일, 말일에 자동으로 진행됩니다. 정산 내역은 등록된 계좌로 입금됩니다.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
