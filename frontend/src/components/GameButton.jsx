import { motion } from 'motion/react'
import { LoaderCircle } from 'lucide-react'
import { useSound } from '../hooks/useSound'

// Botão grande de jogo, com borda, "degrau" de sombra e microinterações.
// variant: primary (Bubble Gum) | success (Tropical Rain) | danger (Tomato Jam) | gold (Pure Sun) | ghost (Lavender)
// size: md | lg
export default function GameButton({
  children,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) {
  const { play } = useSound()
  const isDisabled = disabled || loading

  const handleClick = (event) => {
    if (isDisabled) return
    play('click')
    onClick?.(event)
  }

  return (
    <motion.button
      type={type}
      className={`game-btn game-btn--${variant} game-btn--${size} ${className}`}
      disabled={isDisabled}
      onClick={handleClick}
      whileHover={isDisabled ? undefined : { scale: 1.05, rotate: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.96, y: 4 }}
      transition={{ type: 'spring', stiffness: 420, damping: 17 }}
      {...rest}
    >
      {loading ? (
        <LoaderCircle className="spin" size={22} strokeWidth={3} />
      ) : (
        Icon && <Icon size={size === 'lg' ? 28 : 22} strokeWidth={2.8} />
      )}
      <span>{children}</span>
    </motion.button>
  )
}
