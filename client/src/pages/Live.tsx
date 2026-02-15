import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Radio, Play, Users, Heart, Share2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Live() {
  const [, setLocation] = useLocation();
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(1234);

  const liveStreams = [
    {
      id: 1,
      title: "헬스 매니저와 함께하는 아침 운동",
      host: "김건강 헬스 매니저",
      viewers: 1234,
      duration: "45분",
      thumbnail: "🏃",
      category: "운동",
    },
    {
      id: 2,
      title: "영양사의 건강한 식단 강의",
      host: "이영양 영양사",
      viewers: 856,
      duration: "60분",
      thumbnail: "🥗",
      category: "식단",
    },
    {
      id: 3,
      title: "명상과 요가로 시작하는 하루",
      host: "박명상 요가 강사",
      viewers: 2103,
      duration: "30분",
      thumbnail: "🧘",
      category: "명상",
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">돌아가기</span>
        </button>
        <h1 className="text-xl font-bold font-resort">라이브 방송</h1>
        <div className="w-12" />
      </div>

      {/* Live Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-700 p-6 text-white shadow-lg"
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Radio className="w-6 h-6 animate-pulse" />
              <span className="text-sm font-bold tracking-wide">실시간 방송 중</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Users className="w-4 h-4" />
            <span className="text-sm font-bold">{viewers.toLocaleString()}명 시청 중</span>
          </div>
        </div>
      </motion.div>

      {/* Featured Live Stream */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black aspect-video flex items-center justify-center shadow-xl border border-white/10"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏃</div>
            <p className="text-white/60 text-sm">라이브 방송 준비 중</p>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold">
          <Radio className="w-3 h-3 animate-pulse" />
          LIVE
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-primary">{viewers.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">현재 시청자</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-amber-500">45분</div>
            <p className="text-[10px] text-muted-foreground mt-1">방송 시간</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-pink-500">3</div>
            <p className="text-[10px] text-muted-foreground mt-1">활성 방송</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Live Streams */}
      <div>
        <h2 className="text-lg font-bold mb-4">현재 진행 중인 라이브</h2>
        <div className="space-y-3">
          {liveStreams.map((stream, index) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 2) }}
            >
              <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-3 p-3">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-3xl flex-shrink-0 relative">
                      {stream.thumbnail}
                      <div className="absolute top-1 right-1 flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        LIVE
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm line-clamp-2 mb-1">{stream.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{stream.host}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {stream.viewers.toLocaleString()}명
                        </span>
                        <span>•</span>
                        <span>{stream.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Play className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <Button
          onClick={() => setIsLive(!isLive)}
          className="gradient-resort text-white border-0 h-12 font-bold rounded-xl"
        >
          <Radio className="w-4 h-4 mr-2" />
          {isLive ? "방송 종료" : "라이브 시작"}
        </Button>
        <Button
          variant="outline"
          className="h-12 font-bold rounded-xl"
        >
          <Share2 className="w-4 h-4 mr-2" />
          공유하기
        </Button>
      </div>

      {/* Chat Section */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            라이브 채팅
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-background/50 rounded-lg p-3 text-xs">
            <p className="text-muted-foreground/60">김건강: 오늘 아침 운동 함께 시작해요! 💪</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-xs">
            <p className="text-muted-foreground/60">이순신: 좋은 정보 감사합니다! 👍</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-xs">
            <p className="text-muted-foreground/60">박영희: 매일 이 시간에 나와요? 🙋</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="메시지 입력..."
              className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-2 text-xs placeholder-muted-foreground/40 focus:outline-none focus:border-primary/50"
            />
            <Button size="sm" className="gradient-resort text-white border-0">
              전송
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
