import { useState, useEffect } from "react"

function Game() {
  const difficulties = {
    Easy: { max: 50, attempts: 10, time: 60 },
    Medium: { max: 100, attempts: 7, time: 45 },
    Hard: { max: 200, attempts: 5, time: 30 }
  }

  const sounds = {
    correct: new Audio("/sounds/correct.mp3"),
    wrong: new Audio("/sounds/wrong.mp3"),
    timeout: new Audio("/sounds/timeout.mp3"),
    reset: new Audio("/sounds/reset.mp3")
  }

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")
  const [level, setLevel] = useState("Medium")
  const [number, setNumber] = useState(Math.floor(Math.random() * difficulties.Medium.max) + 1)
  const [guess, setGuess] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState("")
  const [hint, setHint] = useState("")
  const [gameOver, setGameOver] = useState(false)
  const [history, setHistory] = useState([])
  const [timeLeft, setTimeLeft] = useState(difficulties.Medium.time)

  const maxAttempts = difficulties[level].attempts
  const maxRange = difficulties[level].max

  useEffect(() => {
    document.body.className = theme
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    if (gameOver) return

    if (timeLeft === 0) {
      setMessage("Time Over! Number was " + number)
      setGameOver(true)
      sounds.timeout.play()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, gameOver])

  const checkGuess = () => {
    if (gameOver) return

    if (guess === "" || guess < 1 || guess > maxRange) {
      setMessage("Enter a number between 1 and " + maxRange)
      setHint("")
      return
    }

    const userGuess = Number(guess)
    const diff = Math.abs(number - userGuess)
    const newAttempts = attempts + 1

    setAttempts(newAttempts)
    setHistory([...history, userGuess])

    if (userGuess === number) {
      setMessage("Correct! You Won 🎉")
      setHint("")
      setGameOver(true)
      sounds.correct.play()
      setGuess("")
      return
    }

    if (newAttempts === maxAttempts) {
      setMessage("Game Over! Number was " + number)
      setHint("")
      setGameOver(true)
      sounds.wrong.play()
      setGuess("")
      return
    }

    setMessage(userGuess > number ? "Too High" : "Too Low")
    sounds.wrong.play()

    if (diff <= 5) setHint("🔥 Very Close")
    else if (diff <= 15) setHint("🙂 Close")
    else setHint("❄️ Far Away")

    setGuess("")
  }

  const resetGame = (selectedLevel = level) => {
    setLevel(selectedLevel)
    setNumber(Math.floor(Math.random() * difficulties[selectedLevel].max) + 1)
    setGuess("")
    setAttempts(0)
    setMessage("")
    setHint("")
    setGameOver(false)
    setHistory([])
    setTimeLeft(difficulties[selectedLevel].time)
    sounds.reset.play()
  }

  return (
    <div className="card">
      <div className="top">
        <h2>Guess The Number</h2>
        <button className="theme-btn" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      <select value={level} onChange={(e) => resetGame(e.target.value)}>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      <p className="range">Between 1 and {maxRange}</p>
      <p className={`timer ${timeLeft <= 10 ? "danger" : ""}`}>Time Left: {timeLeft}s</p>

      <input
        type="number"
        value={guess}
        disabled={gameOver}
        onChange={(e) => setGuess(e.target.value)}
      />

      <button onClick={checkGuess} disabled={gameOver}>Guess</button>
      <button className="reset" onClick={() => resetGame(level)}>Reset</button>

      <p className={`message ${message.includes("Won") ? "win" : "lose"}`}>{message}</p>

      {!gameOver && <p className="hint">{hint}</p>}

      <p className="attempts">Attempts: {attempts} / {maxAttempts}</p>

      {history.length > 0 && (
        <div className="history">
          <p>Previous Guesses</p>
          <div className="history-list">
            {history.map((num, index) => (
              <span key={index}>{num}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Game
