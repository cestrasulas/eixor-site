const currency = (code, digits) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

// Duas casas para valores de US$ 1 ou mais, quatro para centavos de dolar.
// Casas variaveis viram ambiguidade em pt-BR: "US$ 7,356" parece 7 mil.
const usd2 = currency('USD', 2)
const usd4 = currency('USD', 4)
const brl2 = currency('BRL', 2)
const brl4 = currency('BRL', 4)
const int = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 })

export function money(value, fx) {
  const base = moneyShort(value)
  if (!fx) return base
  const converted = value * fx
  return `${base} (${Math.abs(converted) >= 1 ? brl2.format(converted) : brl4.format(converted)})`
}

export function moneyShort(value) {
  return Math.abs(value) >= 1 ? usd2.format(value) : usd4.format(value)
}

export function moneyBrl(value, fx) {
  if (!fx) return null
  const converted = value * fx
  return Math.abs(converted) >= 1 ? brl2.format(converted) : brl4.format(converted)
}

export function tokens(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace('.', ',')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.', ',')}k`
  return int.format(Math.round(value))
}

export function num(value) {
  return int.format(Math.round(value))
}

export function percent(value) {
  return pct.format(value)
}

export function dateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function duration(ms) {
  if (!ms || ms < 0) return '—'
  const min = Math.floor(ms / 60000)
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  return `${h}h ${min % 60}min`
}

export function truncate(text, max) {
  const flat = String(text ?? '')
  if (flat.length <= max) return flat
  return `${flat.slice(0, max - 1)}…`
}

// Tabela simples de largura fixa. align: 'l' | 'r'
export function table(headers, rows, aligns = []) {
  const widths = headers.map((h, i) =>
    Math.max(String(h).length, ...rows.map((r) => String(r[i] ?? '').length)),
  )
  const pad = (value, i) => {
    const text = String(value ?? '')
    const width = widths[i]
    return aligns[i] === 'r' ? text.padStart(width) : text.padEnd(width)
  }
  const lines = [
    headers.map((h, i) => pad(h, i)).join('  '),
    widths.map((w) => '─'.repeat(w)).join('  '),
    ...rows.map((r) => r.map((cell, i) => pad(cell, i)).join('  ')),
  ]
  return lines.map((l) => `  ${l.trimEnd()}`).join('\n')
}

export function bar(value, max, width = 20) {
  if (!max) return ''
  const filled = Math.max(value > 0 ? 1 : 0, Math.round((value / max) * width))
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled))
}
