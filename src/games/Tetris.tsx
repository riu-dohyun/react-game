import { useState, useEffect, useCallback, useRef } from "react";
import "./Tetris.css";

interface TetrisProps {
  onBack: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  position: Position;
  color: string;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 500;

const PIECES = [
  { shape: [[1, 1, 1, 1]], color: "#00f5ff" }, // I
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#ffff00",
  }, // O
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#8a2be2",
  }, // T
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#00ff00",
  }, // S
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#ff0000",
  }, // Z
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#ffa500",
  }, // J
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#0000ff",
  }, // L
];

function Tetris({ onBack }: TetrisProps) {
  const [board, setBoard] = useState<string[][]>(() =>
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(""))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createPiece = useCallback((): Piece => {
    const pieceType = PIECES[Math.floor(Math.random() * PIECES.length)];
    return {
      shape: pieceType.shape,
      position: {
        x:
          Math.floor(BOARD_WIDTH / 2) -
          Math.floor(pieceType.shape[0].length / 2),
        y: 0,
      },
      color: pieceType.color,
    };
  }, []);

  const rotatePiece = (piece: Piece): Piece => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map((row) => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  };

  const isValidPosition = useCallback(
    (
      piece: Piece,
      board: string[][],
      offset: Position = { x: 0, y: 0 }
    ): boolean => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const newX = piece.position.x + x + offset.x;
            const newY = piece.position.y + y + offset.y;

            if (
              newX < 0 ||
              newX >= BOARD_WIDTH ||
              newY >= BOARD_HEIGHT ||
              (newY >= 0 && board[newY][newX])
            ) {
              return false;
            }
          }
        }
      }
      return true;
    },
    []
  );

  const placePiece = useCallback(
    (piece: Piece, board: string[][]): string[][] => {
      const newBoard = board.map((row) => [...row]);

      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardY = piece.position.y + y;
            const boardX = piece.position.x + x;
            if (boardY >= 0) {
              newBoard[boardY][boardX] = piece.color;
            }
          }
        }
      }

      return newBoard;
    },
    []
  );

  const clearLines = useCallback(
    (board: string[][]): { newBoard: string[][]; clearedLines: number } => {
      const fullLines: number[] = [];

      for (let y = 0; y < BOARD_HEIGHT; y++) {
        if (board[y].every((cell) => cell !== "")) {
          fullLines.push(y);
        }
      }

      if (fullLines.length === 0) {
        return { newBoard: board, clearedLines: 0 };
      }

      const newBoard = board.filter((_, index) => !fullLines.includes(index));

      // 지워진 줄 수만큼 빈 줄 추가
      for (let i = 0; i < fullLines.length; i++) {
        newBoard.unshift(Array(BOARD_WIDTH).fill(""));
      }

      return { newBoard, clearedLines: fullLines.length };
    },
    []
  );

  const movePiece = useCallback(
    (direction: "left" | "right" | "down" | "rotate") => {
      if (!currentPiece || gameOver) return;

      let newPiece = { ...currentPiece };

      switch (direction) {
        case "left":
          newPiece.position.x -= 1;
          break;
        case "right":
          newPiece.position.x += 1;
          break;
        case "down":
          newPiece.position.y += 1;
          break;
        case "rotate":
          newPiece = rotatePiece(newPiece);
          break;
      }

      if (isValidPosition(newPiece, board)) {
        setCurrentPiece(newPiece);
      } else if (direction === "down") {
        // 아래로 못 갈 때는 조각을 고정
        const newBoard = placePiece(currentPiece, board);
        const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);

        setBoard(clearedBoard);
        setLines((prev) => prev + clearedLines);
        setScore((prev) => prev + clearedLines * 100 * level + 10);

        // 다음 조각을 현재 조각으로
        if (nextPiece && isValidPosition(nextPiece, clearedBoard)) {
          setCurrentPiece(nextPiece);
          setNextPiece(createPiece());
        } else {
          setGameOver(true);
          setIsPlaying(false);
        }
      }
    },
    [
      currentPiece,
      board,
      gameOver,
      isValidPosition,
      placePiece,
      clearLines,
      level,
      nextPiece,
      createPiece,
    ]
  );

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      e.preventDefault();

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          movePiece("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          movePiece("right");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          movePiece("down");
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case " ":
          movePiece("rotate");
          break;
      }
    },
    [isPlaying, gameOver, movePiece]
  );

  const startGame = () => {
    const newBoard = Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(""));
    const firstPiece = createPiece();
    const secondPiece = createPiece();

    setBoard(newBoard);
    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPlaying(true);
    setSpeed(INITIAL_SPEED);
  };

  // const resetGame = () => {
  //   if (gameLoopRef.current) {
  //     clearInterval(gameLoopRef.current)
  //     gameLoopRef.current = null
  //   }
  //   setIsPlaying(false)
  //   setGameOver(false)
  // }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const newLevel = Math.floor(lines / 10) + 1;
    setLevel(newLevel);
    setSpeed(Math.max(50, INITIAL_SPEED - (newLevel - 1) * 50));
  }, [lines]);

  useEffect(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        movePiece("down");
      }, speed);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [movePiece, speed, isPlaying, gameOver]);

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row]);

    // 현재 조각을 임시로 보드에 그리기
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            if (
              boardY >= 0 &&
              boardY < BOARD_HEIGHT &&
              boardX >= 0 &&
              boardX < BOARD_WIDTH
            ) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="board-row">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={`board-cell ${cell ? "filled" : ""}`}
            style={{ backgroundColor: cell || "rgba(255, 255, 255, 0.1)" }}
          />
        ))}
      </div>
    ));
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;

    return (
      <div className="next-piece">
        {nextPiece.shape.map((row, y) => (
          <div key={y} className="next-row">
            {row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`next-cell ${cell ? "filled" : ""}`}
                style={{
                  backgroundColor: cell ? nextPiece.color : "transparent",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>

      <h2>테트리스</h2>

      <div className="tetris-container">
        <div className="game-area">
          <div className="game-board tetris-board">{renderBoard()}</div>

          {!isPlaying && (
            <div className="game-overlay">
              {gameOver && (
                <div className="game-over-message">
                  게임 오버!
                  <br />
                  최종 점수: {score}
                </div>
              )}
              <button className="start-button" onClick={startGame}>
                {gameOver ? "다시 시작" : "게임 시작"}
              </button>
            </div>
          )}
        </div>

        <div className="game-info">
          <div className="info-section">
            <h3>점수</h3>
            <div className="info-value">{score}</div>
          </div>

          <div className="info-section">
            <h3>줄</h3>
            <div className="info-value">{lines}</div>
          </div>

          <div className="info-section">
            <h3>레벨</h3>
            <div className="info-value">{level}</div>
          </div>

          <div className="info-section">
            <h3>다음 조각</h3>
            {renderNextPiece()}
          </div>

          <div className="controls-info">
            <h3>조작법</h3>
            <div className="control-item">← → 이동</div>
            <div className="control-item">↓ 빠른 낙하</div>
            <div className="control-item">↑ 회전</div>
            <div className="control-item">또는 WASD</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tetris;
