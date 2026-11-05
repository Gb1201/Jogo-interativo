import { motion } from 'motion/react'

// Barra de progresso animada. value vai de 0 a 1.
export default function ProgressBar({ value, label }) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label}
    >
      <motion.div
        className="progress-fill"
        initial={false}
        animate={{ width: `${percent}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      />
    </div>
  )
}
