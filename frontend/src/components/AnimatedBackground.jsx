import { memo } from 'react'

// Fundo do jogo: céu em gradiente, nuvens à deriva e formas geométricas flutuando.
// Tudo em CSS (transform/opacity) para não pesar, inclusive em celulares.

const C = {
  gum: 'var(--color-bubble-gum)',
  sun: 'var(--color-pure-sun)',
  lime: 'var(--color-limeade)',
  rain: 'var(--color-tropical-rain)',
  lav: 'var(--color-autumn-lavender)',
  peony: 'var(--color-peony-bundle)',
}

// type, left%, top%, tamanho(px), cor, duração(s), atraso(s), dx, dy, rot0, rot1
const SHAPES = [
  ['circle', 6, 14, 54, C.gum, 9, 0, 20, 30, 0, 0],
  ['star', 84, 10, 62, C.sun, 11, 1, -16, 26, -12, 24],
  ['triangle', 90, 52, 60, C.lime, 10, 2, -24, -20, 10, 70],
  ['square', 4, 62, 50, C.peony, 12, 0.5, 24, -26, 8, 52],
  ['ring', 72, 80, 76, C.lav, 13, 1.5, -20, -30, 0, 40],
  ['circle', 46, 6, 28, C.rain, 8, 2.5, 14, 22, 0, 0],
  ['star', 14, 86, 42, C.lime, 10, 0.8, 18, -22, 20, -20],
  ['triangle', 58, 90, 40, C.gum, 9, 3, -18, -26, -20, 30],
  ['square', 30, 24, 22, C.sun, 11, 1.2, 12, 20, 0, 90],
  ['ring', 22, 44, 34, C.sun, 12, 2, 16, -16, 0, 60],
  ['circle', 94, 30, 24, C.peony, 9, 1.8, -10, 24, 0, 0],
]

const CLOUDS = [
  { top: '12%', scale: 1.1, dur: 70, delay: -10 },
  { top: '44%', scale: 0.75, dur: 95, delay: -50 },
  { top: '74%', scale: 1.3, dur: 85, delay: -30 },
]

function AnimatedBackground() {
  return (
    <div className="bg" aria-hidden="true">
      {CLOUDS.map((c, i) => (
        <span
          key={i}
          className="bg-cloud"
          style={{ top: c.top, '--s': c.scale, '--dur': `${c.dur}s`, '--delay': `${c.delay}s` }}
        />
      ))}
      {SHAPES.map(([type, left, top, size, color, dur, delay, dx, dy, r0, r1], i) => (
        <span
          key={i}
          className={`bg-shape bg-shape--${type}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            '--c': color,
            '--dur': `${dur}s`,
            '--delay': `${delay}s`,
            '--dx': `${dx}px`,
            '--dy': `${dy}px`,
            '--rot0': `${r0}deg`,
            '--rot1': `${r1}deg`,
          }}
        />
      ))}
    </div>
  )
}

export default memo(AnimatedBackground)
