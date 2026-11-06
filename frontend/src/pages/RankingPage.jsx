import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ChevronDown, Clock, Crown, Flame, RefreshCw, Sparkles, Star, Trophy, Users } from 'lucide-react'
import { GAME_CONFIG } from '../config/gameConfig'
import { useRanking } from '../hooks/useRanking'
import { burst, celebrate } from '../utils/confetti'
import { formatClock, formatDuration } from '../utils/format'
import AnimatedCounter from '../components/AnimatedCounter'
import Avatar from '../components/Avatar'
import ErrorMessage from '../components/ErrorMessage'
import GameButton from '../components/GameButton'
import Loader from '../components/Loader'
import PodiumCard from '../components/PodiumCard'
import RankRow from '../components/RankRow'

const TITLE_LETTERS = 'Ranking'.split('')

// Estrelinhas que piscam em volta do pódio (posição em %, atraso e tamanho)
const SPARKLES = [
  { x: 6, y: 14, d: 0, s: 22 },
  { x: 92, y: 10, d: 0.6, s: 26 },
  { x: 20, y: 62, d: 1.2, s: 16 },
  { x: 80, y: 58, d: 0.3, s: 18 },
  { x: 50, y: 2, d: 0.9, s: 20 },
  { x: 97, y: 48, d: 1.5, s: 14 },
  { x: 2, y: 46, d: 1.8, s: 14 },
]

// Quanto falta para o jogador alcançar quem está logo acima dele
function buildHint(me, above) {
  if (!me || !above) return null
  const gap = above.score - me.score
  if (gap > 0) return `Faltam ${gap.toLocaleString('pt-BR')} pts para o ${above.position}º`
  return `Empate em pontos com o ${above.position}º: seja mais rápido!`
}

// Ranking geral: pódio animado para o top 3, corrida de posições para os demais. Atualiza sozinho.
export default function RankingPage({ currentId, onBack }) {
  const { rows, loading, refreshing, error, updatedAt, refresh } = useRanking(
    GAME_CONFIG.rankingRefreshMs,
  )

  const top = rows.slice(0, 3)
  const rest = rows.slice(3)
  // Ordem visual do pódio: 2º, 1º, 3º
  const slots = [
    { place: 2, row: top[1] },
    { place: 1, row: top[0] },
    { place: 3, row: top[2] },
  ]

  const maxScore = rows[0]?.score ?? 0
  const meIndex = rows.findIndex((r) => r.id === currentId)
  const me = meIndex >= 0 ? rows[meIndex] : null
  const meOnPodium = meIndex >= 0 && meIndex < 3
  const hint = me && meIndex > 0 ? buildHint(me, rows[meIndex - 1]) : null

  const stats = useMemo(() => {
    if (rows.length === 0) return null
    return {
      players: rows.length,
      best: Math.max(...rows.map((r) => r.score)),
      fastest: Math.min(...rows.map((r) => r.total_time_ms ?? Infinity)),
    }
  }, [rows])

  // Comemoração quando o placar aparece pela primeira vez
  const ready = !loading && rows.length > 0
  const celebrated = useRef(false)
  useEffect(() => {
    if (!ready) return undefined
    const id = setTimeout(() => {
      if (celebrated.current) return
      celebrated.current = true
      if (meOnPodium) celebrate()
      else burst({ x: 0.5, y: 0.4 }, 90)
    }, 1500)
    return () => clearTimeout(id)
  }, [ready, meOnPodium])

  // O que mudou desde a última atualização: subidas, descidas, novatos e novo líder
  const previous = useRef(null)
  const [changes, setChanges] = useState({})
  const [newLeader, setNewLeader] = useState(null)
  useEffect(() => {
    if (rows.length === 0) return undefined
    const before = previous.current
    previous.current = { positions: new Map(rows.map((r) => [r.id, r.position])), leaderId: rows[0].id }
    if (!before) return undefined

    const next = {}
    rows.forEach((r) => {
      const was = before.positions.get(r.id)
      if (was === undefined) next[r.id] = 'new'
      else if (was !== r.position) next[r.id] = was - r.position
    })
    setChanges(next)

    const leaderChanged = before.leaderId !== rows[0].id
    if (leaderChanged) {
      setNewLeader(rows[0])
      burst({ x: 0.5, y: 0.3 }, 120)
    }
    const id = setTimeout(() => {
      setChanges({})
      setNewLeader(null)
    }, 12000)
    return () => clearTimeout(id)
  }, [rows])

  // A barra "você está em Xº" só aparece quando a sua linha está fora da tela
  const [meVisible, setMeVisible] = useState(false)
  useEffect(() => {
    const el = document.getElementById('rank-me')
    if (!el) return undefined
    const observer = new IntersectionObserver(([entry]) => setMeVisible(entry.isIntersecting), {
      threshold: 0.6,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [rows, currentId])

  const scrollToMe = () =>
    document.getElementById('rank-me')?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const showMeBar = me && !meOnPodium && !meVisible

  return (
    <div className="ranking">
      <div className="ranking-head">
        <GameButton variant="ghost" icon={ArrowLeft} onClick={onBack}>
          Voltar
        </GameButton>
        <h1 className="ranking-title" aria-label="Ranking">
          <span className="ranking-trophy">
            <motion.span
              className="ranking-trophy-icon"
              animate={{ rotate: [-10, 10, -10], y: [0, -5, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Trophy size={36} strokeWidth={3} />
            </motion.span>
            <Sparkles className="ranking-twinkle ranking-twinkle--a" size={16} strokeWidth={3} />
            <Sparkles className="ranking-twinkle ranking-twinkle--b" size={12} strokeWidth={3} />
          </span>
          <span className="ranking-title-text" aria-hidden="true">
            {TITLE_LETTERS.map((letter, i) => (
              <span key={i} className="ranking-letter" style={{ '--i': i }}>
                <motion.span
                  initial={{ y: -50, opacity: 0, rotate: -18 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 11, delay: 0.1 + i * 0.07 }}
                >
                  {letter}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>
        <motion.button
          type="button"
          className="icon-btn"
          onClick={refresh}
          aria-label="Atualizar ranking"
          title="Atualizar"
          whileHover={{ scale: 1.1, rotate: 20 }}
          whileTap={{ scale: 0.9, y: 3 }}
        >
          <RefreshCw size={22} strokeWidth={2.8} className={refreshing ? 'spin' : ''} />
        </motion.button>
      </div>

      <div className="ranking-meta">
        <span className="live-badge">
          <span className="live-dot" /> Ao vivo
        </span>
        <p className="ranking-sub">
          {updatedAt ? `Atualizado às ${formatClock(updatedAt)}` : 'Buscando placar...'}
        </p>
      </div>
      {updatedAt && (
        <div className="refresh-track" aria-hidden="true">
          <motion.div
            key={updatedAt.getTime()}
            className="refresh-fill"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: GAME_CONFIG.rankingRefreshMs / 1000, ease: 'linear' }}
          />
        </div>
      )}

      {loading && <Loader label="Carregando o placar..." />}

      {!loading && error && rows.length === 0 && (
        <ErrorMessage
          title="Não consegui carregar o ranking"
          message="Confira sua internet e tente de novo."
          onRetry={refresh}
        />
      )}

      {!loading && !(error && rows.length === 0) && rows.length === 0 && (
        <motion.div
          className="empty"
          initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        >
          <motion.span
            className="empty-trophy"
            animate={{ y: [0, -12, 0], rotate: [-6, 6, -6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Trophy size={52} strokeWidth={2.6} />
          </motion.span>
          <p>Ninguém terminou ainda. Seja o primeiro do pódio!</p>
        </motion.div>
      )}

      {ready && (
        <>
          <AnimatePresence>
            {newLeader && (
              <motion.div
                key={newLeader.id}
                className="leader-banner"
                initial={{ opacity: 0, y: -24, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              >
                <Crown size={20} strokeWidth={2.8} />
                <span>
                  Novo líder: <b>{newLeader.name}</b>!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {stats && (
            <motion.div
              className="ranking-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <span className="stat-pill stat-pill--players">
                <Users size={16} strokeWidth={3} />
                <AnimatedCounter value={stats.players} from={0} duration={1} />
                <small>{stats.players === 1 ? 'jogador' : 'jogadores'}</small>
              </span>
              <span className="stat-pill stat-pill--best">
                <Star size={16} strokeWidth={3} />
                <AnimatedCounter value={stats.best} from={0} duration={1.4} />
                <small>recorde</small>
              </span>
              <span className="stat-pill stat-pill--fast">
                <Clock size={16} strokeWidth={3} />
                <span>{formatDuration(stats.fastest)}</span>
                <small>mais rápido</small>
              </span>
            </motion.div>
          )}

          <div className="podium-stage">
            {SPARKLES.map((s, i) => (
              <Sparkles
                key={i}
                className="stage-sparkle"
                size={s.s}
                strokeWidth={2.8}
                style={{ left: `${s.x}%`, top: `${s.y}%`, '--d': `${s.d}s` }}
                aria-hidden="true"
              />
            ))}
            <div className="podium">
              {slots.map(({ place, row }) => (
                <PodiumCard key={place} place={place} row={row} isMe={!!row && row.id === currentId} />
              ))}
            </div>
          </div>

          {rest.length > 0 && (
            <>
              <motion.h2
                className="rank-heading"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
              >
                <Flame size={22} strokeWidth={3} /> Na corrida pelo pódio
              </motion.h2>
              <ol className="rank-list" start={4}>
                {rest.map((row, i) => (
                  <RankRow
                    key={row.id}
                    row={row}
                    index={i}
                    isMe={row.id === currentId}
                    change={changes[row.id]}
                    maxScore={maxScore}
                    hint={hint}
                  />
                ))}
              </ol>
            </>
          )}
        </>
      )}

      <AnimatePresence>
        {showMeBar && (
          <motion.button
            type="button"
            className="me-bar"
            onClick={scrollToMe}
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97, y: 3 }}
          >
            <Avatar name={me.name} size="sm" />
            <span className="me-bar-text">
              <span>
                Você está em <b>{me.position}º</b>
              </span>
              {hint && <small>{hint}</small>}
            </span>
            <ChevronDown size={22} strokeWidth={3.2} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}