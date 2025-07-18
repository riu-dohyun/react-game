import { useState } from 'react'
import './App.css'
import TicTacToe from './games/TicTacToe'
import GuessNumber from './games/GuessNumber'
import MemoryCard from './games/MemoryCard'
import Snake from './games/Snake'
import WordChain from './games/WordChain'
import Tetris from './games/Tetris'
import FlappyBird from './games/FlappyBird'
import TwoFortyEight from './games/TwoFortyEight'

type GameType = 'menu' | 'tictactoe' | 'guessnumber' | 'memorycard' | 'snake' | 'wordchain' | 'tetris' | 'flappybird' | '2048'

// 전체화면이 필요한 액션 게임들
const FULLSCREEN_GAMES: GameType[] = ['snake', 'tetris', 'flappybird']

function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('menu')
  
  // 현재 게임이 전체화면 게임인지 확인
  const isFullscreenGame = FULLSCREEN_GAMES.includes(currentGame)

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
      case 'tetris':
        return <Tetris onBack={() => setCurrentGame('menu')} />
      case 'flappybird':
        return <FlappyBird onBack={() => setCurrentGame('menu')} />
      case '2048':
        return <TwoFortyEight onBack={() => setCurrentGame('menu')} />
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
              <button onClick={() => setCurrentGame('tetris')}>
                🧩 테트리스
              </button>
              <button onClick={() => setCurrentGame('flappybird')}>
                🐦 플래피 버드
              </button>
              <button onClick={() => setCurrentGame('2048')}>
                🔥 2048
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={`App ${isFullscreenGame ? 'fullscreen-game' : ''}`}>
      {renderGame()}
    </div>
  )
}

export default App