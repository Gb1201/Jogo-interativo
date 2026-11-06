import { motion } from 'motion/react'
import { ChevronDown, ChevronUp, Clock, Sparkles } from 'lucide-react'
import { formatDuration } from '../utils/format'
import AnimatedCounter from './AnimatedCounter'
import Avatar from './Avatar'

// Linha do ranking (4º em diante): posição, jogador, barra de pontos, tempo e pontuação.
// change: número (subiu > 0, desceu < 0), 'new' (acabou de entrar) ou undefined.
export default function RankRow({ row, index, isMe, change, maxScore, hint }) {
  const pct = maxScore > 0 ? Math.max(6, Math.round((row.score / maxScore) * 100)) : 6

  return (
    <motion.li
      layout
      id={isMe ? 'rank-me' : undefined}
      className={`rank-row ${isMe ? 'is-me' : ''}`}
      initial={{ opacity: 0, x: -60, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 22,
        delay: 1.5 + Math.min(index, 12) * 0.06,
      }}
      whileHover={{ x: 6, scale: 1.015 }}
      data-cursor="card"
    >
      <span className="rank-pos">
        {row.position}º
        {typeof change === 'number' && change !== 0 && (
          <motion.span
            className={`rank-delta ${change > 0 ? 'rank-delta--up' : 'rank-delta--down'}`}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            title={change > 0 ? `Subiu ${change}` : `Desceu ${Math.abs(change)}`}
          >
            {change > 0 ? <ChevronUp size={12} strokeWidth={4} /> : <ChevronDown size={12} strokeWidth={4} />}
            {Math.abs(change)}
          </motion.span>
        )}
      </span>

      <Avatar name={row.name} size="md" />

      <div className="rank-main">
        <span className="rank-name">
          <span className="rank-name-text">{row.name}</span>
          {isMe && <em className="rank-you">você</em>}
          {change === 'new' && (
            <em className="rank-new">
              <Sparkles size={11} strokeWidth={3} /> novo
            </em>
          )}
        </span>
        <span className="rank-bar" aria-hidden="true">
          <motion.span
            className="rank-bar-fill"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: pct / 100 }}
            transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 1.7 + Math.min(index, 12) * 0.06 }}
          />
        </span>
        {isMe && hint && <span className="rank-hint">{hint}</span>}
      </div>

      <span className="rank-time">
        <Clock size={14} strokeWidth={3} /> {formatDuration(row.total_time_ms)}
      </span>
      <span className="rank-score">
        <AnimatedCounter value={row.score} from={0} duration={1.1} />
        <small>pts</small>
      </span>
    </motion.li>
  )
}