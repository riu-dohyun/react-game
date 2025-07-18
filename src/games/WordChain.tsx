import { useState, useRef, useEffect } from 'react'
import './WordChain.css'

interface WordChainProps {
  onBack: () => void
}

interface Word {
  text: string
  player: 'user' | 'computer'
  isValid: boolean
}

const KOREAN_WORDS = [
  '사과', '과일', '일요일', '일기', '기차', '차량', '양파', '파도', '도서관', '관리',
  '리모컨', '컨트롤', '롤러', '러시아', '아침', '침대', '대학교', '교실', '실내', '내일',
  '일반', '반찬', '찬물', '물고기', '기억', '억지', '지구', '구름', '름프', '프로그램',
  '램프', '프라이팬', '팬케이크', '케이크', '크기', '기분', '분홍색', '색깔', '깔끔',
  '끔찍', '찍기', '기술', '술집', '집중', '중요', '요리', '리본', '본격', '격투',
  '투자', '자동차', '차이', '이해', '해결', '결과', '과정', '정말', '말하기', '기회',
  '회사', '사람', '람보르기니', '니트', '트럭', '럭키', '키보드', '드라마', '마음', '음식',
  '식당', '당근', '근육', '육류', '류머티즘', '즘', '즘마', '마지막', '막내', '내용',
  '용기', '기운', '운동', '동물', '물병', '병원', '원숭이', '이름', '름차', '차가운',
  '운명', '명예', '예쁜', '쁜내', '내년', '년도', '도움', '움직임', '임금', '금요일'
]

function WordChain({ onBack }: WordChainProps) {
  const [words, setWords] = useState<Word[]>([])
  const [currentWord, setCurrentWord] = useState<string>('')
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const [score, setScore] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const getLastChar = (word: string): string => {
    return word.charAt(word.length - 1)
  }

  const getFirstChar = (word: string): string => {
    return word.charAt(0)
  }

  const isValidKorean = (word: string): boolean => {
    const koreanRegex = /^[가-힣]+$/
    return koreanRegex.test(word) && word.length >= 2
  }

  const findComputerWord = (startChar: string): string | null => {
    const availableWords = KOREAN_WORDS.filter(word => 
      getFirstChar(word) === startChar && !usedWords.has(word)
    )
    
    if (availableWords.length === 0) return null
    
    return availableWords[Math.floor(Math.random() * availableWords.length)]
  }

  const startGame = () => {
    const firstWord = KOREAN_WORDS[Math.floor(Math.random() * KOREAN_WORDS.length)]
    setWords([{ text: firstWord, player: 'computer', isValid: true }])
    setUsedWords(new Set([firstWord]))
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setMessage(`"${firstWord}"로 시작하세요! 끝말 "${getLastChar(firstWord)}"로 시작하는 단어를 입력하세요.`)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const resetGame = () => {
    setWords([])
    setCurrentWord('')
    setGameOver(false)
    setGameStarted(false)
    setMessage('')
    setUsedWords(new Set())
    setScore(0)
  }

  const submitWord = () => {
    if (!currentWord.trim()) return

    const word = currentWord.trim()
    const lastWord = words[words.length - 1]
    
    // 한글 검증
    if (!isValidKorean(word)) {
      setMessage('한글만 입력 가능합니다!')
      setCurrentWord('')
      return
    }

    // 중복 검증
    if (usedWords.has(word)) {
      setMessage('이미 사용된 단어입니다!')
      setCurrentWord('')
      return
    }

    // 끝말잇기 규칙 검증
    if (lastWord && getFirstChar(word) !== getLastChar(lastWord.text)) {
      setMessage(`"${getLastChar(lastWord.text)}"로 시작하는 단어를 입력하세요!`)
      setCurrentWord('')
      return
    }

    // 사용자 단어 추가
    const userWord: Word = { text: word, player: 'user', isValid: true }
    const newUsedWords = new Set([...usedWords, word])
    
    setWords(prev => [...prev, userWord])
    setUsedWords(newUsedWords)
    setScore(prev => prev + word.length * 10)
    setCurrentWord('')

    // 컴퓨터 차례
    setTimeout(() => {
      const computerWord = findComputerWord(getLastChar(word))
      
      if (!computerWord) {
        setMessage(`🎉 축하합니다! 컴퓨터가 단어를 찾지 못했습니다! 최종 점수: ${score + word.length * 10}점`)
        setGameOver(true)
        return
      }

      const compWord: Word = { text: computerWord, player: 'computer', isValid: true }
      setWords(prev => [...prev, compWord])
      setUsedWords(prev => new Set([...prev, computerWord]))
      setMessage(`컴퓨터: "${computerWord}" - "${getLastChar(computerWord)}"로 시작하는 단어를 입력하세요!`)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitWord()
    }
  }

  useEffect(() => {
    if (gameStarted && !gameOver) {
      inputRef.current?.focus()
    }
  }, [words, gameStarted, gameOver])

  return (
    <div className="game-container">
      <button className="back-button" onClick={onBack}>
        ← 뒤로가기
      </button>
      
      <h2>끝말잇기</h2>
      
      {!gameStarted ? (
        <div className="game-start">
          <div className="game-description">
            <p>컴퓨터와 끝말잇기 게임을 해보세요!</p>
            <p>• 한글 단어만 사용 가능합니다</p>
            <p>• 2글자 이상 입력해야 합니다</p>
            <p>• 이미 사용된 단어는 사용할 수 없습니다</p>
          </div>
          <button className="start-button" onClick={startGame}>
            게임 시작
          </button>
        </div>
      ) : (
        <>
          <div className="game-info">
            <div className="score">점수: {score}점</div>
            <div className="word-count">단어 수: {Math.floor(words.length / 2) + (words.length % 2)}</div>
          </div>

          <div className="message">{message}</div>

          <div className="words-container">
            {words.map((word, index) => (
              <div key={index} className={`word-item ${word.player}`}>
                <span className="player-label">
                  {word.player === 'user' ? '👤 나' : '🤖 컴퓨터'}
                </span>
                <span className="word-text">{word.text}</span>
              </div>
            ))}
          </div>

          {!gameOver && (
            <div className="input-section">
              <input
                ref={inputRef}
                type="text"
                value={currentWord}
                onChange={(e) => setCurrentWord(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="단어를 입력하세요..."
                disabled={gameOver}
                autoFocus
              />
              <button onClick={submitWord} disabled={!currentWord.trim()}>
                입력
              </button>
            </div>
          )}

          {gameOver && (
            <div className="game-actions">
              <button className="restart-button" onClick={startGame}>
                다시 시작
              </button>
              <button className="menu-button" onClick={resetGame}>
                처음으로
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default WordChain