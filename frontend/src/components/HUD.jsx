import { motion } from 'motion/react'
import { Cloud, Gamepad2, Trophy } from 'lucide-react'
import { GAME_CONFIG } from '../config/gameConfig'
import { useSound } from '../hooks/useSound'
import SoundToggle from './SoundToggle'

// Barra superior fixa em todas as telas: marca, jogador, som e acesso ao ranking.
// O botão de ranking some durante a partida para ninguém perder o tempo da pergunta.
export default function HUD({ playerName, showRanking, onRanking }) {
  const { play } = useSound()
  return (
    <header className="hud">
      <div className="hud-brand">
        <span className="hud-logo">
          <Cloud size={22} strokeWidth={3} />
        </span>
        <span className="hud-brand-name">{GAME_CONFIG.name}</span>
      </div>

      <div className="hud-actions">
        {playerName && (
          <span className="chip chip--player" title={playerName}>
            <Gamepad2 size={18} strokeWidth={2.8} />
            <span className="chip-text">{playerName}</span>
          </span>
        )}
        <SoundToggle />
        {showRanking && (
          <motion.button
            type="button"
            className="icon-btn icon-btn--gold"
            onClick={() => {
              play('click')
              onRanking()
            }}
            aria-label="Abrir ranking"
            title="Ranking"
            whileHover={{ scale: 1.1, rotate: 6 }}
            whileTap={{ scale: 0.9, y: 3 }}
          >
            <Trophy size={22} strokeWidth={2.8} />
          </motion.button>
        )}
      </div>
    </header>
  )
}
