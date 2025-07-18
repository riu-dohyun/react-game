import { useState, useEffect, useCallback } from 'react'
import './TwoFortyEight.css'

interface TwoFortyEightProps {
  onBack: () => void
}

type Board = number[][]
type Direction = 'up' | 'down' | 'left' | 'right'
type BoardSize = 4 | 5 | 6
type GameMode = '4x4' | '5x5' | '6x6'

interface GameConfig {
  boardSize: BoardSize
  winningTile: number
  name: string
}

const GAME_CONFIGS: Record<GameMode, GameConfig> = {
  '4x4': { boardSize: 4, winningTile: 2048, name: '2048' },
  '5x5': { boardSize: 5, winningTile: 4096, name: '4096' },
  '6x6': { boardSize: 6, winningTile: 8192, name: '8192' }
}

function TwoFortyEight({ onBack }: TwoFortyEightProps) {
  const [gameMode, setGameMode] = useState<GameMode>('4x4')
  const [board, setBoard] = useState<Board>(() => 
    Array(GAME_CONFIGS[gameMode].boardSize).fill(null).map(() => Array(GAME_CONFIGS[gameMode].boardSize).fill(0))
  )
  const [score, setScore] = useState<number>(0)
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem('2048-best-score')
    return saved ? parseInt(saved) : 0
  })
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [gameWon, setGameWon] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const createEmptyBoard = (size: BoardSize): Board => 
    Array(size).fill(null).map(() => Array(size).fill(0))

  const getEmptyCells = (board: Board): Array<[number, number]> => {
    const emptyCells: Array<[number, number]> = []
    const boardSize = board.length
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (board[row][col] === 0) {
          emptyCells.push([row, col])
        }
      }
    }
    return emptyCells
  }

  const addRandomTile = (board: Board): Board => {
    const emptyCells = getEmptyCells(board)
    if (emptyCells.length === 0) return board

    const newBoard = board.map(row => [...row])
    const randomIndex = Math.floor(Math.random() * emptyCells.length)
    const [row, col] = emptyCells[randomIndex]
    newBoard[row][col] = Math.random() < 0.9 ? 2 : 4

    return newBoard
  }


  const startGame = (selectedMode?: GameMode) => {
    if (selectedMode) {
      setGameMode(selectedMode)
    }
    const config = GAME_CONFIGS[selectedMode || gameMode]
    let newBoard = createEmptyBoard(config.boardSize)
    newBoard = addRandomTile(newBoard)
    newBoard = addRandomTile(newBoard)
    setBoard(newBoard)
    setScore(0)
    setGameOver(false)
    setGameWon(false)
    setIsPlaying(true)
  }

  const resetGame = () => {
    setIsPlaying(false)
    setGameOver(false)
    setGameWon(false)
  }

  const slideArray = (arr: number[]): { array: number[], points: number } => {
    const boardSize = arr.length
    const filtered = arr.filter(val => val !== 0)
    const missing = boardSize - filtered.length
    const zeros = Array(missing).fill(0)
    const newArray = filtered.concat(zeros)
    let points = 0

    for (let i = 0; i < boardSize - 1; i++) {
      if (newArray[i] !== 0 && newArray[i] === newArray[i + 1]) {
        newArray[i] *= 2
        newArray[i + 1] = 0
        points += newArray[i]
      }
    }

    const finalFiltered = newArray.filter(val => val !== 0)
    const finalMissing = boardSize - finalFiltered.length
    const finalZeros = Array(finalMissing).fill(0)
    
    return {
      array: finalFiltered.concat(finalZeros),
      points
    }
  }

  const moveLeft = (board: Board): { newBoard: Board, points: number, moved: boolean } => {
    let totalPoints = 0
    let moved = false
    const newBoard = board.map(row => {
      const { array, points } = slideArray(row)
      if (JSON.stringify(array) !== JSON.stringify(row)) {
        moved = true
      }
      totalPoints += points
      return array
    })

    return { newBoard, points: totalPoints, moved }
  }

  const moveRight = (board: Board): { newBoard: Board, points: number, moved: boolean } => {
    let totalPoints = 0
    let moved = false
    const newBoard = board.map(row => {
      const reversed = [...row].reverse()
      const { array, points } = slideArray(reversed)
      const final = array.reverse()
      if (JSON.stringify(final) !== JSON.stringify(row)) {
        moved = true
      }
      totalPoints += points
      return final
    })

    return { newBoard, points: totalPoints, moved }
  }

  const transpose = (board: Board): Board => {
    return board[0].map((_, colIndex) => board.map(row => row[colIndex]))
  }

  const moveUp = (board: Board): { newBoard: Board, points: number, moved: boolean } => {
    const transposed = transpose(board)
    const { newBoard, points, moved } = moveLeft(transposed)
    return { newBoard: transpose(newBoard), points, moved }
  }

  const moveDown = (board: Board): { newBoard: Board, points: number, moved: boolean } => {
    const transposed = transpose(board)
    const { newBoard, points, moved } = moveRight(transposed)
    return { newBoard: transpose(newBoard), points, moved }
  }

  const isGameOver = (board: Board): boolean => {
    // 빈 셀이 있으면 게임이 끝나지 않음
    if (getEmptyCells(board).length > 0) return false

    const boardSize = board.length
    // 인접한 셀과 합칠 수 있는지 확인
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const currentValue = board[row][col]
        
        // 오른쪽 셀 확인
        if (col < boardSize - 1 && board[row][col + 1] === currentValue) {
          return false
        }
        
        // 아래쪽 셀 확인
        if (row < boardSize - 1 && board[row + 1][col] === currentValue) {
          return false
        }
      }
    }

    return true
  }

  const hasWon = (board: Board): boolean => {
    const config = GAME_CONFIGS[gameMode]
    return board.some(row => row.some(cell => cell >= config.winningTile))
  }

  const move = useCallback((direction: Direction) => {
    if (!isPlaying || gameOver) return

    let result
    switch (direction) {
      case 'left':
        result = moveLeft(board)
        break
      case 'right':
        result = moveRight(board)
        break
      case 'up':
        result = moveUp(board)
        break
      case 'down':
        result = moveDown(board)
        break
    }

    if (result.moved) {
      const newBoardWithTile = addRandomTile(result.newBoard)
      setBoard(newBoardWithTile)
      setScore(prev => {
        const newScore = prev + result.points
        if (newScore > bestScore) {
          setBestScore(newScore)
          localStorage.setItem('2048-best-score', newScore.toString())
        }
        return newScore
      })

      // 승리 확인
      if (!gameWon && hasWon(newBoardWithTile)) {
        setGameWon(true)
      }

      // 게임 오버 확인
      if (isGameOver(newBoardWithTile)) {
        setGameOver(true)
        setIsPlaying(false)
      }
    }
  }, [board, isPlaying, gameOver, gameWon, bestScore])

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isPlaying || gameOver) return

    e.preventDefault()
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        move('left')
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        move('right')
        break
      case 'ArrowUp':
      case 'w':
      case 'W':
        move('up')
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        move('down')
        break
    }
  }, [move, isPlaying, gameOver])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const getTileColor = (value: number): string => {
    const colors: Record<number, string> = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    }
    return colors[value] || '#3c3a32'
  }

  const getTileTextColor = (value: number): string => {
    return value <= 4 ? '#776e65' : '#f9f6f2'
  }

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>
      
      <h2>{GAME_CONFIGS[gameMode].name}</h2>
      
      <div className="game-header">
        <div className="score-container">
          <div className="score-box">
            <div className="score-label">점수</div>
            <div className="score-value">{score}</div>
          </div>
          <div className="score-box">
            <div className="score-label">최고점수</div>
            <div className="score-value">{bestScore}</div>
          </div>
        </div>
      </div>

      {!isPlaying ? (
        <div className="game-start">
          <div className="game-description">
            <p><strong>{GAME_CONFIGS[gameMode].winningTile}을 만들어보세요!</strong></p>
            <p>• 방향키나 WASD로 타일을 움직입니다</p>
            <p>• 같은 숫자끼리 합쳐집니다</p>
            <p>• {GAME_CONFIGS[gameMode].winningTile} 타일을 만들면 승리!</p>
          </div>
          
          <div className="mode-selection">
            <h3>게임 모드 선택</h3>
            <div className="mode-buttons">
              {Object.entries(GAME_CONFIGS).map(([mode, config]) => (
                <button 
                  key={mode}
                  className={`mode-button ${gameMode === mode ? 'active' : ''}`}
                  onClick={() => setGameMode(mode as GameMode)}
                >
                  {config.name}<br/>
                  <small>{config.boardSize}x{config.boardSize}</small>
                </button>
              ))}
            </div>
          </div>
          
          <button className="start-button" onClick={() => startGame()}>
            게임 시작
          </button>
        </div>
      ) : (
        <>
          {(gameWon || gameOver) && (
            <div className="game-end-overlay">
              <div className="game-end-message">
                {gameWon ? (
                  <div className="win-message">
                    🎉 축하합니다!<br/>{GAME_CONFIGS[gameMode].winningTile}을 만들었습니다!
                  </div>
                ) : (
                  <div className="lose-message">
                    게임 오버!<br/>최종 점수: {score}
                  </div>
                )}
                <div className="end-buttons">
                  <button className="continue-button" onClick={() => startGame()}>
                    새 게임
                  </button>
                  <button className="menu-button" onClick={resetGame}>
                    메뉴로
                  </button>
                </div>
              </div>
            </div>
          )}

          <div 
            className="game-board-2048" 
            style={{
              gridTemplateColumns: `repeat(${GAME_CONFIGS[gameMode].boardSize}, 1fr)`,
              gridTemplateRows: `repeat(${GAME_CONFIGS[gameMode].boardSize}, 1fr)`,
              width: `${Math.min(320, 280 + GAME_CONFIGS[gameMode].boardSize * 10)}px`,
              height: `${Math.min(320, 280 + GAME_CONFIGS[gameMode].boardSize * 10)}px`
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`tile ${cell ? 'filled' : ''}`}
                  style={{
                    backgroundColor: cell ? getTileColor(cell) : '#cdc1b4',
                    color: getTileTextColor(cell),
                    fontSize: cell >= 10000 ? '0.8rem' : cell >= 1000 ? '1rem' : cell >= 100 ? '1.3rem' : '1.5rem'
                  }}
                >
                  {cell || ''}
                </div>
              ))
            )}
          </div>

          <div className="controls-hint">
            방향키 또는 WASD로 이동
          </div>

          {/* 모바일 컨트롤 */}
          <div className="mobile-controls-2048">
            <div className="mobile-row">
              <button 
                className="mobile-btn"
                onTouchStart={(e) => {
                  e.preventDefault()
                  move('up')
                }}
              >↑</button>
            </div>
            <div className="mobile-row">
              <button 
                className="mobile-btn"
                onTouchStart={(e) => {
                  e.preventDefault()
                  move('left')
                }}
              >←</button>
              <button 
                className="mobile-btn"
                onTouchStart={(e) => {
                  e.preventDefault()
                  move('right')
                }}
              >→</button>
            </div>
            <div className="mobile-row">
              <button 
                className="mobile-btn"
                onTouchStart={(e) => {
                  e.preventDefault()
                  move('down')
                }}
              >↓</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TwoFortyEight