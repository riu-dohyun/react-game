import { useState, useEffect } from 'react'
import './Sudoku.css'

interface SudokuProps {
  onBack: () => void
}

type SudokuBoard = number[][]
type Difficulty = 'easy' | 'medium' | 'hard'

function Sudoku({ onBack }: SudokuProps) {
  const [board, setBoard] = useState<SudokuBoard>(() => 
    Array(9).fill(null).map(() => Array(9).fill(0))
  )
  const [initialBoard, setInitialBoard] = useState<SudokuBoard>(() => 
    Array(9).fill(null).map(() => Array(9).fill(0))
  )
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [errors, setErrors] = useState<number>(0)
  const [time, setTime] = useState<number>(0)

  const isValidMove = (board: SudokuBoard, row: number, col: number, num: number): boolean => {
    // 행 확인
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false
    }

    // 열 확인
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false
    }

    // 3x3 박스 확인
    const startRow = row - (row % 3)
    const startCol = col - (col % 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) return false
      }
    }

    return true
  }


  const generateSudoku = (difficulty: Difficulty): { puzzle: SudokuBoard, solution: SudokuBoard } => {
    // 미리 만들어진 완성된 스도쿠 퍼즐들
    const completePuzzles = [
      [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9]
      ],
      [
        [1,2,3,4,5,6,7,8,9],
        [4,5,6,7,8,9,1,2,3],
        [7,8,9,1,2,3,4,5,6],
        [2,1,4,3,6,5,8,9,7],
        [3,6,5,8,9,7,2,1,4],
        [8,9,7,2,1,4,3,6,5],
        [5,3,1,6,4,2,9,7,8],
        [6,4,2,9,7,8,5,3,1],
        [9,7,8,5,3,1,6,4,2]
      ],
      [
        [9,1,2,3,4,5,6,7,8],
        [3,4,5,6,7,8,9,1,2],
        [6,7,8,9,1,2,3,4,5],
        [1,2,3,4,5,6,7,8,9],
        [4,5,6,7,8,9,1,2,3],
        [7,8,9,1,2,3,4,5,6],
        [2,3,1,5,6,4,8,9,7],
        [5,6,4,8,9,7,2,3,1],
        [8,9,7,2,3,1,5,6,4]
      ]
    ]

    // 난이도별 빈 칸 수
    const emptyCells = {
      easy: 35,
      medium: 45,
      hard: 55
    }

    // 랜덤하게 완성된 퍼즐 선택
    const selectedPuzzle = completePuzzles[Math.floor(Math.random() * completePuzzles.length)]
    const solution = selectedPuzzle.map(row => [...row])
    const puzzle = selectedPuzzle.map(row => [...row])

    // 퍼즐에서 일부 숫자 제거
    const cellsToRemove = emptyCells[difficulty]
    let removed = 0
    const cellsToTry = []
    
    // 모든 셀 위치를 배열에 저장
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        cellsToTry.push([i, j])
      }
    }
    
    // 셀 위치를 랜덤하게 섞기
    for (let i = cellsToTry.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cellsToTry[i], cellsToTry[j]] = [cellsToTry[j], cellsToTry[i]]
    }
    
    // 순서대로 제거
    for (const [row, col] of cellsToTry) {
      if (removed >= cellsToRemove) break
      puzzle[row][col] = 0
      removed++
    }

    return { puzzle, solution }
  }

  const startGame = (selectedDifficulty?: Difficulty) => {
    const diff = selectedDifficulty || difficulty
    setDifficulty(diff)
    
    const { puzzle } = generateSudoku(diff)
    setBoard(puzzle)
    setInitialBoard(puzzle.map(row => [...row]))
    setSelectedCell(null)
    setGameOver(false)
    setIsPlaying(true)
    setErrors(0)
    setTime(0)
  }

  const resetGame = () => {
    setIsPlaying(false)
    setGameOver(false)
  }

  const handleCellClick = (row: number, col: number) => {
    if (!isPlaying || gameOver || initialBoard[row][col] !== 0) return
    setSelectedCell([row, col])
  }

  const handleNumberInput = (num: number) => {
    if (!selectedCell || !isPlaying || gameOver) return

    const [row, col] = selectedCell
    if (initialBoard[row][col] !== 0) return

    const newBoard = board.map(boardRow => [...boardRow])
    
    if (isValidMove(newBoard, row, col, num) || num === 0) {
      newBoard[row][col] = num
      setBoard(newBoard)
      
      // 게임 완료 확인
      if (isBoardComplete(newBoard)) {
        setGameOver(true)
        setIsPlaying(false)
      }
    } else if (num !== 0) {
      setErrors(prev => prev + 1)
    }
  }

  const isBoardComplete = (board: SudokuBoard): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) return false
      }
    }
    return true
  }

  useEffect(() => {
    if (!isPlaying || gameOver) return

    const timer = setInterval(() => {
      setTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying, gameOver])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const renderSudokuGrid = () => {
    const elements = []
    
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        // 3x3 박스 컴포넌트
        const boxCells = []
        for (let cellRow = 0; cellRow < 3; cellRow++) {
          for (let cellCol = 0; cellCol < 3; cellCol++) {
            const globalRow = boxRow * 3 + cellRow
            const globalCol = boxCol * 3 + cellCol
            boxCells.push(renderCell(globalRow, globalCol))
          }
        }
        
        elements.push(
          <div key={`box-${boxRow}-${boxCol}`} className="sudoku-box">
            {boxCells}
          </div>
        )
      }
    }
    
    return elements
  }

  const renderCell = (row: number, col: number) => {
    const value = board[row][col]
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col
    const isInitial = initialBoard[row][col] !== 0
    const isInSameRow = selectedCell?.[0] === row
    const isInSameCol = selectedCell?.[1] === col
    const isInSameBox = selectedCell && 
      Math.floor(selectedCell[0] / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell[1] / 3) === Math.floor(col / 3)
    
    // 선택된 셀과 같은 숫자인지 확인
    const isSameNumber = selectedCell && value !== 0 && 
      board[selectedCell[0]][selectedCell[1]] === value

    let cellClass = 'sudoku-cell'
    if (isSelected) cellClass += ' selected'
    if (isInitial) cellClass += ' initial'
    if (isInSameRow && !isSelected) cellClass += ' highlighted-row'
    if (isInSameCol && !isSelected) cellClass += ' highlighted-col'
    if (isInSameBox && !isSelected && !isInSameRow && !isInSameCol) cellClass += ' highlighted-box'
    if (isSameNumber && !isSelected) cellClass += ' same-number'

    return (
      <div
        key={`${row}-${col}`}
        className={cellClass}
        onClick={() => handleCellClick(row, col)}
      >
        {value || ''}
      </div>
    )
  }

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>
      
      <h2>🧩 스도쿠</h2>
      
      {!isPlaying ? (
        <div className="game-start">
          <div className="game-description">
            <p><strong>1-9 숫자로 모든 칸을 채우세요!</strong></p>
            <p>• 각 행, 열, 3x3 박스에 1-9가 모두 들어가야 합니다</p>
            <p>• 같은 숫자가 중복되면 안됩니다</p>
            <p>• 논리적 사고가 필요한 퍼즐 게임입니다</p>
          </div>
          
          <div className="difficulty-selection">
            <h3>난이도 선택</h3>
            <div className="difficulty-buttons">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <button 
                  key={diff}
                  className={`difficulty-button ${difficulty === diff ? 'active' : ''}`}
                  onClick={() => setDifficulty(diff)}
                >
                  {diff === 'easy' ? '쉬움' : diff === 'medium' ? '보통' : '어려움'}
                  <small>{diff === 'easy' ? '40칸' : diff === 'medium' ? '50칸' : '60칸'} 비움</small>
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
              <span className="stat-label">시간</span>
              <span className="stat-value">{formatTime(time)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">오류</span>
              <span className="stat-value error">{errors}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">난이도</span>
              <span className="stat-value">
                {difficulty === 'easy' ? '쉬움' : difficulty === 'medium' ? '보통' : '어려움'}
              </span>
            </div>
          </div>

          <div className="sudoku-board">
            {renderSudokuGrid()}
          </div>

          <div className="number-pad">
            <div className="number-buttons">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  className="number-button"
                  onClick={() => handleNumberInput(num)}
                >
                  {num}
                </button>
              ))}
              <button
                className="number-button erase"
                onClick={() => handleNumberInput(0)}
              >
                지우기
              </button>
            </div>
          </div>

          {gameOver && (
            <div className="game-end-overlay">
              <div className="game-end-message">
                <div className="win-message">
                  🎉 축하합니다!<br/>스도쿠를 완성했습니다!<br/>
                  시간: {formatTime(time)}<br/>
                  오류: {errors}개
                </div>
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
        </>
      )}
    </div>
  )
}

export default Sudoku