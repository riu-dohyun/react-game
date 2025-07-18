import { useState, useEffect, useCallback, useRef } from "react";
import "./Snake.css";

interface SnakeProps {
  onBack: () => void;
}

interface Position {
  x: number;
  y: number;
}

const BOARD_SIZE = 24;
const INITIAL_SNAKE = [{ x: 12, y: 12 }];
const INITIAL_FOOD = { x: 18, y: 18 };
const INITIAL_SPEED = 120;

function Snake({ onBack }: SnakeProps) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Position>({ x: 0, y: 0 });
  const [nextDirection, setNextDirection] = useState<Position>({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
  const gameLoopRef = useRef<number | null>(null);

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
    } while (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );
    return newFood;
  }, [snake]);

  const resetGame = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection({ x: 0, y: 0 });
    setNextDirection({ x: 0, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
    setSpeed(INITIAL_SPEED);
  };

  const startGame = () => {
    resetGame();
    setDirection({ x: 0, y: -1 });
    setNextDirection({ x: 0, y: -1 });
    setIsPlaying(true);
  };

  const moveSnake = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setDirection(nextDirection);

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      head.x += nextDirection.x;
      head.y += nextDirection.y;

      // 벽 충돌 검사
      if (
        head.x < 0 ||
        head.x >= BOARD_SIZE ||
        head.y < 0 ||
        head.y >= BOARD_SIZE
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      // 자기 자신과 충돌 검사
      if (
        newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // 음식 먹기 검사
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 10);
        setFood(generateFood());
        setSpeed((prev) => Math.max(60, prev - 3)); // 속도 증가
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [nextDirection, food, isPlaying, gameOver, generateFood]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      e.preventDefault();

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (direction.y !== 1) setNextDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (direction.y !== -1) setNextDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (direction.x !== 1) setNextDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (direction.x !== -1) setNextDirection({ x: 1, y: 0 });
          break;
      }
    },
    [direction, isPlaying, gameOver]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveSnake, speed, isPlaying, gameOver]);

  const renderCell = (x: number, y: number) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
    const isSnakeBody = snake
      .slice(1)
      .some((segment) => segment.x === x && segment.y === y);
    const isFood = food.x === x && food.y === y;

    let cellClass = "cell";
    if (isSnakeHead) cellClass += " snake-head";
    else if (isSnakeBody) cellClass += " snake-body";
    else if (isFood) cellClass += " food";

    return <div key={`${x}-${y}`} className={cellClass} />;
  };

  return (
    <div className="snake-fullscreen">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>

      <div className="snake-header">
        <h2>🐍 스네이크 게임</h2>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">점수</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">속도</span>
            <span className="stat-value">
              {Math.round((INITIAL_SPEED - speed) / 10) + 1}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">길이</span>
            <span className="stat-value">{snake.length}</span>
          </div>
        </div>
      </div>

      <div className="snake-main">
        {gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-message">
              🐍 게임 오버!
              <br />
              최종 점수: {score}점
            </div>
            <button className="start-button" onClick={startGame}>
              다시 시작
            </button>
          </div>
        )}

        {!isPlaying && !gameOver && (
          <div className="game-start-overlay">
            <div className="start-message">
              <h3>스네이크 게임</h3>
              <p>방향키 또는 WASD로 뱀을 조작하여 사과를 먹어보세요!</p>
              <p>벽이나 자신의 몸에 닿으면 게임 오버입니다.</p>
            </div>
            <button className="start-button" onClick={startGame}>
              게임 시작
            </button>
          </div>
        )}

        <div className="game-board-container">
          <div className="game-board">
            {Array.from({ length: BOARD_SIZE }, (_, y) =>
              Array.from({ length: BOARD_SIZE }, (_, x) => renderCell(x, y))
            )}
          </div>
        </div>

        <div className="game-controls">
          {isPlaying && (
            <div className="control-hint">방향키 또는 WASD로 이동</div>
          )}

          {/* 모바일 컨트롤 */}
          {isPlaying && (
            <div className="mobile-controls">
              <div className="mobile-row">
                <button
                  className="mobile-btn"
                  onTouchStart={(e) => {
                    e.preventDefault();
                    if (direction.y !== 1) setNextDirection({ x: 0, y: -1 });
                  }}
                >
                  ↑
                </button>
              </div>
              <div className="mobile-row">
                <button
                  className="mobile-btn"
                  onTouchStart={(e) => {
                    e.preventDefault();
                    if (direction.x !== 1) setNextDirection({ x: -1, y: 0 });
                  }}
                >
                  ←
                </button>
                <button
                  className="mobile-btn"
                  onTouchStart={(e) => {
                    e.preventDefault();
                    if (direction.x !== -1) setNextDirection({ x: 1, y: 0 });
                  }}
                >
                  →
                </button>
              </div>
              <div className="mobile-row">
                <button
                  className="mobile-btn"
                  onTouchStart={(e) => {
                    e.preventDefault();
                    if (direction.y !== -1) setNextDirection({ x: 0, y: 1 });
                  }}
                >
                  ↓
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Snake;
