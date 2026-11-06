import { motion } from 'motion/react'
import { Clock, Crown, Medal } from 'lucide-react'
import { formatDuration } from '../utils/format'
import AnimatedCounter from './AnimatedCounter'
import Avatar from './Avatar'

// Ordem dramática da revelação: 3º sobe primeiro, depois o 2º e, por fim, o campeão.
const REVEAL_DELAY = { 3: 0.1, 2: 0.5, 1: 0.95 }

// Coluna do pódio. place: 1 (Pure Sun, coroa), 2 (Lavender), 3 (Peony).
// row = null mostra uma vaga livre.
export default function PodiumCard({ row, place, isMe }) {
  const Icon = place === 1 ? Crown : Medal
  const delay = REVEAL_DELAY[place]
  const heroDelay = delay + 0.35

  return (
    <div className={`podium-slot podium-slot--${place} ${row ? '' : 'is-empty'}`}>
      {place === 1 && row && <span className="podium-rays" aria-hidden="true" />}

      {/* Quem está no pódio: cai do alto depois que a coluna sobe */}
      <motion.div
        className={`podium-hero ${isMe ? 'is-me' : ''}`}
        initial={{ opacity: 0, y: -140, scale: 0.5, rotate: place === 2 ? -12 : place === 3 ? 12 : 0 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 170, damping: 11, mass: 0.9, delay: heroDelay }}
        whileHover={row ? { y: -8, scale: 1.04 } : undefined}
        data-cursor="card"
      >
        <motion.span
          className="podium-icon"
          animate={
            place === 1
              ? { rotate: [-9, 9, -9], y: [0, -6, 0], scale: [1, 1.12, 1] }
              : { rotate: [-5, 5, -5] }
          }
          transition={{
            duration: place === 1 ? 2.2 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: heroDelay + 0.4,
          }}
        >
          <Icon size={place === 1 ? 44 : 32} strokeWidth={2.6} />
        </motion.span>

        {row ? (
          <Avatar name={row.name} size={place === 1 ? 'xl' : 'lg'} className="podium-avatar" />
        ) : (
          <span className={`avatar avatar--${place === 1 ? 'xl' : 'lg'} avatar--ghost podium-avatar`}>?</span>
        )}

        <span className="podium-name" title={row?.name}>
          {row ? row.name : 'Vaga livre'}
        </span>

        {row ? (
          <>
            <span className="podium-score">
              <AnimatedCounter value={row.score} from={0} duration={1.6} />
              <small>pts</small>
            </span>
            <span className="podium-time">
              <Clock size={13} strokeWidth={3} /> {formatDuration(row.total_time_ms)}
            </span>
          </>
        ) : (
          <span className="podium-open">Pode ser você!</span>
        )}

        {isMe && <span className="podium-me">você</span>}
      </motion.div>

      {/* Degrau do pódio: cresce de baixo para cima */}
      <div className="podium-step">
        <motion.div
          className="podium-step-fill"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ type: 'spring', stiffness: 130, damping: 13, delay }}
        />
        <motion.span
          className="podium-step-number"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 12, delay: delay + 0.3 }}
        >
          {place}
        </motion.span>
      </div>
    </div>
  )
}