import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, ArrowLeft } from 'lucide-react';

interface YukmokGameProps {
  onGameEnd?: (result: 'win' | 'loss', points: number) => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';
type GamePhase = 'selectDifficulty' | 'playing' | 'completed';

// 보드 초기화
function initializeBoard(): number[][] {
  return Array(19).fill(null).map(() => Array(19).fill(0));
}

// 6개 연결 확인
function checkWin(board: number[][], row: number, col: number, player: number): boolean {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1] // 가로, 세로, 대각선, 역대각선
  ];

  for (const [dr, dc] of directions) {
    let count = 1;
    
    // 앞 방향
    for (let i = 1; i < 6; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= 19 || c < 0 || c >= 19) break;
      if (board[r][c] === player) count++;
      else break;
    }

    // 뒤 방향
    for (let i = 1; i < 6; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= 19 || c < 0 || c >= 19) break;
      if (board[r][c] === player) count++;
      else break;
    }

    if (count >= 6) return true;
  }

  return false;
}

export default function YukmokGame({ onGameEnd }: YukmokGameProps) {
  const [phase, setPhase] = useState<GamePhase>('selectDifficulty');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<number[][]>(initializeBoard());
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const [moveCount, setMoveCount] = useState(0);

  // 난이도 선택
  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setBoard(initializeBoard());
    setMoveCount(0);
    setPhase('playing');
  };

  // 셀 클릭
  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] !== 0) return; // 이미 돌이 있음

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 1; // 플레이어 (검은 돌)

    // 플레이어 승리 확인
    if (checkWin(newBoard, row, col, 1)) {
      setBoard(newBoard);
      setGameResult('win');
      const points = difficulty === 'easy' ? 250 : difficulty === 'medium' ? 400 : 550;
      onGameEnd?.('win', points);
      setPhase('completed');
      return;
    }

    // AI 움직임 (간단한 랜덤)
    let aiMoved = false;
    for (let i = 0; i < 19 && !aiMoved; i++) {
      for (let j = 0; j < 19 && !aiMoved; j++) {
        if (newBoard[i][j] === 0 && Math.random() < 0.2) {
          newBoard[i][j] = 2; // AI (흰 돌)
          
          // AI 승리 확인
          if (checkWin(newBoard, i, j, 2)) {
            setBoard(newBoard);
            setGameResult('loss');
            const points = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 150 : 200;
            onGameEnd?.('loss', points);
            setPhase('completed');
            return;
          }
          
          aiMoved = true;
        }
      }
    }

    setBoard(newBoard);
    setMoveCount(moveCount + 1);
  };

  // 게임 초기화
  const resetGame = () => {
    setBoard(initializeBoard());
    setMoveCount(0);
    setGameResult(null);
    setPhase('playing');
  };

  // 난이도 선택 화면
  if (phase === 'selectDifficulty') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">🔵 육목</h2>
          <p className="text-center text-gray-600">난이도를 선택하세요</p>

          <div className="space-y-3">
            <Button
              onClick={() => startGame('easy')}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              🟢 초급
            </Button>
            <Button
              onClick={() => startGame('medium')}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              🟡 중급
            </Button>
            <Button
              onClick={() => startGame('hard')}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              🔴 고급
            </Button>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            💡 <strong>팁:</strong> 6개를 먼저 연결하면 승리합니다!
          </div>
        </div>
      </Card>
    );
  }

  // 게임 진행 중
  if (phase === 'playing' || phase === 'completed') {
    const difficultyLabel = {
      easy: '초급',
      medium: '중급',
      hard: '고급',
    };

    const difficultyColor = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700',
    };

    return (
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="space-y-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPhase('selectDifficulty')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold">🔵 육목</h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${difficultyColor[difficulty]}`}>
              {difficultyLabel[difficulty]}
            </div>
          </div>

          {/* 게임 상태 */}
          {phase === 'completed' && (
            <div className={`p-3 rounded-lg text-center font-bold ${
              gameResult === 'win' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {gameResult === 'win' ? '🎉 승리!' : '😢 패배'}
            </div>
          )}

          {/* 육목판 (19x19) */}
          <div className="flex justify-center overflow-x-auto">
            <div className="inline-block border-2 border-amber-900 bg-amber-100 p-1">
              <div className="grid gap-0" style={{ gridTemplateColumns: 'repeat(19, 1fr)' }}>
                {board.map((row, rowIdx) =>
                  row.map((cell, colIdx) => (
                    <button
                      key={`${rowIdx}-${colIdx}`}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                      disabled={phase === 'completed' || cell !== 0}
                      className={`
                        w-6 h-6 border border-amber-800
                        flex items-center justify-center
                        ${phase === 'completed' || cell !== 0 ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-amber-200'}
                      `}
                    >
                      {cell === 1 && <div className="w-4 h-4 bg-black rounded-full" />}
                      {cell === 2 && <div className="w-4 h-4 bg-white rounded-full border border-gray-400" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={resetGame}
              variant="outline"
              className="flex-1"
              disabled={phase === 'completed'}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              초기화
            </Button>
            {phase === 'completed' && (
              <Button
                onClick={() => setPhase('selectDifficulty')}
                variant="outline"
                className="flex-1"
              >
                돌아가기
              </Button>
            )}
          </div>

          {/* 팁 */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            💡 <strong>팁:</strong> 6개를 먼저 연결하세요! (검은 돌: 당신, 흰 돌: AI)
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
