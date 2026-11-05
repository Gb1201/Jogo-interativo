import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { GAME_CONFIG } from '../config/gameConfig'

// Efeitos sonoros sintetizados com Web Audio (sem arquivos de áudio).
// Começam DESLIGADOS; só tocam depois que o jogador ativa o som. Volume baixo.

const VOLUME = 0.13

// Cada nota: f = frequência (Hz), s = início (s), d = duração (s), type = onda, v = volume relativo
const SOUNDS = {
  click: [{ f: 620, d: 0.07, type: 'triangle' }],
  select: [
    { f: 440, d: 0.06, type: 'triangle' },
    { f: 660, s: 0.05, d: 0.09, type: 'triangle' },
  ],
  correct: [
    { f: 523, d: 0.12 },
    { f: 659, s: 0.08, d: 0.12 },
    { f: 784, s: 0.16, d: 0.12 },
    { f: 1047, s: 0.24, d: 0.28 },
  ],
  wrong: [
    { f: 220, d: 0.16, type: 'sawtooth', v: 0.45 },
    { f: 165, s: 0.14, d: 0.3, type: 'sawtooth', v: 0.45 },
  ],
  finish: [
    { f: 523, d: 0.14 },
    { f: 659, s: 0.14, d: 0.14 },
    { f: 784, s: 0.28, d: 0.14 },
    { f: 659, s: 0.42, d: 0.14 },
    { f: 784, s: 0.56, d: 0.14 },
    { f: 1047, s: 0.7, d: 0.55 },
  ],
  achievement: [
    { f: 880, d: 0.1, type: 'triangle' },
    { f: 1175, s: 0.08, d: 0.1, type: 'triangle' },
    { f: 1568, s: 0.16, d: 0.3, type: 'triangle' },
  ],
}

function playNotes(ctx, notes) {
  const t0 = ctx.currentTime + 0.01
  notes.forEach(({ f, s = 0, d = 0.1, type = 'sine', v = 1 }) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(f, t0 + s)
    gain.gain.setValueAtTime(0.0001, t0 + s)
    gain.gain.exponentialRampToValueAtTime(VOLUME * v, t0 + s + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + s + d)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0 + s)
    osc.stop(t0 + s + d + 0.03)
  })
}

function readEnabled() {
  try {
    return localStorage.getItem(GAME_CONFIG.soundKey) === 'on'
  } catch {
    return false
  }
}

const SoundContext = createContext(null)

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(readEnabled)
  const enabledRef = useRef(enabled)
  const ctxRef = useRef(null)

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return null
      ctxRef.current = new AudioCtx()
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const play = useCallback(
    (name) => {
      if (!enabledRef.current || !SOUNDS[name]) return
      try {
        const ctx = getContext()
        if (ctx) playNotes(ctx, SOUNDS[name])
      } catch {
        /* sem áudio: segue o jogo */
      }
    },
    [getContext],
  )

  const toggle = useCallback(() => {
    const next = !enabledRef.current
    enabledRef.current = next
    setEnabled(next)
    try {
      localStorage.setItem(GAME_CONFIG.soundKey, next ? 'on' : 'off')
    } catch {
      /* ignorar */
    }
    if (next) play('select') // confirmação sonora (acontece após um clique do usuário)
  }, [play])

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play])
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound precisa estar dentro de <SoundProvider>')
  return ctx
}
