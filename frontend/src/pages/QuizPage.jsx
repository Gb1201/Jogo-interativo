import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Flag, Flame, Star } from 'lucide-react'
import { useQuiz } from '../hooks/useQuiz'
import AnimatedCounter from '../components/AnimatedCounter'
import ErrorMessage from '../components/ErrorMessage'
import GameButton from '../components/GameButton'
import Loader from '../components/Loader'
import ProgressBar from '../components/ProgressBar'
import QuestionStage from '../components/QuestionStage'

// Tela do jogo: barra de progresso + pontuação + a pergunta atual.
export default function QuizPage({ participant, onFinish }) {
  const quiz = useQuiz(participant)
  const { finish, next, status, current } = quiz
  const autoFinishedRef = useRef(false)

  const handleFinish = async () => {
    const result = await finish()
    if (result) onFinish(result)
  }

  // Caso raro: o jogador já tinha respondido tudo antes de recarregar a página
  useEffect(() => {
    if (status === 'ready' && !current && !autoFinishedRef.current) {
      autoFinishedRef.current = true
      finish().then((result) => {
        if (result) onFinish(result)
      })
    }
  }, [status, current, finish, onFinish])

  if (status === 'loading') return <Loader label="Preparando as perguntas..." />

  if (status === 'error') {
    const empty = quiz.error?.code === 'EMPTY'
    return (
      <ErrorMessage
        title={empty ? 'Ainda não há perguntas' : 'Não consegui carregar o jogo'}
        message={
          empty
            ? 'Avise quem está organizando: as perguntas ainda não foram cadastradas.'
            : 'Confira sua internet e tente novamente. Seu progresso está salvo.'
        }
        onRetry={quiz.reload}
      />
    )
  }

  if (quiz.finishError) {
    return (
      <ErrorMessage
        title="Quase lá!"
        message="Não consegui salvar seu resultado. Confira a internet e tente de novo, suas respostas não foram perdidas."
        onRetry={handleFinish}
        retryLabel="Salvar resultado"
      />
    )
  }

  if (!current) {
    return (
      <div className="quiz-done">
        <Loader label="Salvando seu resultado..." />
        <GameButton variant="success" icon={Flag} loading={quiz.finishing} onClick={handleFinish}>
          Ver resultado
        </GameButton>
      </div>
    )
  }

  const progress = (quiz.number - 1 + (quiz.feedback ? 1 : 0)) / quiz.total

  return (
    <div className="quiz">
      <div className="quiz-top">
        <div className="quiz-top-row">
          <div className="score-pill" title="Pontuação">
            <Star size={22} strokeWidth={3} fill="currentColor" />
            <AnimatedCounter value={quiz.stats.score} className="score-number" />
            <span className="score-label">pts</span>
          </div>

          <AnimatePresence>
            {quiz.stats.streak >= 2 && (
              <motion.div
                key={quiz.stats.streak}
                className="streak"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
              >
                <Flame size={20} strokeWidth={3} /> Combo x{quiz.stats.streak}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ProgressBar value={progress} label="Progresso do quiz" />
      </div>

      <AnimatePresence mode="wait">
        <QuestionStage
          key={current.id}
          question={current}
          number={quiz.number}
          total={quiz.total}
          feedback={quiz.feedback}
          isLast={quiz.isLast}
          finishing={quiz.finishing}
          onAnswer={quiz.answer}
          onContinue={quiz.isLast ? handleFinish : next}
        />
      </AnimatePresence>
    </div>
  )
}
