import { Counter } from './Motion'

// ── Ticker ───────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  'EIXOR Barber', 'EIXOR Saloon', 'EIXOR Needle', 'EIXOR Nails',
  'EIXOR Psico', 'EIXOR Med', 'EIXOR Incorp', 'EIXOR Petition', 'EIXOR Processo',
]

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i}>
            <span className="ticker-item">{item}</span>
            <span className="ticker-sep"> · </span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {
  return (
    <div className="hero-wrap" id="inicio">
      <div className="hero-blur1" />
      <div className="hero-blur2" />
      <div className="hero-grid" />
      <div className="hero-inner">
        <div className="hero-pill fade-in visible">
          <span className="pill-dot" />
          IA aplicada a profissões
        </div>
        <h1 className="hero-title fade-in visible d1">
          Inteligência<br />que entende<br />a sua <em>profissão.</em>
        </h1>
        <p className="hero-sub fade-in visible d2">
          A EIXOR desenvolve plataformas com inteligência artificial embarcada —
          cada vertical construída com profundidade operacional, para que a tecnologia
          resolva os problemas reais de quem trabalha com seriedade.
        </p>
        <div className="hero-actions fade-in visible d3">
          <a href="#produtos" className="btn-blue">Conhecer os produtos</a>
          <a href="#empresa" className="btn-outline">Sobre a empresa</a>
        </div>
        <div className="hero-stats fade-in visible d3">
          <div className="stat">
            <div className="stat-val"><Counter target={2} duration={800} /></div>
            <div className="stat-label">Verticais de atuação</div>
          </div>
          <div className="stat">
            <div className="stat-val"><Counter target={9} /><em>+</em></div>
            <div className="stat-label">Produtos no ecossistema</div>
          </div>
          <div className="stat">
            <div className="stat-val"><Counter target={1} duration={700} /></div>
            <div className="stat-label">Sistema em produção</div>
          </div>
        </div>
      </div>
      <Ticker />
    </div>
  )
}
