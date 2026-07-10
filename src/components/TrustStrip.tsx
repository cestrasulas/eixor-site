import { FadeIn } from './Motion'

// ── Compromissos ─────────────────────────────────────────────────────────────
// Somente afirmações verificáveis — validar com o time antes do deploy.

const COMPROMISSOS = [
  {
    title: 'LGPD desde a concepção',
    desc: 'Dados tratados conforme a legislação brasileira, com controle de acesso e titularidade clara.',
  },
  {
    title: 'Feito no Brasil, em português',
    desc: 'Produto, suporte e documentação no seu idioma — sem tradução automática de sistema gringo.',
  },
  {
    title: 'Suporte direto com quem constrói',
    desc: 'Quem responde é quem desenvolve. Sem camadas de atendimento terceirizado.',
  },
  {
    title: 'Evolução contínua',
    desc: 'Atualizações incluídas para todos os clientes — sem cobrança por versão nova.',
  },
]

export function Compromissos() {
  return (
    <div className="compromissos-wrap" id="compromissos">
      <div className="container">
        <FadeIn><div className="eyebrow">Compromissos</div></FadeIn>
        <FadeIn delay={1}>
          <h2 className="compromissos-title">
            O que você pode <em>cobrar</em> da gente.
          </h2>
        </FadeIn>
        <div className="compromissos-grid">
          {COMPROMISSOS.map((c, i) => (
            <FadeIn key={c.title} delay={Math.min(i, 3) as 0 | 1 | 2 | 3}>
              <div className="compromisso">
                <h3 className="compromisso-title">{c.title}</h3>
                <p className="compromisso-desc">{c.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}
