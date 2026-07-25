import { cacheSavings } from './cost.js'
import {
  bar,
  dateTime,
  duration,
  money,
  moneyShort,
  num,
  percent,
  table,
  tokens,
  truncate,
} from './format.js'

function heading(text) {
  return `\n\x1b[1m${text}\x1b[0m`
}

function dim(text) {
  return `\x1b[2m${text}\x1b[0m`
}

function summaryBlock(agg, options) {
  const t = agg.totals
  const savings = cacheSavings(t)
  const spanMs =
    agg.firstTs && agg.lastTs ? new Date(agg.lastTs) - new Date(agg.firstTs) : 0
  const perHour = spanMs > 3600_000 ? t.cost / (spanMs / 3600_000) : null

  const lines = [
    heading('RESUMO'),
    `  Custo real cobrado ......... ${money(t.cost, options.fx)}`,
    `    entrada .................. ${money(t.costInput, options.fx)}`,
    `    saída .................... ${money(t.costOutput, options.fx)}`,
  ]
  if (t.costServerTools > 0) {
    lines.push(`    ferramentas server-side .. ${money(t.costServerTools, options.fx)}`)
  }
  lines.push(
    '',
    `  Tokens brutos .............. ${num(t.rawInput)} entrada + ${num(t.output)} saída`,
    `  Tokens equivalentes ........ ${num(t.billedInputEquivalent)} entrada (${percent(savings.ratio)} do bruto)`,
    `  Economia do cache .......... ${money(savings.saved, options.fx)} — sem cache seria ${money(savings.fullPrice, options.fx)}`,
    '',
    `  Requisições de API ......... ${num(t.requests)}`,
    `  Custo médio por requisição . ${money(t.requests ? t.cost / t.requests : 0, options.fx)}`,
  )
  if (agg.byTurn.length) {
    lines.push(
      `  Custo médio por pedido ..... ${money(t.cost / agg.byTurn.length, options.fx)} (${num(agg.byTurn.length)} pedidos)`,
    )
  }
  if (agg.subagents.requests) {
    lines.push(
      `  Subagentes ................. ${money(agg.subagents.cost, options.fx)} (${percent(t.cost ? agg.subagents.cost / t.cost : 0)} do total, ${num(agg.subagents.requests)} req)`,
    )
  }
  if (t.webSearch || t.webFetch) {
    lines.push(`  Buscas web / fetch ......... ${num(t.webSearch)} / ${num(t.webFetch)}`)
  }
  lines.push(
    '',
    `  Período .................... ${dateTime(agg.firstTs)} → ${dateTime(agg.lastTs)} (${duration(spanMs)})`,
  )
  if (perHour) {
    lines.push(`  Ritmo médio ................ ${money(perHour, options.fx)}/hora`)
  }
  if (t.estimated) {
    lines.push(
      dim('\n  (?) Algum modelo não está na tabela de preços — custo estimado pelo fallback.'),
    )
  }
  return lines.join('\n')
}

function breakdownTable(title, rows, options, labelHeader, labelWidth = 42) {
  if (!rows.length) return ''
  const max = rows[0].totals.cost
  const body = rows.slice(0, options.limit).map((row) => [
    truncate(row.label, labelWidth),
    moneyShort(row.totals.cost),
    options.fx ? (row.totals.cost * options.fx).toFixed(2).replace('.', ',') : null,
    num(row.totals.requests),
    tokens(row.totals.rawInput),
    tokens(row.totals.output),
    bar(row.totals.cost, max, 14),
  ])
  const headers = [labelHeader, 'Custo US$', options.fx ? 'R$' : null, 'Req', 'Entrada', 'Saída', '']
  const aligns = ['l', 'r', options.fx ? 'r' : null, 'r', 'r', 'r', 'l']
  const keep = (arr) => arr.filter((v) => v !== null)
  const hidden = rows.length - Math.min(rows.length, options.limit)

  return [
    heading(title),
    table(keep(headers), body.map(keep), keep(aligns)),
    hidden > 0 ? dim(`  … e mais ${hidden} linha(s). Use --limit para ver mais.`) : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function renderReport(agg, options) {
  const parts = [summaryBlock(agg, options)]

  if (options.by.includes('day')) {
    parts.push(breakdownTable('POR DIA', agg.byDay, options, 'Dia', 12))
  }
  if (options.by.includes('project')) {
    parts.push(breakdownTable('POR PROJETO', agg.byProject, options, 'Projeto', 30))
  }
  if (options.by.includes('model')) {
    parts.push(breakdownTable('POR MODELO', agg.byModel, options, 'Modelo', 30))
  }
  if (options.by.includes('session')) {
    const rows = agg.bySession.map((s) => ({
      ...s,
      label: `${truncate(s.label, 8)} · ${s.project}${s.branch ? ` · ${s.branch}` : ''}`,
    }))
    parts.push(breakdownTable('POR SESSÃO', rows, options, 'Sessão · projeto · branch', 44))
  }
  if (options.by.includes('turn')) {
    const rows = agg.byTurn.map((t) => ({ ...t, label: `#${t.index} ${t.label}` }))
    parts.push(
      breakdownTable('POR PEDIDO (o que cada coisa custou)', rows, options, 'Pedido', 58),
    )
  }

  parts.push(
    dim(
      `\n  Preços: ${options.pricingFile}` +
        (options.fx ? ` · câmbio USD→BRL: ${String(options.fx).replace('.', ',')}` : ''),
    ),
  )
  return parts.filter(Boolean).join('\n')
}
