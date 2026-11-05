import { useEffect } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

// Número que "rola" até o novo valor. Use from={0} para contar a partir do zero ao montar.
export default function AnimatedCounter({ value, from, duration = 0.8, className }) {
  const motionValue = useMotionValue(from ?? value)
  const text = useTransform(motionValue, (v) => Math.round(v).toLocaleString('pt-BR'))

  useEffect(() => {
    const controls = animate(motionValue, value, { duration, ease: 'easeOut' })
    return () => controls.stop()
  }, [value, duration, motionValue])

  return <motion.span className={className}>{text}</motion.span>
}
