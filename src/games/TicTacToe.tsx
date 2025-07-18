import { useState } from 'react'
import './TicTacToe.css'

interface TicTacToeProps {
  onBack: () => void
}

type Player = 'X' | 'O'
type Cell = Player | null

function TicTacToe({ onBack }: TicTacToeProps) {
  const [boardSize, setBoardSize] = useState<{rows: number, cols: number}>({rows: 3, cols: 3})
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X')
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)
  const [gameStarted, setGameStarted] = useState<boolean>(false)

  const generateWinningCombinations = (rows: number, cols: number) => {
    const combinations: number[][] = []
    const size = Math.min(rows, cols)
    
    // 가로줄
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col <= cols - size; col++) {
        const combo = []
        for (let i = 0; i < size; i++) {
          combo.push(row * cols + col + i)
        }
        combinations.push(combo)
      }
    }
    
    // 세로줄
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row <= rows - size; row++) {
        const combo = []
        for (let i = 0; i < size; i++) {
          combo.push((row + i) * cols + col)
        }
        combinations.push(combo)
      }
    }
    
    // 대각선 (왼쪽 위에서 오른쪽 아래)
    for (let row = 0; row <= rows - size; row++) {
      for (let col = 0; col <= cols - size; col++) {
        const combo = []
        for (let i = 0; i < size; i++) {
          combo.push((row + i) * cols + col + i)
        }
        combinations.push(combo)
      }
    }
    
    // 대각선 (오른쪽 위에서 왼쪽 아래)
    for (let row = 0; row <= rows - size; row++) {
      for (let col = size - 1; col < cols; col++) {
        const combo = []
        for (let i = 0; i < size; i++) {
          combo.push((row + i) * cols + col - i)
        }
        combinations.push(combo)
      }
    }
    
    return combinations
  }

  const checkWinner = (newBoard: Cell[]): Player | 'draw' | null => {
    const winningCombinations = generateWinningCombinations(boardSize.rows, boardSize.cols)
    const winSize = Math.min(boardSize.rows, boardSize.cols)
    
    for (const combination of winningCombinations) {
      const firstCell = newBoard[combination[0]]
      if (firstCell && combination.every(index => newBoard[index] === firstCell)) {
        return firstCell
      }
    }
    
    if (newBoard.every(cell => cell !== null)) {
      return 'draw'
    }
    
    return null
  }

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const gameResult = checkWinner(newBoard)
    if (gameResult) {
      setWinner(gameResult)
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    }
  }

  const startGame = () => {
    const totalCells = boardSize.rows * boardSize.cols
    setBoard(Array(totalCells).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
    setGameStarted(true)
  }

  const resetGame = () => {
    setGameStarted(false)
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
  }

  const renderCell = (index: number) => (
    <button
      key={index}
      className="cell"
      onClick={() => handleCellClick(index)}
      disabled={!!board[index] || !!winner}
    >
      {board[index]}
    </button>
  )

  if (!gameStarted) {
    return (
      <div className="game-container">
        <button className="back-button" onClick={onBack}>
          ← 뒤로가기
        </button>
        
        <h2>틱택토 설정</h2>
        
        <div className="game-settings">
          <div className="setting-group">
            <label>보드 크기 설정</label>
            <div className="size-inputs">
              <div className="input-group">
                <span>가로</span>
                <input
                  type="number"
                  min="3"
                  max="8"
                  value={boardSize.cols}
                  onChange={(e) => setBoardSize(prev => ({...prev, cols: parseInt(e.target.value) || 3}))}
                />
              </div>
              <span>×</span>
              <div className="input-group">
                <span>세로</span>
                <input
                  type="number"
                  min="3"
                  max="8"
                  value={boardSize.rows}
                  onChange={(e) => setBoardSize(prev => ({...prev, rows: parseInt(e.target.value) || 3}))}
                />
              </div>
            </div>
            <p className="size-info">
              {boardSize.cols} × {boardSize.rows} 보드에서 {Math.min(boardSize.rows, boardSize.cols)}개를 연속으로 놓으면 승리!
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
      
      <h2>틱택토 ({boardSize.cols} × {boardSize.rows})</h2>
      
      <div className="game-info">
        {winner ? (
          <p className="winner-message">
            {winner === 'draw' ? '🤝 무승부!' : `🎉 ${winner} 승리!`}
          </p>
        ) : (
          <p className="current-player">현재 플레이어: <span className={`player-${currentPlayer.toLowerCase()}`}>{currentPlayer}</span></p>
        )}
      </div>

      <div 
        className="board" 
        style={{
          gridTemplateColumns: `repeat(${boardSize.cols}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize.rows}, 1fr)`
        }}
      >
        {board.map((_, index) => renderCell(index))}
      </div>

      <div className="game-actions">
        <button className="reset-button" onClick={resetGame}>
          새 게임
        </button>
        <button className="restart-button" onClick={startGame}>
          다시 시작
        </button>
      </div>
    </div>
  )
}

export default TicTacToe