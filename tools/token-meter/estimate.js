#!/usr/bin/env node
// Estimador de custo por peca/tarefa.
// Serve para responder "quanto custa uma inicial?" ANTES de rodar, ou para
// reconstruir o custo de uma peca que ja foi feita mas cujo transcript nao
// existe mais (sessao em container efemero, ou trabalho feito no app/site).
//
// O modelo de custo segue o que a cobranca faz de verdade:
//   turno 1  -> contexto inteiro escrito em cache (1,25x ou 2x) + saida
//   turno N  -> contexto lido do cache (0,1x) + o que mudou + saida
//   saida    -> inclui o thinking, que e cobrado como saida e nao aparece na tela
import fs from 'node:fs'
import path from 'node:path'

import { costOfRequest } from './lib/cost.js'
import { money, moneyBrl, moneyShort, num, percent, table } from './lib/format.js'
import { comparePlans, suggestPlan } from './lib/plans.js'
import { loadPricing } from './lib/pricing.js'

const HELP = `
Estimador de custo por peça — quanto custa (ou custou) uma tarefa específica.

  node tools/token-meter/estimate.js [opções]

Tamanho da peça produzida (escolha uma forma)
  --pages <n>              páginas da peça final (padrão: 350 palavras/página)
  --words <n>              palavras da peça final
  --file <arquivo>         mede um arquivo .txt/.md real já produzido

Documentos que entram (o que você anexa/manda ler)
  --docs-pages <n>         páginas de documentos anexados
  --docs-words <n>         palavras de documentos anexados
  --docs-file <a,b,c>      arquivos .txt/.md reais

Forma de trabalho
  --turns <n>              idas e voltas de revisão (padrão: 3)
  --skill <nome>           overhead da skill: adconsum, adcontrat, adimob, docx, nenhuma
  --model <id>             padrão: claude-opus-5
  --thinking <0..1>        fração da saída que é raciocínio (padrão: 0.5)
  --cache-ttl <5m|1h>      TTL do cache (padrão: 1h, o que o Claude Code usa)

Cenários
  --compare                compara o mesmo trabalho em Opus 5, Sonnet 5 e Haiku 4.5
  --volume <n>             projeta para n peças por mês
  --fx [taxa]              mostra também em reais

  -h, --help               esta ajuda

Exemplos
  # Uma petição inicial de 18 páginas, com 40 páginas de documentos, 3 revisões
  node tools/token-meter/estimate.js --pages 18 --docs-pages 40 --skill adconsum

  # Mesma peça, comparando modelos, projetando 30 peças/mês, em reais
  node tools/token-meter/estimate.js --pages 18 --docs-pages 40 --compare --volume 30 --fx
`

// Overhead fixo de contexto, em tokens. Numeros medidos nos arquivos das skills
// instaladas e no proprio transcript do Claude Code.
const SKILL_OVERHEAD = {
  nenhuma: 0,
  adconsum: 1700,
  adcontrat: 1800,
  adimob: 2100,
  docx: 1700,
}
// Prompt de sistema + definicoes de ferramentas do Claude Code.
const HARNESS_OVERHEAD = 14000

function fail(message) {
  process.stderr.write(`\nErro: ${message}\n${HELP}\n`)
  process.exit(1)
}

function parseArgs(argv) {
  const o = {
    pages: null,
    words: null,
    file: null,
    docsPages: null,
    docsWords: null,
    docsFile: null,
    turns: 3,
    skill: 'nenhuma',
    model: 'claude-opus-5',
    thinking: null,
    cacheTtl: '1h',
    compare: false,
    volume: null,
    fx: null,
  }
  const next = (i) => (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null)
  const numArg = (i, name) => {
    const v = next(i)
    if (v === null) fail(`${name} precisa de um número`)
    const n = Number(v.replace(',', '.'))
    if (!Number.isFinite(n) || n < 0) fail(`${name} precisa de um número válido (recebi "${v}")`)
    return n
  }

  for (let i = 0; i < argv.length; i += 1) {
    switch (argv[i]) {
      case '-h':
      case '--help':
        process.stdout.write(`${HELP}\n`)
        process.exit(0)
        break
      case '--pages': o.pages = numArg(i, '--pages'); i += 1; break
      case '--words': o.words = numArg(i, '--words'); i += 1; break
      case '--file': o.file = next(i); i += 1; break
      case '--docs-pages': o.docsPages = numArg(i, '--docs-pages'); i += 1; break
      case '--docs-words': o.docsWords = numArg(i, '--docs-words'); i += 1; break
      case '--docs-file': o.docsFile = (next(i) || '').split(',').filter(Boolean); i += 1; break
      case '--turns': o.turns = Math.max(1, numArg(i, '--turns')); i += 1; break
      case '--skill': o.skill = (next(i) || 'nenhuma').toLowerCase(); i += 1; break
      case '--model': o.model = next(i) || o.model; i += 1; break
      case '--thinking': o.thinking = numArg(i, '--thinking'); i += 1; break
      case '--cache-ttl': o.cacheTtl = next(i) === '5m' ? '5m' : '1h'; i += 1; break
      case '--compare': o.compare = true; break
      case '--volume': o.volume = numArg(i, '--volume'); i += 1; break
      case '--fx': {
        const v = next(i)
        o.fx = v ? Number(v.replace(',', '.')) : true
        if (v) i += 1
        break
      }
      default:
        if (argv[i].startsWith('-')) fail(`opção desconhecida: ${argv[i]}`)
    }
  }
  if (!(o.pages || o.words || o.file)) {
    fail('diga o tamanho da peça: --pages, --words ou --file')
  }
  if (!SKILL_OVERHEAD[o.skill] && o.skill !== 'nenhuma') {
    fail(`skill desconhecida: ${o.skill}. Use ${Object.keys(SKILL_OVERHEAD).join(', ')}`)
  }
  return o
}

function wordsOfFiles(files) {
  let words = 0
  for (const file of files) {
    let text
    try {
      text = fs.readFileSync(file, 'utf8')
    } catch (error) {
      fail(`não consegui ler ${file}: ${error.message}`)
    }
    if (/\.(docx|pdf|doc)$/i.test(file)) {
      fail(
        `${path.basename(file)} é binário e não dá para contar palavras direto.\n` +
          '  Salve como .txt/.md, ou passe o número de páginas com --pages / --docs-pages.',
      )
    }
    words += text.split(/\s+/).filter(Boolean).length
  }
  return words
}

// Converte tamanho informado (paginas, palavras ou arquivo) em tokens.
function toTokens(opts, pricing, { pages, words, files }) {
  const cfg = pricing.textEstimate
  const newTokenizer = /opus-(5|4-[78])|sonnet-5|fable-5|mythos-5/.test(opts.model)
  const perWord = newTokenizer ? cfg.tokensPerWordNewTokenizer : cfg.tokensPerWordOldTokenizer
  let totalWords = 0
  if (files && files.length) totalWords += wordsOfFiles(files)
  if (words) totalWords += words
  if (pages) totalWords += pages * cfg.wordsPerPage
  return { words: totalWords, tokens: Math.round(totalWords * perWord), perWord }
}

// Monta as requisicoes que a tarefa geraria e soma o custo real de cada uma.
function simulate(opts, pricing, model) {
  const out = toTokens({ ...opts, model }, pricing, {
    pages: opts.pages,
    words: opts.words,
    files: opts.file ? [opts.file] : null,
  })
  const docs = toTokens({ ...opts, model }, pricing, {
    pages: opts.docsPages,
    words: opts.docsWords,
    files: opts.docsFile,
  })

  const thinkingShare =
    opts.thinking === null ? pricing.textEstimate.thinkingShareOfOutput : opts.thinking
  // A peca aparece na tela; o thinking e cobrado junto e nao aparece.
  const outputPerTurn = Math.round(out.tokens / (1 - Math.min(0.95, thinkingShare)))

  const fixedContext = fixedContextFor(opts)
  const baseContext = fixedContext + docs.tokens
  const writeKey = opts.cacheTtl === '5m' ? 'cacheWrite5m' : 'cacheWrite1h'

  const requests = []
  let carried = baseContext
  for (let turn = 1; turn <= opts.turns; turn += 1) {
    const tokens = {
      input: 0,
      output: outputPerTurn,
      cacheWrite5m: 0,
      cacheWrite1h: 0,
      cacheRead: 0,
    }
    if (turn === 1) {
      // Primeiro turno paga a escrita do contexto no cache
      tokens[writeKey] = baseContext
    } else {
      // Turnos seguintes leem o que ja esta em cache e escrevem o que cresceu:
      // a peca anterior e o novo pedido de revisao entram no contexto.
      tokens.cacheRead = carried
      tokens[writeKey] = outputPerTurn + 200
    }
    carried += outputPerTurn + 200
    requests.push({
      model,
      speed: 'standard',
      tokens,
      serverTools: { webSearch: 0, webFetch: 0 },
    })
  }

  let cost = 0
  const totals = { input: 0, output: 0, write: 0, read: 0 }
  for (const request of requests) {
    cost += costOfRequest(pricing, request).cost
    totals.output += request.tokens.output
    totals.write += request.tokens.cacheWrite5m + request.tokens.cacheWrite1h
    totals.read += request.tokens.cacheRead
  }

  return {
    model,
    cost,
    requests: requests.length,
    out,
    docs,
    fixedContext,
    outputPerTurn,
    thinkingShare,
    totals,
  }
}

function fixedContextFor(opts) {
  return HARNESS_OVERHEAD + (SKILL_OVERHEAD[opts.skill] || 0)
}

function render(result, opts) {
  const lines = []
  const b = (text) => `\x1b[1m${text}\x1b[0m`
  const d = (text) => `\x1b[2m${text}\x1b[0m`

  lines.push(b('\nESTIMATIVA DE UMA PEÇA'))
  lines.push(`  Modelo ..................... ${result.model}`)
  lines.push(
    `  Peça produzida ............. ${num(result.out.words)} palavras ≈ ${num(result.out.tokens)} tokens visíveis`,
  )
  lines.push(
    `  Raciocínio (thinking) ...... +${num(result.outputPerTurn - result.out.tokens)} tokens por turno ` +
      d(`(${percent(result.thinkingShare)} da saída, cobrado como saída)`),
  )
  lines.push(
    `  Documentos de entrada ...... ${num(result.docs.words)} palavras ≈ ${num(result.docs.tokens)} tokens`,
  )
  lines.push(
    `  Overhead fixo .............. ${num(result.fixedContext)} tokens ` +
      d(`(prompt de sistema + ferramentas + skill ${opts.skill})`),
  )
  lines.push(`  Idas e voltas .............. ${result.requests}`)
  lines.push('')
  lines.push(`  ${b('CUSTO ESTIMADO')} ............. ${b(money(result.cost, opts.fx))}`)
  lines.push('')
  lines.push(
    d(
      `  Composição: ${num(result.totals.write)} tokens escritos em cache, ` +
        `${num(result.totals.read)} lidos do cache, ${num(result.totals.output)} de saída.`,
    ),
  )
  return lines.join('\n')
}

function renderCompare(results, opts) {
  const rows = results.map((r) => [
    r.model,
    moneyShort(r.cost),
    opts.fx ? moneyBrl(r.cost, opts.fx) : null,
    opts.volume ? moneyShort(r.cost * opts.volume) : null,
    opts.volume && opts.fx ? moneyBrl(r.cost * opts.volume, opts.fx) : null,
  ])
  const headers = [
    'Modelo',
    'Por peça',
    opts.fx ? 'Por peça R$' : null,
    opts.volume ? `${opts.volume}/mês` : null,
    opts.volume && opts.fx ? `${opts.volume}/mês R$` : null,
  ]
  const keep = (arr) => arr.filter((v) => v !== null)
  const aligns = ['l', 'r', 'r', 'r', 'r']
  return [
    `\x1b[1m\nCOMPARATIVO DE MODELOS\x1b[0m`,
    table(keep(headers), rows.map(keep), aligns),
    `\x1b[2m  A peça é a mesma; muda só o preço por MTok do modelo.\x1b[0m`,
  ].join('\n')
}

function renderVolume(result, opts, pricing) {
  if (!opts.volume) return ''
  const monthly = result.cost * opts.volume
  const lines = [`\x1b[1m\nPROJEÇÃO MENSAL\x1b[0m`]
  lines.push(`  ${opts.volume} peças/mês × ${moneyShort(result.cost)} = ${money(monthly, opts.fx)}`)
  lines.push('')
  lines.push(comparePlans(monthly, pricing, opts.fx))
  lines.push('')
  lines.push(`  \x1b[1mSugestão:\x1b[0m ${suggestPlan(monthly, pricing)}`)
  lines.push(
    '\x1b[2m  Assinatura não é medida em tokens: o limite é por janela de 5h e teto semanal,\n' +
      '  e app + site + Claude Code saem do mesmo bolso. Use isto como ordem de grandeza.\x1b[0m',
  )
  return lines.join('\n')
}

function main() {
  const opts = parseArgs(process.argv.slice(2))
  const pricing = loadPricing()
  if (opts.fx === true) opts.fx = pricing.fxUsdBrl || null
  else if (opts.fx !== null && !Number.isFinite(opts.fx)) opts.fx = pricing.fxUsdBrl || null

  const primary = simulate(opts, pricing, opts.model)
  process.stdout.write(`${render(primary, opts)}\n`)

  if (opts.compare) {
    const models = ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5']
    const results = models.map((m) => simulate(opts, pricing, m))
    process.stdout.write(`${renderCompare(results, opts)}\n`)
  }

  const volume = renderVolume(primary, opts, pricing)
  if (volume) process.stdout.write(`${volume}\n`)

  process.stdout.write(
    `\n\x1b[2m  Estimativa, não fatura. Base: ${path.basename(pricing.file)} · ` +
      `${primary.out.perWord} tokens/palavra · ${pricing.textEstimate.wordsPerPage} palavras/página.\n` +
      `  Para medir o custo real de verdade, rode o meter durante o trabalho.\x1b[0m\n`,
  )
}

main()
