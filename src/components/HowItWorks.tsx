import { FadeIn } from './Motion'

// ── Como funciona ────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Diagnóstico',
    desc: 'Entendemos a operação do seu segmento — rotina, pontos de atrito e o que consome seu tempo hoje.',
  },
  {
    num: '02',
    title: 'Implantação',
    desc: 'Configuração e migração acompanhadas. Você não fica sozinho com um sistema vazio.',
  },
  {
    num: '03',
    title: 'Operação com IA',
    desc: 'O dia a dia rodando na plataforma — automações e inteligência trabalhando nos bastidores.',
  },
  {
    num: '04',
    title: 'Evolução contínua',
    desc: 'O produto cresce com o feedback de quem usa. Novos módulos chegam sem troca de sistema.',
  },
]

export function ComoFunciona() {
  return (
    <div className="como-wrap" id="como-funciona">
      <div className="container">
        <FadeIn><div className="eyebrow">Como funciona</div></FadeIn>
        <FadeIn delay={1}>
          <h2 className="sec-title">Da sua rotina <span>para a plataforma.</span></h2>
        </FadeIn>
        <div className="steps">
          {STEPS.map((s, i) => (
            <FadeIn key={s.num} delay={Math.min(i, 3) as 0 | 1 | 2 | 3}>
              <div className="step">
                <p className="step-num">{s.num}</p>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}
