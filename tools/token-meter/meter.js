#!/usr/bin/env node
// Taximetro de tokens do Claude Code.
// Le os transcripts em ~/.claude/projects e mostra tokens + custo real por
// projeto, sessao, dia, modelo e por pedido individual.
import fs from 'node:fs'
import path from 'node:path'

import { aggregate, cacheSavings, costOfRequest } from './lib/cost.js'
import { dateTime, money, moneyShort, num, percent, tokens } from './lib/format.js'
import { renderHtml } from './lib/html.js'
import { loadPricing } from './lib/pricing.js'
import { renderPlanSection } from './lib/plans.js'
import { renderReport } from './lib/report.js'
import { defaultProjectsRoot, listTranscripts, parseTranscript } from './lib/transcripts.js'

const HELP = `
Taxímetro de tokens — quanto cada coisa consumiu e custou.

  node tools/token-meter/meter.js [opções]

Recortes
  --today                  só hoje
  --since <5d|12h|30m|ISO> a partir de um ponto no tempo
  --project <texto>        filtra projeto por trecho do nome (padrão: todos)
  --here                   só o projeto do diretório atual
  --session <id>           só uma sessão (aceita prefixo do id)
  --by <a,b,c>             quebras: day, project, model, session, turn
                           (padrão: day,project,model,session)
  --limit <n>              linhas por tabela (padrão: 12)

Saídas
  --watch [ms]             taxímetro ao vivo no terminal (padrão: 2000ms)
  --html [arquivo]         dashboard HTML (padrão: token-meter-report.html)
  --plan                   compara o consumo medido com Free/Pro/Max 5x/Max 20x
  --json                   dados crus em JSON
  --csv <arquivo>          uma linha por requisição de API

Preço
  --fx [taxa]              mostra também em BRL (padrão: fxUsdBrl do pricing.json)
  --pricing <arquivo>      usa outra tabela de preços
  --root <dir>             outra pasta de transcripts

  -h, --help               esta ajuda
`

function parseArgs(argv) {
  const opts = {
    by: ['day', 'project', 'model', 'session'],
    limit: 12,
    watch: null,
    html: null,
    json: false,
    plan: false,
    csv: null,
    fx: null,
    project: null,
    session: null,
    since: null,
    pricing: null,
    root: null,
    here: false,
  }
  const next = (i) => (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null)

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    switch (arg) {
      case '-h':
      case '--help':
        process.stdout.write(`${HELP}\n`)
        process.exit(0)
        break
      case '--today':
        opts.since = startOfToday()
        break
      case '--since': {
        const value = next(i)
        if (!value) fail('--since precisa de um valor, ex: --since 7d')
        opts.since = parseSince(value)
        i += 1
        break
      }
      case '--project':
        opts.project = next(i)
        if (!opts.project) fail('--project precisa de um valor')
        i += 1
        break
      case '--here':
        opts.here = true
        break
      case '--session':
        opts.session = next(i)
        if (!opts.session) fail('--session precisa de um id')
        i += 1
        break
      case '--by': {
        const value = next(i)
        if (!value) fail('--by precisa de uma lista, ex: --by day,turn')
        opts.by = value.split(',').map((s) => s.trim()).filter(Boolean)
        i += 1
        break
      }
      case '--limit':
        opts.limit = Number(next(i)) || opts.limit
        i += 1
        break
      case '--watch': {
        const value = next(i)
        opts.watch = value ? Number(value) || 2000 : 2000
        if (value) i += 1
        break
      }
      case '--html': {
        const value = next(i)
        opts.html = value || 'token-meter-report.html'
        if (value) i += 1
        break
      }
      case '--json':
        opts.json = true
        break
      case '--plan':
        opts.plan = true
        break
      case '--csv':
        opts.csv = next(i)
        if (!opts.csv) fail('--csv precisa de um arquivo de saída')
        i += 1
        break
      case '--fx': {
        const value = next(i)
        opts.fx = value ? Number(value.replace(',', '.')) : true
        if (value) i += 1
        break
      }
      case '--pricing':
        opts.pricing = next(i)
        i += 1
        break
      case '--root':
        opts.root = next(i)
        i += 1
        break
      default:
        if (arg.startsWith('-')) fail(`opção desconhecida: ${arg}`)
    }
  }
  return opts
}

function fail(message) {
  process.stderr.write(`\nErro: ${message}\n${HELP}\n`)
  process.exit(1)
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function parseSince(value) {
  const relative = /^(\d+(?:[.,]\d+)?)([mhdw])$/i.exec(value.trim())
  if (relative) {
    const amount = Number(relative[1].replace(',', '.'))
    const unit = relative[2].toLowerCase()
    const ms = { m: 60_000, h: 3600_000, d: 86_400_000, w: 604_800_000 }[unit]
    return new Date(Date.now() - amount * ms).toISOString()
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) fail(`não entendi a data "${value}" (tente 7d, 12h ou 2026-07-01)`)
  return parsed.toISOString()
}

// Cache por arquivo: no modo --watch so reprocessa o que mudou de mtime.
const parseCache = new Map()

function loadSessions(opts) {
  const root = opts.root || defaultProjectsRoot()
  if (!fs.existsSync(root)) {
    fail(
      `não encontrei os transcripts em ${root}.\n` +
        'Aponte outra pasta com --root ou defina CLAUDE_PROJECTS_DIR.',
    )
  }

  const sessions = []
  for (const source of listTranscripts(root)) {
    const cached = parseCache.get(source.file)
    let parsed
    if (cached && cached.mtimeMs === source.mtimeMs && cached.size === source.size) {
      parsed = cached.parsed
    } else {
      parsed = parseTranscript(source)
      if (parsed) parseCache.set(source.file, { mtimeMs: source.mtimeMs, size: source.size, parsed })
    }
    if (!parsed) continue

    if (opts.session && !parsed.sessionId.startsWith(opts.session)) continue
    if (opts.project && !matches(parsed, opts.project)) continue
    if (opts.here && parsed.cwd !== process.cwd()) continue

    const requests = opts.since
      ? parsed.requests.filter((r) => r.timestamp && r.timestamp >= opts.since)
      : parsed.requests
    if (!requests.length) continue

    sessions.push({ ...parsed, requests })
  }
  return { root, sessions }
}

function matches(parsed, needle) {
  const term = needle.toLowerCase()
  return (
    parsed.project.toLowerCase().includes(term) ||
    String(parsed.cwd || '').toLowerCase().includes(term)
  )
}

function resolveFx(opts, pricing) {
  if (opts.fx === null) return null
  if (opts.fx === true) return pricing.fxUsdBrl || null
  return Number.isFinite(opts.fx) ? opts.fx : null
}

function writeCsv(file, sessions, pricing) {
  const header = [
    'timestamp',
    'projeto',
    'sessao',
    'branch',
    'turno',
    'pedido',
    'modelo',
    'velocidade',
    'esforco',
    'subagente',
    'tokens_entrada',
    'cache_escrita_5m',
    'cache_escrita_1h',
    'cache_leitura',
    'tokens_saida',
    'entrada_equivalente',
    'custo_usd',
  ]
  const lines = [header.join(',')]
  for (const session of sessions) {
    for (const r of session.requests) {
      const c = costOfRequest(pricing, r)
      lines.push(
        [
          r.timestamp || '',
          csv(r.project),
          r.sessionId,
          csv(r.gitBranch || ''),
          r.turnIndex,
          csv(r.turnLabel),
          csv(r.model),
          r.speed,
          r.effort || '',
          r.isSidechain ? 'sim' : 'nao',
          r.tokens.input,
          r.tokens.cacheWrite5m,
          r.tokens.cacheWrite1h,
          r.tokens.cacheRead,
          r.tokens.output,
          Math.round(c.inputEquivalent),
          c.cost.toFixed(6),
        ].join(','),
      )
    }
  }
  fs.writeFileSync(file, `${lines.join('\n')}\n`)
  return lines.length - 1
}

function csv(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

// ─── taxímetro ao vivo ────────────────────────────────────────────────────────

function renderLive(agg, opts, sessions) {
  const t = agg.totals
  const savings = cacheSavings(t)
  const now = new Date()
  const todayStart = startOfToday()

  const todayCost = agg.byDay
    .filter((d) => d.key >= todayStart.slice(0, 10))
    .reduce((sum, d) => sum + d.totals.cost, 0)

  const latest = sessions
    .filter((s) => s.updatedAt)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0]
  const activeTurn = latest
    ? agg.byTurn
        .filter((x) => x.sessionId === latest.sessionId)
        .sort((a, b) => b.index - a.index)[0]
    : null

  // Ritmo dos ultimos 10 minutos, para o gasto "agora"
  const cutoff = new Date(Date.now() - 600_000).toISOString()
  let recentCost = 0
  for (const session of sessions) {
    for (const r of session.requests) {
      if (r.timestamp && r.timestamp >= cutoff) {
        recentCost += costOfRequest(agg.pricing, r).cost
      }
    }
  }

  const width = 64
  const line = (text = '') => `\x1b[2m│\x1b[0m ${text}`
  const top = `\x1b[2m┌${'─'.repeat(width)}\x1b[0m`
  const bottom = `\x1b[2m└${'─'.repeat(width)}\x1b[0m`
  const label = (text) => `\x1b[2m${text.padEnd(13)}\x1b[0m`

  const out = [
    top,
    line(`\x1b[1mTAXÍMETRO\x1b[0m  ${latest ? `${latest.project} · ${latest.sessionId.slice(0, 8)}` : 'aguardando atividade'}`),
    line(),
    line(`${label('Total')}\x1b[1m\x1b[33m${money(t.cost, opts.fx)}\x1b[0m`),
    line(`${label('Hoje')}${money(todayCost, opts.fx)}`),
    line(`${label('Últ. 10min')}${money(recentCost, opts.fx)}  \x1b[2m≈ ${moneyShort(recentCost * 6)}/h nesse ritmo\x1b[0m`),
    line(),
  ]

  if (activeTurn) {
    out.push(
      line(`${label('Pedido atual')}#${activeTurn.index} — ${money(activeTurn.totals.cost, opts.fx)}`),
      line(`${label('')}\x1b[2m${activeTurn.label.slice(0, width - 16)}\x1b[0m`),
      line(),
    )
  }

  out.push(
    line(`${label('Requisições')}${num(t.requests)}`),
    line(`${label('Entrada')}${num(t.rawInput)} brutos → ${num(t.billedInputEquivalent)} cobrados \x1b[2m(${percent(savings.ratio)})\x1b[0m`),
    line(`${label('Saída')}${num(t.output)} tokens`),
    line(`${label('Cache poupou')}${money(savings.saved, opts.fx)}`),
    line(),
    line(`\x1b[2m${now.toLocaleTimeString('pt-BR')} · atualiza a cada ${opts.watch}ms · Ctrl+C para sair\x1b[0m`),
    bottom,
  )
  return out.join('\n')
}

async function watch(opts, pricing) {
  const tick = () => {
    const { sessions } = loadSessions(opts)
    const agg = aggregate(pricing, sessions)
    agg.pricing = pricing
    // Limpa a tela e reposiciona o cursor
    process.stdout.write('\x1b[2J\x1b[H')
    process.stdout.write(`${renderLive(agg, opts, sessions)}\n`)
  }

  process.stdout.write('\x1b[?25l') // esconde o cursor
  const restore = () => {
    process.stdout.write('\x1b[?25h\n')
    process.exit(0)
  }
  process.on('SIGINT', restore)
  process.on('SIGTERM', restore)

  tick()
  setInterval(tick, opts.watch)
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv.slice(2))

  let pricing
  try {
    pricing = loadPricing(opts.pricing)
  } catch (error) {
    fail(`não consegui ler a tabela de preços: ${error.message}`)
  }
  opts.fx = resolveFx(opts, pricing)
  opts.pricingFile = path.relative(process.cwd(), pricing.file) || pricing.file

  if (opts.watch) {
    await watch(opts, pricing)
    return
  }

  const { root, sessions } = loadSessions(opts)
  if (!sessions.length) {
    process.stdout.write(
      `\nNenhuma requisição encontrada com esses filtros.\n  transcripts: ${root}\n`,
    )
    return
  }

  const agg = aggregate(pricing, sessions)

  if (opts.json) {
    process.stdout.write(`${JSON.stringify({ ...agg, pricingFile: pricing.file }, null, 2)}\n`)
    return
  }

  if (opts.csv) {
    const count = writeCsv(opts.csv, sessions, pricing)
    process.stdout.write(`\n${count} requisições escritas em ${opts.csv}\n`)
    return
  }

  if (opts.html) {
    fs.writeFileSync(opts.html, renderHtml(agg, opts))
    process.stdout.write(
      `\nDashboard salvo em ${opts.html}\n` +
        `  ${moneyShort(agg.totals.cost)} · ${num(agg.totals.requests)} requisições · ` +
        `${tokens(agg.totals.rawInput)} tokens de entrada\n` +
        `  último dado: ${dateTime(agg.lastTs)}\n`,
    )
    return
  }

  process.stdout.write(`${renderReport(agg, opts)}\n`)
  if (opts.plan) {
    process.stdout.write(`${renderPlanSection(agg, opts, pricing)}\n`)
  }
}

main().catch((error) => {
  process.stderr.write(`\nFalhou: ${error.stack || error.message}\n`)
  process.exit(1)
})
