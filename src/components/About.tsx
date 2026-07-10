import { FadeIn } from './Motion'

// ── Empresa ──────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    num: '01',
    title: 'IA que trabalha, não que impressiona',
    desc: 'Cada funcionalidade inteligente nasceu de um problema real. Validações documentais automatizadas, relatórios jurídicos em português, antecipação de demandas em serviços. IA com lógica de negócio — não com marketing.',
  },
  {
    num: '02',
    title: 'Especialização profunda por vertical',
    desc: 'Não cobrimos tudo — mergulhamos fundo onde atuamos. Antes de escrever código, mapeamos as operações do profissional, entendemos os pontos de atrito e construímos lógica específica para aquele mercado.',
  },
  {
    num: '03',
    title: 'Plataformas que crescem com a profissão',
    desc: 'Cada vertical é um ecossistema em expansão. Novos módulos, novas automações, novas integrações — acompanhando a evolução das necessidades do profissional, sem trocar de sistema.',
  },
]

export function Empresa() {
  return (
    <div className="empresa-wrap" id="empresa">
      <div className="container">
        <FadeIn><div className="eyebrow">Empresa</div></FadeIn>
        <FadeIn delay={1}>
          <h2 className="sec-title">
            Construída para <span>resolver problemas reais.</span>
          </h2>
        </FadeIn>
        <div className="pillars">
          {PILLARS.map((p, i) => (
            <FadeIn key={p.num} delay={i as 0 | 1 | 2}>
              <div className="pillar">
                <p className="pillar-num">{p.num}</p>
                <h3 className="pillar-title">{p.title}</h3>
                <p className="pillar-desc">{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}
