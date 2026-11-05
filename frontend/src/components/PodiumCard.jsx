import { motion } from 'motion/react'
import { Crown, Medal } from 'lucide-react'
import { formatDuration } from '../utils/format'

// Coluna do pódio. place: 1 (Pure Sun, coroa), 2 (Lavender), 3 (Peony).
// row = null mostra uma vaga vazia.
export default function PodiumCard({ row, place, isMe }) {
  const Icon = place === 1 ? Crown : Medal
  return (
    <motion.div
      className={`podium-card podium-card--${place} ${isMe ? 'is-me' : ''} ${row ? '' : 'is-empty'}`}
      initial={{ opacity: 0, y: 80, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 16,
        delay: place === 1 ? 0.35 : place === 2 ? 0.15 : 0.25,
      }}
      whileHover={{ y: -6 }}
      data-cursor="card"
    >
      <motion.span
        className="podium-icon"
        animate={place === 1 ? { rotate: [-8, 8, -8], y: [0, -4, 0] } : undefined}
        transition={place === 1 ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <Icon size={place === 1 ? 40 : 32} strokeWidth={2.6} />
      </motion.span>
      <span className="podium-place">{row ? `${row.position}º` : place + 'º'}</span>
      <span className="podium-name" title={row?.name}>
        {row ? row.name : '—'}
      </span>
      <span className="podium-score">{row ? row.score.toLocaleString('pt-BR') : '?'}</span>
      {row && <span className="podium-time">{formatDuration(row.total_time_ms)}</span>}
      {isMe && <span className="podium-me">você</span>}
    </motion.div>
  )
}
