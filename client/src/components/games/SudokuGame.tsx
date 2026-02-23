import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, ArrowLeft, Trophy } from 'lucide-react';

interface SudokuGameProps {
  onGameEnd?: (result: 'win' | 'loss', points: number) => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';

// 스도쿠 퍼즐 생성 함수
function generateSudokuPuzzle(difficulty: Difficulty): number[][] {
  // 완성된 스도쿠 보드
  const completed = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  // 난이도별 제거할 셀 개수
  const cellsToRemove = {
    easy: 30,
    medium: 45,
    hard: 55,
  };

  const puzzle = completed.map(row => [...row]);
  let removed = 0;

  while (removed < cellsToRemove[difficulty]) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return puzzle;
}

// 스도쿠 검증 함수
function isValidSudoku(board: number[][]): boolean {
  // 행 검증
  for (let i = 0; i < 9; i++) {
    const row = board[i];
    const seen = new Set<number>();
    for (const num of row) {
      if (num !== 0) {
        if (seen.has(num)) return false;
        seen.add(num);
      }
    }
  }

  // 열 검증
  for (let col = 0; col < 9; col++) {
    const seen = new Set<number>();
    for (let row = 0; row < 9; row++) {
      const num = board[row][col];
      if (num !== 0) {
        if (seen.has(num)) return false;
        seen.add(num);
      }
    }
  }

  // 3x3 박스 검증
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set<number>();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const num = board[boxRow * 3 + i][boxCol * 3 + j];
          if (num !== 0) {
            if (seen.has(num)) return false;
            seen.add(num);
          }
        }
      }
    }
  }

  return true;
}

// 스도쿠 완성 여부 확인
function isSudokuComplete(board: number[][]): boolean {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) return false;
    }
  }
  return isValidSudoku(board);
}

export default function SudokuGame({ onGameEnd }: SudokuGameProps) {
  const [gameState, setGameState] = useState<'difficulty' | 'playing' | 'completed'>('difficulty');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [board, setBoard] = useState<number[][]>([]);
  const [original, setOriginal] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // 게임 시작
  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const newPuzzle = generateSudokuPuzzle(selectedDifficulty);
    setPuzzle(newPuzzle);
    setBoard(newPuzzle.map(row => [...row]));
    setOriginal(newPuzzle.map(row => [...row]));
    setGameState('playing');
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  // 타이머
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, startTime]);

  // 셀 입력
  const handleCellInput = (row: number, col: number, value: string) => {
    if (original[row][col] !== 0) return; // 원본 셀은 수정 불가

    const newBoard = board.map(r => [...r]);
    const num = value === '' ? 0 : parseInt(value);

    if (num >= 0 && num <= 9) {
      newBoard[row][col] = num;
      setBoard(newBoard);

      // 게임 완성 확인
      if (num !== 0 && isSudokuComplete(newBoard)) {
        setGameState('completed');
        const points = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 300 : 500;
        onGameEnd?.('win', points);
      }
    }
  };

  // 게임 초기화
  const resetGame = () => {
    setBoard(original.map(row => [...row]));
    setSelectedCell(null);
  };

  // 게임 뒤로가기
  const goBack = () => {
    setGameState('difficulty');
    setSelectedCell(null);
  };

  // 난이도 선택 화면
  if (gameState === 'difficulty') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">🔢 스도쿠</h2>
          <p className="text-center text-gray-600">난이도를 선택하세요</p>

          <div className="space-y-3">
            <Button
              onClick={() => startGame('easy')}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              🟢 초급 (30개 힌트)
            </Button>
            <Button
              onClick={() => startGame('medium')}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              🟡 중급 (45개 힌트)
            </Button>
            <Button
              onClick={() => startGame('hard')}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              🔴 고급 (55개 힌트)
            </Button>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            💡 <strong>팁:</strong> 난이도가 높을수록 더 많은 포인트를 얻습니다!
          </div>
        </div>
      </Card>
    );
  }

  // 게임 화면
  if (gameState === 'playing' || gameState === 'completed') {
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
                onClick={goBack}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold">🔢 스도쿠</h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${difficultyColor[difficulty]}`}>
              {difficultyLabel[difficulty]}
            </div>
          </div>

          {/* 게임 상태 */}
          {gameState === 'completed' && (
            <div className="p-3 rounded-lg text-center font-bold bg-green-100 text-green-700">
              🎉 완성! 축하합니다!
            </div>
          )}

          {/* 통계 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">경과 시간</p>
              <p className="text-lg font-bold">{Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">난이도</p>
              <p className="text-lg font-bold">{difficultyLabel[difficulty]}</p>
            </div>
          </div>

          {/* 스도쿠 보드 */}
          <div className="flex justify-center">
            <div className="grid grid-cols-9 gap-0 border-4 border-gray-800 w-fit">
              {board.map((row, rowIdx) =>
                row.map((cell, colIdx) => {
                  const isOriginal = original[rowIdx][colIdx] !== 0;
                  const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                  const boxRow = Math.floor(rowIdx / 3);
                  const boxCol = Math.floor(colIdx / 3);
                  const isBorderRight = (colIdx + 1) % 3 === 0 && colIdx !== 8;
                  const isBorderBottom = (rowIdx + 1) % 3 === 0 && rowIdx !== 8;

                  return (
                    <input
                      key={`${rowIdx}-${colIdx}`}
                      type="text"
                      maxLength={1}
                      value={cell === 0 ? '' : cell}
                      onChange={(e) => handleCellInput(rowIdx, colIdx, e.target.value)}
                      onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                      disabled={isOriginal || gameState === 'completed'}
                      className={`
                        w-10 h-10 text-center font-bold text-lg
                        border border-gray-300
                        ${isBorderRight ? 'border-r-2 border-r-gray-800' : ''}
                        ${isBorderBottom ? 'border-b-2 border-b-gray-800' : ''}
                        ${isSelected ? 'bg-blue-200' : isOriginal ? 'bg-gray-100' : 'bg-white'}
                        ${isOriginal ? 'cursor-not-allowed text-gray-800' : 'cursor-text'}
                        focus:outline-none focus:bg-blue-100
                      `}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={resetGame}
              variant="outline"
              className="flex-1"
              disabled={gameState === 'completed'}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              초기화
            </Button>
            {gameState === 'completed' && (
              <Button
                onClick={goBack}
                variant="outline"
                className="flex-1"
              >
                돌아가기
              </Button>
            )}
          </div>

          {/* 팁 */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            💡 <strong>팁:</strong> 각 행, 열, 3x3 박스에 1~9가 정확히 한 번씩 나타나야 합니다!
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
