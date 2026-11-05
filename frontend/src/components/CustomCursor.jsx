import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

// Cursor do jogo: ponto + anel com mola + rastro de bolinhas + onda no clique.
// Só existe em dispositivos com mouse (hover: hover e pointer: fine). No celular não renderiza nada.

const HOVER_SELECTORS = {
  card: '[data-cursor="card"]',
  button: 'button, a, [role="button"], [data-cursor="button"]',
  text: 'input, textarea',
}

const RING_SCALE = { default: 1, button: 1.9, card: 1.55, text: 0.45 }

const TRAIL = [
  { stiffness: 260, damping: 26, size: 12, color: 'var(--color-bubble-gum)' },
  { stiffness: 170, damping: 28, size: 9, color: 'var(--color-pure-sun)' },
  { stiffness: 110, damping: 30, size: 6, color: 'var(--color-limeade)' },
]

function TrailDot({ x, y, stiffness, damping, size, color, visible }) {
  const sx = useSpring(x, { stiffness, damping, mass: 0.5 })
  const sy = useSpring(y, { stiffness, damping, mass: 0.5 })
  return (
    <motion.div className="cursor-layer" style={{ x: sx, y: sy }}>
      <span
        className="cursor-trail"
        style={{
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          background: color,
          opacity: visible ? 0.85 : 0,
        }}
      />
    </motion.div>
  )
}

function getMode(target) {
  if (!(target instanceof Element)) return 'default'
  if (target.closest(HOVER_SELECTORS.text)) return 'text'
  if (target.closest(HOVER_SELECTORS.card)) return 'card'
  if (target.closest(HOVER_SELECTORS.button)) return 'button'
  return 'default'
}

export default function CustomCursor() {
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )
  const [mode, setMode] = useState('default')
  const [pressed, setPressed] = useState(false)
  const [visible, setVisible] = useState(false)
  const [ripples, setRipples] = useState([])

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 220, damping: 20, mass: 0.6 })
  const ringY = useSpring(y, { stiffness: 220, damping: 20, mass: 0.6 })

  useEffect(() => {
    if (!enabled) return undefined
    const root = document.documentElement
    root.classList.add('custom-cursor')

    let rippleId = 0
    const onMove = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const onOver = (e) => setMode(getMode(e.target))
    const onDown = (e) => {
      setPressed(true)
      const id = ++rippleId
      setRipples((list) => [...list, { id, x: e.clientX, y: e.clientY }])
    }
    const onUp = () => setPressed(false)
    const onLeave = () => setVisible(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      root.classList.remove('custom-cursor')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const scale = RING_SCALE[mode] * (pressed ? 0.72 : 1)

  return (
    <div className="cursor-root" aria-hidden="true">
      {TRAIL.map((t) => (
        <TrailDot key={t.size} x={x} y={y} visible={visible} {...t} />
      ))}

      <motion.div className="cursor-layer" style={{ x: ringX, y: ringY }}>
        <motion.span
          className={`cursor-ring cursor-ring--${mode}`}
          animate={{ scale, opacity: visible ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        />
      </motion.div>

      <motion.div className="cursor-layer" style={{ x, y }}>
        <motion.span
          className="cursor-dot"
          animate={{ scale: pressed ? 0.6 : mode === 'text' ? 0 : 1, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.12 }}
        />
      </motion.div>

      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="cursor-ripple"
          style={{ left: r.x, top: r.y }}
          initial={{ scale: 0.2, opacity: 0.8 }}
          animate={{ scale: 2.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onAnimationComplete={() => setRipples((list) => list.filter((i) => i.id !== r.id))}
        />
      ))}
    </div>
  )
}
