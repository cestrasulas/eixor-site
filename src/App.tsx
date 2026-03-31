import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

function Logo({ className }: { className?: string }) {
  return (
    <span className={`nav-logo ${className ?? ''}`}>
      E<span className="x">I</span><span className="x">X</span>OR
    </span>
  )
}

function Nav() {
  return (
    <nav className="nav">
      <Logo />
      <ul className="nav-links">
        <li><a href="#produtos">Produtos</a></li>
        <li><a href="#contato">Contato</a></li>
      </ul>
      <a href="#contato" className="btn btn-outline">Fale conosco</a>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero" id="inicio">
      <span className="hero-tag">Ecossistema de produtos digitais</span>
      <h1>Tecnologia que resolve.<br />Resultado que você sente.</h1>
      <p className="hero-sub">
        Criamos ferramentas digitais focadas em facilidade, comodidade e resultado — para
        quem toca o negócio de verdade, sem tempo a perder.
      </p>
      <div className="hero-actions">
        <a href="#produtos" className="btn btn-solid">Conhecer produtos</a>
        <a href="#contato" className="btn btn-ghost">Enviar sugestão</a>
      </div>
    </section>
  )
}

function Manifesto() {
  return (
    <div className="manifesto-wrap">
      <div className="section">
        <div className="manifesto-inner">
          <p className="section-label">Manifesto</p>
          <h2>Construindo fora do <em>eixo</em>.</h2>
          <div className="manifesto-body">
            <p>
              <strong>A EIXOR nasceu de uma convicção simples:</strong> a tecnologia de
              verdade não deveria ser privilégio de grandes empresas. O pequeno negócio,
              o empreendedor que abre cedo e fecha tarde, merece ferramentas que funcionam
              — sem curva de aprendizado absurda, sem mensalidade que sangra o caixa, sem
              suporte que some quando mais precisa.
            </p>
            <p>
              Construímos fora do eixo porque acreditamos que as soluções mais relevantes
              ainda estão por surgir — e que elas precisam ser pensadas por quem conhece a
              realidade do chão de loja, do salão de bairro, do estúdio que quer crescer.
              Cada produto que lançamos começa ouvindo quem vai usar.
            </p>
            <p>
              <strong>Nossa visão de longo prazo</strong> é construir um ecossistema coeso:
              produtos que se integram, que compartilham identidade e que evoluem juntos.
              Não somos uma fábrica de software. Somos uma empresa que escolheu os
              segmentos em que vai se tornar referência — e trabalha com seriedade para
              isso acontecer.
            </p>
            <p>
              Tecnologia acessível não é tecnologia barata. É tecnologia honesta,
              bem-feita e que respeita o tempo de quem usa. Esse é o padrão EIXOR.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface Product {
  name: string
  xIndex: number
  description: string
  status: 'live' | 'soon' | 'suggest'
  link?: string
}

const products: Product[] = [
  {
    name: 'EIXOR Barber',
    xIndex: 2,
    description:
      'Gestão completa para barbearias: agendamento online, controle de caixa, fila de espera e relacionamento com clientes em um só lugar.',
    status: 'live',
    link: 'https://barber.eixor.com.br',
  },
  {
    name: 'EIXOR Saloon',
    xIndex: 2,
    description:
      'A plataforma de gestão desenhada para salões de beleza. Agendamentos, fichas de cliente, comissões e muito mais. Em breve.',
    status: 'soon',
  },
  {
    name: 'EIXOR Needle',
    xIndex: 2,
    description:
      'Solução para estúdios de tatuagem e piercing. Controle de sessões, catálogo de arte, gestão de agenda e clientes. Em breve.',
    status: 'soon',
  },
  {
    name: 'EIXOR +',
    xIndex: 2,
    description:
      'Tem uma ideia de produto para o seu segmento? A EIXOR escuta. Envie sua sugestão e ajude a moldar o próximo produto do ecossistema.',
    status: 'suggest',
  },
]

function badgeLabel(status: Product['status']) {
  if (status === 'live') return 'No ar'
  if (status === 'soon') return 'Em breve'
  return 'Sugestões'
}

function ProductCard({ product }: { product: Product }) {
  const nameParts = product.name.split('')

  return (
    <div className={`product-card ${product.status === 'live' ? 'active' : ''}`}>
      <span className={`product-badge badge-${product.status === 'suggest' ? 'suggest' : product.status === 'live' ? 'live' : 'soon'}`}>
        {badgeLabel(product.status)}
      </span>

      <h3 className="product-name">
        {nameParts.map((char, i) => {
          const wordStart = product.name.indexOf('EIXOR')
          const relativeI = i - wordStart
          if ((relativeI === 1 || relativeI === 2) && char !== ' ') {
            return <span key={i} className="x">{char}</span>
          }
          return <span key={i}>{char}</span>
        })}
      </h3>

      <p className="product-desc">{product.description}</p>

      {product.status === 'live' && product.link ? (
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="product-link"
        >
          Acessar produto →
        </a>
      ) : product.status === 'suggest' ? (
        <a href="#contato" className="product-link">Enviar sugestão →</a>
      ) : (
        <span className="product-link-disabled">Disponível em breve</span>
      )}
    </div>
  )
}

function Products() {
  return (
    <section className="section" id="produtos">
      <div className="products-header">
        <p className="section-label">Produtos</p>
        <h2>Um ecossistema em construção.</h2>
      </div>
      <div className="products-grid">
        {products.map((p) => (
          <ProductCard key={p.name} product={p} />
        ))}
      </div>
    </section>
  )
}

function Contact() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="contact-wrap" id="contato">
      <div className="section">
        <div className="contact-grid">
          <div className="contact-info">
            <p className="section-label">Contato</p>
            <h2>Bora conversar.</h2>
            <p>
              Tem uma dúvida, uma sugestão de produto ou quer entender como a EIXOR pode
              ajudar o seu negócio? Manda mensagem. Respondemos de verdade.
            </p>
            <div className="contact-detail">
              <div className="contact-item">
                <span className="contact-item-icon">✉</span>
                <span>contato@eixor.com.br</span>
              </div>
              <div className="contact-item">
                <span className="contact-item-icon">🇧🇷</span>
                <span>Brasil — atendimento em português</span>
              </div>
            </div>
          </div>

          <div>
            {submitted ? (
              <div style={{
                background: 'rgba(200,150,12,0.06)',
                border: '1px solid rgba(200,150,12,0.25)',
                borderRadius: '12px',
                padding: '40px 32px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
                <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#fff' }}>
                  Mensagem recebida!
                </h3>
                <p style={{ fontSize: '14px', color: '#888' }}>
                  Em breve entraremos em contato.
                </p>
              </div>
            ) : (
              <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nome">Nome</label>
                    <input id="nome" type="text" placeholder="Seu nome" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" type="email" placeholder="seu@email.com" required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="segmento">Tipo de negócio</label>
                  <select id="segmento" required>
                    <option value="">Selecione...</option>
                    <option value="barbearia">Barbearia</option>
                    <option value="salao">Salão de beleza</option>
                    <option value="tatuagem">Estúdio de tatuagem</option>
                    <option value="outro">Outro segmento</option>
                    <option value="sugestao">Quero sugerir um produto</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="mensagem">Mensagem</label>
                  <textarea
                    id="mensagem"
                    placeholder="Conte o que você precisa ou o que está pensando..."
                    required
                  />
                </div>

                <div className="form-submit">
                  <button type="submit" className="btn btn-solid">
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

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Logo className="footer-logo" />
        <ul className="footer-links">
          <li><a href="#">Termos de uso <span style={{ color: '#555', fontSize: '11px' }}>(em breve)</span></a></li>
          <li><a href="#">Privacidade <span style={{ color: '#555', fontSize: '11px' }}>(em breve)</span></a></li>
          <li><a href="#">LGPD <span style={{ color: '#555', fontSize: '11px' }}>(em breve)</span></a></li>
        </ul>
        <span className="footer-copy">© 2026 EIXOR. Todos os direitos reservados.</span>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Manifesto />
      <Products />
      <Contact />
      <Footer />
    </>
  )
}
