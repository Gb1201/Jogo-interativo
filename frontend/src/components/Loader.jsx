import { motion } from 'motion/react'

// Estado de carregamento: três formas pulando.
export default function Loader({ label = 'Carregando...' }) {
  const shapes = ['loader-dot--gum', 'loader-dot--sun', 'loader-dot--lime']
  return (
    <div className="loader" role="status">
      <div className="loader-dots">
        {shapes.map((cls, i) => (
          <motion.span
            key={cls}
            className={`loader-dot ${cls}`}
            animate={{ y: [0, -22, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <p className="loader-label">{label}</p>
    </div>
  )
}
