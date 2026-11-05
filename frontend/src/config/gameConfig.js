export const GAME_CONFIG = {
  name: 'Nimbus Quiz',
  tagline: 'Responda rápido. Suba no ranking.',

  // Tempo limite de cada pergunta, em segundos
  secondsPerQuestion: 20,

  // Pontuação
  pointsPerCorrect: 100,
  // Bônus proporcional ao tempo que sobrou (0 a este valor)
  maxSpeedBonus: 50,

  // Combo: a cada acerto seguido, ganha +comboBonusStep pontos no acerto seguinte (até o teto)
  comboBonusStep: 10,
  comboBonusMax: 40,

  // Rodada Ouro: os pontos da pergunta valem em dobro
  goldMultiplier: 2,

  // Dica 50/50: elimina 2 alternativas erradas, mas o acerto vale metade dos pontos
  hintsPerGame: 2,
  hintPenalty: 0.5,

  // Missões: metas opcionais para o jogador buscar durante a partida
  missionComboTarget: 3,
  missionFastTarget: 3,
  missionFastSeconds: 8,

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