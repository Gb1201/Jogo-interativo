import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { isSupabaseConfigured } from './config/supabase'
import { clearSavedPlayer } from './utils/storage'
import AnimatedBackground from './components/AnimatedBackground'
import CustomCursor from './components/CustomCursor'
import ErrorMessage from './components/ErrorMessage'
import HUD from './components/HUD'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import RankingPage from './pages/RankingPage'
import ResultPage from './pages/ResultPage'
import RulesPage from './pages/RulesPage'

const pageTransition = {
  initial: { opacity: 0, y: 40, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -30, scale: 0.97 },
  transition: { type: 'spring', stiffness: 220, damping: 26 },
}

// Controla qual tela aparece: home -> quiz -> result, com o ranking acessível de fora da partida.
export default function App() {
  const [screen, setScreen] = useState('home')
  const [previousScreen, setPreviousScreen] = useState('home')
  const [participant, setParticipant] = useState(null)
  const [result, setResult] = useState(null)

  const openRanking = () => {
    setPreviousScreen(screen)
    setScreen('ranking')
  }
  const closeRanking = () => setScreen(previousScreen)

  const openRules = () => {
    setPreviousScreen(screen)
    setScreen('rules')
  }
  const closeRules = () => setScreen(previousScreen)

  // Jogador novo vê as regras antes da primeira pergunta; quem retoma vai direto ao jogo.
  const startQuiz = (p, { showRules = false } = {}) => {
    setParticipant(p)
    setResult(null)
    setScreen(showRules ? 'rules-pregame' : 'quiz')
  }

  const showResult = (r) => {
    setResult(r)
    setScreen('result')
  }

  // Jogador que já tinha terminado (retomou pela página inicial)
  const showFinishedParticipant = (p) => {
    setParticipant(p)
    showResult({
      participantId: p.id,
      name: p.name,
      score: p.score,
      correct: p.correct_count,
      wrong: p.wrong_count,
      totalMs: p.total_time_ms,
      total: p.correct_count + p.wrong_count,
    })
  }

  const newPlayer = () => {
    clearSavedPlayer()
    setParticipant(null)
    setResult(null)
    setScreen('home')
  }

  if (!isSupabaseConfigured) {
    return (
      <>
        <AnimatedBackground />
        <main className="app-shell">
          <div className="screen screen--center">
            <ErrorMessage
              title="Falta configurar o Supabase"
              message="Crie o arquivo .env.development com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja o .env.development.example) e reinicie o npm run dev."
            />
          </div>
        </main>
      </>
    )
  }

  const showRankingButton = screen === 'home' || screen === 'result'
  const showHelpButton = screen === 'home' || screen === 'result'

  return (
    <>
      <AnimatedBackground />
      <CustomCursor />
      <div className="app-shell">
        <HUD
          playerName={screen !== 'home' ? participant?.name : null}
          showRanking={showRankingButton}
          onRanking={openRanking}
          showHelp={showHelpButton}
          onHelp={openRules}
        />
        <main className="screen">
          <AnimatePresence mode="wait">
            <motion.div key={screen} className="screen-inner" {...pageTransition}>
              {screen === 'home' && (
                <HomePage
                  onStart={startQuiz}
                  onFinished={showFinishedParticipant}
                  onRanking={openRanking}
                  onRules={openRules}
                />
              )}
              {screen === 'rules' && <RulesPage mode="info" onBack={closeRules} />}
              {screen === 'rules-pregame' && participant && (
                <RulesPage mode="pregame" onStart={() => setScreen('quiz')} />
              )}
              {screen === 'quiz' && participant && (
                <QuizPage participant={participant} onFinish={showResult} />
              )}
              {screen === 'result' && result && (
                <ResultPage result={result} onRanking={openRanking} onNewPlayer={newPlayer} />
              )}
              {screen === 'ranking' && (
                <RankingPage currentId={participant?.id} onBack={closeRanking} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  )
}