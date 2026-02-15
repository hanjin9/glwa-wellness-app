import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MessageCircle, Send, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "ai" | "user";
  text: string;
  options?: string[];
}

interface UpgradeChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tierName: string;
  tierNameEn: string;
  tierKey: string;
  currentTierName: string;
  tierColor: string;
  userName?: string;
}

export function UpgradeChatDialog({
  open, onOpenChange, tierName, tierNameEn, tierKey, currentTierName, tierColor, userName
}: UpgradeChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [completed, setCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const requestUpgrade = trpc.membership.requestUpgrade.useMutation({
    onSuccess: () => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "ai",
          text: `✅ 신청이 접수되었습니다!\n\nGLWA 본사 담당자가 확인 후 3시간 이내에 연락드리겠습니다.\n\n${userName ? `${userName}님` : "회원님"}의 ${tierName}(${tierNameEn}) 등급 업그레이드를 위해 최선을 다하겠습니다. 감사합니다! 🙏`
        }]);
        setCompleted(true);
      }, 1500);
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (open) {
      setMessages([]);
      setStep(0);
      setCompleted(false);
      // 첫 번째 AI 메시지
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([{
          role: "ai",
          text: `안녕하세요! ${userName ? `${userName}님` : "회원님"} 😊\n\n${tierName}(${tierNameEn}) 등급 업그레이드에 관심을 가져주셔서 감사합니다.\n\n현재 ${currentTierName} 등급이시네요. ${tierName} 등급으로 업그레이드하시면 더 많은 프리미엄 혜택을 누리실 수 있습니다.`,
          options: ["혜택이 궁금해요", "바로 신청할게요"]
        }]);
        setStep(1);
      }, 1000);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleOption = (option: string) => {
    setMessages(prev => [...prev, { role: "user", text: option }]);

    if (step === 1 && option === "혜택이 궁금해요") {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "ai",
          text: `${tierName} 등급의 주요 혜택입니다:\n\n💎 프리미엄 건강 관리 서비스\n🏥 전담 웰니스 매니저 배정\n🎁 등급 전용 할인 및 이벤트\n✨ VIP 라운지 이용 가능\n📊 맞춤형 건강 리포트 제공\n\n업그레이드를 진행하시겠습니까?`,
          options: ["네, 신청할게요!", "좀 더 생각해볼게요"]
        }]);
        setStep(2);
      }, 1500);
    } else if (option === "바로 신청할게요" || option === "네, 신청할게요!") {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "ai",
          text: `${tierName}(${tierNameEn}) 등급 업그레이드 신청을 접수합니다.\n\n📋 신청 정보:\n• 회원: ${userName || "회원님"}\n• 신청 등급: ${tierName}(${tierNameEn})\n• 현재 등급: ${currentTierName}\n\n신청을 확정하시겠습니까?`,
          options: ["확인, 신청합니다", "취소"]
        }]);
        setStep(3);
      }, 1200);
    } else if (step === 3 && option === "확인, 신청합니다") {
      requestUpgrade.mutate({ tier: tierKey as any });
    } else if (option === "좀 더 생각해볼게요" || option === "취소") {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "ai",
          text: "알겠습니다! 언제든지 다시 문의해주세요. 😊\nGLWA가 항상 함께합니다."
        }]);
        setCompleted(true);
      }, 800);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className={`p-4 bg-gradient-to-r ${tierColor} text-white rounded-t-lg`}>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            {tierName} 업그레이드 신청
          </DialogTitle>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}>
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  {msg.options && !completed && i === messages.length - 1 && (
                    <div className="mt-3 space-y-2">
                      {msg.options.map((opt, j) => (
                        <Button
                          key={j}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleOption(opt)}
                          disabled={requestUpgrade.isPending}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {completed && (
          <div className="p-4 border-t bg-muted/30">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              닫기
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
