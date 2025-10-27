"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPaused, setIsPaused] = useState(true)
  const [playerScore, setPlayerScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)
  const [difficulty, setDifficulty] = useState(3)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<"player" | "computer" | null>(null)
  const gameStateRef = useRef<any>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Game constants
    const CANVAS_WIDTH = 800
    const CANVAS_HEIGHT = 500
    const PADDLE_WIDTH = 12
    const PADDLE_HEIGHT = 80
    const BALL_SIZE = 12
    const WINNING_SCORE = 7

    // Game state
    const game = {
      player: {
        x: 30,
        y: CANVAS_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: 0,
      },
      computer: {
        x: CANVAS_WIDTH - 30 - PADDLE_WIDTH,
        y: CANVAS_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: 0,
      },
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 0,
        size: BALL_SIZE,
        speed: 5,
      },
      particles: [] as Array<{
        x: number
        y: number
        vx: number
        vy: number
        life: number
        color: string
      }>,
      mouseY: CANVAS_HEIGHT / 2,
    }

    gameStateRef.current = game

    // Initialize ball velocity
    const resetBall = (toRight: boolean = Math.random() > 0.5) => {
      game.ball.x = CANVAS_WIDTH / 2
      game.ball.y = CANVAS_HEIGHT / 2
      const angle = ((Math.random() - 0.5) * Math.PI) / 3
      game.ball.vx = (toRight ? 1 : -1) * game.ball.speed * Math.cos(angle)
      game.ball.vy = game.ball.speed * Math.sin(angle)
    }

    // Create particles
    const createParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8
        game.particles.push({
          x,
          y,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          life: 1,
          color,
        })
      }
    }

    // Play sound
    const playSound = (frequency: number, duration: number) => {
      if (!soundEnabled) return
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = frequency
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)
      } catch (e) {
        console.log("Audio not supported")
      }
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      game.mouseY = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT
    }

    canvas.addEventListener("mousemove", handleMouseMove)

    resetBall()

    // Game loop
    let animationId: number
    const gameLoop = () => {
      if (!ctx) return

      // Clear canvas with trail effect
      ctx.fillStyle = "rgba(10, 15, 30, 0.3)"
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw center line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.lineWidth = 2
      ctx.setLineDash([10, 10])
      ctx.beginPath()
      ctx.moveTo(CANVAS_WIDTH / 2, 0)
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
      ctx.stroke()
      ctx.setLineDash([])

      if (!isPaused && !gameOver) {
        // Update player paddle
        const targetY = Math.max(game.player.height / 2, Math.min(CANVAS_HEIGHT - game.player.height / 2, game.mouseY))
        game.player.y += (targetY - game.player.y) * 0.2

        // Update computer paddle (AI)
        const aiSpeed = 2 + difficulty * 0.5
        const predictedY = game.ball.y + game.ball.vy * 10
        if (game.ball.x > CANVAS_WIDTH / 2) {
          if (predictedY > game.computer.y + 10) {
            game.computer.y += aiSpeed
          } else if (predictedY < game.computer.y - 10) {
            game.computer.y -= aiSpeed
          }
        }
        game.computer.y = Math.max(
          game.computer.height / 2,
          Math.min(CANVAS_HEIGHT - game.computer.height / 2, game.computer.y),
        )

        // Update ball
        game.ball.x += game.ball.vx
        game.ball.y += game.ball.vy

        // Ball collision with top/bottom
        if (game.ball.y <= game.ball.size / 2 || game.ball.y >= CANVAS_HEIGHT - game.ball.size / 2) {
          game.ball.vy *= -1
          playSound(300, 0.1)
          createParticles(game.ball.x, game.ball.y, "#60a5fa")
        }

        // Ball collision with paddles
        const checkPaddleCollision = (paddle: typeof game.player) => {
          if (
            game.ball.x - game.ball.size / 2 <= paddle.x + paddle.width / 2 &&
            game.ball.x + game.ball.size / 2 >= paddle.x - paddle.width / 2 &&
            game.ball.y + game.ball.size / 2 >= paddle.y - paddle.height / 2 &&
            game.ball.y - game.ball.size / 2 <= paddle.y + paddle.height / 2
          ) {
            const relativeY = (game.ball.y - paddle.y) / (paddle.height / 2)
            const angle = relativeY * (Math.PI / 3)
            const speed = Math.sqrt(game.ball.vx ** 2 + game.ball.vy ** 2) * 1.05
            game.ball.vx = (paddle === game.player ? 1 : -1) * speed * Math.cos(angle)
            game.ball.vy = speed * Math.sin(angle)
            playSound(400, 0.1)
            createParticles(game.ball.x, game.ball.y, "#34d399")
          }
        }

        checkPaddleCollision(game.player)
        checkPaddleCollision(game.computer)

        // Score
        if (game.ball.x < 0) {
          setComputerScore((prev) => {
            const newScore = prev + 1
            if (newScore >= WINNING_SCORE) {
              setGameOver(true)
              setWinner("computer")
            }
            return newScore
          })
          playSound(200, 0.3)
          resetBall(true)
        } else if (game.ball.x > CANVAS_WIDTH) {
          setPlayerScore((prev) => {
            const newScore = prev + 1
            if (newScore >= WINNING_SCORE) {
              setGameOver(true)
              setWinner("player")
            }
            return newScore
          })
          playSound(200, 0.3)
          resetBall(false)
        }

        // Update particles
        game.particles = game.particles.filter((p) => {
          p.x += p.vx
          p.y += p.vy
          p.life -= 0.02
          return p.life > 0
        })
      }

      // Draw particles
      game.particles.forEach((p) => {
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.life
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
      })
      ctx.globalAlpha = 1

      // Draw paddles with glow
      const drawPaddle = (paddle: typeof game.player, color: string) => {
        ctx.shadowBlur = 15
        ctx.shadowColor = color
        ctx.fillStyle = color
        ctx.fillRect(paddle.x - paddle.width / 2, paddle.y - paddle.height / 2, paddle.width, paddle.height)
        ctx.shadowBlur = 0
      }

      drawPaddle(game.player, "#3b82f6")
      drawPaddle(game.computer, "#ef4444")

      // Draw ball with glow
      ctx.shadowBlur = 20
      ctx.shadowColor = "#fbbf24"
      ctx.fillStyle = "#fbbf24"
      ctx.beginPath()
      ctx.arc(game.ball.x, game.ball.y, game.ball.size / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      animationId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isPaused, difficulty, soundEnabled, gameOver])

  const handleReset = () => {
    setPlayerScore(0)
    setComputerScore(0)
    setGameOver(false)
    setWinner(null)
    setIsPaused(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* Game Canvas */}
        <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="rounded-lg border-2 border-slate-600 shadow-2xl"
              style={{ maxWidth: "100%", height: "auto" }}
            />

            {/* Score Display */}
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-12 pointer-events-none">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  {playerScore}
                </div>
                <div className="text-sm text-slate-300 mt-1">VOCÊ</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  {computerScore}
                </div>
                <div className="text-sm text-slate-300 mt-1">IA</div>
              </div>
            </div>

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {winner === "player" ? "🎉 Você Venceu!" : "💻 IA Venceu!"}
                  </h2>
                  <p className="text-slate-300 mb-6">
                    Placar Final: {playerScore} - {computerScore}
                  </p>
                  <Button onClick={handleReset} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Jogar Novamente
                  </Button>
                </div>
              </div>
            )}

            {/* Pause Overlay */}
            {isPaused && !gameOver && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">🏓 Eri Pongson</h2>
                  <p className="text-slate-300 mb-6">Mova o mouse para controlar sua raquete</p>
                  <Button onClick={() => setIsPaused(false)} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Play className="mr-2 h-5 w-5" />
                    Iniciar Jogo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Controls Panel */}
        <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur w-full lg:w-80">
          <h3 className="text-xl font-bold text-white mb-4">Controles</h3>

          <div className="space-y-4">
            {/* Play/Pause Button */}
            <Button
              onClick={() => setIsPaused(!isPaused)}
              disabled={gameOver}
              className="w-full"
              variant={isPaused ? "default" : "secondary"}
            >
              {isPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Continuar
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar
                </>
              )}
            </Button>

            {/* Reset Button */}
            <Button onClick={handleReset} className="w-full bg-transparent" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar
            </Button>

            {/* Sound Toggle */}
            <Button onClick={() => setSoundEnabled(!soundEnabled)} className="w-full" variant="outline">
              {soundEnabled ? (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Som Ligado
                </>
              ) : (
                <>
                  <VolumeX className="mr-2 h-4 w-4" />
                  Som Desligado
                </>
              )}
            </Button>

            {/* Difficulty Slider */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300 flex justify-between">
                <span>Dificuldade da IA</span>
                <span className="text-white font-semibold">{difficulty}/5</span>
              </label>
              <Slider
                value={[difficulty]}
                onValueChange={(value) => setDifficulty(value[0])}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <h4 className="text-sm font-semibold text-white mb-2">Como Jogar</h4>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Mova o mouse para controlar sua raquete</li>
                <li>• Primeiro a fazer 7 pontos vence</li>
                <li>• A bola acelera a cada rebatida</li>
                <li>• Ajuste a dificuldade da IA</li>
              </ul>
            </div>

            {/* Credits */}
            <div className="mt-4 text-center text-xs text-slate-400">
              <p>Inspirado nas partidas de Eri Johnson</p>
              <p className="mt-1">Desenvolvido por Léo Santander Nycz</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
