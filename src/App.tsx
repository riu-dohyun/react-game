import { useState } from 'react'
import './App.css'
import TicTacToe from './games/TicTacToe'
import GuessNumber from './games/GuessNumber'
import MemoryCard from './games/MemoryCard'
import Snake from './games/Snake'
import WordChain from './games/WordChain'

type GameType = 'menu' | 'tictactoe' | 'guessnumber' | 'memorycard' | 'snake' | 'wordchain'

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
      case 'snake':
        return <Snake onBack={() => setCurrentGame('menu')} />
      case 'wordchain':
        return <WordChain onBack={() => setCurrentGame('menu')} />
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
              <button onClick={() => setCurrentGame('snake')}>
                🐍 스네이크
              </button>
              <button onClick={() => setCurrentGame('wordchain')}>
                📝 끝말잇기
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