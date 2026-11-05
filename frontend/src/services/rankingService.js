import { supabase } from '../config/supabase'
import { GameError } from './errors'

// Lê a view "ranking" (só quem finalizou), ordenada por pontuação e tempo.
export async function fetchRanking() {
  const { data, error } = await supabase
    .from('ranking')
    .select('position, id, name, score, correct_count, wrong_count, total_time_ms')
    .order('score', { ascending: false })
    .order('total_time_ms', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw new GameError('NETWORK', error.message)
  return data ?? []
}
