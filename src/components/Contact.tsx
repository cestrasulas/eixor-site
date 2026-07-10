import { useState, type FormEvent } from 'react'

// ── Contato ──────────────────────────────────────────────────────────────────

// rótulos legíveis para o assunto do e-mail
const ASSUNTOS: Record<string, string> = {
  barber: 'EIXOR Barber',
  incorp: 'EIXOR Incorp',
  petition: 'EIXOR Petition',
  processo: 'EIXOR Processo',
  juridica: 'Vertical Jurídica',
  parceria: 'Parceria comercial',
  sugestao: 'Sugestão de novo segmento',
  outro: 'Contato',
}

export function Contato() {
  const [submitted, setSubmitted] = useState(false)

  // monta um mailto: com os campos preenchidos e abre o cliente de e-mail
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const assunto = ASSUNTOS[String(data.get('assunto'))] ?? 'Contato'
    const subject = `[Site EIXOR] ${assunto}`
    const body = [
      `Nome: ${data.get('nome')}`,
      `E-mail: ${data.get('email')}`,
      `Empresa: ${data.get('empresa') || '—'}`,
      '',
      String(data.get('mensagem') ?? ''),
    ].join('\n')
    window.location.href =
      `mailto:contato@eixor.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
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
                <h3>Mensagem pronta.</h3>
                <p>
                  Seu cliente de e-mail foi aberto com a mensagem preenchida — basta enviar.
                  Se preferir, escreva direto para contato@eixor.com.br.
                </p>
              </div>
            ) : (
              <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="nome">Nome</label>
                    <input id="nome" name="nome" type="text" placeholder="Seu nome completo" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">E-mail</label>
                    <input id="email" name="email" type="email" placeholder="seu@email.com" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="empresa-field">Empresa / Estabelecimento</label>
                  <input id="empresa-field" name="empresa" type="text" placeholder="Nome do seu negócio (opcional)" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="assunto">Assunto</label>
                  <select id="assunto" name="assunto" required>
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
                  <textarea id="mensagem" name="mensagem" placeholder="Descreva o que você precisa..." required />
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
