import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Trophy, Skull } from 'lucide-react';

interface ChessGameProps {
  onGameEnd?: (result: 'win' | 'loss', points: number) => void;
}

const PIECE_UNICODE = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

export default function ChessGame({ onGameEnd }: ChessGameProps) {
  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'draw'>('playing');
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [thinking, setThinking] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  // 보드 생성
  const getBoardArray = () => {
    const board: string[] = [];
    for (let i = 0; i < 64; i++) {
      const file = String.fromCharCode(97 + (i % 8));
      const rank = 8 - Math.floor(i / 8);
      board.push(`${file}${rank}`);
    }
    return board;
  };

  const getPieceAt = (square: string) => {
    const piece = game.get(square as any);
    return piece ? PIECE_UNICODE[piece.type.toUpperCase() as keyof typeof PIECE_UNICODE] || piece.type : '';
  };

  const getSquareColor = (square: string) => {
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt(square[1]) - 1;
    return (file + rank) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-700';
  };

  // AI 움직임
  const makeAIMove = () => {
    setThinking(true);
    setTimeout(() => {
      const gameCopy = new Chess(game.fen());
      const moves = gameCopy.moves({ verbose: true });
      
      if (moves.length === 0) {
        if (gameCopy.isCheckmate()) {
          setGameStatus('checkmate');
          onGameEnd?.(playerColor === 'w' ? 'win' : 'loss', playerColor === 'w' ? 1000 : 100);
        } else {
          setGameStatus('stalemate');
          onGameEnd?.('loss', 200);
        }
        setThinking(false);
        return;
      }

      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      gameCopy.move(randomMove);
      setGame(gameCopy);
      setMoves(prev => [...prev, randomMove.san]);

      if (gameCopy.isCheckmate()) {
        setGameStatus('checkmate');
        onGameEnd?.(playerColor === 'b' ? 'win' : 'loss', playerColor === 'b' ? 1000 : 100);
      } else if (gameCopy.isStalemate()) {
        setGameStatus('stalemate');
        onGameEnd?.('loss', 200);
      } else if (gameCopy.isDraw()) {
        setGameStatus('draw');
        onGameEnd?.('loss', 300);
      }

      setThinking(false);
    }, 500);
  };

  const handleSquareClick = (square: string) => {
    if (gameStatus !== 'playing' || thinking) return;
    if (game.turn() !== playerColor) return;

    const piece = game.get(square as any);

    if (selectedSquare === null) {
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square as any, verbose: true });
        setLegalMoves(moves.map((m: any) => m.to));
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({
        from: selectedSquare as any,
        to: square as any,
        promotion: 'q' as any,
      });

      if (move) {
        setGame(gameCopy);
        setMoves(prev => [...prev, move.san]);
        setSelectedSquare(null);
        setLegalMoves([]);

        if (gameCopy.isCheckmate()) {
          setGameStatus('checkmate');
          onGameEnd?.(playerColor === 'w' ? 'win' : 'loss', playerColor === 'w' ? 1000 : 100);
          return;
        }

        if (gameCopy.isStalemate() || gameCopy.isDraw()) {
          setGameStatus(gameCopy.isStalemate() ? 'stalemate' : 'draw');
          onGameEnd?.('loss', 300);
          return;
        }

        // AI 움직임
        makeAIMove();
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setMoves([]);
    setGameStatus('playing');
    setPlayerColor(Math.random() > 0.5 ? 'w' : 'b');
    setThinking(false);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const board = getBoardArray();

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">♟️ 체스</h2>
          <div className="text-sm text-gray-600">
            {gameStatus === 'playing' ? '게임 중...' : gameStatus === 'checkmate' ? '체크메이트!' : gameStatus === 'stalemate' ? '스테일메이트' : '비김'}
          </div>
        </div>

        {/* 게임 상태 */}
        {gameStatus !== 'playing' && (
          <div className={`p-3 rounded-lg text-center font-bold ${
            gameStatus === 'checkmate' && playerColor === 'w' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {gameStatus === 'checkmate' && playerColor === 'w' ? '🎉 승리!' : '패배...'}
          </div>
        )}

        {/* 체스판 */}
        <div className="flex justify-center">
          <div className="grid grid-cols-8 gap-0 border-4 border-amber-900 w-fit">
            {board.map((square) => {
              const isSelected = selectedSquare === square;
              const isLegalMove = legalMoves.includes(square);
              const piece = getPieceAt(square);

              return (
                <button
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`
                    w-12 h-12 flex items-center justify-center text-2xl font-bold
                    ${getSquareColor(square)}
                    ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                    ${isLegalMove ? 'ring-4 ring-green-400' : ''}
                    hover:opacity-80 transition-all
                  `}
                >
                  {piece}
                </button>
              );
            })}
          </div>
        </div>

        {/* 이동 기록 */}
        <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
          <p className="text-sm font-semibold mb-2">이동 기록:</p>
          <div className="text-sm text-gray-700">
            {moves.length === 0 ? (
              <p className="text-gray-500">이동이 없습니다</p>
            ) : (
              <p>{moves.join(' ')}</p>
            )}
          </div>
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
          {gameStatus !== 'playing' && (
            <Button
              onClick={() => onGameEnd?.('loss', 0)}
              variant="outline"
              className="flex-1"
            >
              나가기
            </Button>
          )}
        </div>

        {/* 팁 */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
          💡 <strong>팁:</strong> 상대 왕을 체크메이트하면 1000 포인트를 얻습니다!
        </div>
      </div>
    </Card>
  );
}
