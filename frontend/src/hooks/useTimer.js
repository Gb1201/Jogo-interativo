import { useCallback, useEffect, useRef, useState } from 'react'

// Temporizador regressivo de uma pergunta.
// Usa timestamps (performance.now), então continua correto mesmo se a aba ficar em segundo plano.
// - running=false congela a contagem (ex.: depois de responder).
// - onExpire é chamado uma única vez quando o tempo acaba.
export function useTimer({ durationMs, running, onExpire }) {
  const [remainingMs, setRemainingMs] = useState(durationMs)
  const startRef = useRef(null)
  const firedRef = useRef(false)
  const expireRef = useRef(onExpire)

  useEffect(() => {
    expireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (startRef.current === null) startRef.current = performance.now()
    if (!running) return undefined

    const id = setInterval(() => {
      const left = Math.max(0, durationMs - (performance.now() - startRef.current))
      setRemainingMs(left)
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true
        clearInterval(id)
        expireRef.current?.()
      }
    }, 100)

    return () => clearInterval(id)
  }, [running, durationMs])

  // Tempo gasto até agora (preciso, não depende do intervalo de 100 ms)
  const getElapsedMs = useCallback(() => {
    if (startRef.current === null) return 0
    return Math.min(durationMs, performance.now() - startRef.current)
  }, [durationMs])

  return { remainingMs, getElapsedMs }
}
