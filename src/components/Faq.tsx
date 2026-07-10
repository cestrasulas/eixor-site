import { FadeIn } from './Motion'

// ── FAQ ──────────────────────────────────────────────────────────────────────
// <details>/<summary> nativo: acessível por teclado sem JavaScript.

const FAQS = [
  {
    q: 'O que é o EIXOR Barber e como começo a usar?',
    a: 'É a plataforma de gestão para barbearias — agendamento online, controle de caixa e relacionamento com clientes. Já está em operação: acesse barber.eixor.com.br ou fale com a gente pelo formulário para uma demonstração.',
  },
  {
    q: 'Os próximos produtos de serviços (Saloon, Needle, Nails, Psico, Med) já têm previsão?',
    a: 'Estão em desenvolvimento, seguindo o mesmo método do Barber: mapear a operação do segmento antes de lançar. Se você atua em um desses mercados, manifeste interesse antecipado — clientes early têm voz ativa no produto.',
  },
  {
    q: 'O que é a vertical jurídica da EIXOR?',
    a: 'Uma linha de produtos para o universo do direito. Começa pelo EIXOR Incorp (incorporações imobiliárias, em desenvolvimento), seguido do EIXOR Petition (peticionamento inteligente) e do EIXOR Processo (controle processual com relatórios em português, prazos, audiências e produtividade para advogados).',
  },
  {
    q: 'Como a IA é usada nos produtos?',
    a: 'Sempre a serviço de um problema concreto: validação documental automatizada nas incorporações, tradução de andamentos processuais do juridiquês para o português, antecipação de demandas e insights nos sistemas de gestão. IA embarcada no fluxo de trabalho — não um chatbot decorativo.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. Tratamos dados conforme a LGPD, com controle de acesso, titularidade clara e possibilidade de exportação. Cada sistema tem base de dados própria e independente.',
  },
  {
    q: 'Quanto custa?',
    a: 'Os preços variam por produto e porte da operação. Fale com a gente pelo formulário ou pelo contato@eixor.com.br e retornamos com uma proposta adequada ao seu caso.',
  },
]

export function Faq() {
  return (
    <div className="faq-wrap" id="faq">
      <div className="container">
        <FadeIn><div className="eyebrow">FAQ</div></FadeIn>
        <FadeIn delay={1}>
          <h2 className="sec-title">Perguntas <span>frequentes.</span></h2>
        </FadeIn>
        <FadeIn delay={2}>
          <div className="faq-list">
            {FAQS.map(f => (
              <details key={f.q} className="faq-item">
                <summary className="faq-q">
                  {f.q}
                  <span className="faq-icon" aria-hidden="true">+</span>
                </summary>
                <p className="faq-a">{f.a}</p>
              </details>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
