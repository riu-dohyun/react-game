import { useState, useEffect, useCallback, useRef } from "react";
import "./FlappyBird.css";

interface FlappyBirdProps {
  onBack: () => void;
}

interface Bird {
  y: number;
  velocity: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
}

const GAME_HEIGHT = 400;
const GAME_WIDTH = 400;
const BIRD_SIZE = 20;
const PIPE_WIDTH = 50;
const PIPE_GAP = 120;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const PIPE_SPEED = 2;

function FlappyBird({ onBack }: FlappyBirdProps) {
  const [bird, setBird] = useState<Bird>({ y: GAME_HEIGHT / 2, velocity: 0 });
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const gameLoopRef = useRef<number | null>(null);
  const pipeSpawnRef = useRef<number | null>(null);

  const createPipe = useCallback((): Pipe => {
    const topHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
    return {
      x: GAME_WIDTH,
      topHeight,
      bottomHeight: GAME_HEIGHT - topHeight - PIPE_GAP,
      passed: false,
    };
  }, []);

  const jump = useCallback(() => {
    if (!isPlaying) return;
    setBird((prev) => ({ ...prev, velocity: JUMP_FORCE }));
  }, [isPlaying]);

  const checkCollision = useCallback((bird: Bird, pipes: Pipe[]): boolean => {
    // 땅이나 천장에 충돌
    if (bird.y <= 0 || bird.y >= GAME_HEIGHT - BIRD_SIZE) {
      return true;
    }

    // 파이프와 충돌
    for (const pipe of pipes) {
      if (
        50 + BIRD_SIZE > pipe.x &&
        50 < pipe.x + PIPE_WIDTH &&
        (bird.y < pipe.topHeight ||
          bird.y + BIRD_SIZE > GAME_HEIGHT - pipe.bottomHeight)
      ) {
        return true;
      }
    }

    return false;
  }, []);

  const updateGame = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setBird((prev) => {
      const newBird = {
        y: prev.y + prev.velocity,
        velocity: prev.velocity + GRAVITY,
      };

      setPipes((prevPipes) => {
        let newPipes = prevPipes.map((pipe) => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED,
        }));

        // 점수 계산
        let newScore = score;
        newPipes.forEach((pipe) => {
          if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
            pipe.passed = true;
            newScore++;
          }
        });

        if (newScore !== score) {
          setScore(newScore);
        }

        // 화면을 벗어난 파이프 제거
        newPipes = newPipes.filter((pipe) => pipe.x > -PIPE_WIDTH);

        // 충돌 검사
        if (checkCollision(newBird, newPipes)) {
          setGameOver(true);
          setIsPlaying(false);
        }

        return newPipes;
      });

      return newBird;
    });
  }, [isPlaying, gameOver, score, checkCollision]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.code === "Space" ||
        e.key === "ArrowUp" ||
        e.key === "w" ||
        e.key === "W"
      ) {
        e.preventDefault();
        jump();
      }
    },
    [jump]
  );

  const handleClick = useCallback(() => {
    jump();
  }, [jump]);

  const startGame = () => {
    setBird({ y: GAME_HEIGHT / 2, velocity: 0 });
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    if (pipeSpawnRef.current) {
      clearInterval(pipeSpawnRef.current);
    }

    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(updateGame, 16); // 60 FPS

      pipeSpawnRef.current = setInterval(() => {
        setPipes((prev) => [...prev, createPipe()]);
      }, 2000); // 새 파이프 2초마다 생성
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (pipeSpawnRef.current) {
        clearInterval(pipeSpawnRef.current);
      }
    };
  }, [updateGame, isPlaying, gameOver, createPipe]);

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>

      <h2>플래피 버드</h2>

      <div className="game-info">
        <div className="score">점수: {score}</div>
        {!isPlaying && !gameOver && (
          <div className="instruction">스페이스바나 클릭으로 점프!</div>
        )}
      </div>

      <div className="flappy-game-area" onClick={handleClick}>
        <div className="game-background">
          {/* 새 */}
          <div
            className="bird"
            style={{
              left: "50px",
              top: `${bird.y}px`,
              transform: `rotate(${Math.min(
                Math.max(bird.velocity * 3, -30),
                30
              )}deg)`,
            }}
          >
            🐦
          </div>

          {/* 파이프들 */}
          {pipes.map((pipe, index) => (
            <div key={index}>
              {/* 위쪽 파이프 */}
              <div
                className="pipe pipe-top"
                style={{
                  left: `${pipe.x}px`,
                  height: `${pipe.topHeight}px`,
                  width: `${PIPE_WIDTH}px`,
                }}
              />
              {/* 아래쪽 파이프 */}
              <div
                className="pipe pipe-bottom"
                style={{
                  left: `${pipe.x}px`,
                  bottom: "0px",
                  height: `${pipe.bottomHeight}px`,
                  width: `${PIPE_WIDTH}px`,
                }}
              />
            </div>
          ))}

          {/* 게임 오버 오버레이 */}
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
              {!gameOver && (
                <div className="instructions">
                  <p>• 스페이스바, 클릭, 또는 ↑키로 점프</p>
                  <p>• 파이프 사이를 통과하여 점수 획득</p>
                  <p>• 파이프나 땅에 닿으면 게임 오버</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 모바일 컨트롤 */}
      {isPlaying && (
        <div className="mobile-control">
          <button
            className="jump-button"
            onTouchStart={(e) => {
              e.preventDefault();
              jump();
            }}
            onClick={jump}
          >
            점프! 🐦
          </button>
        </div>
      )}
    </div>
  );
}

export default FlappyBird;
