import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Smartphone,
  Globe,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getHanJinLevelInfo } from "@/utils/hanJinLevel";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  region: "KR" | "GLOBAL";
  description: string;
}

interface PaymentResult {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  vipLevel: number;
  pointsAwarded: number;
  timestamp: number;
}

interface UnifiedPaymentGatewayProps {
  amount: number;
  currency?: string;
  userId?: number;
  onPaymentComplete?: (result: PaymentResult) => void;
  onPaymentError?: (error: string) => void;
}

export default function UnifiedPaymentGateway({
  amount,
  currency = "KRW",
  userId,
  onPaymentComplete,
  onPaymentError,
}: UnifiedPaymentGatewayProps) {
  const [userRegion, setUserRegion] = useState<"KR" | "GLOBAL">("KR");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 사용자 지역 감지 (Geo-IP)
  useEffect(() => {
    const detectRegion = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        setUserRegion(data.country_code === "KR" ? "KR" : "GLOBAL");
      } catch (err) {
        console.error("지역 감지 실패:", err);
        setUserRegion("GLOBAL");
      }
    };

    detectRegion();
  }, []);

  // 한국 결제 방법
  const koreanMethods: PaymentMethod[] = [
    {
      id: "kakao",
      name: "카카오페이",
      icon: <Smartphone className="w-6 h-6" />,
      region: "KR",
      description: "카카오페이로 빠르게 결제",
    },
    {
      id: "naver",
      name: "네이버페이",
      icon: <Smartphone className="w-6 h-6" />,
      region: "KR",
      description: "네이버페이로 간편 결제",
    },
    {
      id: "toss",
      name: "토스페이",
      icon: <Smartphone className="w-6 h-6" />,
      region: "KR",
      description: "토스페이로 신속 결제",
    },
    {
      id: "phone",
      name: "휴대폰 결제",
      icon: <Smartphone className="w-6 h-6" />,
      region: "KR",
      description: "휴대폰 소액 결제",
    },
    {
      id: "qr",
      name: "QR 결제",
      icon: <CreditCard className="w-6 h-6" />,
      region: "KR",
      description: "QR 코드로 결제",
    },
  ];

  // 글로벌 결제 방법
  const globalMethods: PaymentMethod[] = [
    {
      id: "paypal",
      name: "PayPal",
      icon: <Globe className="w-6 h-6" />,
      region: "GLOBAL",
      description: "PayPal으로 글로벌 결제",
    },
    {
      id: "card",
      name: "신용카드",
      icon: <CreditCard className="w-6 h-6" />,
      region: "GLOBAL",
      description: "국제 신용카드 결제",
    },
  ];

  const availableMethods =
    userRegion === "KR" ? koreanMethods : globalMethods;

  // AI 자동 VIP 승급 로직
  const calculateVIPLevel = (paymentAmount: number): number => {
    // 결제 금액에 따른 VIP 레벨 자동 결정
    if (paymentAmount >= 5000000) return 10; // 블랙플래티넘
    if (paymentAmount >= 3000000) return 9; // 플래티넘
    if (paymentAmount >= 2000000) return 8; // 블루다이아몬드
    if (paymentAmount >= 1000000) return 7; // 다이아몬드
    if (paymentAmount >= 500000) return 6; // 그린에메랄드
    if (paymentAmount >= 300000) return 5; // 블루사파이어
    if (paymentAmount >= 100000) return 4; // 골드
    if (paymentAmount >= 50000) return 3; // 실버
    return 2; // 기본회원
  };

  // 포인트 자동 지급 로직
  const calculatePoints = (paymentAmount: number): number => {
    // 결제 금액의 1-5% 포인트 지급 (VIP 레벨에 따라 다름)
    const vipLevel = calculateVIPLevel(paymentAmount);
    const baseRate = 0.01; // 1%
    const bonusRate = (vipLevel - 1) * 0.004; // VIP 레벨당 0.4% 추가
    return Math.round(paymentAmount * (baseRate + bonusRate));
  };

  // 결제 처리
  const handlePayment = async (methodId: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // 시뮬레이션: 실제로는 포트원 또는 PayPal API 호출
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const vipLevel = calculateVIPLevel(amount);
      const points = calculatePoints(amount);

      const result: PaymentResult = {
        success: true,
        orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency,
        method: methodId,
        vipLevel,
        pointsAwarded: points,
        timestamp: Date.now(),
      };

      setPaymentResult(result);

      // 콜백 실행
      if (onPaymentComplete) {
        onPaymentComplete(result);
      }

      // 자동 VIP 승급 및 포인트 지급 (AI 자동화)
      console.log(`✅ 결제 완료!`);
      console.log(`📊 VIP 레벨: ${vipLevel}단계`);
      console.log(`💰 포인트 지급: ${points}P`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "결제 실패";
      setError(errorMessage);

      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/50 border border-[#d4af37]/20 rounded-xl p-6 space-y-6"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-[#d4af37]" />
          <div>
            <h3 className="text-white font-semibold">럭셔리 결제 시스템</h3>
            <p className="text-xs text-[#d4af37]/60">
              {userRegion === "KR"
                ? "한국 간편결제 (카카오/네이버/토스)"
                : "글로벌 결제 (PayPal/카드)"}
            </p>
          </div>
        </div>
        <span className="text-[#d4af37] font-bold text-lg">
          {amount.toLocaleString()} {currency}
        </span>
      </div>

      {/* 결제 완료 상태 */}
      <AnimatePresence>
        {paymentResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h4 className="text-green-400 font-semibold">결제 완료!</h4>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#d4af37]/70">주문번호</span>
                <span className="text-white font-mono">
                  {paymentResult.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d4af37]/70">결제 방법</span>
                <span className="text-white">
                  {availableMethods.find((m) => m.id === paymentResult.method)
                    ?.name || paymentResult.method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d4af37]/70">VIP 레벨</span>
                <span className="text-[#d4af37] font-bold">
                  {paymentResult.vipLevel}단계
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d4af37]/70">포인트 지급</span>
                <span className="text-yellow-400 font-bold">
                  +{paymentResult.pointsAwarded}P
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 에러 메시지 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 결제 방법 선택 */}
      {!paymentResult && (
        <div className="space-y-3">
          <p className="text-[#d4af37]/70 text-sm">결제 방법을 선택하세요</p>

          <div className="grid grid-cols-2 gap-3">
            {availableMethods.map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !isProcessing && handlePayment(method.id)}
                disabled={isProcessing}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === method.id
                    ? "border-[#d4af37] bg-[#d4af37]/10"
                    : "border-[#d4af37]/20 bg-black/30 hover:border-[#d4af37]/50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[#d4af37]">{method.icon}</div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm">
                      {method.name}
                    </p>
                    <p className="text-[#d4af37]/60 text-xs">
                      {method.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* 지역 정보 */}
      <div className="text-xs text-[#d4af37]/50 text-center">
        {userRegion === "KR"
          ? "🇰🇷 한국 사용자 - 한국 결제 시스템 활성화"
          : "🌍 해외 사용자 - 글로벌 결제 시스템 활성화"}
      </div>
    </motion.div>
  );
}
