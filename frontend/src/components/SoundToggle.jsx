import { motion } from 'motion/react'
import { Volume2, VolumeX } from 'lucide-react'
import { useSound } from '../hooks/useSound'

// Liga/desliga os efeitos sonoros (começam desligados).
export default function SoundToggle() {
  const { enabled, toggle } = useSound()
  return (
    <motion.button
      type="button"
      className={`icon-btn ${enabled ? 'icon-btn--on' : ''}`}
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Desativar sons' : 'Ativar sons'}
      title={enabled ? 'Sons ligados' : 'Sons desligados'}
      whileHover={{ scale: 1.1, rotate: -6 }}
      whileTap={{ scale: 0.9, y: 3 }}
    >
      {enabled ? <Volume2 size={22} strokeWidth={2.8} /> : <VolumeX size={22} strokeWidth={2.8} />}
    </motion.button>
  )
}
