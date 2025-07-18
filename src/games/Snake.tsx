import { useState, useEffect, useCallback } from 'react'
import './Snake.css'

interface SnakeProps {
  onBack: () => void
}

interface Position {
  x: number
  y: number
}

const BOARD_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_FOOD = { x: 15, y: 15 }

function Snake({ onBack }: SnakeProps) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>(INITIAL_FOOD)
  const [direction, setDirection] = useState<Position>({ x: 0, y: -1 })
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(150)

  const generateFood = useCallback(() => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [snake])

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection({ x: 0, y: -1 })
    setGameOver(false)
    setScore(0)
    setIsPlaying(false)
  }

  const startGame = () => {
    resetGame()
    setIsPlaying(true)
  }

  const moveSnake = useCallback(() => {
    if (!isPlaying || gameOver) return

    setSnake(currentSnake => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }
      
      head.x += direction.x
      head.y += direction.y

      // 벽 충돌 검사
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true)
        setIsPlaying(false)
        return currentSnake
      }

      // 자기 자신과 충돌 검사
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        setIsPlaying(false)
        return currentSnake
      }

      newSnake.unshift(head)

      // 음식 먹기 검사
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10)
        setFood(generateFood())
        setSpeed(prev => Math.max(50, prev - 2)) // 속도 증가
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, isPlaying, gameOver, generateFood])

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isPlaying) return

    switch (e.key) {
      case 'ArrowUp':
        if (direction.y !== 1) setDirection({ x: 0, y: -1 })
        break
      case 'ArrowDown':
        if (direction.y !== -1) setDirection({ x: 0, y: 1 })
        break
      case 'ArrowLeft':
        if (direction.x !== 1) setDirection({ x: -1, y: 0 })
        break
      case 'ArrowRight':
        if (direction.x !== -1) setDirection({ x: 1, y: 0 })
        break
    }
  }, [direction, isPlaying])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed)
    return () => clearInterval(gameInterval)
  }, [moveSnake, speed])

  const renderCell = (x: number, y: number) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y
    const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y)
    const isFood = food.x === x && food.y === y

    let cellClass = 'cell'
    if (isSnakeHead) cellClass += ' snake-head'
    else if (isSnakeBody) cellClass += ' snake-body'
    else if (isFood) cellClass += ' food'

    return (
      <div key={`${x}-${y}`} className={cellClass}>
        {isFood && '🍎'}
        {isSnakeHead && '👑'}
      </div>
    )
  }

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>
      
      <h2>스네이크 게임</h2>
      
      <div className="game-info">
        <div className="score">점수: {score}</div>
        <div className="speed">속도: {Math.round((200 - speed) / 10)}</div>
      </div>

      {gameOver && (
        <div className="game-over">
          🐍 게임 오버! 최종 점수: {score}점
        </div>
      )}

      {!isPlaying && !gameOver && (
        <div className="start-message">
          방향키로 뱀을 조작하여 사과를 먹어보세요!<br/>
          벽이나 자신의 몸에 닿으면 게임 오버입니다.
        </div>
      )}

      <div className="game-board">
        {Array.from({ length: BOARD_SIZE }, (_, y) =>
          Array.from({ length: BOARD_SIZE }, (_, x) => renderCell(x, y))
        )}
      </div>

      <div className="game-controls">
        {!isPlaying ? (
          <button className="start-button" onClick={startGame}>
            {gameOver ? '다시 시작' : '게임 시작'}
          </button>
        ) : (
          <div className="control-hint">
            방향키로 이동하세요
          </div>
        )}
      </div>
    </div>
  )
}

export default Snake