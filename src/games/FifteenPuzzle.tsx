import { useState, useEffect, useCallback } from 'react'
import './FifteenPuzzle.css'

interface FifteenPuzzleProps {
  onBack: () => void
}

type Board = (number | null)[][]
type GridSize = 3 | 4 | 5

const GRID_CONFIGS = {
  3: { size: 3, name: '3x3 (8퍼즐)' },
  4: { size: 4, name: '4x4 (15퍼즐)' },
  5: { size: 5, name: '5x5 (24퍼즐)' }
}

function FifteenPuzzle({ onBack }: FifteenPuzzleProps) {
  const [gridSize, setGridSize] = useState<GridSize>(4)
  const [board, setBoard] = useState<Board>([])
  const [moves, setMoves] = useState<number>(0)
  const [time, setTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isWon, setIsWon] = useState<boolean>(false)
  const [isStarted, setIsStarted] = useState<boolean>(false)

  const createSolvedBoard = useCallback((size: GridSize): Board => {
    const board: Board = []
    let num = 1
    
    for (let row = 0; row < size; row++) {
      board[row] = []
      for (let col = 0; col < size; col++) {
        if (row === size - 1 && col === size - 1) {
          board[row][col] = null // 빈 칸
        } else {
          board[row][col] = num++
        }
      }
    }
    return board
  }, [])

  const shuffleBoard = useCallback((board: Board, size: GridSize): Board => {
    const newBoard = board.map(row => [...row])
    
    // 빈 칸 위치 찾기
    let emptyRow = size - 1
    let emptyCol = size - 1
    
    // 1000번 랜덤 이동으로 섞기
    for (let i = 0; i < 1000; i++) {
      const directions = []
      if (emptyRow > 0) directions.push([-1, 0]) // 위
      if (emptyRow < size - 1) directions.push([1, 0]) // 아래
      if (emptyCol > 0) directions.push([0, -1]) // 왼쪽
      if (emptyCol < size - 1) directions.push([0, 1]) // 오른쪽
      
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)]
      const newRow = emptyRow + dr
      const newCol = emptyCol + dc
      
      // 타일 이동
      newBoard[emptyRow][emptyCol] = newBoard[newRow][newCol]
      newBoard[newRow][newCol] = null
      emptyRow = newRow
      emptyCol = newCol
    }
    
    return newBoard
  }, [])

  const isSolved = useCallback((board: Board, size: GridSize): boolean => {
    let num = 1
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (row === size - 1 && col === size - 1) {
          return board[row][col] === null
        }
        if (board[row][col] !== num++) {
          return false
        }
      }
    }
    return true
  }, [])

  const findEmptyPosition = useCallback((board: Board): [number, number] => {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === null) {
          return [row, col]
        }
      }
    }
    return [-1, -1]
  }, [])

  const canMoveTile = useCallback((board: Board, row: number, col: number): boolean => {
    const [emptyRow, emptyCol] = findEmptyPosition(board)
    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    )
  }, [findEmptyPosition])

  const moveTile = useCallback((board: Board, row: number, col: number): Board => {
    if (!canMoveTile(board, row, col)) return board
    
    const newBoard = board.map(row => [...row])
    const [emptyRow, emptyCol] = findEmptyPosition(board)
    
    newBoard[emptyRow][emptyCol] = newBoard[row][col]
    newBoard[row][col] = null
    
    return newBoard
  }, [canMoveTile, findEmptyPosition])

  const startGame = (selectedSize?: GridSize) => {
    const size = selectedSize || gridSize
    setGridSize(size)
    
    const solvedBoard = createSolvedBoard(size)
    const shuffledBoard = shuffleBoard(solvedBoard, size)
    
    setBoard(shuffledBoard)
    setMoves(0)
    setTime(0)
    setIsPlaying(true)
    setIsWon(false)
    setIsStarted(true)
  }

  const handleTileClick = (row: number, col: number) => {
    if (!isPlaying || isWon) return
    
    if (canMoveTile(board, row, col)) {
      const newBoard = moveTile(board, row, col)
      setBoard(newBoard)
      setMoves(prev => prev + 1)
      
      if (isSolved(newBoard, gridSize)) {
        setIsWon(true)
        setIsPlaying(false)
      }
    }
  }

  const resetGame = () => {
    setIsStarted(false)
    setIsPlaying(false)
    setIsWon(false)
    setBoard([])
    setMoves(0)
    setTime(0)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!isPlaying || isWon) return

    const timer = setInterval(() => {
      setTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying, isWon])

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>
      
      <h2>🧩 {GRID_CONFIGS[gridSize].name}</h2>
      
      {!isStarted ? (
        <div className="game-start">
          <div className="game-description">
            <p><strong>숫자를 순서대로 배열해보세요!</strong></p>
            <p>• 빈 칸 옆의 타일을 클릭해서 이동시킵니다</p>
            <p>• 1부터 순서대로 배열하면 승리!</p>
            <p>• 최소한의 이동으로 도전해보세요</p>
          </div>
          
          <div className="size-selection">
            <h3>퍼즐 크기 선택</h3>
            <div className="size-buttons">
              {(Object.keys(GRID_CONFIGS) as unknown as GridSize[]).map((size) => (
                <button 
                  key={size}
                  className={`size-button ${gridSize === size ? 'active' : ''}`}
                  onClick={() => setGridSize(size)}
                >
                  {GRID_CONFIGS[size].name}
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
          <div className="game-stats">
            <div className="stat-item">
              <span className="stat-label">이동 수</span>
              <span className="stat-value">{moves}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">시간</span>
              <span className="stat-value">{formatTime(time)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">크기</span>
              <span className="stat-value">{gridSize}x{gridSize}</span>
            </div>
          </div>

          <div className={`puzzle-board size-${gridSize}`}>
            {board.map((row, rowIndex) =>
              row.map((tile, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`puzzle-tile ${tile === null ? 'empty' : ''} ${
                    canMoveTile(board, rowIndex, colIndex) ? 'movable' : ''
                  }`}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                >
                  {tile}
                </div>
              ))
            )}
          </div>

          <div className="game-controls">
            <button className="control-button" onClick={() => startGame()}>
              새 게임
            </button>
            <button className="control-button" onClick={resetGame}>
              메뉴로
            </button>
          </div>

          {isWon && (
            <div className="game-end-overlay">
              <div className="game-end-message">
                <div className="win-message">
                  🎉 축하합니다!<br/>퍼즐을 완성했습니다!<br/>
                  이동 수: {moves}회<br/>
                  시간: {formatTime(time)}
                </div>
                <div className="end-buttons">
                  <button className="continue-button" onClick={() => startGame()}>
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

export default FifteenPuzzle