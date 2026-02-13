import { trpc } from "@/lib/trpc";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { useState, useEffect } from "react";

const SYSTEM_PROMPT = `당신은 GLWA 글로벌 리더스 웰니스 협회의 전담 건강 매니저입니다.
동양 철학과 현대 의학의 조화로운 관점에서 회원의 건강을 관리합니다.

핵심 원칙:
- 의료 행위가 아닌 생활 건강 관리 조언을 제공합니다
- 동양의학 기반 체질 분석과 생활 습관 개선을 안내합니다
- 호흡, 수면, 자세, 스트레칭, 정신건강의 5단계 프로그램을 기반으로 조언합니다
- 근골격계 통증, 염증 관리, 중력 관리에 대한 생활 건강 팁을 제공합니다
- 심각한 증상은 반드시 의료 전문가 상담을 권유합니다
- 친절하고 따뜻한 어조로 대화합니다
- 한국어로 대화합니다`;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: SYSTEM_PROMPT },
  ]);

  const { data: chatHistory } = trpc.chat.getHistory.useQuery(undefined, { retry: false });
  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.content },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요." },
      ]);
    },
  });

  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      const history: Message[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatHistory.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];
      setMessages(history);
    }
  }, [chatHistory]);

  const handleSend = (content: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    sendMessage.mutate({
      messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
          건강 상담
        </h1>
        <p className="text-xs text-muted-foreground">AI 건강 매니저와 1:1 상담</p>
      </div>
      <AIChatBox
        messages={messages}
        onSendMessage={handleSend}
        isLoading={sendMessage.isPending}
        placeholder="건강 관련 질문을 입력하세요..."
        height="calc(100vh - 220px)"
        emptyStateMessage="건강 매니저에게 무엇이든 물어보세요"
        suggestedPrompts={[
          "오늘 허리가 아파요",
          "수면의 질을 높이는 방법",
          "스트레스 관리 팁",
          "체질에 맞는 식단 추천",
        ]}
      />
    </div>
  );
}
