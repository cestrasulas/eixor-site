import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

// ── Header ──────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="header">
      <a href="#inicio" className="header-logo">
        <img src="/logo-eixor.jpeg" height="36" alt="EIXOR" />
      </a>

      <nav className="header-nav">
        <a href="#empresa">Empresa</a>
        <a href="#sistemas">Sistemas</a>
        <a href="#expansao">Expansão</a>
        <a href="#contato">Contato</a>
      </nav>

      <div className="header-right">
        <a href="#contato" className="btn btn-gold-outline">
          Falar com a EIXOR
        </a>
      </div>
    </header>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section id="inicio" style={{ background: 'var(--bg)' }}>
      <div className="hero">
        {/* Coluna esquerda */}
        <div>
          <span className="hero-tag">Ecossistema de sistemas digitais independentes</span>
          <h1 className="hero-title">
            Tecnologia especializada para operações reais.
          </h1>
          <p className="hero-sub">
            A EIXOR desenvolve sistemas de gestão com lógica de negócio — cada produto
            construído para um segmento específico, com profundidade e autonomia operacional.
          </p>
          <div className="hero-actions">
            <a href="#sistemas" className="btn btn-primary">Ver sistemas</a>
            <a href="#empresa" className="btn btn-secondary">Sobre a empresa</a>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="hero-card">
          <p className="hero-card-label">Estrutura EIXOR</p>
          <div className="hero-tree">
            <div className="hero-tree-item">
              <div className="hero-tree-line">
                <div className="hero-tree-dot active" />
                <div className="hero-tree-connector" />
              </div>
              <div className="hero-tree-content">
                <p className="hero-tree-title">EIXOR — Empresa</p>
                <p className="hero-tree-desc">
                  Holding de tecnologia responsável por desenvolver e operar sistemas
                  digitais independentes.
                </p>
              </div>
            </div>

            <div className="hero-tree-item">
              <div className="hero-tree-line">
                <div className="hero-tree-dot" />
                <div className="hero-tree-connector" />
              </div>
              <div className="hero-tree-content">
                <p className="hero-tree-title">Sistemas independentes</p>
                <p className="hero-tree-desc">
                  Cada sistema opera com lógica própria, voltado a um segmento de mercado.
                </p>
                <div className="hero-tree-tags">
                  <span className="hero-tree-tag live">EIXOR Barber</span>
                  <span className="hero-tree-tag">EIXOR Saloon</span>
                  <span className="hero-tree-tag">EIXOR Needle</span>
                  <span className="hero-tree-tag">EIXOR Psico</span>
                  <span className="hero-tree-tag">EIXOR Med</span>
                </div>
              </div>
            </div>

            <div className="hero-tree-item">
              <div className="hero-tree-line">
                <div className="hero-tree-dot" />
              </div>
              <div className="hero-tree-content">
                <p className="hero-tree-title">Expansão contínua</p>
                <p className="hero-tree-desc">
                  Novos segmentos mapeados e sistemas em desenvolvimento constante.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
    <div className="section-wrap alt" id="empresa">
      <div className="section">
        <p className="section-label">Empresa</p>
        <h2 className="section-title">
          Uma empresa construída para desenvolver<br />sistemas com lógica de negócio.
        </h2>
        <p className="section-subtitle">
          A EIXOR não é uma agência nem uma fábrica de software. É uma empresa de
          tecnologia que escolheu os segmentos em que vai se tornar referência — e
          trabalha com seriedade para isso acontecer.
        </p>
        <div className="pillars-grid">
          {pillars.map((p) => (
            <div key={p.num} className="pillar-card">
              <p className="pillar-number">{p.num}</p>
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
      icon: '◈',
      title: 'Estrutura antes de interface',
      desc: 'Antes de qualquer tela, definimos a lógica: quais entidades existem, como se relacionam, quais regras governam cada operação.',
    },
    {
      icon: '◎',
      title: 'Fluxo como centro do produto',
      desc: 'O sistema deve refletir como a operação realmente acontece — não como uma versão idealizada dela. Adaptamos o software ao negócio, não o contrário.',
    },
    {
      icon: '◇',
      title: 'Evolução com dados',
      desc: 'Cada sistema coleta métricas relevantes para o segmento. A próxima versão é sempre informada pelo uso real, não por achismo.',
    },
  ]

  return (
    <div className="section-wrap" id="produto">
      <div className="section">
        <p className="section-label">Como pensamos produto</p>
        <h2 className="section-title">Produto não é interface. É estrutura.</h2>
        <p className="section-subtitle">
          Construir software sério exige pensar antes de codificar. Cada sistema EIXOR
          nasce de uma análise profunda da operação que vai servir.
        </p>
        <div className="product-thinking-grid">
          {items.map((item) => (
            <div key={item.title} className="thinking-card">
              <div className="thinking-icon">{item.icon}</div>
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

type SystemStatus = 'live' | 'dev' | 'expansion'

interface SystemItem {
  name: string
  desc: string
  status: SystemStatus
  link?: string
}

const systems: SystemItem[] = [
  {
    name: 'EIXOR Barber',
    desc: 'Gestão completa para barbearias: agendamento online, controle de caixa, fila de espera e relacionamento com clientes. Primeiro sistema em produção do ecossistema.',
    status: 'live',
    link: 'https://barber.eixor.com.br',
  },
  {
    name: 'EIXOR Saloon',
    desc: 'Plataforma de gestão para salões de beleza. Agendamentos, fichas de cliente, controle de comissões e fluxo de caixa.',
    status: 'dev',
  },
  {
    name: 'EIXOR Needle',
    desc: 'Sistema para estúdios de tatuagem e piercing. Gestão de sessões, catálogo de arte, agenda de artistas e acompanhamento pós-sessão.',
    status: 'dev',
  },
  {
    name: 'EIXOR Nails',
    desc: 'Gestão para nail designers e estúdios de nail art. Agendamento, catálogo de serviços, controle de insumos e fidelização de clientes.',
    status: 'dev',
  },
  {
    name: 'EIXOR Psico',
    desc: 'Sistema de gestão para psicólogos e clínicas de psicologia. Prontuário digital, agendamento, sessões e faturamento.',
    status: 'dev',
  },
  {
    name: 'EIXOR Med',
    desc: 'Plataforma para médicos e clínicas. Prontuário eletrônico, agenda inteligente, prescrição digital e gestão de consultório.',
    status: 'dev',
  },
  {
    name: 'EIXOR +',
    desc: 'Novos segmentos sendo mapeados. Cada sistema que entra no ecossistema passa por análise criteriosa antes do desenvolvimento.',
    status: 'expansion',
  },
]

function statusLabel(s: SystemStatus) {
  if (s === 'live') return 'Em operação'
  if (s === 'dev') return 'Em desenvolvimento'
  return 'Expansão'
}

function SystemCard({ item }: { item: SystemItem }) {
  const cardClass = `system-card ${item.status === 'live' ? 'gold' : item.status === 'expansion' ? 'dashed' : ''}`
  const statusClass = `system-status ${item.status === 'live' ? 'status-live' : item.status === 'expansion' ? 'status-expansion' : 'status-dev'}`

  return (
    <div className={cardClass}>
      <span className={statusClass}>{statusLabel(item.status)}</span>
      <h3 className="system-name">{item.name}</h3>
      <p className="system-desc">{item.desc}</p>
      {item.status === 'live' && item.link ? (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="system-link">
          Acessar sistema →
        </a>
      ) : item.status === 'expansion' ? (
        <a href="#contato" className="system-link">Entre em contato →</a>
      ) : (
        <span className="system-link-disabled">Em desenvolvimento</span>
      )}
    </div>
  )
}

function Sistemas() {
  return (
    <div className="section-wrap alt" id="sistemas">
      <div className="section">
        <p className="section-label">Sistemas</p>
        <h2 className="section-title">Um ecossistema em construção.</h2>
        <p className="section-subtitle">
          Cada sistema é independente, com lógica própria para o segmento que serve.
          Desenvolvidos com profundidade, não apenas como ferramentas genéricas.
        </p>
        <div className="systems-grid">
          {systems.map((s) => (
            <SystemCard key={s.name} item={s} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Expansão ──────────────────────────────────────────────────────────────────

function Expansao() {
  return (
    <div className="section-wrap" id="expansao">
      <div className="section">
        <div className="expansion-inner">
          <div className="expansion-text">
            <p className="section-label">Expansão</p>
            <h2 className="section-title">Novos sistemas. Novos segmentos.</h2>
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

          <div className="expansion-highlight">
            <div className="expansion-stat">
              <span className="expansion-stat-num">1</span>
              <span className="expansion-stat-label">Sistema em operação</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border)' }} />
            <div className="expansion-stat">
              <span className="expansion-stat-num">5+</span>
              <span className="expansion-stat-label">Sistemas em desenvolvimento</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border)' }} />
            <div className="expansion-stat">
              <span className="expansion-stat-num">∞</span>
              <span className="expansion-stat-label">Segmentos sendo mapeados</span>
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
      icon: '✂',
      title: 'Profissionais autônomos',
      desc: 'Barbeiros, cabeleireiros, tatuadores e outros profissionais que trabalham por conta própria e precisam de um sistema que funcione sem burocracia.',
    },
    {
      icon: '◻',
      title: 'Donos de estabelecimento',
      desc: 'Proprietários de barbearias, salões, clínicas e estúdios que precisam controlar a operação, a equipe e os resultados em um só lugar.',
    },
    {
      icon: '⊕',
      title: 'Clínicas e consultórios',
      desc: 'Profissionais da saúde — psicólogos, médicos e especialistas — que buscam um sistema focado na sua área, não uma solução genérica adaptada.',
    },
    {
      icon: '◈',
      title: 'Negócios em crescimento',
      desc: 'Operações que cresceram e precisam de mais controle: múltiplos profissionais, relatórios, histórico de clientes e gestão financeira integrada.',
    },
  ]

  return (
    <div className="section-wrap alt" id="para-quem">
      <div className="section">
        <p className="section-label">Para quem</p>
        <h2 className="section-title">Para quem opera de verdade.</h2>
        <p className="section-subtitle">
          Os sistemas EIXOR são feitos para profissionais e negócios que precisam de
          tecnologia que respeite a realidade do dia a dia — sem excesso, sem falta.
        </p>
        <div className="audience-grid">
          {items.map((item) => (
            <div key={item.title} className="audience-card">
              <div className="audience-icon">{item.icon}</div>
              <div>
                <h3 className="audience-title">{item.title}</h3>
                <p className="audience-desc">{item.desc}</p>
              </div>
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
    <div className="section-wrap" id="contato">
      <div className="section">
        <div className="contact-grid">
          <div className="contact-info">
            <p className="section-label">Contato</p>
            <h2 className="section-title">Fale com a EIXOR.</h2>
            <p>
              Tem dúvidas sobre nossos sistemas, quer entender como podemos ajudar sua operação,
              ou está pensando em sugerir um novo segmento? Manda mensagem.
            </p>
            <div className="contact-detail">
              <div className="contact-item">
                <span className="contact-item-icon">✉</span>
                <span>contato@eixor.com.br</span>
              </div>
              <div className="contact-item">
                <span className="contact-item-icon">⊕</span>
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
                  <label htmlFor="empresa">Empresa / Estabelecimento</label>
                  <input id="empresa" type="text" placeholder="Nome do seu negócio (opcional)" />
                </div>

                <div className="form-group">
                  <label htmlFor="assunto">Assunto</label>
                  <select id="assunto" required>
                    <option value="">Selecione o assunto...</option>
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
                    placeholder="Descreva o que você precisa ou o que está pensando..."
                    required
                  />
                </div>

                <div className="form-submit">
                  <button type="submit" className="btn btn-primary">
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
          <img src="/logo-eixor.jpeg" height="28" alt="EIXOR" />
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
        <span className="footer-copy">© 2026 EIXOR. Todos os direitos reservados.</span>
        <span className="footer-copy">CNPJ disponível em breve</span>
      </div>
    </footer>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <Header />
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
