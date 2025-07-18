import { useState, useCallback } from 'react'
import './Minesweeper.css'

interface MinesweeperProps {
  onBack: () => void
}

type Difficulty = 'easy' | 'medium' | 'hard'

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

interface GameConfig {
  rows: number
  cols: number
  mines: number
  name: string
}

const DIFFICULTIES: Record<Difficulty, GameConfig> = {
  easy: { rows: 9, cols: 9, mines: 10, name: '쉬움' },
  medium: { rows: 16, cols: 16, mines: 40, name: '보통' },
  hard: { rows: 16, cols: 30, mines: 99, name: '어려움' }
}

function Minesweeper({ onBack }: MinesweeperProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [board, setBoard] = useState<Cell[][]>([])
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'ready'>('ready')
  const [flagsLeft, setFlagsLeft] = useState<number>(0)

  const createEmptyBoard = (rows: number, cols: number): Cell[][] => {
    return Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0
      }))
    )
  }

  const placeMines = (board: Cell[][], mines: number, firstClickRow: number, firstClickCol: number): Cell[][] => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })))
    const { rows, cols } = { rows: newBoard.length, cols: newBoard[0].length }
    let minesPlaced = 0

    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows)
      const col = Math.floor(Math.random() * cols)

      // 첫 클릭 위치와 인접한 곳에는 지뢰 안둠
      if (Math.abs(row - firstClickRow) <= 1 && Math.abs(col - firstClickCol) <= 1) continue
      if (newBoard[row][col].isMine) continue

      newBoard[row][col].isMine = true
      minesPlaced++
    }

    // 인접 지뢰 수 계산
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr
              const newCol = col + dc
              if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                if (newBoard[newRow][newCol].isMine) count++
              }
            }
          }
          newBoard[row][col].adjacentMines = count
        }
      }
    }

    return newBoard
  }

  const startGame = (selectedDifficulty?: Difficulty) => {
    const diff = selectedDifficulty || difficulty
    setDifficulty(diff)
    const config = DIFFICULTIES[diff]
    
    const newBoard = createEmptyBoard(config.rows, config.cols)
    setBoard(newBoard)
    setGameStatus('playing')
    setFlagsLeft(config.mines)
  }

  const revealCells = useCallback((startRow: number, startCol: number, board: Cell[][]): Cell[][] => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })))
    const { rows, cols } = { rows: newBoard.length, cols: newBoard[0].length }
    const queue: Array<[number, number]> = [[startRow, startCol]]
    
    while (queue.length > 0) {
      const [row, col] = queue.shift()!
      
      if (row < 0 || row >= rows || col < 0 || col >= cols) continue
      if (newBoard[row][col].isRevealed || newBoard[row][col].isFlagged) continue
      
      newBoard[row][col].isRevealed = true
      
      // 빈 칸이면 주변도 큐에 추가
      if (newBoard[row][col].adjacentMines === 0 && !newBoard[row][col].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const newRow = row + dr
            const newCol = col + dc
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols &&
                !newBoard[newRow][newCol].isRevealed && !newBoard[newRow][newCol].isFlagged) {
              queue.push([newRow, newCol])
            }
          }
        }
      }
    }
    
    return newBoard
  }, [])

  const handleCellClick = (row: number, col: number) => {
    if (gameStatus !== 'playing') return
    if (board[row][col].isFlagged || board[row][col].isRevealed) return

    let newBoard = [...board]

    // 첫 클릭이면 지뢰 배치
    if (board.every(row => row.every(cell => !cell.isRevealed))) {
      newBoard = placeMines(board, DIFFICULTIES[difficulty].mines, row, col)
    }

    // 지뢰 클릭 시
    if (newBoard[row][col].isMine) {
      newBoard = newBoard.map(boardRow => 
        boardRow.map(cell => ({ ...cell, isRevealed: cell.isMine ? true : cell.isRevealed }))
      )
      setBoard(newBoard)
      setGameStatus('lost')
      return
    }

    // 일반 셀 공개
    newBoard = revealCells(row, col, newBoard)
    setBoard(newBoard)

    // 승리 조건 확인
    const revealedCount = newBoard.flat().filter(cell => cell.isRevealed).length
    const totalCells = newBoard.length * newBoard[0].length
    const mineCount = DIFFICULTIES[difficulty].mines
    
    if (revealedCount === totalCells - mineCount) {
      setGameStatus('won')
    }
  }

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    if (gameStatus !== 'playing') return
    if (board[row][col].isRevealed) return

    const newBoard = board.map(boardRow => [...boardRow])
    const cell = newBoard[row][col]
    
    if (cell.isFlagged) {
      cell.isFlagged = false
      setFlagsLeft(prev => prev + 1)
    } else if (flagsLeft > 0) {
      cell.isFlagged = true
      setFlagsLeft(prev => prev - 1)
    }

    setBoard(newBoard)
  }

  const resetGame = () => {
    setGameStatus('ready')
    setBoard([])
  }

  const getCellDisplay = (cell: Cell) => {
    if (cell.isFlagged) return '🚩'
    if (!cell.isRevealed) return ''
    if (cell.isMine) return '💣'
    if (cell.adjacentMines === 0) return ''
    return cell.adjacentMines.toString()
  }

  const getCellClass = (cell: Cell) => {
    let className = 'mine-cell'
    if (cell.isRevealed) {
      className += ' revealed'
      if (cell.isMine) className += ' mine'
      else if (cell.adjacentMines > 0) className += ` number-${cell.adjacentMines}`
    }
    if (cell.isFlagged) className += ' flagged'
    return className
  }

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>
      
      <h2>💣 마인스위퍼</h2>
      
      {gameStatus === 'ready' ? (
        <div className="game-start">
          <div className="game-description">
            <p><strong>지뢰를 피해 모든 칸을 열어보세요!</strong></p>
            <p>• 좌클릭: 칸 열기</p>
            <p>• 우클릭: 깃발 표시</p>
            <p>• 숫자는 인접한 지뢰의 개수입니다</p>
          </div>
          
          <div className="difficulty-selection">
            <h3>난이도 선택</h3>
            <div className="difficulty-buttons">
              {(Object.keys(DIFFICULTIES) as Difficulty[]).map((diff) => (
                <button 
                  key={diff}
                  className={`difficulty-button ${difficulty === diff ? 'active' : ''}`}
                  onClick={() => setDifficulty(diff)}
                >
                  {DIFFICULTIES[diff].name}
                  <small>{DIFFICULTIES[diff].rows}x{DIFFICULTIES[diff].cols}<br/>{DIFFICULTIES[diff].mines}개 지뢰</small>
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
              <span className="stat-label">남은 깃발</span>
              <span className="stat-value">{flagsLeft}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">상태</span>
              <span className={`stat-value ${gameStatus}`}>
                {gameStatus === 'playing' ? '진행중' : 
                 gameStatus === 'won' ? '승리!' : '패배'}
              </span>
            </div>
          </div>

          <div className={`minesweeper-board ${difficulty}`}>
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClass(cell)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                >
                  {getCellDisplay(cell)}
                </div>
              ))
            )}
          </div>

          {gameStatus !== 'playing' && (
            <div className="game-end-overlay">
              <div className="game-end-message">
                {gameStatus === 'won' ? (
                  <div className="win-message">
                    🎉 축하합니다!<br/>모든 지뢰를 찾았습니다!
                  </div>
                ) : (
                  <div className="lose-message">
                    💥 지뢰를 밟았습니다!<br/>다시 도전해보세요!
                  </div>
                )}
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

export default Minesweeper