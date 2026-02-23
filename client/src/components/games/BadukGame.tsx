import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, ArrowLeft } from 'lucide-react';

interface BadukGameProps {
  onGameEnd?: (result: 'win' | 'loss', points: number) => void;
}

type GamePhase = 'selectUserRank' | 'selectAIRank' | 'playing' | 'completed';

// 바둑 급수 정의
const BADUK_RANKS = [
  // 급수 (30급 ~ 1급)
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `kyu_${30 - i}`,
    label: `${30 - i}급`,
    level: 30 - i,
    type: 'kyu' as const,
  })),
  // 단수 (1단 ~ 7단)
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `dan_${i + 1}`,
    label: `${i + 1}단`,
    level: i + 1,
    type: 'dan' as const,
  })),
];

// 급수 난이도 점수
const RANK_DIFFICULTY: { [key: string]: number } = {
  kyu_30: 50,
  kyu_25: 100,
  kyu_20: 150,
  kyu_15: 200,
  kyu_10: 250,
  kyu_5: 300,
  kyu_1: 350,
  dan_1: 400,
  dan_2: 500,
  dan_3: 600,
  dan_4: 700,
  dan_5: 800,
  dan_6: 900,
  dan_7: 1000,
};

// 보드 초기화
function initializeBoard(): number[][] {
  return Array(19).fill(null).map(() => Array(19).fill(0));
}

// 포인트 계산 (사용자 급수 vs AI 급수)
function calculatePoints(userRank: string, aiRank: string, result: 'win' | 'loss'): number {
  const userDifficulty = RANK_DIFFICULTY[userRank] || 100;
  const aiDifficulty = RANK_DIFFICULTY[aiRank] || 100;
  
  if (result === 'win') {
    // AI가 더 강할수록 더 많은 포인트
    const bonus = Math.max(0, aiDifficulty - userDifficulty);
    return userDifficulty + bonus;
  } else {
    // 패배 시 기본 포인트
    return Math.max(50, userDifficulty / 2);
  }
}

export default function BadukGame({ onGameEnd }: BadukGameProps) {
  const [phase, setPhase] = useState<GamePhase>('selectUserRank');
  const [userRank, setUserRank] = useState<string>('');
  const [aiRank, setAIRank] = useState<string>('');
  const [board, setBoard] = useState<number[][]>(initializeBoard());
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);

  // 사용자 급수 선택
  const handleSelectUserRank = (rankId: string) => {
    setUserRank(rankId);
    setPhase('selectAIRank');
  };

  // AI 급수 선택
  const handleSelectAIRank = (rankId: string) => {
    setAIRank(rankId);
    setPhase('playing');
  };

  // 게임 시뮬레이션 (실제 바둑 AI 대신 간단한 시뮬레이션)
  const simulateGameResult = () => {
    const userDifficulty = RANK_DIFFICULTY[userRank] || 100;
    const aiDifficulty = RANK_DIFFICULTY[aiRank] || 100;
    
    // 사용자 급수가 높을수록 승리 확률 증가
    const winProbability = userDifficulty / (userDifficulty + aiDifficulty);
    const result = Math.random() < winProbability ? 'win' : 'loss';
    
    return result as 'win' | 'loss';
  };

  // 게임 완료
  const completeGame = () => {
    const result = simulateGameResult();
    setGameResult(result);
    const points = calculatePoints(userRank, aiRank, result);
    onGameEnd?.(result, points);
    setPhase('completed');
  };

  // 게임 초기화
  const resetGame = () => {
    setPhase('selectUserRank');
    setUserRank('');
    setAIRank('');
    setBoard(initializeBoard());
    setGameResult(null);
  };

  // 단계 1: 사용자 급수 선택
  if (phase === 'selectUserRank') {
    return (
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">⚫ 바둑</h2>
          <p className="text-center text-gray-600">당신의 급수를 선택하세요</p>

          {/* 급수 선택 그리드 */}
          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
            {BADUK_RANKS.map((rank) => (
              <Button
                key={rank.id}
                onClick={() => handleSelectUserRank(rank.id)}
                variant="outline"
                className="text-sm"
              >
                {rank.label}
              </Button>
            ))}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            💡 <strong>팁:</strong> 높은 급수를 선택할수록 더 강한 AI와 대국하게 됩니다!
          </div>
        </div>
      </Card>
    );
  }

  // 단계 2: AI 급수 선택
  if (phase === 'selectAIRank') {
    return (
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPhase('selectUserRank')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">⚫ 바둑</h2>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">당신의 급수</p>
            <p className="text-lg font-bold">
              {BADUK_RANKS.find(r => r.id === userRank)?.label}
            </p>
          </div>

          <p className="text-center text-gray-600">상대 AI의 급수를 선택하세요</p>

          {/* AI 급수 선택 그리드 */}
          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
            {BADUK_RANKS.map((rank) => (
              <Button
                key={rank.id}
                onClick={() => handleSelectAIRank(rank.id)}
                variant="outline"
                className="text-sm"
              >
                {rank.label}
              </Button>
            ))}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            💡 <strong>팁:</strong> 더 강한 AI를 이기면 더 많은 포인트를 얻습니다!
          </div>
        </div>
      </Card>
    );
  }

  // 단계 3: 게임 진행 중
  if (phase === 'playing') {
    return (
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">⚫ 바둑</h2>
            <div className="text-sm text-gray-600">
              {BADUK_RANKS.find(r => r.id === userRank)?.label} vs {BADUK_RANKS.find(r => r.id === aiRank)?.label}
            </div>
          </div>

          {/* 바둑판 (19x19) */}
          <div className="flex justify-center">
            <div className="inline-block border-2 border-amber-900 bg-amber-100 p-2">
              <div className="grid gap-0" style={{ gridTemplateColumns: 'repeat(19, 1fr)' }}>
                {board.map((row, rowIdx) =>
                  row.map((cell, colIdx) => (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className={`
                        w-6 h-6 border border-amber-800
                        flex items-center justify-center
                        ${rowIdx === 0 ? 'border-t-2' : ''}
                        ${rowIdx === 18 ? 'border-b-2' : ''}
                        ${colIdx === 0 ? 'border-l-2' : ''}
                        ${colIdx === 18 ? 'border-r-2' : ''}
                      `}
                    >
                      {cell === 1 && <div className="w-4 h-4 bg-black rounded-full" />}
                      {cell === 2 && <div className="w-4 h-4 bg-white rounded-full border border-gray-400" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 게임 설명 */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            <p>🎮 <strong>게임 시뮬레이션 중...</strong></p>
            <p>AI와의 대국을 시뮬레이션하고 있습니다.</p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={completeGame}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              게임 완료
            </Button>
            <Button
              onClick={() => setPhase('selectUserRank')}
              variant="outline"
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // 단계 4: 게임 완료
  if (phase === 'completed') {
    const points = calculatePoints(userRank, aiRank, gameResult!);
    const userRankLabel = BADUK_RANKS.find(r => r.id === userRank)?.label;
    const aiRankLabel = BADUK_RANKS.find(r => r.id === aiRank)?.label;

    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">⚫ 바둑</h2>

          {/* 결과 */}
          <div className={`p-4 rounded-lg text-center font-bold ${
            gameResult === 'win' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {gameResult === 'win' ? '🎉 승리!' : '😢 패배'}
          </div>

          {/* 게임 정보 */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">당신의 급수:</span>
              <span className="font-bold">{userRankLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">상대 AI 급수:</span>
              <span className="font-bold">{aiRankLabel}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">획득 포인트:</span>
              <span className="font-bold text-purple-600">{points} 포인트</span>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={resetGame}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              다시 하기
            </Button>
            <Button
              onClick={() => onGameEnd?.('loss', 0)}
              variant="outline"
              className="flex-1"
            >
              나가기
            </Button>
          </div>

          {/* 팁 */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            💡 <strong>팁:</strong> 더 강한 상대를 이길수록 더 많은 포인트를 얻습니다!
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
