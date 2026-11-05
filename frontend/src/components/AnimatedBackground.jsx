import { memo } from 'react'
import DecorIcon from './ContraceptiveIcons'
import '../styles/decor.css'

// Fundo do jogo: céu em gradiente, nuvens à deriva e ilustrações educativas de
// métodos contraceptivos flutuando como stickers.
// Tudo em CSS (transform/opacity) para não pesar, inclusive em celulares.

const C = {
  gum: 'var(--color-bubble-gum)',
  sun: 'var(--color-pure-sun)',
  lime: 'var(--color-limeade)',
  rain: 'var(--color-tropical-rain)',
  lav: 'var(--color-autumn-lavender)',
  peony: 'var(--color-peony-bundle)',
  sky: 'var(--color-airplane-view)',
  paper: 'var(--paper)',
}

// ícone, left%, top%, tamanho(px), cor, cor2, duração(s), atraso(s), dx, dy, rot0, rot1, balanço(s)
const DECOR = [
  ['condom', 4, 9, 86, C.gum, C.sun, 11, 0, 18, 26, -14, 8, 6],
  ['pill', 78, 5, 100, C.sun, C.lav, 13, 1, -22, 24, 12, -6, 7],
  ['iud', 88, 36, 90, C.rain, C.lime, 12, 2, -16, -22, 10, 26, 6.5],
  ['syringe', 2, 38, 96, C.lav, C.gum, 14, 0.5, 20, -24, -34, -18, 7.5],
  ['ring', 83, 68, 84, C.lime, C.lime, 12, 1.5, -20, -28, 0, 40, 8],
  ['femaleCondom', 6, 70, 88, C.peony, C.lav, 13, 2.5, 22, -22, -10, 10, 6],
  ['patch', 44, 2, 70, C.peony, C.sun, 10, 1.2, 16, 22, 8, -10, 5.5],
  ['implant', 58, 87, 96, C.lime, C.gum, 14, 0.8, -24, -18, -22, -8, 7],
  ['pill', 21, 87, 84, C.gum, C.peony, 12, 3, 20, -24, 18, 32, 6.5],
  ['condom', 70, 45, 62, C.lav, C.lime, 10, 1.8, -14, 20, 18, 4, 5.5],
  ['iud', 27, 17, 62, C.gum, C.sun, 11, 2.2, 14, 20, -18, -4, 6],
  ['syringe', 91, 86, 72, C.sun, C.peony, 13, 1.1, -18, -20, -50, -30, 7],
  ['ring', 35, 62, 56, C.gum, C.gum, 11, 0.4, 16, -18, 0, -50, 8],
  ['heart', 15, 28, 34, C.gum, null, 9, 0.6, 10, 22, -12, 10, 4],
  ['heart', 62, 14, 30, C.sun, null, 10, 1.4, -12, 18, 10, -8, 4.5],
  ['plus', 50, 79, 30, C.lime, null, 10, 2.6, 12, -16, 0, 90, 5],
  ['heart', 78, 28, 26, C.peony, null, 9, 1.9, -8, 20, 14, -6, 4],
  ['plus', 11, 55, 28, C.sun, null, 11, 0.9, 10, -14, 0, -90, 5],
  ['heart', 90, 58, 32, C.gum, null, 10, 2.1, -10, 18, -10, 12, 4.5],
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
      {DECOR.map(([name, left, top, size, color, color2, dur, delay, dx, dy, r0, r1, bob], i) => (
        <span
          key={i}
          className="bg-decor"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            '--size': `${size}px`,
            '--dur': `${dur}s`,
            '--delay': `${delay}s`,
            '--dx': `${dx}px`,
            '--dy': `${dy}px`,
            '--rot0': `${r0}deg`,
            '--rot1': `${r1}deg`,
            '--bob': `${bob}s`,
          }}
        >
          <DecorIcon name={name} c={color} c2={color2 ?? undefined} />
        </span>
      ))}
    </div>
  )
}

export default memo(AnimatedBackground)