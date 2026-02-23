import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, ArrowLeft, Zap } from "lucide-react";
import { toast } from "sonner";

interface Game {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  maxPoints: number;
  status: "available" | "coming-soon";
}

const GAMES: Game[] = [
  {
    id: "go-stop",
    name: "고스톱",
    icon: "🃏",
    description: "한국 전통 카드 게임",
    difficulty: "medium",
    maxPoints: 500,
    status: "coming-soon",
  },
  {
    id: "sudoku",
    name: "스도쿠",
    icon: "🔢",
    description: "숫자 논리 퍼즐",
    difficulty: "medium",
    maxPoints: 300,
    status: "coming-soon",
  },
  {
    id: "tetris",
    name: "테트리스",
    icon: "🧩",
    description: "클래식 블록 게임",
    difficulty: "medium",
    maxPoints: 400,
    status: "coming-soon",
  },
  {
    id: "baccarat",
    name: "바카라",
    icon: "🎰",
    description: "카드 배팅 게임",
    difficulty: "hard",
    maxPoints: 1000,
    status: "coming-soon",
  },
  {
    id: "holdem",
    name: "홀덤",
    icon: "♠️",
    description: "포커 변형 게임",
    difficulty: "hard",
    maxPoints: 800,
    status: "coming-soon",
  },
  {
    id: "mahjong",
    name: "마작",
    icon: "🀄",
    description: "동양 타일 게임",
    difficulty: "hard",
    maxPoints: 600,
    status: "coming-soon",
  },
  {
    id: "chess",
    name: "체스",
    icon: "♟️",
    description: "전략 보드 게임",
    difficulty: "hard",
    maxPoints: 700,
    status: "coming-soon",
  },
  {
    id: "janggi",
    name: "장기",
    icon: "🎯",
    description: "한국 전략 게임",
    difficulty: "hard",
    maxPoints: 650,
    status: "coming-soon",
  },
  {
    id: "baduk",
    name: "바둑",
    icon: "⚫",
    description: "고대 전략 게임",
    difficulty: "hard",
    maxPoints: 900,
    status: "coming-soon",
  },
  {
    id: "omok",
    name: "오목",
    icon: "⭕",
    description: "5개 연결 게임",
    difficulty: "medium",
    maxPoints: 350,
    status: "coming-soon",
  },
  {
    id: "yukmok",
    name: "육목",
    icon: "🔵",
    description: "6개 연결 게임",
    difficulty: "hard",
    maxPoints: 550,
    status: "coming-soon",
  },
];

export default function Games() {
  const [, setLocation] = useLocation();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handlePlayGame = (gameId: string, status: string) => {
    if (status === "coming-soon") {
      toast.info("곧 출시될 게임입니다!");
      return;
    }
    setSelectedGame(gameId);
    toast.success(`${gameId} 게임을 시작합니다!`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "쉬움";
      case "medium":
        return "중간";
      case "hard":
        return "어려움";
      default:
        return "보통";
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setLocation("/dashboard")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold">게임 포털</h1>
        </div>
      </div>

      {/* 게임 소개 */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
          <div>
            <h2 className="font-semibold text-purple-900">포인트 적립 게임</h2>
            <p className="text-sm text-purple-700 mt-1">
              각 게임에서 승리하면 포인트를 얻을 수 있습니다. 포인트로 VIP 등급을 올리고 특별한 혜택을 누려보세요!
            </p>
          </div>
        </div>
      </Card>

      {/* 게임 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((game) => (
          <Card
            key={game.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              game.status === "coming-soon"
                ? "opacity-60 bg-gray-50"
                : "hover:border-purple-300"
            }`}
            onClick={() => handlePlayGame(game.id, game.status)}
          >
            <div className="text-center">
              {/* 게임 아이콘 */}
              <div className="text-4xl mb-2">{game.icon}</div>

              {/* 게임 이름 */}
              <h3 className="font-bold text-sm mb-1">{game.name}</h3>

              {/* 설명 */}
              <p className="text-xs text-gray-600 mb-2">{game.description}</p>

              {/* 난이도 배지 */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(
                    game.difficulty
                  )}`}
                >
                  {getDifficultyLabel(game.difficulty)}
                </span>
              </div>

              {/* 포인트 */}
              <div className="text-xs font-semibold text-purple-600 mb-3">
                최대 {game.maxPoints} 포인트
              </div>

              {/* 버튼 */}
              <Button
                size="sm"
                className={`w-full ${
                  game.status === "coming-soon"
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg"
                }`}
                disabled={game.status === "coming-soon"}
              >
                {game.status === "coming-soon" ? "준비 중" : "플레이"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* 게임 실행 중 표시 */}
      {selectedGame && (
        <Card className="p-6 text-center bg-gradient-to-r from-purple-100 to-pink-100">
          <p className="text-lg font-bold text-purple-900 mb-2">
            🎮 게임 실행 중
          </p>
          <p className="text-sm text-purple-700 mb-4">
            {GAMES.find((g) => g.id === selectedGame)?.name} 게임을 플레이 중입니다.
          </p>
          <Button
            onClick={() => setSelectedGame(null)}
            variant="outline"
            className="w-full"
          >
            게임 종료
          </Button>
        </Card>
      )}

      {/* 포인트 정보 */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 포인트 시스템</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ 게임 승리: 최대 1,000 포인트</li>
          <li>✓ 미션 완료: 최대 2,000 포인트</li>
          <li>✓ 건강 개선: 최대 500 포인트</li>
          <li>✓ 숙면 감지: 최대 300 포인트</li>
        </ul>
      </Card>
    </div>
  );
}
