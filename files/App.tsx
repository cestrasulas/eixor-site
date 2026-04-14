import { useState, useEffect, useRef, type FormEvent } from 'react'
import './App.css'

// ── useInView hook ──────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function FadeIn({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={`fade-in${visible ? ' visible' : ''}${delay === 1 ? ' d1' : delay === 2 ? ' d2' : delay === 3 ? ' d3' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// ── Counter ─────────────────────────────────────────────────────────────────

function Counter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0)
  const { ref, visible } = useInView(0.5)
  const started = useRef(false)
  useEffect(() => {
    if (!visible || started.current) return
    started.current = true
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, target, duration])
  return <span ref={ref}>{val}</span>
}

// ── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <a href="#inicio" className="nav-logo">EI<span>X</span>OR</a>
      <ul className="nav-links">
        <li><a href="#empresa">Empresa</a></li>
        <li><a href="#produtos">Produtos</a></li>
        <li><a href="#contato">Contato</a></li>
      </ul>
      <a href="#contato" className="nav-cta">Falar com a EIXOR</a>
    </nav>
  )
}

// ── Ticker ───────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  'EIXOR Barber', 'EIXOR Saloon', 'EIXOR Needle', 'EIXOR Nails',
  'EIXOR Psico', 'EIXOR Med', 'Incorporações imobiliárias',
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

function Hero() {
  return (
    <div className="hero-wrap" id="inicio">
      <div className="hero-blur1" />
      <div className="hero-blur2" />
      <div className="hero-grid" />
      <div className="hero-inner">
        <div className="hero-pill fade-in visible">
          <span className="pill-dot" />
          Ecossistema de produtos digitais
        </div>
        <h1 className="hero-title fade-in visible d1">
          Tecnologia<br />com lógica<br />de <em>negócio.</em>
        </h1>
        <p className="hero-sub fade-in visible d2">
          A EIXOR desenvolve sistemas digitais com profundidade operacional —
          cada produto construído para um segmento específico, com autonomia e método.
        </p>
        <div className="hero-actions fade-in visible d3">
          <a href="#produtos" className="btn-blue">Conhecer os produtos</a>
          <a href="#empresa" className="btn-outline">Sobre a empresa</a>
        </div>
        <div className="hero-stats fade-in visible d3">
          <div className="stat">
            <div className="stat-val"><Counter target={6} /><em>+</em></div>
            <div className="stat-label">Segmentos em desenvolvimento</div>
          </div>
          <div className="stat">
            <div className="stat-val"><Counter target={1} duration={700} /></div>
            <div className="stat-label">Sistema em operação</div>
          </div>
          <div className="stat">
            <div className="stat-val"><Counter target={7} duration={1400} /></div>
            <div className="stat-label">Produtos no ecossistema</div>
          </div>
        </div>
      </div>
      <Ticker />
    </div>
  )
}

// ── Empresa ──────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    num: '01',
    title: 'Especialização por segmento',
    desc: 'Nada genérico. Cada produto é construído com lógica de negócio específica para o mercado que serve — sem funcionalidades desnecessárias, sem curva de aprendizado absurda.',
  },
  {
    num: '02',
    title: 'Independência operacional',
    desc: 'Cada sistema é autônomo — base de dados própria, fluxos próprios, regras de negócio próprias. Um ecossistema coeso que não cria dependência entre produtos.',
  },
  {
    num: '03',
    title: 'Expansão com método',
    desc: 'Antes de lançar, mapeamos o segmento, entendemos as operações e validamos a lógica. Qualidade não é negociável.',
  },
]

function Empresa() {
  return (
    <div className="empresa-wrap" id="empresa">
      <div className="container">
        <FadeIn><div className="eyebrow">Empresa</div></FadeIn>
        <FadeIn delay={1}>
          <h2 className="sec-title">
            Construída para fazer<br />produto. <span>Não projeto.</span>
          </h2>
        </FadeIn>
        <div className="pillars">
          {PILLARS.map((p, i) => (
            <FadeIn key={p.num} delay={i as 0 | 1 | 2}>
              <div className="pillar">
                <p className="pillar-num">{p.num}</p>
                <h3 className="pillar-title">{p.title}</h3>
                <p className="pillar-desc">{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Produtos ─────────────────────────────────────────────────────────────────

const GESTAO_PRODUCTS = [
  { name: 'Barber', live: true },
  { name: 'Saloon', live: false },
  { name: 'Needle', live: false },
  { name: 'Nails', live: false },
  { name: 'Psico', live: false },
  { name: 'Med', live: false },
]

const INCORP_FEATURES = [
  'Validação documental automatizada',
  'Readiness registral',
  'Controle de exigências',
  'Gestão do processo de incorporação',
]

function Produtos() {
  return (
    <div className="produtos-wrap" id="produtos">
      <div className="container">
        <FadeIn><div className="eyebrow">Produtos</div></FadeIn>
        <FadeIn delay={1}>
          <h2 className="sec-title">Um ecossistema <span>em construção.</span></h2>
        </FadeIn>
        <div className="produtos-grid">

          {/* Card Gestão */}
          <FadeIn>
            <div className="card-gestao">
              <div className="card-title-row">
                <div>
                  <h3 className="card-name">EIXOR <span>Gestão</span></h3>
                  <p className="card-sub">Sistemas verticais para negócios de serviço</p>
                </div>
                <div className="badge-live">
                  <span className="live-dot" />
                  Em operação
                </div>
              </div>
              <p className="card-desc">
                Plataformas de gestão desenvolvidas para segmentos específicos —
                agendamento online, controle de caixa, relacionamento com clientes
                e autonomia operacional completa, para cada tipo de negócio.
              </p>
              <div className="prod-row">
                {GESTAO_PRODUCTS.map(p => (
                  <span key={p.name} className={p.live ? 'prod-active' : 'prod-tag'}>
                    {p.live ? '● ' : ''}{p.name}
                  </span>
                ))}
              </div>
              <a
                href="https://barber.eixor.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="card-cta"
              >
                Acessar EIXOR Barber →
              </a>
            </div>
          </FadeIn>

          {/* Card Incorp */}
          <FadeIn delay={1}>
            <div className="card-incorp">
              <div className="incorp-badge">
                <span className="incorp-dot" />
                Em desenvolvimento
              </div>
              <h3 className="incorp-name">EIXOR <span>Incorp</span></h3>
              <p className="incorp-desc">
                SaaS de automação para incorporações imobiliárias —
                do controle documental ao registro.
              </p>
              <div className="incorp-features">
                {INCORP_FEATURES.map(f => (
                  <div key={f} className="incorp-feature">{f}</div>
                ))}
              </div>
              <div className="incorp-foot">
                Interesse antecipado?{' '}
                <a href="mailto:contato@eixor.com.br">contato@eixor.com.br</a>
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </div>
  )
}

// ── Contato ──────────────────────────────────────────────────────────────────

function Contato() {
  const [submitted, setSubmitted] = useState(false)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }
  return (
    <div className="contato-wrap" id="contato">
      <div className="container">
        <div className="contato-grid">
          <div>
            <div className="eyebrow">Contato</div>
            <h2 className="contato-title">Fale com<br />a EIXOR.</h2>
            <p className="contato-sub">
              Dúvidas sobre produtos, parcerias ou interesse antecipado em novos sistemas.
            </p>
            <div className="contato-email">contato@eixor.com.br</div>
            <div className="contato-loc">Brasil — atendimento em português</div>
          </div>
          <div>
            {submitted ? (
              <div className="form-success">
                <div className="form-success-icon">✓</div>
                <h3>Mensagem recebida.</h3>
                <p>Em breve nossa equipe entrará em contato.</p>
              </div>
            ) : (
              <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="nome">Nome</label>
                    <input id="nome" type="text" placeholder="Seu nome completo" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">E-mail</label>
                    <input id="email" type="email" placeholder="seu@email.com" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="empresa-field">Empresa / Estabelecimento</label>
                  <input id="empresa-field" type="text" placeholder="Nome do seu negócio (opcional)" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="assunto">Assunto</label>
                  <select id="assunto" required>
                    <option value="">Selecione...</option>
                    <option value="barber">EIXOR Barber</option>
                    <option value="incorp">EIXOR Incorp</option>
                    <option value="outros">Outros sistemas em desenvolvimento</option>
                    <option value="parceria">Parceria comercial</option>
                    <option value="sugestao">Sugerir novo segmento</option>
                    <option value="outro">Outro assunto</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="mensagem">Mensagem</label>
                  <textarea id="mensagem" placeholder="Descreva o que você precisa..." required />
                </div>
                <button type="submit" className="btn-form">Enviar mensagem</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-brand-logo">EI<span>X</span>OR</span>
          <p>
            Empresa de tecnologia especializada no desenvolvimento de sistemas
            digitais independentes para segmentos específicos.
          </p>
        </div>
        <div className="footer-col">
          <p className="footer-col-title">Empresa</p>
          <ul>
            <li><a href="#empresa">Sobre a EIXOR</a></li>
            <li><a href="#empresa">Como pensamos produto</a></li>
            <li><a href="#produtos">Produtos</a></li>
            <li><a href="#contato">Contato</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <p className="footer-col-title">Produtos</p>
          <ul>
            <li><a href="https://barber.eixor.com.br" target="_blank" rel="noopener noreferrer">EIXOR Barber</a></li>
            <li><a href="#produtos">EIXOR Saloon</a></li>
            <li><a href="#produtos">EIXOR Needle</a></li>
            <li><a href="#produtos">EIXOR Nails</a></li>
            <li><a href="#produtos">EIXOR Psico</a></li>
            <li><a href="#produtos">EIXOR Med</a></li>
            <li><a href="#produtos">EIXOR Incorp</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2026 EIXOR. Todos os direitos reservados.</span>
        <span className="footer-copy">contato@eixor.com.br</span>
      </div>
    </footer>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Empresa />
      <Produtos />
      <Contato />
      <Footer />
    </>
  )
}
