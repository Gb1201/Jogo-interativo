import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Gamepad2, Play, RotateCcw, Sparkles, Timer, Trophy, User, Zap } from 'lucide-react'
import { GAME_CONFIG } from '../config/gameConfig'
import { useSound } from '../hooks/useSound'
import { createParticipant, getParticipant } from '../services/participantService'
import { clearSavedPlayer, getSavedPlayer, savePlayer } from '../utils/storage'
import { normalizeName } from '../utils/format'
import { sparkle } from '../utils/confetti'
import GameButton from '../components/GameButton'

const TITLE = 'NIMBUS'

function friendlyError(error) {
  if (error?.code === 'DUPLICATE_NAME') {
    return 'Opa! Já tem alguém jogando com esse nome. Que tal adicionar um sobrenome ou apelido?'
  }
  return 'Não consegui falar com o servidor agora. Confira sua internet e tente de novo!'
}

export default function HomePage({ onStart, onFinished, onRanking }) {
  const { play } = useSound()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(getSavedPlayer)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (loading) return
    const clean = normalizeName(name)

    if (!clean) {
      setError('Ei! Como você quer aparecer no ranking? Digite seu nome para jogar.')
      return
    }
    if (clean.length < GAME_CONFIG.nameMinLength) {
      setError(`Seu nome precisa ter pelo menos ${GAME_CONFIG.nameMinLength} letras.`)
      return
    }

    setError('')
    setLoading(true)
    try {
      const participant = await createParticipant(clean)
      savePlayer(participant)
      play('achievement')
      onStart(participant)
    } catch (err) {
      setError(friendlyError(err))
      setLoading(false)
    }
  }

  const handleResume = async () => {
    if (loading || !saved) return
    setError('')
    setLoading(true)
    try {
      const participant = await getParticipant(saved.id)
      if (!participant) {
        clearSavedPlayer()
        setSaved(null)
        setError('Não encontrei seu jogo anterior. Comece um novo com seu nome!')
        setLoading(false)
        return
      }
      if (participant.status === 'finished') onFinished(participant)
      else onStart(participant)
    } catch (err) {
      setError(friendlyError(err))
      setLoading(false)
    }
  }

  const handleForget = () => {
    clearSavedPlayer()
    setSaved(null)
    setError('')
  }

  const handleEmblem = () => {
    play('achievement')
    sparkle({ x: 0.5, y: 0.28 })
  }

  return (
    <div className="home">
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.button
          type="button"
          className="emblem"
          onClick={handleEmblem}
          aria-label="Fazer brilhar"
          initial={{ scale: 0, rotate: -120 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 12 }}
          whileHover={{ scale: 1.1, rotate: 6 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="emblem-orbit emblem-orbit--a">
            <Sparkles size={22} strokeWidth={3} />
          </span>
          <span className="emblem-orbit emblem-orbit--b">
            <Sparkles size={16} strokeWidth={3} />
          </span>
          <Gamepad2 size={68} strokeWidth={2.4} />
        </motion.button>
      </motion.div>

      <h1 className="home-title" aria-label={`${GAME_CONFIG.name}`}>
        <span className="title-letters" aria-hidden="true">
          {TITLE.split('').map((letter, i) => (
            <motion.span
              key={i}
              className="title-letter"
              initial={{ y: -90, opacity: 0, rotate: -25 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.2 + i * 0.07 }}
              whileHover={{ y: -12, rotate: i % 2 ? 6 : -6, scale: 1.12 }}
            >
              {letter}
            </motion.span>
          ))}
        </span>
        <motion.span
          className="title-badge"
          aria-hidden="true"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 0.85 }}
        >
          QUIZ
        </motion.span>
      </h1>

      <motion.p
        className="home-tagline"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {GAME_CONFIG.tagline}
      </motion.p>

      <motion.form
        className="name-card"
        onSubmit={handleSubmit}
        noValidate
        initial={{ opacity: 0, y: 50, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.9 }}
      >
        <label className="name-label" htmlFor="player-name">
          Qual é o seu nome de jogador?
        </label>
        <div className="name-input-wrap">
          <User size={22} strokeWidth={2.8} />
          <input
            id="player-name"
            className="name-input"
            type="text"
            value={name}
            maxLength={GAME_CONFIG.nameMaxLength}
            placeholder="Digite seu nome"
            autoComplete="off"
            autoCapitalize="words"
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              className="form-error"
              role="alert"
              initial={{ opacity: 0, height: 0, x: -10 }}
              animate={{ opacity: 1, height: 'auto', x: [0, -8, 8, -5, 5, 0] }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <GameButton type="submit" size="lg" icon={Play} loading={loading && !saved}>
          START
        </GameButton>

        {saved && (
          <div className="resume">
            <p className="resume-text">
              Você já entrou como <strong>{saved.name}</strong>.
            </p>
            <div className="resume-actions">
              <GameButton variant="success" icon={RotateCcw} onClick={handleResume} loading={loading}>
                Continuar
              </GameButton>
              <button type="button" className="link-btn" onClick={handleForget}>
                Não sou eu
              </button>
            </div>
          </div>
        )}
      </motion.form>

      <motion.ul
        className="chips"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <li className="chip chip--lime">
          <Timer size={18} strokeWidth={2.8} /> {GAME_CONFIG.secondsPerQuestion}s por pergunta
        </li>
        <li className="chip chip--lime">
          <Zap size={18} strokeWidth={2.8} /> Bônus de velocidade
        </li>
        <li className="chip chip--lime">
          <Trophy size={18} strokeWidth={2.8} /> Ranking geral
        </li>
      </motion.ul>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35 }}>
        <GameButton variant="gold" icon={Trophy} onClick={onRanking}>
          Ver ranking
        </GameButton>
      </motion.div>
    </div>
  )
}
