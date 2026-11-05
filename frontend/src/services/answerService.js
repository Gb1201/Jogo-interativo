import { supabase } from '../config/supabase'
import { GameError, sleep } from './errors'

// Registra uma resposta, com até 3 tentativas em caso de falha de rede.
// Se o banco acusar duplicidade (23505), a resposta já existe e tudo bem.
export async function saveAnswer(payload) {
  let lastError = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.from('answers').insert(payload)
    if (!error || error.code === '23505') return
    lastError = error
    await sleep(500 * (attempt + 1))
  }
  throw new GameError('NETWORK', lastError?.message)
}

// Respostas já dadas por um participante (para retomar o jogo)
export async function fetchAnswers(participantId) {
  const { data, error } = await supabase
    .from('answers')
    .select('question_id, is_correct, time_ms, points')
    .eq('participant_id', participantId)

  if (error) throw new GameError('NETWORK', error.message)
  return data ?? []
}
