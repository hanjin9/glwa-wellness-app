import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, ArrowLeft } from 'lucide-react';

interface JanggiGameProps {
  onGameEnd?: (result: 'win' | 'loss', points: number) => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';
type GamePhase = 'selectDifficulty' | 'playing' | 'completed';

// 한글 장기 기물
const PIECES = {
  // 빨강 (한)
  'R_K': '한왕', 'R_A': '한신', 'R_E': '한상', 'R_H': '한마', 'R_C': '한차', 'R_P': '한포',
  // 파랑 (초)
  'B_K': '초왕', 'B_A': '초신', 'B_E': '초상', 'B_H': '초마', 'B_C': '초차', 'B_P': '초포',
};

// 보드 초기화 (장기판 10x9)
function initializeBoard(): string[][] {
  const board: string[][] = Array(10).fill(null).map(() => Array(9).fill(''));
  
  // 빨강 (한) - 아래쪽
  board[9][0] = 'R_C'; board[9][8] = 'R_C';
  board[8][1] = 'R_H'; board[8][7] = 'R_H';
  board[7][2] = 'R_E'; board[7][6] = 'R_E';
  board[6][3] = 'R_A'; board[6][5] = 'R_A';
  board[5][4] = 'R_K';
  board[6][4] = 'R_P'; board[8][4] = 'R_P';
  
  // 파랑 (초) - 위쪽
  board[0][0] = 'B_C'; board[0][8] = 'B_C';
  board[1][1] = 'B_H'; board[1][7] = 'B_H';
  board[2][2] = 'B_E'; board[2][6] = 'B_E';
  board[3][3] = 'B_A'; board[3][5] = 'B_A';
  board[4][4] = 'B_K';
  board[3][4] = 'B_P'; board[1][4] = 'B_P';
  
  return board;
}

export default function JanggiGame({ onGameEnd }: JanggiGameProps) {
  const [phase, setPhase] = useState<GamePhase>('selectDifficulty');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<string[][]>(initializeBoard());
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
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
    if (selectedCell === null) {
      if (board[row][col].startsWith('R_')) {
        setSelectedCell({ row, col });
      }
    } else {
      // 이동 시뮬레이션
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = newBoard[selectedCell.row][selectedCell.col];
      newBoard[selectedCell.row][selectedCell.col] = '';
      setBoard(newBoard);
      setSelectedCell(null);
      setMoveCount(moveCount + 1);

      // 게임 결과 시뮬레이션 (10수 후 랜덤)
      if (moveCount > 10 && Math.random() < 0.4) {
        const result = Math.random() < 0.5 ? 'win' : 'loss';
        setGameResult(result);
        const points = result === 'win' 
          ? (difficulty === 'easy' ? 200 : difficulty === 'medium' ? 400 : 650)
          : (difficulty === 'easy' ? 100 : difficulty === 'medium' ? 150 : 200);
        onGameEnd?.(result, points);
        setPhase('completed');
      }
    }
  };

  // 게임 초기화
  const resetGame = () => {
    setBoard(initializeBoard());
    setMoveCount(0);
    setGameResult(null);
    setSelectedCell(null);
    setPhase('playing');
  };

  // 난이도 선택 화면
  if (phase === 'selectDifficulty') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">🎯 장기</h2>
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
            💡 <strong>팁:</strong> 상대의 왕을 체크메이트하면 승리합니다!
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
              <h2 className="text-2xl font-bold">🎯 장기</h2>
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

          {/* 장기판 (10x9) */}
          <div className="flex justify-center">
            <div className="inline-block border-4 border-amber-900 bg-amber-100 p-1">
              <div className="grid gap-0" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
                {board.map((row, rowIdx) =>
                  row.map((piece, colIdx) => {
                    const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                    
                    return (
                      <button
                        key={`${rowIdx}-${colIdx}`}
                        onClick={() => handleCellClick(rowIdx, colIdx)}
                        disabled={phase === 'completed'}
                        className={`
                          w-10 h-10 border border-amber-800
                          flex items-center justify-center text-xs font-bold
                          ${isSelected ? 'bg-blue-300' : 'bg-amber-50'}
                          ${phase === 'completed' ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-amber-200'}
                        `}
                      >
                        <span className={piece.startsWith('R_') ? 'text-red-600' : 'text-blue-600'}>
                          {piece ? piece.split('_')[1] : ''}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 통계 */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            <p>이동 횟수: <span className="font-bold">{moveCount}</span></p>
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
            💡 <strong>팁:</strong> 빨강(한)이 당신입니다. 상대 왕을 체크메이트하세요!
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
