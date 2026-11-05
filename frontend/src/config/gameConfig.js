export const GAME_CONFIG = {
  name: 'Nimbus Quiz',
  tagline: 'Responda rápido. Suba no ranking.',

  // Tempo limite de cada pergunta, em segundos
  secondsPerQuestion: 20,

  // Pontuação
  pointsPerCorrect: 100,
  // Bônus proporcional ao tempo que sobrou (0 a este valor)
  maxSpeedBonus: 50,

  // Pausa (ms) mostrando o feedback antes de avançar sozinho
  feedbackDelayMs: 1700,

  // Ranking: intervalo de atualização automática (ms)
  rankingRefreshMs: 8000,

  // Limites do campo de nome
  nameMinLength: 2,
  nameMaxLength: 24,

  // % da pontuação máxima possível para disparar a comemoração grande
  celebrationThreshold: 0.6,

  // Chaves do localStorage
  storageKey: 'nimbus-quiz-participant',
  soundKey: 'nimbus-quiz-sound',
}
