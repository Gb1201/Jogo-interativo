import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Check, Clock, Crown, Trophy, UserPlus, X } from 'lucide-react'
import { GAME_CONFIG } from '../config/gameConfig'
import { useSound } from '../hooks/useSound'
import { fetchRanking } from '../services/rankingService'
import { formatDuration } from '../utils/format'
import { burst, celebrate } from '../utils/confetti'
import AnimatedCounter from '../components/AnimatedCounter'
import GameButton from '../components/GameButton'

function rankTitle(correct, total) {
  const ratio = total ? correct / total : 0
  if (ratio >= 0.9) return 'Lenda das nuvens'
  if (ratio >= 0.7) return 'Piloto ás'
  if (ratio >= 0.5) return 'Aviador firme'
  return 'Em treinamento'
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.5 } },
}
const item = {
  hidden: { opacity: 0, y: 40, scale: 0.85 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 16 } },
}

export default function ResultPage({ result, onRanking, onNewPlayer }) {
  const { play } = useSound()
  const [rank, setRank] = useState({ status: 'loading', position: null, of: null })

  const maxScore = result.total * (GAME_CONFIG.pointsPerCorrect + GAME_CONFIG.maxSpeedBonus)
  const isHigh = maxScore > 0 && result.score / maxScore >= GAME_CONFIG.celebrationThreshold

  // Animação de comemoração ao entrar (uma vez)
  useEffect(() => {
    play('finish')
    const id = setTimeout(() => {
      if (isHigh) celebrate()
      else burst({ x: 0.5, y: 0.35 }, 70)
    }, 450)
    return () => clearTimeout(id)
  }, [isHigh, play])

  // Posição no ranking
  useEffect(() => {
    let cancelled = false
    fetchRanking()
      .then((rows) => {
        if (cancelled) return
        const me = rows.find((r) => r.id === result.participantId)
        setRank({ status: 'ok', position: me?.position ?? null, of: rows.length })
      })
      .catch(() => !cancelled && setRank({ status: 'error', position: null, of: null }))
    return () => {
      cancelled = true
    }
  }, [result.participantId])

  const podium = rank.position !== null && rank.position <= 3

  return (
    <motion.div className="result" variants={container} initial="hidden" animate="show">
      <motion.div
        className="trophy"
        initial={{ scale: 0, rotate: -270 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 11, delay: 0.1 }}
      >
        <motion.span
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="trophy-icon"
        >
          <Trophy size={78} strokeWidth={2.4} />
        </motion.span>
        <span className="trophy-glow" />
      </motion.div>

      <motion.div variants={item} className="result-head">
        <p className="result-kicker">Fim de jogo!</p>
        <h1 className="result-title">{result.name}</h1>
        <span className="badge badge--gum">{rankTitle(result.correct, result.total)}</span>
      </motion.div>

      <motion.div variants={item} className="final-score">
        <span className="final-score-label">Pontuação final</span>
        <div className="final-score-value">
          <AnimatedCounter value={result.score} from={0} duration={1.6} />
        </div>
      </motion.div>

      <motion.div variants={item} className="stats">
        <div className="stat stat--ok">
          <Check size={28} strokeWidth={4} />
          <strong>{result.correct}</strong>
          <span>acertos</span>
        </div>
        <div className="stat stat--bad">
          <X size={28} strokeWidth={4} />
          <strong>{result.wrong}</strong>
          <span>erros</span>
        </div>
        <div className="stat stat--time">
          <Clock size={28} strokeWidth={3.5} />
          <strong>{formatDuration(result.totalMs)}</strong>
          <span>tempo total</span>
        </div>
      </motion.div>

      <motion.div variants={item} className={`rank-card ${podium ? 'rank-card--podium' : ''}`}>
        <Crown size={30} strokeWidth={2.8} />
        {rank.status === 'loading' && <span>Calculando sua posição...</span>}
        {rank.status === 'error' && <span>Não consegui carregar sua posição agora.</span>}
        {rank.status === 'ok' && (
          <span>
            Você está em <strong className="rank-position">{rank.position ?? '?'}º lugar</strong>
            {rank.of ? ` de ${rank.of}` : ''}
          </span>
        )}
      </motion.div>

      <motion.div variants={item} className="result-actions">
        <GameButton size="lg" variant="gold" icon={Trophy} onClick={onRanking}>
          Ver ranking
        </GameButton>
        <GameButton variant="ghost" icon={UserPlus} onClick={onNewPlayer}>
          Novo jogador
        </GameButton>
      </motion.div>
    </motion.div>
  )
}
