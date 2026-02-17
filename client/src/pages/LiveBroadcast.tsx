import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Gift, Play, Square, Send } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function LiveBroadcast() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [isLive, setIsLive] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDescription, setLiveDescription] = useState("");
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [giftQuantity, setGiftQuantity] = useState(1);
  const [chatMessage, setChatMessage] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null);

  const gifts = [
    { id: "heart", name: "❤️ 하트", points: 100 },
    { id: "star", name: "⭐ 별", points: 500 },
    { id: "diamond", name: "💎 다이아몬드", points: 1000 },
    { id: "crown", name: "👑 왕관", points: 5000 },
  ];

  const handleStartStream = () => {
    if (!liveTitle.trim()) {
      toast.error("방송 제목을 입력해주세요");
      return;
    }
    setIsLive(true);
    toast.success("라이브 방송이 시작되었습니다");
  };

  const handleEndStream = () => {
    setIsLive(false);
    setLiveTitle("");
    setLiveDescription("");
    toast.success("라이브 방송이 종료되었습니다");
  };

  const handleSendGift = () => {
    if (!selectedGift) {
      toast.error("선물을 선택해주세요");
      return;
    }
    toast.success(`${giftQuantity}개의 선물을 보냈습니다`);
    setGiftQuantity(1);
    setSelectedGift(null);
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim() || !selectedStreamId) return;
    toast.success("메시지가 전송되었습니다");
    setChatMessage("");
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-6">라이브 방송</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">방송 둘러보기</TabsTrigger>
          <TabsTrigger value="broadcast">방송하기</TabsTrigger>
          <TabsTrigger value="history">시청 기록</TabsTrigger>
        </TabsList>

        {/* 방송 둘러보기 */}
        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedStreamId(i)}>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-40 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">라이브 방송 #{i}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Users className="w-4 h-4" />
                    <span>{Math.floor(Math.random() * 1000) + 100} 명 시청 중</span>
                  </div>
                  <Button className="w-full mt-4" onClick={() => setSelectedStreamId(i)}>
                    입장하기
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* 라이브 채팅 */}
          {selectedStreamId && (
            <Card className="p-4 mt-4">
              <h3 className="font-bold mb-4">라이브 채팅</h3>
              <div className="bg-gray-50 h-64 rounded p-4 mb-4 overflow-y-auto space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="text-sm">
                    <span className="font-semibold text-blue-600">사용자{i}:</span>
                    <span className="ml-2 text-gray-700">안녕하세요! 좋은 방송 감사합니다 {i}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="메시지를 입력하세요"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendChatMessage()}
                />
                <Button onClick={handleSendChatMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* 선물 보내기 */}
          {selectedStreamId && (
            <Card className="p-4">
              <h3 className="font-bold mb-4">선물 보내기</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {gifts.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => setSelectedGift(gift.id)}
                    className={`p-3 rounded border-2 transition-all ${
                      selectedGift === gift.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{gift.name.split(" ")[0]}</div>
                    <div className="text-xs text-gray-600">{gift.points}P</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <Input
                  type="number"
                  min="1"
                  value={giftQuantity}
                  onChange={(e) => setGiftQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20"
                />
                <Button onClick={handleSendGift} className="flex-1">
                  <Gift className="w-4 h-4 mr-2" />
                  선물 보내기
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* 방송하기 */}
        <TabsContent value="broadcast" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">라이브 방송 시작</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">방송 제목</label>
                <Input
                  placeholder="방송 제목을 입력하세요"
                  value={liveTitle}
                  onChange={(e) => setLiveTitle(e.target.value)}
                  disabled={isLive}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">방송 설명</label>
                <Textarea
                  placeholder="방송에 대해 설명해주세요"
                  value={liveDescription}
                  onChange={(e) => setLiveDescription(e.target.value)}
                  disabled={isLive}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                {!isLive ? (
                  <Button onClick={handleStartStream} className="flex-1" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    방송 시작
                  </Button>
                ) : (
                  <>
                    <div className="flex-1 bg-red-50 border border-red-200 rounded p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-red-600">라이브 중...</span>
                      </div>
                    </div>
                    <Button onClick={handleEndStream} variant="destructive" size="lg">
                      <Square className="w-4 h-4 mr-2" />
                      방송 종료
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* 시청 기록 */}
        <TabsContent value="history" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">시청 기록</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">라이브 방송 #{i}</p>
                    <p className="text-sm text-gray-600">2시간 전</p>
                  </div>
                  <Button variant="outline" size="sm">
                    다시보기
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
