import confetti from 'canvas-confetti'

// Cores da paleta oficial
const COLORS = [
  '#f29cc3', // bubble gum
  '#f4d242', // pure sun
  '#d6d35f', // limeade
  '#008471', // tropical rain
  '#80b0e8', // airplane view
  '#ffc0c0', // peony bundle
  '#d1caea', // autumn lavender
]

const base = {
  colors: COLORS,
  disableForReducedMotion: true,
  zIndex: 9000,
}

// Explosão pequena a partir de um ponto (x, y entre 0 e 1)
export function burst(origin = { x: 0.5, y: 0.6 }, particleCount = 55) {
  confetti({
    ...base,
    particleCount,
    spread: 75,
    startVelocity: 34,
    ticks: 150,
    origin,
  })
}

// Chuva de estrelas (usada no emblema da tela inicial)
export function sparkle(origin = { x: 0.5, y: 0.35 }) {
  confetti({
    ...base,
    particleCount: 26,
    spread: 100,
    startVelocity: 28,
    shapes: ['star'],
    scalar: 1.2,
    ticks: 120,
    origin,
  })
}

// Comemoração grande para pontuações altas
export function celebrate(duration = 2600) {
  const end = Date.now() + duration
  const frame = () => {
    confetti({ ...base, particleCount: 4, angle: 60, spread: 62, origin: { x: 0, y: 0.75 } })
    confetti({ ...base, particleCount: 4, angle: 120, spread: 62, origin: { x: 1, y: 0.75 } })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
  confetti({ ...base, particleCount: 140, spread: 110, startVelocity: 45, origin: { x: 0.5, y: 0.45 } })
}
