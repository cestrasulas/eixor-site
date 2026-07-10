import { useState, useEffect } from 'react'

// ── Nav ─────────────────────────────────────────────────────────────────────

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [onLight, setOnLight] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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

  // fecha o menu mobile com Escape
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}${onLight ? ' light' : ''}${menuOpen ? ' menu-open' : ''}`}>
      <a href="#inicio" className="nav-logo" onClick={close}>
        <img
          src={onLight ? '/logo-eixor-clara.png' : '/logo-eixor-escura.png'}
          alt="EIXOR"
          className="nav-logo-img"
        />
      </a>
      <button
        className="nav-toggle"
        aria-expanded={menuOpen}
        aria-controls="nav-menu"
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setMenuOpen(o => !o)}
      >
        <span /><span /><span />
      </button>
      <ul id="nav-menu" className={`nav-links${menuOpen ? ' open' : ''}`}>
        <li><a href="#empresa" onClick={close}>Empresa</a></li>
        <li><a href="#como-funciona" onClick={close}>Como funciona</a></li>
        <li><a href="#produtos" onClick={close}>Produtos</a></li>
        <li><a href="#faq" onClick={close}>FAQ</a></li>
        <li><a href="#contato" onClick={close}>Contato</a></li>
      </ul>
      <a href="#contato" className="nav-cta" onClick={close}>Falar com a EIXOR</a>
    </nav>
  )
}
