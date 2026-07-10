import { useState, type FormEvent } from 'react'

// ── Contato ──────────────────────────────────────────────────────────────────

export function Contato() {
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
