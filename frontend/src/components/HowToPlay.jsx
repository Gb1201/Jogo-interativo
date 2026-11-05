import { Clock, Flame, Lightbulb, Star, Target, Zap } from 'lucide-react'
import { GAME_CONFIG } from '../config/gameConfig'
import { MISSIONS } from '../utils/scoring'

// Cada regra é gerada a partir do gameConfig, então o texto nunca fica diferente do jogo real.
export default function HowToPlay() {
  const c = GAME_CONFIG
  const steps = [
    {
      icon: Clock,
      color: 'lime',
      title: 'Responda a tempo',
      text: `Cada pergunta tem ${c.secondsPerQuestion} segundos e 1 resposta correta. Se o tempo acabar, a pergunta vale 0 ponto.`,
    },
    {
      icon: Star,
      color: 'gum',
      title: 'Acertou? Ganhou pontos',
      text: `Cada acerto vale ${c.pointsPerCorrect} pontos. Errar não tira pontos, só não soma.`,
    },
    {
      icon: Zap,
      color: 'sun',
      title: 'Seja rápido',
      text: `Quanto mais cedo você acertar, maior o bônus de velocidade (até +${c.maxSpeedBonus}).`,
    },
    {
      icon: Flame,
      color: 'gum',
      title: 'Faça combos',
      text: `Acertos seguidos dão +${c.comboBonusStep} pontos a mais a cada acerto (até +${c.comboBonusMax}). Errar zera o combo.`,
    },
    {
      icon: Star,
      color: 'sun',
      title: 'Rodada Ouro',
      text: `A pergunta do meio e a última valem pontos em dobro (x${c.goldMultiplier}). Capriche nelas!`,
    },
    {
      icon: Lightbulb,
      color: 'lime',
      title: 'Dica 50/50',
      text: `Você tem ${c.hintsPerGame} dicas por jogo. Cada uma elimina 2 alternativas erradas, mas o acerto vale só metade dos pontos. Use com estratégia!`,
    },
  ]

  return (
    <div className="howto">
      <ol className="howto-steps">
        {steps.map(({ icon: Icon, color, title, text }, i) => (
          <li key={title} className="howto-step">
            <span className={`howto-icon howto-icon--${color}`}>
              <Icon size={24} strokeWidth={2.8} />
            </span>
            <div>
              <strong className="howto-step-title">
                {i + 1}. {title}
              </strong>
              <p className="howto-step-text">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="howto-missions">
        <h3 className="howto-missions-title">
          <Target size={22} strokeWidth={3} /> Missões do jogo
        </h3>
        <p className="howto-missions-intro">
          São 3 desafios opcionais. Cumpra todos para ganhar o selo de campeão no final!
        </p>
        <ul className="howto-missions-list">
          {MISSIONS.map((m) => (
            <li key={m.id}>
              <strong>{m.title}:</strong> {m.description}.
            </li>
          ))}
        </ul>
      </section>

      <p className="howto-tip">
        <Lightbulb size={18} strokeWidth={3} /> Depois de cada resposta, você vê a explicação.
        Leia com calma: ela ajuda a acertar as próximas!
      </p>
    </div>
  )
}
