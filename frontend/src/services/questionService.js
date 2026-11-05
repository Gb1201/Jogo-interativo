import { supabase } from '../config/supabase'
import { GameError } from './errors'

const BASE_COLUMNS = 'id, text, position, options(id, text, is_correct)'

// Busca perguntas ativas com suas alternativas e a explicação da resposta.
// Se o banco ainda não tiver a coluna "explanation" (SQL não atualizado), o jogo
// continua funcionando, só sem a explicação.
export async function fetchQuestions() {
  const query = (columns) =>
    supabase
      .from('questions')
      .select(columns)
      .eq('active', true)
      .order('position', { ascending: true })

  let { data, error } = await query(
    'id, text, explanation, position, options(id, text, is_correct)',
  )

  if (error && (error.code === '42703' || /explanation/i.test(error.message ?? ''))) {
    ;({ data, error } = await query(BASE_COLUMNS))
  }

  if (error) throw new GameError('NETWORK', error.message)

  // Descarta perguntas mal cadastradas (sem alternativas ou sem resposta correta)
  return (data ?? []).filter(
    (q) => q.options?.length >= 2 && q.options.some((o) => o.is_correct),
  )
}