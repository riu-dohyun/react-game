import { useState, useEffect } from 'react'
import './MemoryCard.css'

interface MemoryCardProps {
  onBack: () => void
}

interface Card {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

const symbols = [
  '🎯', '🎮', '🎲', '🎪', '🎨', '🎭', '🎺', '🎸',
  '🚀', '⭐', '🌙', '☀️', '🌈', '🔥', '❄️', '⚡',
  '🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍑', '🥭',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🌸', '🌺', '🌻', '🌷', '🌹', '🌿', '🍀', '🌵',
  '💎', '💍', '👑', '🎁', '🎈', '🎉', '🎊', '🏆'
]

function MemoryCard({ onBack }: MemoryCardProps) {
  const [gridSize, setGridSize] = useState<number>(4)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState<number>(0)
  const [gameWon, setGameWon] = useState<boolean>(false)
  const [timer, setTimer] = useState<number>(0)
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false)
  const [gameStarted, setGameStarted] = useState<boolean>(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isGameStarted && !gameWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isGameStarted, gameWon])

  const initializeGame = () => {
    const totalCards = gridSize * gridSize
    const pairsNeeded = totalCards / 2
    
    if (pairsNeeded > symbols.length) {
      console.error('Not enough symbols for this grid size')
      return
    }
    
    const selectedSymbols = symbols.slice(0, pairsNeeded)
    const shuffledCards = [...selectedSymbols, ...selectedSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }))
    
    setCards(shuffledCards)
    setFlippedCards([])
    setMoves(0)
    setGameWon(false)
    setTimer(0)
    setIsGameStarted(false)
  }

  const startGame = () => {
    setGameStarted(true)
    setIsGameStarted(true)
    initializeGame()
  }

  const backToSettings = () => {
    setGameStarted(false)
    setIsGameStarted(false)
    setGameWon(false)
  }

  const handleCardClick = (cardId: number) => {
    if (!isGameStarted) {
      setIsGameStarted(true)
    }

    if (flippedCards.length === 2) return

    const card = cards[cardId]
    if (card.isFlipped || card.isMatched) return

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1)
      
      const [firstCard, secondCard] = newFlippedCards.map(id => 
        cards.find(c => c.id === id)!
      )

      if (firstCard.symbol === secondCard.symbol) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlippedCards.includes(c.id) 
              ? { ...c, isMatched: true }
              : c
          ))
          setFlippedCards([])
          
          const updatedCards = cards.map(c => 
            newFlippedCards.includes(c.id) 
              ? { ...c, isMatched: true }
              : c
          )
          
          if (updatedCards.every(c => c.isMatched)) {
            setGameWon(true)
          }
        }, 500)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlippedCards.includes(c.id) 
              ? { ...c, isFlipped: false }
              : c
          ))
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!gameStarted) {
    return (
      <div className="game-container">
        <button className="back-button" onClick={onBack}>
          ← 뒤로가기
        </button>
        
        <h2>메모리 카드 설정</h2>
        
        <div className="game-settings">
          <div className="setting-group">
            <label>그리드 크기</label>
            <div className="grid-size-selector">
              {[2, 3, 4, 5, 6].map(size => (
                <button
                  key={size}
                  className={`size-option ${gridSize === size ? 'selected' : ''}`}
                  onClick={() => setGridSize(size)}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>

          <div className="game-preview">
            <p>
              {gridSize}×{gridSize} 그리드 ({gridSize * gridSize}장의 카드)<br/>
              {(gridSize * gridSize) / 2}쌍을 모두 찾아보세요!
            </p>
            <p className="difficulty">
              난이도: {gridSize <= 3 ? '쉬움' : gridSize <= 4 ? '보통' : '어려움'}
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
      
      <h2>메모리 카드 ({gridSize}×{gridSize})</h2>
      
      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">이동 횟수</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">시간</span>
          <span className="stat-value">{formatTime(timer)}</span>
        </div>
      </div>

      {gameWon && (
        <div className="win-message">
          🎉 축하합니다! {moves}번의 이동으로 {formatTime(timer)}에 완료했습니다!
        </div>
      )}

      <div 
        className="card-grid" 
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-front">?</div>
            <div className="card-back">{card.symbol}</div>
          </div>
        ))}
      </div>

      <div className="game-actions">
        <button className="settings-button" onClick={backToSettings}>
          설정 변경
        </button>
        <button className="reset-button" onClick={initializeGame}>
          새 게임
        </button>
      </div>
    </div>
  )
}

export default MemoryCard