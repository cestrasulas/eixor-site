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
  const [onLight, setOnLight] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      // hero tem ~100vh de altura — após isso entramos nas seções brancas
      const heroHeight = window.innerHeight
      setScrolled(y > 20)
      setOnLight(y > heroHeight * 0.85)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}${onLight ? ' light' : ''}`}>
      <a href="#inicio" className="nav-logo">
        <img
          src={onLight ? '/logo-eixor-clara.png' : '/logo-eixor-escura.png'}
          alt="EIXOR"
          className="nav-logo-img"
        />
      </a>
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

function Hero() {
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

// ── Empresa ──────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    num: '01',
    title: 'IA que trabalha, não que impressiona',
    desc: 'Cada funcionalidade inteligente nasceu de um problema real. Validações documentais automatizadas, relatórios jurídicos em português, antecipação de demandas em serviços. IA com lógica de negócio — não com marketing.',
  },
  {
    num: '02',
    title: 'Especialização profunda por vertical',
    desc: 'Não cobrimos tudo — mergulhamos fundo onde atuamos. Antes de escrever código, mapeamos as operações do profissional, entendemos os pontos de atrito e construímos lógica específica para aquele mercado.',
  },
  {
    num: '03',
    title: 'Plataformas que crescem com a profissão',
    desc: 'Cada vertical é um ecossistema em expansão. Novos módulos, novas automações, novas integrações — acompanhando a evolução das necessidades do profissional, sem trocar de sistema.',
  },
]

function Empresa() {
  return (
    <div className="empresa-wrap" id="empresa">
      <div className="container">
        <FadeIn><div className="eyebrow">Empresa</div></FadeIn>
        <FadeIn delay={1}>
          <h2 className="sec-title">
            Construída para <span>resolver problemas reais.</span>
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

const JURIDICA_ROADMAP = [
  {
    name: 'EIXOR Incorp',
    status: 'dev' as const,
    statusLabel: 'Em desenvolvimento',
    desc: 'Software completo para incorporações imobiliárias — do protocolo ao registro, com validação documental assistida por IA.',
    features: [
      'Validação documental automatizada com IA',
      'Readiness registral e controle de exigências',
      'Gestão completa do processo de incorporação',
      'Painel de acompanhamento em tempo real',
    ],
  },
  {
    name: 'EIXOR Petition',
    status: 'soon' as const,
    statusLabel: 'Em breve',
    desc: 'Peticionamento inteligente — geração, revisão e protocolo de peças com auxílio de inteligência artificial.',
    features: [
      'Geração de petições assistida por IA',
      'Templates por área do direito e instância',
      'Revisão automática de fundamentos e consistência',
      'Protocolo integrado nos principais sistemas',
    ],
  },
  {
    name: 'EIXOR Processo',
    status: 'soon' as const,
    statusLabel: 'Em breve',
    desc: 'Controle processual simplificado — relatórios em português, prazos, audiências e produtividade para advogados.',
    features: [
      'Andamentos traduzidos do juridiquês para o português',
      'Controle de prazos, audiências e reuniões',
      'Painel de tarefas e produtividade para advogados',
      'Relatórios automáticos e acessíveis para clientes',
    ],
  },
]

function Produtos() {
  return (
    <div className="produtos-wrap" id="produtos">
      <div className="container">
        <FadeIn><div className="eyebrow">Verticais</div></FadeIn>
        <FadeIn delay={1}>
          <h2 className="sec-title">Duas verticais. <span>Um padrão de produto.</span></h2>
        </FadeIn>
        <FadeIn delay={2}>
          <p className="produtos-intro">
            A EIXOR não cobre tudo — mergulha fundo onde atua. Cada vertical é construída
            com lógica operacional específica e inteligência artificial embarcada, substituindo
            processos manuais por automação que entende a rotina do profissional.
          </p>
        </FadeIn>

        {/* Vertical de Serviços */}
        <div className="vertical-block">
          <FadeIn>
            <div className="vertical-header">
              <div className="vertical-label-wrap">
                <span className="vertical-num">01</span>
                <span className="vertical-name">Vertical de Serviços</span>
              </div>
              <p className="vertical-sub">
                Plataformas de gestão para negócios de serviço e saúde — barbearias, salões,
                clínicas e consultórios. Agendamento, caixa, CRM e automação com IA, cada
                sistema pensado para quem vive aquela rotina.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={1}>
            <div className="card-gestao">
              <div className="card-title-row">
                <div>
                  <h3 className="card-name">EIXOR <span>Gestão</span></h3>
                  <p className="card-sub">Sistemas verticais para negócios de serviço e saúde</p>
                </div>
                <div className="badge-live">
                  <span className="live-dot" />
                  Em operação
                </div>
              </div>
              <p className="card-desc">
                Plataformas desenvolvidas para segmentos específicos — agendamento online,
                controle de caixa, CRM e relatórios inteligentes. IA aplicada para antecipar
                demandas, automatizar lembretes e gerar insights sobre o negócio.
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
        </div>

        {/* Vertical Jurídica */}
        <div className="vertical-block">
          <FadeIn>
            <div className="vertical-header">
              <div className="vertical-label-wrap">
                <span className="vertical-num">02</span>
                <span className="vertical-name">Vertical Jurídica</span>
              </div>
              <p className="vertical-sub">
                Sistemas para o universo do direito — de incorporações imobiliárias ao
                controle processual completo. IA que lê o processo, traduz o juridiquês e
                organiza a agenda do advogado.
              </p>
            </div>
          </FadeIn>
          <div className="juridica-grid">
            {JURIDICA_ROADMAP.map((product, i) => (
              <FadeIn key={product.name} delay={i as 0 | 1 | 2}>
                <div className={`juridica-card juridica-card--${product.status}`}>
                  <span className={`juridica-badge juridica-badge--${product.status}`}>
                    <span className="juridica-dot" />
                    {product.statusLabel}
                  </span>
                  <h3 className="juridica-card-name">{product.name}</h3>
                  <p className="juridica-card-desc">{product.desc}</p>
                  <ul className="juridica-features">
                    {product.features.map(f => (
                      <li key={f} className="juridica-feature">{f}</li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn>
            <div className="juridica-foot">
              Interesse antecipado na vertical jurídica?{' '}
              <a href="mailto:contato@eixor.com.br">contato@eixor.com.br</a>
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
                    <option value="petition">EIXOR Petition</option>
                    <option value="processo">EIXOR Processo</option>
                    <option value="juridica">Vertical Jurídica (geral)</option>
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
          <img src="/logo-eixor-escura.png" alt="EIXOR" className="footer-logo-img" />
          <p>
            Empresa de tecnologia que desenvolve plataformas com inteligência
            artificial para profissões — da gestão de serviços ao universo jurídico.
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
          <p className="footer-col-title">Vertical de Serviços</p>
          <ul>
            <li><a href="https://barber.eixor.com.br" target="_blank" rel="noopener noreferrer">EIXOR Barber</a></li>
            <li><a href="#produtos">EIXOR Saloon</a></li>
            <li><a href="#produtos">EIXOR Needle</a></li>
            <li><a href="#produtos">EIXOR Nails</a></li>
            <li><a href="#produtos">EIXOR Psico</a></li>
            <li><a href="#produtos">EIXOR Med</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <p className="footer-col-title">Vertical Jurídica</p>
          <ul>
            <li><a href="#produtos">EIXOR Incorp</a></li>
            <li><a href="#produtos">EIXOR Petition</a></li>
            <li><a href="#produtos">EIXOR Processo</a></li>
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
