// ── Footer ───────────────────────────────────────────────────────────────────

export function Footer() {
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
