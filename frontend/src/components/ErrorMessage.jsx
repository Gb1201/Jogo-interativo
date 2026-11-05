import { motion } from 'motion/react'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import GameButton from './GameButton'

// Mensagem de erro amigável com botão de tentar de novo.
export default function ErrorMessage({ title = 'Algo deu errado', message, onRetry, retryLabel = 'Tentar de novo' }) {
  return (
    <motion.div
      className="error-box"
      role="alert"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <span className="error-icon">
        <TriangleAlert size={34} strokeWidth={3} />
      </span>
      <h2 className="error-title">{title}</h2>
      {message && <p className="error-text">{message}</p>}
      {onRetry && (
        <GameButton variant="danger" icon={RefreshCw} onClick={onRetry}>
          {retryLabel}
        </GameButton>
      )}
    </motion.div>
  )
}
