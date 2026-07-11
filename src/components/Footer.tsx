// ── Footer ───────────────────────────────────────────────────────────────────

// ícone inline com currentColor para herdar a cor dos links
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.88 5.88 0 0 0-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.48 1.38 2.13a5.88 5.88 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
    </svg>
  )
}

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
          <div className="footer-social">
            <a href="https://instagram.com/eixor" target="_blank" rel="noopener noreferrer" aria-label="Instagram @eixor"><InstagramIcon /></a>
            <a href="https://instagram.com/eixorbarber" target="_blank" rel="noopener noreferrer" aria-label="Instagram @eixorbarber"><InstagramIcon /></a>
          </div>
        </div>
        <div className="footer-col">
          <p className="footer-col-title">Empresa</p>
          <ul>
            <li><a href="#empresa">Sobre a EIXOR</a></li>
            <li><a href="#como-funciona">Como funciona</a></li>
            <li><a href="#produtos">Produtos</a></li>
            <li><a href="#faq">FAQ</a></li>
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
          <p className="footer-col-title footer-col-title--spaced">Legal</p>
          <ul>
            {/* páginas estáticas em public/ — modelos, revisar com o jurídico */}
            <li><a href="/privacidade.html">Política de Privacidade</a></li>
            <li><a href="/termos.html">Termos de Uso</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2026 EIXOR. Todos os direitos reservados.</span>
        {/* adicionar linha de CNPJ aqui quando a empresa for constituída */}
        <span className="footer-copy">contato@eixor.com.br</span>
      </div>
    </footer>
  )
}
