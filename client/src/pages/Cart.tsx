import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Package,
  CreditCard, Smartphone, Wallet, Globe, Crown, Shield, Star, Diamond,
  Ticket, Coins, ChevronDown, ChevronUp, Check, Gift,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const PAYMENT_METHODS = [
  { id: "stripe", name: "카드결제", icon: CreditCard, desc: "Visa, Mastercard, AMEX", region: "global" },
  { id: "kakaopay", name: "카카오페이", icon: Wallet, desc: "카카오페이 간편결제", region: "kr" },
  { id: "naverpay", name: "네이버페이", icon: Wallet, desc: "네이버페이 간편결제", region: "kr" },
  { id: "tosspay", name: "토스페이", icon: Wallet, desc: "토스 간편결제", region: "kr" },
  { id: "phone", name: "휴대폰결제", icon: Smartphone, desc: "통신사 소액결제", region: "kr" },
  { id: "paypal", name: "PayPal", icon: Globe, desc: "PayPal 글로벌 결제", region: "global" },
];

const tierDiscounts: Record<string, number> = {
  silver: 0, gold: 5, blue_sapphire: 8, green_emerald: 10,
  diamond: 12, blue_diamond: 15, platinum: 20, black_platinum: 25,
};
const tierPointRates: Record<string, number> = {
  silver: 1, gold: 1.5, blue_sapphire: 2, green_emerald: 2.5,
  diamond: 3, blue_diamond: 4, platinum: 5, black_platinum: 10,
};
const tierNames: Record<string, string> = {
  silver: "실버", gold: "골드", blue_sapphire: "블루사파이어", green_emerald: "그린에메랄드",
  diamond: "다이아몬드", blue_diamond: "블루다이아몬드", platinum: "플래티넘", black_platinum: "블랙플래티넘",
};
const tierIcons: Record<string, any> = {
  silver: Shield, gold: Star, blue_sapphire: Diamond, green_emerald: Diamond,
  diamond: Diamond, blue_diamond: Diamond, platinum: Crown, black_platinum: Crown,
};
const tierGradients: Record<string, string> = {
  silver: "from-gray-400 to-gray-500", gold: "from-amber-400 to-amber-600",
  blue_sapphire: "from-blue-400 to-indigo-600", green_emerald: "from-emerald-400 to-teal-600",
  diamond: "from-sky-400 to-blue-600", blue_diamond: "from-violet-500 to-purple-700",
  platinum: "from-slate-500 to-slate-800", black_platinum: "from-gray-800 to-black",
};

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [shipping, setShipping] = useState({ name: "", phone: "", address: "", memo: "" });
  const [usePoints, setUsePoints] = useState(0);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showPoints, setShowPoints] = useState(false);

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const utils = trpc.useUtils();
  const { data: cartItems, isLoading } = trpc.shop.getCart.useQuery();
  const { data: membershipData } = trpc.membership.getMyMembership.useQuery(undefined, { retry: false });
  const { data: pointsData } = trpc.points.getBalance.useQuery(undefined, { retry: false });
  const { data: couponsData } = trpc.coupon.getMyCoupons.useQuery(undefined, { retry: false });

  const currentTier = membershipData?.membership?.tier || "silver";
  const TierIcon = tierIcons[currentTier] || Shield;
  const availablePoints = pointsData?.currentPoints || 0;
  const availableCoupons = (couponsData as any[])?.filter((c: any) => c.status === "active") || [];

  const updateItem = trpc.shop.updateCartItem.useMutation({
    onSuccess: () => utils.shop.getCart.invalidate(),
  });
  const removeItem = trpc.shop.removeCartItem.useMutation({
    onSuccess: () => { utils.shop.getCart.invalidate(); toast.success("삭제되었습니다"); },
  });
  const placeOrder = trpc.shop.placeOrder.useMutation({
    onSuccess: (data) => {
      utils.shop.getCart.invalidate();
      if (data.checkoutUrl) {
        toast.info("결제 페이지로 이동합니다");
        window.open(data.checkoutUrl, "_blank");
      } else {
        toast.success(`주문이 완료되었습니다! (${data.orderNumber})`);
      }
      navigate("/shop?payment=success");
    },
    onError: (err) => toast.error(err.message),
  });

  const subtotal = cartItems?.reduce((sum: number, item: any) => {
    const price = item.product?.salePrice || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0) || 0;

  const memberDiscount = Math.round(subtotal * (tierDiscounts[currentTier] / 100));
  const selectedCoupon = availableCoupons.find((c: any) => c.id === selectedCouponId);
  const couponDiscount = selectedCoupon
    ? selectedCoupon.discountType === "percent"
      ? Math.min(Math.round(subtotal * (selectedCoupon.discountValue / 100)), selectedCoupon.maxDiscount || Infinity)
      : Math.min(selectedCoupon.discountValue, subtotal)
    : 0;
  const pointDiscount = Math.min(usePoints, subtotal - memberDiscount - couponDiscount);
  const totalDiscount = memberDiscount + couponDiscount + pointDiscount;
  const totalAmount = Math.max(subtotal - totalDiscount, 0);
  const earnPoints = Math.round(totalAmount * (tierPointRates[currentTier] / 100));

  const formatPrice = (price: number) => price.toLocaleString() + "원";

  const handlePlaceOrder = () => {
    if (!shipping.name || !shipping.phone || !shipping.address) {
      toast.error("배송 정보를 모두 입력해주세요");
      return;
    }
    const unsupportedMethods = ["kakaopay", "naverpay", "tosspay", "phone", "paypal"];
    if (unsupportedMethods.includes(paymentMethod)) {
      toast.info(`${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name} 결제는 곧 지원됩니다`, { description: "현재는 카드결제(Stripe)를 이용해주세요" });
      return;
    }
    placeOrder.mutate({
      shippingName: shipping.name, shippingPhone: shipping.phone,
      shippingAddress: shipping.address, shippingMemo: shipping.memo,
      paymentMethod: paymentMethod as any,
      origin: window.location.origin,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-white border-b px-4 pt-12 pb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => step === "checkout" ? setStep("cart") : navigate("/shop")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-lg">{step === "cart" ? "장바구니" : "주문/결제"}</h1>
        <span className="text-xs text-muted-foreground ml-auto">{cartItems?.length || 0}개 상품</span>
      </div>

      {step === "cart" && (
        <>
          {/* 멤버십 혜택 배너 */}
          {tierDiscounts[currentTier] > 0 && (
            <div className={`mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r ${tierGradients[currentTier]} text-white flex items-center gap-3`}>
              <TierIcon className="w-5 h-5" />
              <div className="flex-1">
                <p className="text-xs font-bold">{tierNames[currentTier]} 멤버 혜택</p>
                <p className="text-[10px] opacity-90">추가 {tierDiscounts[currentTier]}% 할인 + {tierPointRates[currentTier]}% 포인트 적립</p>
              </div>
            </div>
          )}

          {!cartItems || cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
              <p className="font-medium mb-2">장바구니가 비어있습니다</p>
              <p className="text-sm mb-6">건강에 좋은 상품을 담아보세요</p>
              <Button onClick={() => navigate("/shop")} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                쇼핑하러 가기
              </Button>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-3">
              {cartItems.map((item: any) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-3 flex gap-3">
                    <div className="w-20 h-20 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Package className="w-8 h-8 text-emerald-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">{item.product?.name || "상품"}</h3>
                      <p className="text-sm font-bold text-emerald-800 mt-1">
                        {formatPrice(item.product?.salePrice || item.product?.price || 0)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-muted"
                          onClick={() => {
                            if (item.quantity <= 1) return;
                            updateItem.mutate({ cartItemId: item.id, quantity: item.quantity - 1 });
                          }}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-muted"
                          onClick={() => updateItem.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          className="ml-auto text-muted-foreground hover:text-red-500"
                          onClick={() => removeItem.mutate({ cartItemId: item.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {step === "checkout" && (
        <div className="px-4 py-4 space-y-5">
          {/* 배송 정보 */}
          <div>
            <h2 className="font-bold text-sm mb-3">배송 정보</h2>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">수령인</Label>
                <Input placeholder="이름" value={shipping.name} onChange={e => setShipping(s => ({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">연락처</Label>
                <Input placeholder="010-0000-0000" value={shipping.phone} onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">배송지</Label>
                <Input placeholder="주소를 입력하세요" value={shipping.address} onChange={e => setShipping(s => ({ ...s, address: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">배송 메모</Label>
                <Input placeholder="배송 시 요청사항 (선택)" value={shipping.memo} onChange={e => setShipping(s => ({ ...s, memo: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* 쿠폰 적용 */}
          <div className="border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowCoupons(!showCoupons)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-sm">쿠폰 적용</span>
                {selectedCouponId && <span className="text-xs text-emerald-600 font-bold">-{formatPrice(couponDiscount)}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{availableCoupons.length}장 보유</span>
                {showCoupons ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            {showCoupons && (
              <div className="border-t px-4 py-3 space-y-2 bg-muted/20">
                {availableCoupons.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">사용 가능한 쿠폰이 없습니다</p>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedCouponId(null)}
                      className={`w-full p-3 rounded-lg border text-left text-xs transition-all ${
                        !selectedCouponId ? "border-emerald-500 bg-emerald-50" : "hover:bg-muted/50"
                      }`}
                    >
                      쿠폰 미적용
                    </button>
                    {availableCoupons.map((coupon: any) => (
                      <button
                        key={coupon.id}
                        onClick={() => setSelectedCouponId(coupon.id === selectedCouponId ? null : coupon.id)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          coupon.id === selectedCouponId ? "border-emerald-500 bg-emerald-50" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{coupon.name}</span>
                          {coupon.id === selectedCouponId && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {coupon.discountType === "percent" ? `${coupon.discountValue}% 할인` : `${formatPrice(coupon.discountValue)} 할인`}
                          {coupon.minOrderAmount > 0 && ` · ${formatPrice(coupon.minOrderAmount)} 이상 주문 시`}
                        </p>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* 포인트 사용 */}
          <div className="border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowPoints(!showPoints)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-sm">포인트 사용</span>
                {usePoints > 0 && <span className="text-xs text-emerald-600 font-bold">-{formatPrice(pointDiscount)}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{availablePoints.toLocaleString()}P 보유</span>
                {showPoints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            {showPoints && (
              <div className="border-t px-4 py-3 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="사용할 포인트"
                    value={usePoints || ""}
                    onChange={e => setUsePoints(Math.min(Number(e.target.value) || 0, availablePoints))}
                    className="flex-1"
                  />
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setUsePoints(Math.min(availablePoints, subtotal - memberDiscount - couponDiscount))}
                    className="shrink-0 text-xs"
                  >
                    전액 사용
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">사용 가능: {availablePoints.toLocaleString()}P (1P = 1원)</p>
              </div>
            )}
          </div>

          {/* 결제 수단 */}
          <div>
            <h2 className="font-bold text-sm mb-3">결제 수단</h2>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">글로벌</p>
                {PAYMENT_METHODS.filter(m => m.region === "global").map(method => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === method.id ? "border-emerald-500 bg-emerald-50" : "hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value={method.id} />
                    <method.icon className="w-5 h-5 text-emerald-700" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{method.name}</p>
                      <p className="text-[10px] text-muted-foreground">{method.desc}</p>
                    </div>
                  </label>
                ))}
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-3">한국 간편결제</p>
                {PAYMENT_METHODS.filter(m => m.region === "kr").map(method => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === method.id ? "border-emerald-500 bg-emerald-50" : "hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value={method.id} />
                    <method.icon className="w-5 h-5 text-emerald-700" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{method.name}</p>
                      <p className="text-[10px] text-muted-foreground">{method.desc}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">준비중</span>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* 주문 요약 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border shadow-sm">
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-600" />
              주문 요약
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">상품 금액</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {memberDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <TierIcon className="w-3 h-3" />
                    {tierNames[currentTier]} 할인 ({tierDiscounts[currentTier]}%)
                  </span>
                  <span>-{formatPrice(memberDiscount)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Ticket className="w-3 h-3" />
                    쿠폰 할인
                  </span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              {pointDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    포인트 사용
                  </span>
                  <span>-{formatPrice(pointDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">배송비</span>
                <span className="text-emerald-600">무료</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1.5">
                  <span className="font-medium">총 할인 금액</span>
                  <span className="font-bold">-{formatPrice(totalDiscount)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>총 결제 금액</span>
                <span className="text-emerald-800 text-lg">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1.5">
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  적립 예정 포인트
                </span>
                <span className="font-bold">+{earnPoints.toLocaleString()}P</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      {cartItems && cartItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs text-muted-foreground">총 {cartItems.length}개 상품</span>
              {totalDiscount > 0 && step === "checkout" && (
                <span className="text-[10px] text-emerald-600 ml-2 font-semibold">(-{formatPrice(totalDiscount)} 할인)</span>
              )}
            </div>
            <span className="text-lg font-bold text-emerald-800">
              {step === "checkout" ? formatPrice(totalAmount) : formatPrice(subtotal)}
            </span>
          </div>
          {step === "cart" ? (
            <Button
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold h-12"
              onClick={() => setStep("checkout")}
            >
              주문하기
            </Button>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-semibold h-12 shadow-lg"
              onClick={handlePlaceOrder}
              disabled={placeOrder.isPending}
            >
              {placeOrder.isPending ? "결제 처리 중..." : `${formatPrice(totalAmount)} 결제하기`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
