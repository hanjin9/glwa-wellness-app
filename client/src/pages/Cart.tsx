import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Package,
  CreditCard, Smartphone, Wallet, Globe,
} from "lucide-react";
import { useState } from "react";
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

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [shipping, setShipping] = useState({ name: "", phone: "", address: "", memo: "" });

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const utils = trpc.useUtils();
  const { data: cartItems, isLoading } = trpc.shop.getCart.useQuery();

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

  const totalAmount = cartItems?.reduce((sum: number, item: any) => {
    const price = item.product?.salePrice || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0) || 0;

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
          <div className="p-4 rounded-xl bg-muted/50 border">
            <h2 className="font-bold text-sm mb-3">주문 요약</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">상품 금액</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">배송비</span>
                <span className="text-emerald-600">무료</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>총 결제 금액</span>
                <span className="text-emerald-800 text-lg">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      {cartItems && cartItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">총 {cartItems.length}개 상품</span>
            <span className="text-lg font-bold text-emerald-800">{formatPrice(totalAmount)}</span>
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
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold h-12"
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
