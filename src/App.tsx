import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

// ── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="nav">
      <a href="#inicio" className="nav-brand">
        <img src="/logo-eixor.jpeg" height="32" alt="EIXOR" />
        <span className="nav-brand-text">EIXOR</span>
      </a>

      <ul className="nav-links">
        <li><a href="#empresa">Empresa</a></li>
        <li><a href="#sistemas">Sistemas</a></li>
        <li><a href="#expansao">Expansão</a></li>
        <li><a href="#contato">Contato</a></li>
      </ul>

      <a href="#contato" className="btn btn-nav">
        Falar com a EIXOR
      </a>
    </nav>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <div className="hero-wrap" id="inicio">
      <div className="container">
        <div className="hero">
          {/* Coluna esquerda */}
          <div>
            <span className="hero-tag">Ecossistema de sistemas digitais independentes</span>
            <h1 className="hero-title">
              Tecnologia especializada<br />
              para <strong>operações reais.</strong>
            </h1>
            <p className="hero-sub">
              A EIXOR desenvolve sistemas de gestão com lógica de negócio — cada produto
              construído para um segmento específico, com profundidade e autonomia operacional.
            </p>
            <div className="hero-actions">
              <a href="#sistemas" className="btn btn-dark">Ver sistemas</a>
              <a href="#empresa" className="btn btn-outline-dark">Sobre a empresa</a>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="hero-card">
            <div className="hero-card-row">
              <div className="hero-card-dot active" />
              <div>
                <p className="hero-card-title">EIXOR — Empresa</p>
                <p className="hero-card-sub">
                  Holding de tecnologia responsável por desenvolver e operar sistemas
                  digitais independentes.
                </p>
                <div className="hero-card-tags">
                  <span className="hero-card-tag active">Tecnologia</span>
                  <span className="hero-card-tag active">Gestão</span>
                  <span className="hero-card-tag active">Múltiplos segmentos</span>
                </div>
              </div>
            </div>

            <div className="hero-card-row">
              <div className="hero-card-dot" />
              <div>
                <p className="hero-card-title">Sistemas independentes</p>
                <p className="hero-card-sub">
                  Cada sistema opera com lógica própria, voltado a um segmento de mercado específico.
                </p>
                <div className="hero-card-tags">
                  <span className="hero-card-tag active">EIXOR Barber</span>
                  <span className="hero-card-tag">EIXOR Saloon</span>
                  <span className="hero-card-tag">EIXOR Needle</span>
                  <span className="hero-card-tag">EIXOR Psico</span>
                  <span className="hero-card-tag">EIXOR Med</span>
                </div>
              </div>
            </div>

            <div className="hero-card-row">
              <div className="hero-card-dot" />
              <div>
                <p className="hero-card-title">Expansão contínua</p>
                <p className="hero-card-sub">
                  Novos segmentos mapeados e sistemas em desenvolvimento constante.
                </p>
                <div className="hero-card-tags">
                  <span className="hero-card-tag">Em curso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Empresa ──────────────────────────────────────────────────────────────────

function Empresa() {
  const pillars = [
    {
      num: '01',
      title: 'Especialização por segmento',
      desc: 'Não fazemos sistemas genéricos. Cada produto é construído com lógica de negócio específica para o mercado que serve — sem funcionalidades desnecessárias, sem curva de aprendizado absurda.',
    },
    {
      num: '02',
      title: 'Independência operacional',
      desc: 'Cada sistema é autônomo: base de dados própria, fluxos próprios, regras de negócio próprias. Um ecossistema coeso de produtos que não dependem uns dos outros para funcionar.',
    },
    {
      num: '03',
      title: 'Expansão planejada',
      desc: 'Crescemos com método. Antes de lançar um novo sistema, mapeamos o segmento, entendemos as operações e validamos a lógica. Qualidade não é negociável.',
    },
  ]

  return (
    <div className="empresa-wrap" id="empresa">
      <div className="container">
        <div className="empresa-header">
          <p className="section-label">Empresa</p>
          <h2 className="section-title">
            Uma empresa construída para desenvolver<br />
            <strong>sistemas com lógica de negócio.</strong>
          </h2>
        </div>
        <div className="pillars-gap">
          {pillars.map((p) => (
            <div key={p.num} className="pillar">
              <p className="pillar-num">{p.num}</p>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Como Pensamos Produto ─────────────────────────────────────────────────────

function ComoPensamos() {
  const items = [
    {
      title: 'Estrutura antes de interface',
      desc: 'Antes de qualquer tela, definimos a lógica: quais entidades existem, como se relacionam, quais regras governam cada operação.',
    },
    {
      title: 'Fluxo como centro do produto',
      desc: 'O sistema deve refletir como a operação realmente acontece — não uma versão idealizada. Adaptamos o software ao negócio, não o contrário.',
    },
    {
      title: 'Evolução com dados reais',
      desc: 'Cada sistema coleta métricas relevantes para o segmento. A próxima versão é sempre informada pelo uso real, não por achismo.',
    },
  ]

  return (
    <div className="thinking-wrap" id="produto">
      <div className="container">
        <p className="section-label">Como pensamos produto</p>
        <h2 className="section-title">
          Produto não é interface.<br /><strong>É estrutura.</strong>
        </h2>
        <div className="thinking-grid">
          {items.map((item) => (
            <div key={item.title} className="thinking-card">
              <h3 className="thinking-title">{item.title}</h3>
              <p className="thinking-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Sistemas ──────────────────────────────────────────────────────────────────

type SysStatus = 'live' | 'dev' | 'expansion'

interface SysItem {
  prefix: string
  product: string
  desc: string
  status: SysStatus
  link?: string
}

const systems: SysItem[] = [
  {
    prefix: 'EIXOR',
    product: ' Barber',
    desc: 'Gestão completa para barbearias: agendamento online, controle de caixa, fila de espera e relacionamento com clientes.',
    status: 'live',
    link: 'https://barber.eixor.com.br',
  },
  {
    prefix: 'EIXOR',
    product: ' Saloon',
    desc: 'Plataforma de gestão para salões de beleza. Agendamentos, fichas de cliente, controle de comissões e fluxo de caixa.',
    status: 'dev',
  },
  {
    prefix: 'EIXOR',
    product: ' Needle',
    desc: 'Sistema para estúdios de tatuagem e piercing. Gestão de sessões, catálogo de arte e agenda de artistas.',
    status: 'dev',
  },
  {
    prefix: 'EIXOR',
    product: ' Nails',
    desc: 'Gestão para nail designers e estúdios de nail art. Agendamento, catálogo de serviços e fidelização de clientes.',
    status: 'dev',
  },
  {
    prefix: 'EIXOR',
    product: ' Psico',
    desc: 'Sistema para psicólogos e clínicas de psicologia. Prontuário digital, agendamento e faturamento.',
    status: 'dev',
  },
  {
    prefix: 'EIXOR',
    product: ' Med',
    desc: 'Plataforma para médicos e clínicas. Prontuário eletrônico, agenda inteligente e gestão de consultório.',
    status: 'dev',
  },
  {
    prefix: 'EIXOR',
    product: ' +',
    desc: 'Novos segmentos sendo mapeados. Cada sistema que entra no ecossistema passa por análise criteriosa antes do desenvolvimento.',
    status: 'expansion',
  },
]

function SysCard({ item }: { item: SysItem }) {
  const cardClass = `system-card${item.status === 'live' ? ' active' : item.status === 'expansion' ? ' dashed' : ''}`

  return (
    <div className={cardClass}>
      {item.status === 'live' && (
        <span className="system-badge badge-live">Em operação</span>
      )}
      {item.status === 'dev' && (
        <span className="system-badge badge-dev">Em desenvolvimento</span>
      )}
      {item.status === 'expansion' && (
        <span className="system-badge badge-expansion">Expansão</span>
      )}

      <h3 className="system-name">
        <span className="eixor">{item.prefix}</span>
        <span className="product">{item.product}</span>
      </h3>

      <p className="system-desc">{item.desc}</p>

      {item.status === 'live' && item.link ? (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="system-link">
          Acessar sistema →
        </a>
      ) : item.status === 'expansion' ? (
        <a href="#contato" className="system-link">Entrar em contato →</a>
      ) : (
        <span className="system-link-disabled">Em desenvolvimento</span>
      )}
    </div>
  )
}

function Sistemas() {
  return (
    <div className="sistemas-wrap" id="sistemas">
      <div className="container">
        <p className="section-label">Sistemas</p>
        <h2 className="section-title">
          Um ecossistema <strong>em construção.</strong>
        </h2>
        <div className="sistemas-grid">
          {systems.map((s) => (
            <SysCard key={s.product} item={s} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Expansão ──────────────────────────────────────────────────────────────────

function Expansao() {
  return (
    <div className="expansao-wrap" id="expansao">
      <div className="container">
        <div className="expansao-inner">
          <div className="expansao-text">
            <p className="section-label">Expansão</p>
            <h2 className="section-title">
              Novos sistemas.<br /><strong>Novos segmentos.</strong>
            </h2>
            <p>
              O ecossistema EIXOR cresce de forma planejada. Antes de qualquer linha de código,
              mapeamos o segmento: entendemos as operações, identificamos as lacunas e validamos
              se existe espaço para um sistema especializado.
            </p>
            <p>
              Não construímos sistemas para ter portfólio. Construímos quando temos convicção de
              que podemos ser referência — e quando a lógica de negócio do segmento justifica
              um produto próprio.
            </p>
            <p>
              Se você opera num segmento que ainda não tem um sistema EIXOR, entre em contato.
              Cada conversa pode ser o início do próximo produto do ecossistema.
            </p>
          </div>

          <div className="expansao-stats">
            <div className="expansao-stat">
              <div className="expansao-stat-num">1</div>
              <div className="expansao-stat-label">Sistema em operação</div>
            </div>
            <div className="expansao-stat">
              <div className="expansao-stat-num">5+</div>
              <div className="expansao-stat-label">Sistemas em desenvolvimento</div>
            </div>
            <div className="expansao-stat">
              <div className="expansao-stat-num">∞</div>
              <div className="expansao-stat-label">Segmentos sendo mapeados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Para Quem ─────────────────────────────────────────────────────────────────

function ParaQuem() {
  const items = [
    {
      title: 'Profissionais autônomos',
      desc: 'Barbeiros, cabeleireiros, tatuadores e outros profissionais que trabalham por conta própria e precisam de um sistema sem burocracia.',
    },
    {
      title: 'Donos de estabelecimento',
      desc: 'Proprietários de barbearias, salões, clínicas e estúdios que precisam controlar operação, equipe e resultados em um só lugar.',
    },
    {
      title: 'Clínicas e consultórios',
      desc: 'Profissionais da saúde — psicólogos, médicos — que buscam um sistema focado na sua área, não uma solução genérica adaptada.',
    },
    {
      title: 'Negócios em crescimento',
      desc: 'Operações que cresceram e precisam de mais controle: múltiplos profissionais, relatórios e gestão financeira integrada.',
    },
  ]

  return (
    <div className="paraquem-wrap" id="para-quem">
      <div className="container">
        <p className="section-label">Para quem</p>
        <h2 className="section-title">
          Para quem <strong>opera de verdade.</strong>
        </h2>
        <div className="audience-grid">
          {items.map((item) => (
            <div key={item.title} className="audience-card">
              <h3 className="audience-title">{item.title}</h3>
              <p className="audience-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Contato ──────────────────────────────────────────────────────────────────

function Contato() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="contato-wrap" id="contato">
      <div className="container">
        <div className="contato-grid">
          <div>
            <p className="section-label">Contato</p>
            <h2 className="contato-title">Fale com a EIXOR.</h2>
            <p className="contato-sub">
              Dúvidas sobre nossos sistemas, interesse em parcerias ou quer sugerir um
              novo segmento? Manda mensagem.
            </p>
            <div className="contato-detail">
              <div className="contato-item">
                <span>contato@eixor.com.br</span>
              </div>
              <div className="contato-item">
                <span>Brasil — atendimento em português</span>
              </div>
            </div>
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
                    <label htmlFor="nome">Nome</label>
                    <input id="nome" type="text" placeholder="Seu nome completo" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" type="email" placeholder="seu@email.com" required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="empresa-field">Empresa / Estabelecimento</label>
                  <input id="empresa-field" type="text" placeholder="Nome do seu negócio (opcional)" />
                </div>

                <div className="form-group">
                  <label htmlFor="assunto">Assunto</label>
                  <select id="assunto" required>
                    <option value="">Selecione...</option>
                    <option value="demo">Quero conhecer um sistema</option>
                    <option value="barber">EIXOR Barber</option>
                    <option value="outros">Outros sistemas em desenvolvimento</option>
                    <option value="parceria">Parceria comercial</option>
                    <option value="sugestao">Sugerir novo segmento</option>
                    <option value="outro">Outro assunto</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="mensagem">Mensagem</label>
                  <textarea
                    id="mensagem"
                    placeholder="Descreva o que você precisa..."
                    required
                  />
                </div>

                <div className="form-submit">
                  <button type="submit" className="btn btn-blue">
                    Enviar mensagem
                  </button>
                </div>
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
        {/* Coluna 1 — Institucional */}
        <div className="footer-brand">
          <img src="/logo-eixor.jpeg" height="28" alt="EIXOR" style={{ filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
          <p>
            Empresa de tecnologia especializada no desenvolvimento de sistemas de gestão
            para segmentos específicos. Tecnologia com lógica de negócio.
          </p>
        </div>

        {/* Coluna 2 — Empresa */}
        <div className="footer-col">
          <p className="footer-col-title">Empresa</p>
          <ul>
            <li><a href="#empresa">Sobre a EIXOR</a></li>
            <li><a href="#produto">Como pensamos produto</a></li>
            <li><a href="#expansao">Expansão</a></li>
            <li><a href="#para-quem">Para quem</a></li>
            <li><a href="#contato">Contato</a></li>
          </ul>
        </div>

        {/* Coluna 3 — Sistemas */}
        <div className="footer-col">
          <p className="footer-col-title">Sistemas</p>
          <ul>
            <li><a href="https://barber.eixor.com.br" target="_blank" rel="noopener noreferrer">EIXOR Barber</a></li>
            <li><a href="#sistemas">EIXOR Saloon</a></li>
            <li><a href="#sistemas">EIXOR Needle</a></li>
            <li><a href="#sistemas">EIXOR Nails</a></li>
            <li><a href="#sistemas">EIXOR Psico</a></li>
            <li><a href="#sistemas">EIXOR Med</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span className="footer-copy">© 2026 EIXOR. Todos os direitos reservados.</span>
          <span className="footer-copy">contato@eixor.com.br</span>
        </div>
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
      <ComoPensamos />
      <Sistemas />
      <Expansao />
      <ParaQuem />
      <Contato />
      <Footer />
    </>
  )
}
