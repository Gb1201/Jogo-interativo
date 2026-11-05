import { GAME_CONFIG } from '../config/gameConfig'

const LIMIT_MS = GAME_CONFIG.secondsPerQuestion * 1000

// Quais perguntas são "Rodada Ouro": a do meio e a última.
export function getGoldRounds(total) {
  if (total < 2) return total === 1 ? [1] : []
  return [...new Set([Math.ceil(total / 2), total])]
}

// Bônus de combo: depende de quantos acertos seguidos vieram ANTES desta pergunta.
export function comboBonus(previousStreak) {
  return Math.min(previousStreak * GAME_CONFIG.comboBonusStep, GAME_CONFIG.comboBonusMax)
}

// Calcula os pontos de uma resposta correta e devolve o detalhamento para mostrar ao jogador.
export function computePoints(timeMs, { previousStreak = 0, isGold = false, hinted = false } = {}) {
  const timeLeft = Math.max(0, 1 - timeMs / LIMIT_MS)
  const base = GAME_CONFIG.pointsPerCorrect
  const speed = Math.round(GAME_CONFIG.maxSpeedBonus * timeLeft)
  const combo = comboBonus(previousStreak)

  let total = base + speed + combo
  if (hinted) total = Math.round(total * GAME_CONFIG.hintPenalty)
  if (isGold) total *= GAME_CONFIG.goldMultiplier

  return { base, speed, combo, hinted, isGold, total }
}

// Pontuação máxima possível (acertar tudo, bem rápido, sem dica).
export function maxScorePossible(total) {
  const perQuestion = (n) =>
    GAME_CONFIG.pointsPerCorrect + GAME_CONFIG.maxSpeedBonus + comboBonus(n)
  let sum = 0
  for (let i = 0; i < total; i++) {
    const isGold = getGoldRounds(total).includes(i + 1)
    sum += perQuestion(i) * (isGold ? GAME_CONFIG.goldMultiplier : 1)
  }
  return sum
}

export const MISSIONS = [
  {
    id: 'combo',
    title: 'Sequência de fogo',
    description: `Acerte ${GAME_CONFIG.missionComboTarget} perguntas seguidas`,
    target: GAME_CONFIG.missionComboTarget,
    value: (m) => m.maxStreak,
  },
  {
    id: 'fast',
    title: 'Rápido no gatilho',
    description: `Acerte ${GAME_CONFIG.missionFastTarget} perguntas em menos de ${GAME_CONFIG.missionFastSeconds}s cada`,
    target: GAME_CONFIG.missionFastTarget,
    value: (m) => m.fastCorrect,
  },
  {
    id: 'gold',
    title: 'Mestre da Ouro',
    description: 'Acerte todas as Rodadas Ouro',
    target: (total) => getGoldRounds(total).length,
    value: (m) => m.goldCorrect,
  },
]

export const EMPTY_MISSION_STATS = { maxStreak: 0, fastCorrect: 0, goldCorrect: 0 }

// Devolve cada missão com progresso atual, meta e se foi cumprida.
export function evaluateMissions(missionStats, total) {
  return MISSIONS.map((mission) => {
    const target = typeof mission.target === 'function' ? mission.target(total) : mission.target
    const progress = Math.min(mission.value(missionStats), target)
    return { ...mission, target, progress, done: target > 0 && progress >= target }
  })
}
