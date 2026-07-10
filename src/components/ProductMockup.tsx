// Moldura de navegador para screenshot de produto.
// Quando a captura real existir: colocar a imagem em public/ e passar `src`.
export function ProductMockup({ src, url = 'barber.eixor.com.br', alt }: {
  src?: string; url?: string; alt: string
}) {
  return (
    <div className="mockup">
      <div className="mockup-bar">
        <span className="mockup-dot" /><span className="mockup-dot" /><span className="mockup-dot" />
        <span className="mockup-url">{url}</span>
      </div>
      {src
        ? <img className="mockup-img" src={src} alt={alt} loading="lazy" />
        : (
          <div className="mockup-empty" aria-hidden="true">
            <div className="mockup-skeleton w40" />
            <div className="mockup-skeleton-row">
              <div className="mockup-skeleton-card" />
              <div className="mockup-skeleton-card" />
              <div className="mockup-skeleton-card" />
            </div>
            <div className="mockup-skeleton w80" />
            <div className="mockup-skeleton w60" />
          </div>
        )}
    </div>
  )
}
