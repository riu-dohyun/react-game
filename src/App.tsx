import { useState } from 'react'
import './App.css'
import TicTacToe from './games/TicTacToe'
import GuessNumber from './games/GuessNumber'
import MemoryCard from './games/MemoryCard'
import TwoFortyEight from './games/TwoFortyEight'
import ColorMatch from './games/ColorMatch'
import Sudoku from './games/Sudoku'
import Minesweeper from './games/Minesweeper'
import SimonSays from './games/SimonSays'
import FifteenPuzzle from './games/FifteenPuzzle'

type GameType = 'menu' | 'tictactoe' | 'guessnumber' | 'memorycard' | '2048' | 'colormatch' | 'sudoku' | 'minesweeper' | 'simonsays' | 'fifteenpuzzle'


function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('menu')
  

  const renderGame = () => {
    switch (currentGame) {
      case 'tictactoe':
        return <TicTacToe onBack={() => setCurrentGame('menu')} />
      case 'guessnumber':
        return <GuessNumber onBack={() => setCurrentGame('menu')} />
      case 'memorycard':
        return <MemoryCard onBack={() => setCurrentGame('menu')} />
      case '2048':
        return <TwoFortyEight onBack={() => setCurrentGame('menu')} />
      case 'colormatch':
        return <ColorMatch onBack={() => setCurrentGame('menu')} />
      case 'sudoku':
        return <Sudoku onBack={() => setCurrentGame('menu')} />
      case 'minesweeper':
        return <Minesweeper onBack={() => setCurrentGame('menu')} />
      case 'simonsays':
        return <SimonSays onBack={() => setCurrentGame('menu')} />
      case 'fifteenpuzzle':
        return <FifteenPuzzle onBack={() => setCurrentGame('menu')} />
      default:
        return (
          <div className="game-menu">
            <h1>🎮 React Games</h1>
            <div className="game-buttons">
              <button onClick={() => setCurrentGame('tictactoe')}>
                🎯 틱택토
              </button>
              <button onClick={() => setCurrentGame('guessnumber')}>
                🔢 숫자 맞추기
              </button>
              <button onClick={() => setCurrentGame('memorycard')}>
                🃏 메모리 카드
              </button>
              <button onClick={() => setCurrentGame('2048')}>
                🔥 2048
              </button>
              <button onClick={() => setCurrentGame('colormatch')}>
                🎨 색깔 맞추기
              </button>
              <button onClick={() => setCurrentGame('sudoku')}>
                🧩 스도쿠
              </button>
              <button onClick={() => setCurrentGame('minesweeper')}>
                💣 마인스위퍼
              </button>
              <button onClick={() => setCurrentGame('simonsays')}>
                🎵 사이먼 Says
              </button>
              <button onClick={() => setCurrentGame('fifteenpuzzle')}>
                🧩 15퍼즐
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="App">
      {renderGame()}
    </div>
  )
}

export default App