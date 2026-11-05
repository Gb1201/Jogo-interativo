import { motion } from 'motion/react'
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react'
import { GAME_CONFIG } from '../config/gameConfig'
import { useRanking } from '../hooks/useRanking'
import { formatClock, formatDuration } from '../utils/format'
import ErrorMessage from '../components/ErrorMessage'
import GameButton from '../components/GameButton'
import Loader from '../components/Loader'
import PodiumCard from '../components/PodiumCard'

// Ranking geral: pódio para o top 3 e lista para os demais. Atualiza sozinho.
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

  return (
    <div className="ranking">
      <div className="ranking-head">
        <GameButton variant="ghost" icon={ArrowLeft} onClick={onBack}>
          Voltar
        </GameButton>
        <h1 className="ranking-title">
          <Trophy size={34} strokeWidth={3} /> Ranking
        </h1>
        <motion.button
          type="button"
          className="icon-btn"
          onClick={refresh}
          aria-label="Atualizar ranking"
          title="Atualizar"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9, y: 3 }}
        >
          <RefreshCw size={22} strokeWidth={2.8} className={refreshing ? 'spin' : ''} />
        </motion.button>
      </div>

      <p className="ranking-sub">
        {updatedAt
          ? `Atualizado às ${formatClock(updatedAt)} · atualiza sozinho a cada ${GAME_CONFIG.rankingRefreshMs / 1000}s`
          : 'Buscando placar...'}
      </p>

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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Trophy size={44} strokeWidth={2.6} />
          <p>Ninguém terminou ainda. Seja o primeiro do pódio!</p>
        </motion.div>
      )}

      {!loading && rows.length > 0 && (
        <>
          <div className="podium">
            {slots.map(({ place, row }) => (
              <PodiumCard key={place} place={place} row={row} isMe={row?.id === currentId} />
            ))}
          </div>

          {rest.length > 0 && (
            <ol className="rank-list" start={4}>
              {rest.map((row, i) => (
                <motion.li
                  key={row.id}
                  className={`rank-row ${row.id === currentId ? 'is-me' : ''}`}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + Math.min(i, 12) * 0.05 }}
                  data-cursor="card"
                >
                  <span className="rank-pos">{row.position}º</span>
                  <span className="rank-name">
                    {row.name}
                    {row.id === currentId && <em className="rank-you">você</em>}
                  </span>
                  <span className="rank-time">{formatDuration(row.total_time_ms)}</span>
                  <span className="rank-score">{row.score.toLocaleString('pt-BR')}</span>
                </motion.li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  )
}
