// Remove espaços sobrando: "  Ana   Lima " -> "Ana Lima"
export function normalizeName(raw) {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

// 65000 -> "1:05"
export function formatDuration(ms) {
  const totalSeconds = Math.round((ms ?? 0) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function formatClock(date) {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
