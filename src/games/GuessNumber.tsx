import { useState, useEffect } from 'react'
import './GuessNumber.css'

interface GuessNumberProps {
  onBack: () => void
}

function GuessNumber({ onBack }: GuessNumberProps) {
  const [gameSettings, setGameSettings] = useState({
    min: 1,
    max: 100,
    maxAttempts: 10
  })
  const [targetNumber, setTargetNumber] = useState<number>(0)
  const [guess, setGuess] = useState<string>('')
  const [attempts, setAttempts] = useState<number>(0)
  const [message, setMessage] = useState<string>('')
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [history, setHistory] = useState<Array<{guess: number, hint: string}>>([])

  useEffect(() => {
    if (gameStarted) {
      resetGame()
    }
  }, [gameStarted])

  const resetGame = () => {
    const range = gameSettings.max - gameSettings.min + 1
    const newTarget = Math.floor(Math.random() * range) + gameSettings.min
    setTargetNumber(newTarget)
    setGuess('')
    setAttempts(0)
    setMessage(`${gameSettings.min}부터 ${gameSettings.max} 사이의 숫자를 맞춰보세요!`)
    setGameOver(false)
    setHistory([])
  }

  const startGame = () => {
    setGameStarted(true)
  }

  const backToSettings = () => {
    setGameStarted(false)
    setGameOver(false)
    setHistory([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const guessNumber = parseInt(guess)
    
    if (isNaN(guessNumber) || guessNumber < gameSettings.min || guessNumber > gameSettings.max) {
      setMessage(`${gameSettings.min}부터 ${gameSettings.max} 사이의 유효한 숫자를 입력해주세요.`)
      return
    }

    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    let hint = ''
    if (guessNumber === targetNumber) {
      setMessage(`🎉 정답입니다! ${newAttempts}번 만에 맞췄습니다!`)
      setGameOver(true)
      hint = '정답!'
    } else if (newAttempts >= gameSettings.maxAttempts) {
      setMessage(`😢 게임 오버! 정답은 ${targetNumber}이었습니다.`)
      setGameOver(true)
      hint = guessNumber < targetNumber ? '너무 작아요' : '너무 커요'
    } else {
      if (guessNumber < targetNumber) {
        hint = '너무 작아요'
        setMessage(`${hint}! (${gameSettings.maxAttempts - newAttempts}번 남음)`)
      } else {
        hint = '너무 커요'
        setMessage(`${hint}! (${gameSettings.maxAttempts - newAttempts}번 남음)`)
      }
    }

    setHistory(prev => [...prev, { guess: guessNumber, hint }])
    setGuess('')
  }

  if (!gameStarted) {
    return (
      <div className="game-container">
        <button className="back-button" onClick={onBack}>
          ← 뒤로가기
        </button>
        
        <h2>숫자 맞추기 설정</h2>
        
        <div className="game-settings">
          <div className="setting-group">
            <label>숫자 범위</label>
            <div className="range-inputs">
              <div className="input-group">
                <span>최소값</span>
                <input
                  type="number"
                  value={gameSettings.min}
                  onChange={(e) => setGameSettings(prev => ({
                    ...prev, 
                    min: Math.max(1, parseInt(e.target.value) || 1)
                  }))}
                  min="1"
                  max="999"
                />
              </div>
              <span>~</span>
              <div className="input-group">
                <span>최대값</span>
                <input
                  type="number"
                  value={gameSettings.max}
                  onChange={(e) => setGameSettings(prev => ({
                    ...prev, 
                    max: Math.max(prev.min + 1, parseInt(e.target.value) || 100)
                  }))}
                  min={gameSettings.min + 1}
                  max="1000"
                />
              </div>
            </div>
          </div>

          <div className="setting-group">
            <label>최대 시도 횟수</label>
            <input
              type="number"
              value={gameSettings.maxAttempts}
              onChange={(e) => setGameSettings(prev => ({
                ...prev, 
                maxAttempts: Math.max(1, Math.min(50, parseInt(e.target.value) || 10))
              }))}
              min="1"
              max="50"
              className="attempts-input"
            />
          </div>

          <div className="game-preview">
            <p>
              {gameSettings.min}부터 {gameSettings.max} 사이의 숫자를<br/>
              {gameSettings.maxAttempts}번 안에 맞춰보세요!
            </p>
            <p className="difficulty">
              난이도: {gameSettings.max - gameSettings.min < 50 ? '쉬움' : 
                      gameSettings.max - gameSettings.min < 200 ? '보통' : '어려움'}
            </p>
          </div>
          
          <button className="start-button" onClick={startGame}>
            게임 시작
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>
      
      <h2>숫자 맞추기 ({gameSettings.min}-{gameSettings.max})</h2>
      
      <div className="game-info">
        <p className="message">{message}</p>
        <p className="attempts">시도 횟수: {attempts}/{gameSettings.maxAttempts}</p>
      </div>

      {!gameOver && (
        <form onSubmit={handleSubmit} className="guess-form">
          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder={`${gameSettings.min}-${gameSettings.max} 사이 숫자`}
            min={gameSettings.min}
            max={gameSettings.max}
            autoFocus
          />
          <button type="submit">추측하기</button>
        </form>
      )}

      {history.length > 0 && (
        <div className="history">
          <h3>시도 기록</h3>
          <div className="history-list">
            {history.map((entry, index) => (
              <div key={index} className="history-item">
                <span className="guess-num">{entry.guess}</span>
                <span className={`hint ${entry.hint === '정답!' ? 'correct' : ''}`}>
                  {entry.hint}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="game-actions">
        <button className="settings-button" onClick={backToSettings}>
          설정 변경
        </button>
        <button className="reset-button" onClick={resetGame}>
          새 게임
        </button>
      </div>
    </div>
  )
}

export default GuessNumber