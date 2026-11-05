// Ilustrações educativas de métodos contraceptivos, em estilo "sticker" (contorno + cores da paleta).
// São objetos estilizados e não explícitos. Cada ícone cabe em um quadro 100x100.
// Props: name (qual ícone), c (cor principal), c2 (cor secundária).

const INK = 'var(--ink)'
const PAPER = 'var(--paper)'

const line = {
  stroke: INK,
  strokeWidth: 3.5,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
}
const thin = { ...line, strokeWidth: 2.5 }
const shine = { stroke: PAPER, strokeWidth: 3.5, strokeLinecap: 'round', fill: 'none' }

// Borda serrilhada de embalagem (sachê) em volta de um quadrado
function serrated(x, y, w, teeth, d) {
  const step = w / teeth
  const pts = []
  for (let i = 0; i < teeth; i++) pts.push(`${x + i * step},${y}`, `${x + i * step + step / 2},${y + d}`)
  for (let i = 0; i < teeth; i++) pts.push(`${x + w},${y + i * step}`, `${x + w - d},${y + i * step + step / 2}`)
  for (let i = 0; i < teeth; i++) pts.push(`${x + w - i * step},${y + w}`, `${x + w - i * step - step / 2},${y + w - d}`)
  for (let i = 0; i < teeth; i++) pts.push(`${x},${y + w - i * step}`, `${x + d},${y + w - i * step - step / 2}`)
  return pts.join(' ')
}

const SACHET = serrated(10, 10, 80, 8, 5)

// Preservativo masculino (embalagem com o anel enrolado)
function Condom({ c, c2 }) {
  return (
    <>
      <polygon points={SACHET} style={{ ...line, fill: c }} />
      <circle cx="50" cy="50" r="25" style={{ ...line, fill: c2 }} />
      <circle cx="50" cy="50" r="15" style={{ ...thin, fill: c }} />
      <path className="decor-shine" d="M34 40 A19 19 0 0 1 44 31" style={shine} />
    </>
  )
}

// Preservativo feminino (bolsa flexível com anel aberto em uma ponta e anel menor na outra)
function FemaleCondom({ c, c2 }) {
  return (
    <>
      <path d="M18 28 C18 62 32 88 50 88 C68 88 82 62 82 28 Z" style={{ ...line, fill: c }} />
      <ellipse cx="50" cy="82" rx="14" ry="6" style={{ ...thin, fill: c2 }} />
      <ellipse cx="50" cy="26" rx="36" ry="13" style={{ ...line, fill: c2 }} />
      <ellipse cx="50" cy="26" rx="25" ry="7" style={{ ...thin, fill: PAPER, fillOpacity: 0.65 }} />
      <path className="decor-shine" d="M28 46 C30 60 34 70 40 78" style={shine} />
    </>
  )
}

// Cartela de pílulas anticoncepcionais
function Pill({ c, c2 }) {
  const dots = []
  ;[40, 60].forEach((cy) => [24, 42, 60, 78].forEach((cx) => dots.push([cx, cy])))
  return (
    <>
      <rect x="6" y="24" width="88" height="52" rx="12" style={{ ...line, fill: c }} />
      {dots.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="7.5" style={{ ...thin, fill: c2 }} />
          <path d={`M${cx - 3} ${cy - 2} A4 4 0 0 1 ${cx} ${cy - 4.5}`} style={{ ...shine, strokeWidth: 2 }} />
        </g>
      ))}
    </>
  )
}

// DIU (formato de T)
function Iud({ c, c2 }) {
  const arms = 'M12 32 C22 14 40 18 50 26 C60 18 78 14 88 32'
  return (
    <>
      <path d="M50 74 L50 94" style={{ ...thin, fill: 'none' }} />
      <path d={arms} style={{ ...line, strokeWidth: 13, fill: 'none' }} />
      <path d={arms} style={{ stroke: c, strokeWidth: 6.5, strokeLinecap: 'round', fill: 'none' }} />
      <circle cx="12" cy="32" r="5" style={{ ...thin, fill: c2 }} />
      <circle cx="88" cy="32" r="5" style={{ ...thin, fill: c2 }} />
      <rect x="43" y="20" width="14" height="56" rx="7" style={{ ...line, fill: c }} />
      <path d="M43 36 L57 36 M43 46 L57 46 M43 56 L57 56" style={{ ...thin, strokeWidth: 2 }} />
      <path className="decor-shine" d="M47 26 L47 66" style={{ ...shine, strokeWidth: 2.5 }} />
    </>
  )
}

// Implante contraceptivo (pequeno bastão flexível)
function Implant({ c, c2 }) {
  return (
    <>
      <rect x="4" y="40" width="92" height="20" rx="10" style={{ ...line, fill: c }} />
      <rect x="62" y="40" width="34" height="20" rx="10" style={{ ...thin, fill: c2 }} />
      <path className="decor-shine" d="M16 47 L52 47" style={shine} />
    </>
  )
}

// Injeção anticoncepcional (seringa)
function Syringe({ c, c2 }) {
  return (
    <>
      <path d="M2 50 L22 50" style={{ ...line, strokeWidth: 3 }} />
      <rect x="20" y="43" width="10" height="14" rx="3" style={{ ...thin, fill: PAPER }} />
      <rect x="29" y="36" width="48" height="28" rx="6" style={{ ...line, fill: c2 }} />
      <rect x="33" y="40" width="26" height="20" rx="4" style={{ stroke: 'none', fill: c }} />
      <path d="M44 36 L44 43 M54 36 L54 43 M64 36 L64 43" style={{ ...thin, strokeWidth: 2 }} />
      <rect x="76" y="45" width="14" height="10" style={{ ...thin, fill: PAPER }} />
      <rect x="72" y="30" width="7" height="40" rx="3.5" style={{ ...thin, fill: c }} />
      <rect x="88" y="34" width="8" height="32" rx="4" style={{ ...thin, fill: c }} />
      <path className="decor-shine" d="M34 44 L34 52" style={{ ...shine, strokeWidth: 3 }} />
    </>
  )
}

// Anel vaginal
function Ring({ c }) {
  return (
    <>
      <path
        d="M8 50 a42 42 0 1 0 84 0 a42 42 0 1 0 -84 0 Z M24 50 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0 Z"
        fillRule="evenodd"
        style={{ ...line, fill: c }}
      />
      <path className="decor-shine" d="M18 36 A34 34 0 0 1 36 18" style={shine} />
    </>
  )
}

// Adesivo contraceptivo (com cantinho descolando)
function Patch({ c, c2 }) {
  return (
    <>
      <rect x="12" y="12" width="76" height="76" rx="20" style={{ ...line, fill: c }} />
      <rect x="28" y="28" width="44" height="44" rx="12" style={{ ...thin, fill: c2 }} />
      <circle cx="42" cy="44" r="3" style={{ fill: INK, opacity: 0.35 }} />
      <circle cx="58" cy="44" r="3" style={{ fill: INK, opacity: 0.35 }} />
      <circle cx="42" cy="58" r="3" style={{ fill: INK, opacity: 0.35 }} />
      <circle cx="58" cy="58" r="3" style={{ fill: INK, opacity: 0.35 }} />
      <path d="M56 88 L88 56 L88 70 Q88 88 70 88 Z" style={{ ...thin, fill: PAPER }} />
      <path className="decor-shine" d="M22 30 A14 14 0 0 1 30 22" style={shine} />
    </>
  )
}

// Detalhes de apoio: coração e cruz de saúde
function Heart({ c }) {
  return (
    <path
      d="M50 88 C12 60 4 36 22 20 C34 10 46 17 50 28 C54 17 66 10 78 20 C96 36 88 60 50 88 Z"
      style={{ ...line, fill: c }}
    />
  )
}

function Plus({ c }) {
  return (
    <path
      d="M38 12 H62 V38 H88 V62 H62 V88 H38 V62 H12 V38 H38 Z"
      style={{ ...line, strokeWidth: 4, fill: c }}
    />
  )
}

const ICONS = {
  condom: Condom,
  femaleCondom: FemaleCondom,
  pill: Pill,
  iud: Iud,
  implant: Implant,
  syringe: Syringe,
  ring: Ring,
  patch: Patch,
  heart: Heart,
  plus: Plus,
}

export default function DecorIcon({ name, c, c2 }) {
  const Icon = ICONS[name]
  if (!Icon) return null
  return (
    <svg className="decor-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <Icon c={c} c2={c2 ?? PAPER} />
    </svg>
  )
}