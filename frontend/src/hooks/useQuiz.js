import { useCallback, useEffect, useRef, useState } from 'react'
import { GAME_CONFIG } from '../config/gameConfig'
import { fetchQuestions } from '../services/questionService'
import { fetchAnswers, saveAnswer } from '../services/answerService'
import { finishParticipant } from '../services/participantService'
import { GameError } from '../services/errors'
import { shuffle } from '../utils/shuffle'

const LIMIT_MS = GAME_CONFIG.secondsPerQuestion * 1000
const EMPTY_STATS = { score: 0, correct: 0, wrong: 0, totalMs: 0, streak: 0 }

// 100 pontos + bônus proporcional ao tempo que sobrou
export function computePoints(timeMs) {
  const timeLeft = Math.max(0, 1 - timeMs / LIMIT_MS)
  return GAME_CONFIG.pointsPerCorrect + Math.round(GAME_CONFIG.maxSpeedBonus * timeLeft)
}

// Toda a lógica do jogo: carregar, embaralhar, responder, pontuar e finalizar.
// Também sabe retomar: perguntas já respondidas (gravadas no banco) são puladas.
export function useQuiz(participant) {
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)
  const [queue, setQueue] = useState([]) // perguntas que ainda faltam (a primeira é a atual)
  const [total, setTotal] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [stats, setStats] = useState(EMPTY_STATS)
  const [feedback, setFeedback] = useState(null)
  const [finishing, setFinishing] = useState(false)
  const [finishError, setFinishError] = useState(null)

  const statsRef = useRef(EMPTY_STATS)
  const lockRef = useRef(false) // impede responder duas vezes a mesma pergunta
  const finishingRef = useRef(false)
  const pendingRef = useRef([]) // gravações em andamento
  const failedRef = useRef([]) // gravações que falharam (são refeitas ao finalizar)

  const commitStats = useCallback((patch) => {
    statsRef.current = { ...statsRef.current, ...patch }
    setStats(statsRef.current)
  }, [])

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const [questions, previous] = await Promise.all([
        fetchQuestions(),
        fetchAnswers(participant.id),
      ])
      if (questions.length === 0) {
        throw new GameError('EMPTY', 'Nenhuma pergunta cadastrada')
      }

      const validIds = new Set(questions.map((q) => q.id))
      const doneIds = new Set(
        previous.filter((a) => validIds.has(a.question_id)).map((a) => a.question_id),
      )
      const restored = previous.reduce(
        (acc, a) => ({
          score: acc.score + a.points,
          correct: acc.correct + (a.is_correct ? 1 : 0),
          wrong: acc.wrong + (a.is_correct ? 0 : 1),
          totalMs: acc.totalMs + a.time_ms,
          streak: 0,
        }),
        EMPTY_STATS,
      )
      commitStats(restored)

      const remaining = questions
        .filter((q) => !doneIds.has(q.id))
        .map((q) => ({ ...q, options: shuffle(q.options) }))

      setQueue(shuffle(remaining))
      setTotal(questions.length)
      setAnswered(doneIds.size)
      setStatus('ready')
    } catch (err) {
      setError(err)
      setStatus('error')
    }
  }, [participant.id, commitStats])

  useEffect(() => {
    load()
  }, [load])

  const current = queue[0] ?? null

  // option = alternativa escolhida, ou null se o tempo acabou
  const answer = useCallback(
    (option, elapsedMs) => {
      if (!current || lockRef.current) return
      lockRef.current = true

      const timedOut = !option
      const isCorrect = Boolean(option?.is_correct)
      const timeMs = timedOut
        ? LIMIT_MS
        : Math.round(Math.min(Math.max(elapsedMs, 0), LIMIT_MS))
      const points = isCorrect ? computePoints(timeMs) : 0
      const correctOption = current.options.find((o) => o.is_correct)

      const s = statsRef.current
      commitStats({
        score: s.score + points,
        correct: s.correct + (isCorrect ? 1 : 0),
        wrong: s.wrong + (isCorrect ? 0 : 1),
        totalMs: s.totalMs + timeMs,
        streak: isCorrect ? s.streak + 1 : 0,
      })

      setFeedback({
        selectedId: option?.id ?? null,
        correctId: correctOption?.id ?? null,
        isCorrect,
        timedOut,
        points,
      })

      const payload = {
        participant_id: participant.id,
        question_id: current.id,
        option_id: option?.id ?? null,
        is_correct: isCorrect,
        time_ms: timeMs,
        points,
      }
      pendingRef.current.push(
        saveAnswer(payload).catch(() => {
          failedRef.current.push(payload)
        }),
      )
    },
    [current, participant.id, commitStats],
  )

  const next = useCallback(() => {
    if (!lockRef.current) return
    setQueue((q) => q.slice(1))
    setAnswered((n) => n + 1)
    setFeedback(null)
    lockRef.current = false
  }, [])

  // Espera as gravações, refaz as que falharam e marca o participante como finalizado.
  // Devolve o resultado, ou null se falhou (o erro fica em finishError).
  const finish = useCallback(async () => {
    if (finishingRef.current) return null
    finishingRef.current = true
    setFinishing(true)
    setFinishError(null)
    try {
      await Promise.all(pendingRef.current)

      const toRetry = failedRef.current
      failedRef.current = []
      for (const payload of toRetry) {
        try {
          await saveAnswer(payload)
        } catch {
          failedRef.current.push(payload)
        }
      }
      if (failedRef.current.length > 0) {
        throw new GameError('NETWORK', 'Não foi possível salvar todas as respostas')
      }

      const s = statsRef.current
      await finishParticipant(participant.id, {
        score: s.score,
        correct: s.correct,
        wrong: s.wrong,
        totalMs: s.totalMs,
      })

      return {
        participantId: participant.id,
        name: participant.name,
        score: s.score,
        correct: s.correct,
        wrong: s.wrong,
        totalMs: s.totalMs,
        total,
      }
    } catch (err) {
      setFinishError(err)
      return null
    } finally {
      finishingRef.current = false
      setFinishing(false)
    }
  }, [participant.id, participant.name, total])

  return {
    status,
    error,
    reload: load,
    current,
    number: answered + 1,
    total,
    isLast: queue.length <= 1,
    stats,
    feedback,
    answer,
    next,
    finish,
    finishing,
    finishError,
  }
}
