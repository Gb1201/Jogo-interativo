import { motion } from 'motion/react'
import { ArrowLeft, Play } from 'lucide-react'
import GameButton from '../components/GameButton'
import HowToPlay from '../components/HowToPlay'

// Tela "Como jogar".
// mode "pregame": aparece antes da primeira partida e tem o botão de começar.
// mode "info": consulta a partir da página inicial, só volta.
export default function RulesPage({ mode = 'info', onStart, onBack }) {
  const pregame = mode === 'pregame'
  return (
    <div className="rules">
      <motion.div
        className="rules-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <h1 className="rules-title">Como jogar</h1>
        <p className="rules-subtitle">
          {pregame
            ? 'Leia as regras antes de começar. O tempo só corre depois que você iniciar!'
            : 'Tudo o que você precisa saber para fazer muitos pontos.'}
        </p>
        <HowToPlay />
        <div className="rules-actions">
          {pregame ? (
            <GameButton size="lg" variant="success" icon={Play} onClick={onStart}>
              Entendi, vamos!
            </GameButton>
          ) : (
            <GameButton variant="gold" icon={ArrowLeft} onClick={onBack}>
              Voltar
            </GameButton>
          )}
        </div>
      </motion.div>
    </div>
  )
}
