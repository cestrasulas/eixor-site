import { cacheSavings } from './cost.js'
import { dateTime, moneyBrl, moneyShort, num, percent, tokens, truncate } from './format.js'

function escape(text) {
  return String(text ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  )
}

function card(label, value, hint) {
  return `<div class="card"><span class="card-label">${escape(label)}</span><strong class="card-value">${escape(value)}</strong>${
    hint ? `<span class="card-hint">${escape(hint)}</span>` : ''
  }</div>`
}

function rows(list, options, labelWidth = 70) {
  const max = list.length ? list[0].totals.cost : 0
  return list
    .slice(0, options.limit)
    .map((row) => {
      const width = max ? Math.max(2, (row.totals.cost / max) * 100) : 0
      return `<tr>
      <td class="label"><span class="track"><span class="fill" style="width:${width.toFixed(1)}%"></span></span><span class="text">${escape(truncate(row.label, labelWidth))}</span></td>
      <td class="n strong">${escape(moneyShort(row.totals.cost))}</td>
      ${options.fx ? `<td class="n">${escape((row.totals.cost * options.fx).toFixed(2).replace('.', ','))}</td>` : ''}
      <td class="n">${escape(num(row.totals.requests))}</td>
      <td class="n">${escape(tokens(row.totals.rawInput))}</td>
      <td class="n">${escape(tokens(row.totals.output))}</td>
      <td class="n muted">${escape(percent(row.totals.rawInput ? row.totals.billedInputEquivalent / row.totals.rawInput : 0))}</td>
    </tr>`
    })
    .join('')
}

function section(title, subtitle, list, options, labelHeader, labelWidth) {
  if (!list.length) return ''
  return `<section>
    <h2>${escape(title)}</h2>
    ${subtitle ? `<p class="sub">${escape(subtitle)}</p>` : ''}
    <div class="scroll"><table>
      <thead><tr>
        <th>${escape(labelHeader)}</th><th class="n">Custo US$</th>
        ${options.fx ? '<th class="n">R$</th>' : ''}
        <th class="n">Req</th><th class="n">Entrada</th><th class="n">Saída</th><th class="n">Cobrado/bruto</th>
      </tr></thead>
      <tbody>${rows(list, options, labelWidth)}</tbody>
    </table></div>
  </section>`
}

export function renderHtml(agg, options) {
  const t = agg.totals
  const savings = cacheSavings(t)
  const generated = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })

  const sessionRows = agg.bySession.map((s) => ({
    ...s,
    label: `${s.project}${s.branch ? ` · ${s.branch}` : ''} · ${truncate(s.label, 8)} · ${dateTime(s.updatedAt)}`,
  }))
  const turnRows = agg.byTurn.map((row) => ({ ...row, label: `#${row.index} · ${row.label}` }))

  return `<title>Taxímetro de tokens</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #ffffff; --fg: #14171c; --muted: #6b7280; --line: #e5e7eb;
    --panel: #f7f8fa; --accent: #b8763a; --accent-soft: #f0d9c2;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #101317; --fg: #e8eaed; --muted: #9aa3ae; --line: #262b33;
            --panel: #171b21; --accent: #e0a163; --accent-soft: #3a2c1c; }
  }
  :root[data-theme="dark"] {
    --bg: #101317; --fg: #e8eaed; --muted: #9aa3ae; --line: #262b33;
    --panel: #171b21; --accent: #e0a163; --accent-soft: #3a2c1c;
  }
  :root[data-theme="light"] {
    --bg: #ffffff; --fg: #14171c; --muted: #6b7280; --line: #e5e7eb;
    --panel: #f7f8fa; --accent: #b8763a; --accent-soft: #f0d9c2;
  }
  body { background: var(--bg); color: var(--fg); font: 15px/1.55 ui-sans-serif, system-ui, sans-serif;
         margin: 0; padding: 2.5rem 1.25rem 4rem; }
  .wrap { max-width: 62rem; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin: 0 0 .25rem; letter-spacing: -.01em; }
  .meta { color: var(--muted); font-size: .85rem; margin: 0 0 2rem; }
  h2 { font-size: 1rem; margin: 2.5rem 0 .35rem; text-transform: uppercase;
       letter-spacing: .06em; color: var(--muted); }
  .sub { margin: 0 0 .75rem; color: var(--muted); font-size: .85rem; }
  .cards { display: grid; gap: .75rem; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); }
  .card { background: var(--panel); border: 1px solid var(--line); border-radius: .6rem; padding: .85rem .95rem; }
  .card-label { display: block; font-size: .72rem; text-transform: uppercase;
                letter-spacing: .06em; color: var(--muted); }
  .card-value { display: block; font-size: 1.35rem; margin-top: .2rem; font-variant-numeric: tabular-nums; }
  .card-hint { display: block; font-size: .75rem; color: var(--muted); margin-top: .15rem; }
  .hero .card-value { color: var(--accent); font-size: 1.9rem; }
  .scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: .87rem; }
  th, td { padding: .45rem .6rem; border-bottom: 1px solid var(--line); text-align: left; }
  th { font-size: .72rem; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); font-weight: 600; }
  td.n, th.n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  td.strong { font-weight: 600; }
  td.muted { color: var(--muted); }
  td.label { position: relative; min-width: 16rem; }
  .track { position: absolute; inset: .35rem auto .35rem .35rem; width: calc(100% - .7rem);
           background: transparent; border-radius: .25rem; overflow: hidden; }
  .fill { display: block; height: 100%; background: var(--accent-soft); }
  td.label .text { position: relative; }
  .note { margin-top: 2.5rem; padding: 1rem 1.1rem; background: var(--panel);
          border: 1px solid var(--line); border-radius: .6rem; color: var(--muted); font-size: .85rem; }
  code { font-family: ui-monospace, monospace; font-size: .85em; }
</style>
<div class="wrap">
  <h1>Taxímetro de tokens</h1>
  <p class="meta">Gerado em ${escape(generated)} · período medido ${escape(dateTime(agg.firstTs))} → ${escape(dateTime(agg.lastTs))}${
    t.estimated ? ' · contém modelo fora da tabela de preços (custo estimado)' : ''
  }</p>

  <div class="cards hero">
    ${card(
      'Custo real',
      moneyShort(t.cost),
      [moneyBrl(t.cost, options.fx), `${num(t.requests)} requisições de API`]
        .filter(Boolean)
        .join(' · '),
    )}
    ${card('Sem cache seria', moneyShort(savings.fullPrice), `economia de ${moneyShort(savings.saved)}`)}
    ${card('Tokens brutos (entrada)', num(t.rawInput), `${percent(savings.ratio)} disso foi realmente cobrado`)}
    ${card('Tokens de saída', num(t.output), 'a parte mais cara por token')}
  </div>

  <div class="cards" style="margin-top:.75rem">
    ${card('Custo de entrada', moneyShort(t.costInput), `${num(t.cacheRead)} tokens lidos do cache`)}
    ${card('Custo de saída', moneyShort(t.costOutput), 'texto gerado pelo modelo')}
    ${card('Por requisição', moneyShort(t.requests ? t.cost / t.requests : 0), 'média')}
    ${card(
      'Por pedido seu',
      moneyShort(agg.byTurn.length ? t.cost / agg.byTurn.length : 0),
      `${num(agg.byTurn.length)} pedidos medidos`,
    )}
  </div>

  ${section('Por dia', 'Série temporal do gasto.', agg.byDay, options, 'Dia', 14)}
  ${section('Por projeto', null, agg.byProject, options, 'Projeto', 40)}
  ${section('Por modelo', 'Preço por MTok difere bastante entre famílias.', agg.byModel, options, 'Modelo', 40)}
  ${section('Por sessão', null, sessionRows, options, 'Projeto · branch · sessão · última atividade', 70)}
  ${section('Por pedido', 'Quanto custou cada coisa que você pediu.', turnRows, options, 'Pedido', 90)}

  <div class="note">
    <strong>Por que este número é menor que o contador da conversa.</strong>
    O indicador que aparece em cada conversa mostra o tamanho do contexto acumulado —
    ele soma o histórico inteiro a cada turno. Aqui cada requisição de API é contada
    uma única vez (o transcript repete a mesma requisição em várias linhas) e os tokens
    lidos do cache entram a 10% do preço, escrita de cache a 1,25× (TTL 5min) ou 2× (TTL 1h).
    A coluna <em>Cobrado/bruto</em> mostra essa razão. Preços em
    <code>${escape(options.pricingFile)}</code>.
  </div>
</div>`
}
