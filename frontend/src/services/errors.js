// Erro com um "code" simples para a interface decidir qual mensagem amigável mostrar.
// Códigos usados: DUPLICATE_NAME, NETWORK, EMPTY, NOT_FOUND
export class GameError extends Error {
  constructor(code, message) {
    super(message || code)
    this.name = 'GameError'
    this.code = code
  }
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
