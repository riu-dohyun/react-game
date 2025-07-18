import { useState, useEffect } from 'react'
import './ColorMatch.css'

interface ColorMatchProps {
  onBack: () => void
}

interface ColorItem {
  id: number
  color: string
  name: string
}

const COLORS: ColorItem[] = [
  { id: 1, color: '#ff6b6b', name: '빨강' },
  { id: 2, color: '#4ecdc4', name: '청록' },
  { id: 3, color: '#45b7d1', name: '파랑' },
  { id: 4, color: '#96ceb4', name: '초록' },
  { id: 5, color: '#ffeaa7', name: '노랑' },
  { id: 6, color: '#dda0dd', name: '보라' },
  { id: 7, color: '#ffa07a', name: '주황' },
  { id: 8, color: '#98d8c8', name: '민트' },
  { id: 9, color: '#f7dc6f', name: '금색' },
  { id: 10, color: '#bb8fce', name: '라벤더' }
]

function ColorMatch({ onBack }: ColorMatchProps) {
  const [currentColor, setCurrentColor] = useState<ColorItem | null>(null)
  const [options, setOptions] = useState<ColorItem[]>([])
  const [score, setScore] = useState<number>(0)
  const [lives, setLives] = useState<number>(3)
  const [timeLeft, setTimeLeft] = useState<number>(30)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [gameWon, setGameWon] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [level, setLevel] = useState<number>(1)

  const generateRound = () => {
    const numOptions = Math.min(4 + Math.floor(level / 3), 6)
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5)
    const correctColor = shuffledColors[0]
    const wrongColors = shuffledColors.slice(1, numOptions)
    const allOptions = [correctColor, ...wrongColors].sort(() => Math.random() - 0.5)
    
    setCurrentColor(correctColor)
    setOptions(allOptions)
  }

  const startGame = () => {
    setScore(0)
    setLives(3)
    setTimeLeft(30)
    setGameOver(false)
    setGameWon(false)
    setLevel(1)
    setIsPlaying(true)
    generateRound()
  }

  const handleColorSelect = (selectedColor: ColorItem) => {
    if (!isPlaying || gameOver) return

    if (selectedColor.id === currentColor?.id) {
      const points = 10 + (level - 1) * 5
      setScore(prev => prev + points)
      setLevel(prev => prev + 1)
      
      if (level >= 20) {
        setGameWon(true)
        setIsPlaying(false)
        return
      }
      
      generateRound()
      setTimeLeft(Math.max(15, 30 - Math.floor(level / 5) * 2))
    } else {
      setLives(prev => {
        const newLives = prev - 1
        if (newLives <= 0) {
          setGameOver(true)
          setIsPlaying(false)
        }
        return newLives
      })
    }
  }

  const resetGame = () => {
    setIsPlaying(false)
    setGameOver(false)
    setGameWon(false)
  }

  useEffect(() => {
    if (!isPlaying || gameOver || gameWon) return

    if (timeLeft <= 0) {
      setLives(prev => {
        const newLives = prev - 1
        if (newLives <= 0) {
          setGameOver(true)
          setIsPlaying(false)
        }
        return newLives
      })
      setTimeLeft(Math.max(15, 30 - Math.floor(level / 5) * 2))
      generateRound()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, isPlaying, gameOver, gameWon, level])

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>
      
      <h2>🎨 색깔 맞추기</h2>
      
      {!isPlaying ? (
        <div className="game-start">
          <div className="game-description">
            <p><strong>색깔 이름을 보고 올바른 색을 선택하세요!</strong></p>
            <p>• 제한 시간 내에 정답을 맞춰야 합니다</p>
            <p>• 레벨이 올라갈수록 선택지가 많아집니다</p>
            <p>• 생명은 3개, 20레벨 달성시 승리!</p>
          </div>
          <button className="start-button" onClick={startGame}>
            게임 시작
          </button>
        </div>
      ) : (
        <>
          <div className="game-stats">
            <div className="stat-item">
              <span className="stat-label">점수</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">레벨</span>
              <span className="stat-value">{level}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">생명</span>
              <span className="stat-value">{'❤️'.repeat(lives)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">시간</span>
              <span className="stat-value timer">{timeLeft}초</span>
            </div>
          </div>

          <div className="color-question">
            <div className="question-text">
              이 색을 찾으세요: <span className="color-name">{currentColor?.name}</span>
            </div>
          </div>

          <div className="color-options">
            {options.map((color) => (
              <button
                key={color.id}
                className="color-option"
                style={{ backgroundColor: color.color }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>

          {(gameOver || gameWon) && (
            <div className="game-end-overlay">
              <div className="game-end-message">
                {gameWon ? (
                  <div className="win-message">
                    🎉 축하합니다!<br/>20레벨을 달성했습니다!<br/>최종 점수: {score}점
                  </div>
                ) : (
                  <div className="lose-message">
                    게임 오버!<br/>최종 점수: {score}점<br/>도달 레벨: {level}
                  </div>
                )}
                <div className="end-buttons">
                  <button className="continue-button" onClick={startGame}>
                    다시 시작
                  </button>
                  <button className="menu-button" onClick={resetGame}>
                    메뉴로
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ColorMatch