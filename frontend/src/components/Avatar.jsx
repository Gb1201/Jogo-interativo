// Bolinha com a inicial do jogador. A cor é sempre a mesma para o mesmo nome.
const TONES = ['gum', 'sky', 'lime', 'sun', 'peony', 'lav']

function toneFor(key) {
  let hash = 0
  for (const char of String(key ?? '')) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return TONES[hash % TONES.length]
}

// size: sm | md | lg | xl
export default function Avatar({ name, size = 'md', className = '' }) {
  const initial = String(name ?? '').trim().charAt(0).toUpperCase() || '?'
  return (
    <span className={`avatar avatar--${size} avatar--${toneFor(name)} ${className}`} aria-hidden="true">
      {initial}
    </span>
  )
}