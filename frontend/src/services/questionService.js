import { supabase } from '../config/supabase'
import { GameError } from './errors'

// Busca perguntas ativas com suas alternativas, já em um formato simples.
export async function fetchQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, text, position, options(id, text, is_correct)')
    .eq('active', true)
    .order('position', { ascending: true })

  if (error) throw new GameError('NETWORK', error.message)

  // Descarta perguntas mal cadastradas (sem alternativas ou sem resposta correta)
  return (data ?? []).filter(
    (q) => q.options?.length >= 2 && q.options.some((o) => o.is_correct),
  )
}
