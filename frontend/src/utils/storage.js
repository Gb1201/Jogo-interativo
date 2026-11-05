import { GAME_CONFIG } from '../config/gameConfig'

// Guarda quem está jogando neste aparelho, para retomar se a página recarregar.
// Tudo em try/catch: em modo privado o localStorage pode falhar.

export function getSavedPlayer() {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.storageKey)
    const data = raw ? JSON.parse(raw) : null
    return data?.id && data?.name ? data : null
  } catch {
    return null
  }
}

export function savePlayer(player) {
  try {
    localStorage.setItem(
      GAME_CONFIG.storageKey,
      JSON.stringify({ id: player.id, name: player.name }),
    )
  } catch {
    /* sem persistência: o jogo continua normalmente */
  }
}

export function clearSavedPlayer() {
  try {
    localStorage.removeItem(GAME_CONFIG.storageKey)
  } catch {
    /* ignorar */
  }
}
