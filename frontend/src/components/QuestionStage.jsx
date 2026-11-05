import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Clock, Crown, Flag, Lightbulb, X } from 'lucide-react'
import { GAME_CONFIG } from '../config/gameConfig'
import '../styles/explanation.css'
import { useSound } from '../hooks/useSound'
import { useTimer } from '../hooks/useTimer'
import { burst } from '../utils/confetti'
import AnswerCard from './AnswerCard'
import GameButton from './GameButton'
import TimerRing from './TimerRing'

const DURATION_MS = GAME_CONFIG.secondsPerQuestion * 1000

// Mostra de onde vieram os pontos, para o jogador entender a conta.
function breakdownText(b) {
  const parts = [`${b.base} base`]
  if (b.speed > 0) parts.push(`${b.speed} velocidade`)
  if (b.combo > 0) parts.push(`${b.combo} combo`)
  let text = parts.join(' + ')
  if (b.hinted) text += ' (÷2 pela dica)'
  if (b.isGold) text += ` (x${GAME_CONFIG.goldMultiplier} Ouro)`
  return text
}

// Uma pergunta na tela. O QuizPage usa key={question.id}, então cada pergunta
// monta um componente novo: o timer e os "travas" reiniciam sozinhos.
export default function QuestionStage({
  question,
  number,
  total,
  feedback,
  isLast,
  isGold,
  hintsLeft,
  finishing,
  onAnswer,
  onHint,
  onContinue,
}) {
  const { play } = useSound()
  const answered = Boolean(feedback)
  const lockedRef = useRef(false)
  const continuedRef = useRef(false)
  const panelRef = useRef(null)
  const [removedIds, setRemovedIds] = useState([])
  const hinted = removedIds.length > 0

  const correctOption = question.options.find((o) => o.is_correct)
  const explanation = question.explanation?.trim() || null

  const handleExpire = useCallback(() => {
    if (lockedRef.current) return
    lockedRef.current = true
    play('wrong')
    onAnswer(null, DURATION_MS)
  }, [onAnswer, play])

  const { remainingMs, getElapsedMs } = useTimer({
    durationMs: DURATION_MS,
    running: !answered,
    onExpire: handleExpire,
  })

  const handleSelect = (option, event) => {
    if (lockedRef.current || answered) return
    lockedRef.current = true
    const elapsed = getElapsedMs()

    if (option.is_correct) {
      play('correct')
      const rect = event.currentTarget.getBoundingClientRect()
      burst(
        {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        45,
      )
    } else {
      play('wrong')
    }
    onAnswer(option, elapsed, hinted)
  }

  const handleHint = () => {
    if (lockedRef.current || answered || hinted || hintsLeft <= 0) return
    const ids = onHint()
    if (ids) {
      play('select')
      setRemovedIds(ids)
    }
  }

  const handleContinue = useCallback(() => {
    if (continuedRef.current) return
    continuedRef.current = true
    onContinue()
  }, [onContinue])

  // Sem explicação: avança sozinho depois do feedback (o botão "Continuar" adianta).
  // Com explicação: espera o jogador terminar de ler e clicar em "Continuar".
  const continueRef = useRef(handleContinue)
  useEffect(() => {
    continueRef.current = handleContinue
  }, [handleContinue])
  useEffect(() => {
    if (!feedback || explanation) return undefined
    const id = setTimeout(() => continueRef.current(), GAME_CONFIG.feedbackDelayMs)
    return () => clearTimeout(id)
  }, [feedback, explanation])

  // Garante que o painel da resposta apareça na tela (importante no celular)
  useEffect(() => {
    if (!feedback) return undefined
    const id = setTimeout(
      () => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
      350,
    )
    return () => clearTimeout(id)
  }, [feedback])

  const stateOf = (option) => {
    if (!feedback) return removedIds.includes(option.id) ? 'removed' : 'idle'
    if (option.id === feedback.correctId) return 'correct'
    if (option.id === feedback.selectedId) return 'wrong'
    return 'dim'
  }

  return (
    <motion.section
      className="stage"
      initial={{ opacity: 0, x: 80, rotate: 2 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      exit={{ opacity: 0, x: -80, rotate: -2 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
    >
      <div className={`question-card ${isGold ? 'question-card--gold' : ''}`}>
        <div className="question-meta">
          <span className="question-badges">
            <span className="badge badge--gum">
              Pergunta {number} de {total}
            </span>
            {isGold && (
              <span className="badge badge--gold" title="Vale pontos em dobro">
                <Crown size={16} strokeWidth={3} /> Rodada Ouro x{GAME_CONFIG.goldMultiplier}
              </span>
            )}
          </span>
          <TimerRing remainingMs={remainingMs} durationMs={DURATION_MS} />
        </div>
        <h2 className="question-text">{question.text}</h2>
      </div>

      <div className="answers">
        {question.options.map((option, i) => (
          <AnswerCard
            key={option.id}
            index={i}
            text={option.text}
            state={stateOf(option)}
            disabled={answered}
            onClick={(event) => handleSelect(option, event)}
          />
        ))}
      </div>

      {!answered && (
        <div className="hint-row">
          <button
            type="button"
            className="hint-btn"
            onClick={handleHint}
            disabled={hinted || hintsLeft <= 0}
          >
            <Lightbulb size={20} strokeWidth={3} />
            {hinted
              ? 'Dica usada: vale metade dos pontos'
              : `Dica 50/50 (${hintsLeft} ${hintsLeft === 1 ? 'restante' : 'restantes'})`}
          </button>
          {!hinted && hintsLeft > 0 && (
            <span className="hint-note">Elimina 2 erradas, mas o acerto vale metade.</span>
          )}
        </div>
      )}

      <AnimatePresence>
        {feedback && correctOption && (
          <motion.div
            key="explain"
            ref={panelRef}
            className="explain"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          >
            <div className="explain-head">
              <Check size={30} strokeWidth={4} />
              <div className="explain-head-text">
                <span className="explain-label">Resposta correta</span>
                <strong className="explain-answer">{correctOption.text}</strong>
              </div>
            </div>
            {explanation && (
              <div className="explain-body">
                <span className="explain-icon">
                  <Lightbulb size={20} strokeWidth={3} />
                </span>
                <p className="explain-text">{explanation}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="stage-footer">
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              key="feedback"
              className={`feedback ${feedback.isCorrect ? 'feedback--ok' : 'feedback--bad'}`}
              initial={{ opacity: 0, y: 24, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              role="status"
            >
              {feedback.isCorrect ? (
                <Check size={30} strokeWidth={4} />
              ) : feedback.timedOut ? (
                <Clock size={30} strokeWidth={3.5} />
              ) : (
                <X size={30} strokeWidth={4} />
              )}
              <span className="feedback-text">
                <span>
                  {feedback.isCorrect
                    ? `Mandou bem! +${feedback.points}`
                    : feedback.timedOut
                      ? 'O tempo acabou!'
                      : 'Ops, não foi dessa vez!'}
                </span>
                {feedback.isCorrect && feedback.breakdown && (
                  <small className="feedback-detail">
                    {breakdownText(feedback.breakdown)}
                  </small>
                )}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {feedback && (
          <GameButton
            variant="success"
            icon={isLast ? Flag : ArrowRight}
            loading={finishing}
            onClick={handleContinue}
          >
            {isLast ? 'Ver resultado' : 'Continuar'}
          </GameButton>
        )}
      </div>
    </motion.section>
  )
}