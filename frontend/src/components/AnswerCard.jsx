import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

// Alternativa em forma de card de jogo.
// state: idle | correct | wrong | dim
const variants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.12 + i * 0.08 },
  }),
  wrong: {
    x: [0, -12, 12, -9, 9, -4, 0],
    transition: { duration: 0.5 },
  },
  correct: {
    scale: [1, 1.06, 1],
    transition: { duration: 0.45 },
  },
}

export default function AnswerCard({ index, text, state = 'idle', disabled, onClick }) {
  const animateState = state === 'wrong' ? 'wrong' : state === 'correct' ? 'correct' : 'show'

  return (
    <motion.button
      type="button"
      data-cursor="card"
      data-index={index}
      className={`answer answer--${state}`}
      custom={index}
      variants={variants}
      initial="hidden"
      animate={animateState}
      whileHover={disabled ? undefined : { y: -4, rotate: index % 2 ? 0.8 : -0.8, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 3 }}
      disabled={disabled}
      onClick={(event) => onClick?.(event)}
    >
      <span className="answer-letter">{LETTERS[index] ?? index + 1}</span>
      <span className="answer-text">{text}</span>
      {state === 'correct' && <Check className="answer-mark" size={30} strokeWidth={4} />}
      {state === 'wrong' && <X className="answer-mark" size={30} strokeWidth={4} />}
    </motion.button>
  )
}
