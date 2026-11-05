import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Clock, Flag, X } from 'lucide-react'
import { GAME_CONFIG } from '../config/gameConfig'
import { useSound } from '../hooks/useSound'
import { useTimer } from '../hooks/useTimer'
import { burst } from '../utils/confetti'
import AnswerCard from './AnswerCard'
import GameButton from './GameButton'
import TimerRing from './TimerRing'

const DURATION_MS = GAME_CONFIG.secondsPerQuestion * 1000

// Uma pergunta na tela. O QuizPage usa key={question.id}, então cada pergunta
// monta um componente novo: o timer e os "travas" reiniciam sozinhos.
export default function QuestionStage({
  question,
  number,
  total,
  feedback,
  isLast,
  finishing,
  onAnswer,
  onContinue,
}) {
  const { play } = useSound()
  const answered = Boolean(feedback)
  const lockedRef = useRef(false)
  const continuedRef = useRef(false)

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
    onAnswer(option, elapsed)
  }

  const handleContinue = useCallback(() => {
    if (continuedRef.current) return
    continuedRef.current = true
    onContinue()
  }, [onContinue])

  // Avança sozinho depois de mostrar o feedback (o botão "Continuar" adianta)
  const continueRef = useRef(handleContinue)
  useEffect(() => {
    continueRef.current = handleContinue
  }, [handleContinue])
  useEffect(() => {
    if (!feedback) return undefined
    const id = setTimeout(() => continueRef.current(), GAME_CONFIG.feedbackDelayMs)
    return () => clearTimeout(id)
  }, [feedback])

  const stateOf = (option) => {
    if (!feedback) return 'idle'
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
      <div className="question-card">
        <div className="question-meta">
          <span className="badge badge--gum">
            Pergunta {number} de {total}
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
              <span>
                {feedback.isCorrect
                  ? `Mandou bem! +${feedback.points}`
                  : feedback.timedOut
                    ? 'O tempo acabou!'
                    : 'Ops, não foi dessa vez!'}
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
