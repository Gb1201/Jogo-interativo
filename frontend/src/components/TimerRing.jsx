// Cronômetro circular. Fica Limeade e vira Tomato Jam pulsando nos últimos 5 segundos.
const RADIUS = 34
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function TimerRing({ remainingMs, durationMs }) {
  const fraction = Math.max(0, Math.min(1, remainingMs / durationMs))
  const seconds = Math.ceil(remainingMs / 1000)
  const danger = seconds <= 5

  return (
    <div
      className={`timer ${danger ? 'timer--danger' : ''}`}
      role="timer"
      aria-label={`${seconds} segundos restantes`}
    >
      <svg viewBox="0 0 80 80" className="timer-svg" aria-hidden="true">
        <circle className="timer-track" cx="40" cy="40" r={RADIUS} />
        <circle
          className="timer-arc"
          cx="40"
          cy="40"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
        />
      </svg>
      <span className="timer-number">{seconds}</span>
    </div>
  )
}
