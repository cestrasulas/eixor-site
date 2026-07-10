import { useState, useEffect } from 'react'

// ── Nav ─────────────────────────────────────────────────────────────────────

export function Nav() {
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
