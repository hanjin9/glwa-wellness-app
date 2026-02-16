import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Gift, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export default function LiveBroadcast() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("browse");
  const [isLive, setIsLive] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDescription, setLiveDescription] = useState("");
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [giftQuantity, setGiftQuantity] = useState(1);

  const gifts = [
    { id: "heart", name: "❤️ 하트", points: 100 },
    { id: "star", name: "⭐ 별", points: 500 },
    { id: "diamond", name: "💎 다이아몬드", points: 1000 },
    { id: "crown", name: "👑 왕관", points: 5000 },
  ];

  const handleStartStream = () => {
    if (!liveTitle.trim()) {
      toast.error("라이브 제목을 입력해주세요");
      return;
    }
    setIsLive(true);
    toast.success("라이브 방송이 시작되었습니다!");
  };

  const handleEndStream = () => {
    setIsLive(false);
    setLiveTitle("");
    setLiveDescription("");
    toast.success("라이브 방송이 종료되었습니다");
  };

  const handleSendGift = (giftId: string) => {
    const gift = gifts.find((g) => g.id === giftId);
    if (!gift) return;
    toast.success(`${gift.name}를 ${giftQuantity}개 보냈습니다!`);
    setGiftQuantity(1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">라이브 방송</h1>
          <p className="text-sm text-muted-foreground">
            건강 정보를 공유하고 포인트를 기부하세요
          </p>
        </div>

        {/* 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">라이브 시청</TabsTrigger>
            <TabsTrigger value="broadcast">라이브 방송</TabsTrigger>
          </TabsList>

          {/* 라이브 시청 탭 */}
          <TabsContent value="browse" className="space-y-4">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">현재 진행 중인 라이브가 없습니다</p>
              <p className="text-xs text-muted-foreground">
                라이브 방송 기능은 준비 중입니다
              </p>
            </Card>
          </TabsContent>

          {/* 라이브 방송 탭 */}
          <TabsContent value="broadcast" className="space-y-4">
            {!isLive ? (
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold">라이브 방송 시작</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">제목</label>
                    <Input
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      placeholder="라이브 제목을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">설명</label>
                    <Textarea
                      value={liveDescription}
                      onChange={(e) => setLiveDescription(e.target.value)}
                      placeholder="라이브 설명을 입력하세요"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleStartStream}
                    className="w-full gap-2"
                  >
                    <Play className="w-4 h-4" />
                    라이브 시작
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 space-y-4 border-green-500/50 bg-green-50/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-semibold text-red-500">라이브 중...</span>
                  </div>
                  <Button
                    onClick={handleEndStream}
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                  >
                    <Square className="w-4 h-4" />
                    종료
                  </Button>
                </div>
                <div className="bg-secondary p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">{liveTitle}</p>
                  <p className="text-xs text-muted-foreground">{liveDescription}</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
