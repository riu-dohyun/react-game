import { useState, useCallback } from 'react'
import './SimonSays.css'

interface SimonSaysProps {
  onBack: () => void
}

type Color = 'red' | 'blue' | 'green' | 'yellow'

const COLORS: Color[] = ['red', 'blue', 'green', 'yellow']

const COLOR_NAMES: Record<Color, string> = {
  red: '빨강',
  blue: '파랑', 
  green: '초록',
  yellow: '노랑'
}

function SimonSays({ onBack }: SimonSaysProps) {
  const [sequence, setSequence] = useState<Color[]>([])
  const [playerSequence, setPlayerSequence] = useState<Color[]>([])
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isShowingSequence, setIsShowingSequence] = useState<boolean>(false)
  const [activeColor, setActiveColor] = useState<Color | null>(null)
  const [level, setLevel] = useState<number>(1)
  const [score, setScore] = useState<number>(0)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)

  const generateNextColor = useCallback((): Color => {
    return COLORS[Math.floor(Math.random() * COLORS.length)]
  }, [])

  const startGame = () => {
    const firstColor = generateNextColor()
    setSequence([firstColor])
    setPlayerSequence([])
    setLevel(1)
    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
    setIsReady(true)
    setTimeout(() => showSequence([firstColor]), 1000)
  }

  const showSequence = useCallback((seq: Color[]) => {
    setIsShowingSequence(true)
    setPlayerSequence([])
    
    seq.forEach((color, index) => {
      setTimeout(() => {
        setActiveColor(color)
        setTimeout(() => setActiveColor(null), 600)
      }, index * 800)
    })

    setTimeout(() => {
      setIsShowingSequence(false)
    }, seq.length * 800 + 200)
  }, [])

  const handleColorClick = (color: Color) => {
    if (!isPlaying || isShowingSequence || gameOver) return

    const newPlayerSequence = [...playerSequence, color]
    setPlayerSequence(newPlayerSequence)

    // 현재 입력이 틀렸는지 확인
    if (sequence[newPlayerSequence.length - 1] !== color) {
      setGameOver(true)
      setIsPlaying(false)
      return
    }

    // 시퀀스를 모두 맞췄는지 확인
    if (newPlayerSequence.length === sequence.length) {
      const newScore = score + level * 10
      setScore(newScore)
      setLevel(level + 1)
      
      // 다음 레벨로
      setTimeout(() => {
        const nextSequence = [...sequence, generateNextColor()]
        setSequence(nextSequence)
        setTimeout(() => showSequence(nextSequence), 1000)
      }, 1000)
    }
  }

  const resetGame = () => {
    setSequence([])
    setPlayerSequence([])
    setIsPlaying(false)
    setIsShowingSequence(false)
    setActiveColor(null)
    setLevel(1)
    setScore(0)
    setGameOver(false)
    setIsReady(false)
  }

  const getButtonClass = (color: Color) => {
    let className = `simon-button ${color}`
    if (activeColor === color) className += ' active'
    if (isShowingSequence) className += ' disabled'
    return className
  }

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>
      
      <h2>🎵 사이먼 Says</h2>
      
      {!isReady ? (
        <div className="game-start">
          <div className="game-description">
            <p><strong>패턴을 기억하고 따라해보세요!</strong></p>
            <p>• 색깔이 빛나는 순서를 기억하세요</p>
            <p>• 같은 순서로 색깔 버튼을 눌러주세요</p>
            <p>• 레벨이 올라갈수록 패턴이 길어집니다</p>
            <p>• 실수하면 게임이 끝납니다</p>
          </div>
          
          <button className="start-button" onClick={startGame}>
            게임 시작
          </button>
        </div>
      ) : (
        <>
          <div className="game-stats">
            <div className="stat-item">
              <span className="stat-label">레벨</span>
              <span className="stat-value">{level}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">점수</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">패턴 길이</span>
              <span className="stat-value">{sequence.length}</span>
            </div>
          </div>

          <div className="simon-status">
            {isShowingSequence ? (
              <div className="status-message showing">
                패턴을 기억하세요... ({playerSequence.length + 1}/{sequence.length})
              </div>
            ) : gameOver ? (
              <div className="status-message game-over">
                게임 오버!
              </div>
            ) : (
              <div className="status-message waiting">
                패턴을 따라해보세요 ({playerSequence.length}/{sequence.length})
              </div>
            )}
          </div>

          <div className="simon-board">
            {COLORS.map((color) => (
              <button
                key={color}
                className={getButtonClass(color)}
                onClick={() => handleColorClick(color)}
                disabled={isShowingSequence || gameOver}
              >
                <span className="color-name">{COLOR_NAMES[color]}</span>
              </button>
            ))}
          </div>

          {gameOver && (
            <div className="game-end-overlay">
              <div className="game-end-message">
                <div className="lose-message">
                  🎯 게임 오버!<br/>
                  최종 레벨: {level}<br/>
                  최종 점수: {score}점
                </div>
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

export default SimonSays