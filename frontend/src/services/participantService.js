import { supabase } from '../config/supabase'
import { normalizeName } from '../utils/format'
import { GameError } from './errors'

// Cria o participante. O banco tem índice único em lower(btrim(name)),
// então um nome repetido (mesmo com maiúsculas diferentes) devolve o erro 23505.
export async function createParticipant(rawName) {
  const name = normalizeName(rawName)
  const { data, error } = await supabase
    .from('participants')
    .insert({ name })
    .select('id, name, status')
    .single()

  if (error) {
    if (error.code === '23505') throw new GameError('DUPLICATE_NAME', error.message)
    throw new GameError('NETWORK', error.message)
  }
  return data
}

// Busca um participante pelo id (usado para retomar o jogo). Devolve null se não existir.
export async function getParticipant(id) {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new GameError('NETWORK', error.message)
  return data
}

// Marca o participante como finalizado e grava os totais.
export async function finishParticipant(id, { score, correct, wrong, totalMs }) {
  const { data, error } = await supabase
    .from('participants')
    .update({
      score,
      correct_count: correct,
      wrong_count: wrong,
      total_time_ms: totalMs,
      status: 'finished',
      finished_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) throw new GameError('NETWORK', error.message)
  // data === null significa que já estava finalizado (nova tentativa): tudo certo.
  return data
}
