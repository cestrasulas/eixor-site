import { FadeIn } from './Motion'
import { ProductMockup } from './ProductMockup'

// ── Produtos ─────────────────────────────────────────────────────────────────

const GESTAO_PRODUCTS = [
  { name: 'Barber', live: true },
  { name: 'Saloon', live: false },
  { name: 'Needle', live: false },
  { name: 'Nails', live: false },
  { name: 'Psico', live: false },
  { name: 'Med', live: false },
]

const JURIDICA_ROADMAP = [
  {
    name: 'EIXOR Incorp',
    status: 'dev' as const,
    statusLabel: 'Em desenvolvimento',
    desc: 'Software completo para incorporações imobiliárias — do protocolo ao registro, com validação documental assistida por IA.',
    features: [
      'Validação documental automatizada com IA',
      'Readiness registral e controle de exigências',
      'Gestão completa do processo de incorporação',
      'Painel de acompanhamento em tempo real',
    ],
  },
  {
    name: 'EIXOR Petition',
    status: 'soon' as const,
    statusLabel: 'Em breve',
    desc: 'Peticionamento inteligente — geração, revisão e protocolo de peças com auxílio de inteligência artificial.',
    features: [
      'Geração de petições assistida por IA',
      'Templates por área do direito e instância',
      'Revisão automática de fundamentos e consistência',
      'Protocolo integrado nos principais sistemas',
    ],
  },
  {
    name: 'EIXOR Processo',
    status: 'soon' as const,
    statusLabel: 'Em breve',
    desc: 'Controle processual simplificado — relatórios em português, prazos, audiências e produtividade para advogados.',
    features: [
      'Andamentos traduzidos do juridiquês para o português',
      'Controle de prazos, audiências e reuniões',
      'Painel de tarefas e produtividade para advogados',
      'Relatórios automáticos e acessíveis para clientes',
    ],
  },
]

export function Produtos() {
  return (
    <div className="produtos-wrap" id="produtos">
      <div className="container">
        <FadeIn><div className="eyebrow">Verticais</div></FadeIn>
        <FadeIn delay={1}>
          <h2 className="sec-title">Duas verticais. <span>Um padrão de produto.</span></h2>
        </FadeIn>
        <FadeIn delay={2}>
          <p className="produtos-intro">
            A EIXOR não cobre tudo — mergulha fundo onde atua. Cada vertical é construída
            com lógica operacional específica e inteligência artificial embarcada, substituindo
            processos manuais por automação que entende a rotina do profissional.
          </p>
        </FadeIn>

        {/* Vertical de Serviços */}
        <div className="vertical-block">
          <FadeIn>
            <div className="vertical-header">
              <div className="vertical-label-wrap">
                <span className="vertical-num">01</span>
                <span className="vertical-name">Vertical de Serviços</span>
              </div>
              <p className="vertical-sub">
                Plataformas de gestão para negócios de serviço e saúde — barbearias, salões,
                clínicas e consultórios. Agendamento, caixa, CRM e automação com IA, cada
                sistema pensado para quem vive aquela rotina.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={1}>
            <div className="card-gestao">
              <div className="card-title-row">
                <div>
                  <h3 className="card-name">EIXOR <span>Gestão</span></h3>
                  <p className="card-sub">Sistemas verticais para negócios de serviço e saúde</p>
                </div>
                <div className="badge-live">
                  <span className="live-dot" />
                  Em operação
                </div>
              </div>
              <p className="card-desc">
                Plataformas desenvolvidas para segmentos específicos — agendamento online,
                controle de caixa, CRM e relatórios inteligentes. IA aplicada para antecipar
                demandas, automatizar lembretes e gerar insights sobre o negócio.
              </p>
              <div className="prod-row">
                {GESTAO_PRODUCTS.map(p => (
                  <span key={p.name} className={p.live ? 'prod-active' : 'prod-tag'}>
                    {p.live ? '● ' : ''}{p.name}
                  </span>
                ))}
              </div>
              <a
                href="https://barber.eixor.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="card-cta"
              >
                Acessar EIXOR Barber →
              </a>
            </div>
          </FadeIn>
          <FadeIn delay={2}>
            {/* Trocar por src="/barber-screenshot.png" quando a captura real existir */}
            <div className="mockup-wrap">
              <ProductMockup alt="Interface do EIXOR Barber" />
            </div>
          </FadeIn>
        </div>

        {/* Vertical Jurídica */}
        <div className="vertical-block">
          <FadeIn>
            <div className="vertical-header">
              <div className="vertical-label-wrap">
                <span className="vertical-num">02</span>
                <span className="vertical-name">Vertical Jurídica</span>
              </div>
              <p className="vertical-sub">
                Sistemas para o universo do direito — de incorporações imobiliárias ao
                controle processual completo. IA que lê o processo, traduz o juridiquês e
                organiza a agenda do advogado.
              </p>
            </div>
          </FadeIn>
          <div className="juridica-grid">
            {JURIDICA_ROADMAP.map((product, i) => (
              <FadeIn key={product.name} delay={i as 0 | 1 | 2}>
                <div className={`juridica-card juridica-card--${product.status}`}>
                  <span className={`juridica-badge juridica-badge--${product.status}`}>
                    <span className="juridica-dot" />
                    {product.statusLabel}
                  </span>
                  <h3 className="juridica-card-name">{product.name}</h3>
                  <p className="juridica-card-desc">{product.desc}</p>
                  <ul className="juridica-features">
                    {product.features.map(f => (
                      <li key={f} className="juridica-feature">{f}</li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn>
            <div className="juridica-foot">
              Interesse antecipado na vertical jurídica?{' '}
              <a href="mailto:contato@eixor.com.br">contato@eixor.com.br</a>
            </div>
          </FadeIn>
        </div>

      </div>
    </div>
  )
}
