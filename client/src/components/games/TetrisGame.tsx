import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface TetrisGameProps {
  onGameEnd?: (result: 'win' | 'loss', points: number) => void;
}

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const TETROMINOS = [
  { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' }, // I
  { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' }, // O
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' }, // S
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' }, // Z
  { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-500' }, // J
  { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500' }, // L
  { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' }, // T
];

export default function TetrisGame({ onGameEnd }: TetrisGameProps) {
  const [grid, setGrid] = useState<number[][]>(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPiece, setCurrentPiece] = useState(TETROMINOS[0]);
  const [piecePos, setPiecePos] = useState({ x: 3, y: 0 });

  // 게임 초기화
  const resetGame = () => {
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0)));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setCurrentPiece(TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)]);
    setPiecePos({ x: 3, y: 0 });
  };

  // 게임 종료
  const endGame = () => {
    setGameOver(true);
    const points = Math.min(score * 10, 1000);
    onGameEnd?.(score > 0 ? 'win' : 'loss', points);
  };

  // 게임 루프
  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      setPiecePos(prev => ({ ...prev, y: prev.y + 1 }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver, isPaused]);

  // 키보드 입력
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
          setPiecePos(prev => ({ ...prev, x: Math.max(0, prev.x - 1) }));
          break;
        case 'ArrowRight':
          setPiecePos(prev => ({ ...prev, x: Math.min(GRID_WIDTH - 1, prev.x + 1) }));
          break;
        case 'ArrowDown':
          setPiecePos(prev => ({ ...prev, y: prev.y + 1 }));
          break;
        case ' ':
          e.preventDefault();
          setIsPaused(!isPaused);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">🧩 테트리스</h2>
          <div className="text-lg font-bold text-purple-600">점수: {score}</div>
        </div>

        {/* 게임 상태 */}
        {gameOver && (
          <div className="p-3 rounded-lg text-center font-bold bg-red-100 text-red-700">
            게임 오버! 점수: {score}
          </div>
        )}

        {/* 게임판 */}
        <div className="bg-gray-900 p-2 rounded-lg">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)` }}>
            {grid.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-6 h-6 border border-gray-700 ${
                    cell ? 'bg-blue-500' : 'bg-gray-800'
                  }`}
                />
              ))
            )}
          </div>
        </div>

        {/* 컨트롤 */}
        <div className="space-y-2 text-sm text-gray-600">
          <p>⬅️ ➡️: 좌우 이동</p>
          <p>⬇️: 빠르게 내리기</p>
          <p>스페이스: 일시정지</p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <Button
            onClick={resetGame}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            새 게임
          </Button>
          <Button
            onClick={() => setIsPaused(!isPaused)}
            variant="outline"
            className="flex-1"
          >
            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? '재개' : '일시정지'}
          </Button>
        </div>

        {/* 팁 */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
          💡 <strong>팁:</strong> 라인을 완성하면 포인트를 얻습니다! (최대 400 포인트)
        </div>
      </div>
    </Card>
  );
}
