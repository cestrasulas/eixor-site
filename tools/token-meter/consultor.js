#!/usr/bin/env node
// Consultor: antes de gastar, entenda o que voce precisa e quanto vai custar.
//
// Faz tres perguntas que a maioria das pessoas so responde depois de já ter
// gasto: que tipo de tarefa é essa, qual modelo cabe nela, e quanto isso
// custa. Reaproveita o motor de calculo do estimate.js — nao reinventa a
// conta, so decide os parametros a partir de um questionario.
import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline/promises'

import { money, moneyBrl, moneyShort, num, table } from './lib/format.js'
import { comparePlans, suggestPlan } from './lib/plans.js'
import { loadPricing } from './lib/pricing.js'
import { simulate } from './estimate.js'

const HELP = `
Consultor — o que fazer, qual modelo usar, quanto vai custar.

Sem flags, abre um questionário guiado. Com --task, roda direto (bom para
repetir a mesma pergunta depois, ou para automatizar):

  node tools/token-meter/consultor.js
  node tools/token-meter/consultor.js --task inicial --pages 18 --docs-pages 40 --complexity padrao --fx

Tarefas (--task)
  inicial      Petição inicial
  contestacao  Contestação / defesa
  recurso      Recurso (apelação, agravo etc.)
  contrato     Contrato — elaborar ou revisar
  parecer      Parecer jurídico / due diligence
  pesquisa     Pesquisa rápida / resposta objetiva
  revisao      Revisão, resumo ou extração de documento
  codigo       Código / tarefa técnica
  outro        Você define o tamanho do zero

Ajustes finos (opcionais — sem eles, uso o padrão de cada tarefa)
  --pages <n>            páginas do resultado final
  --docs-pages <n>       páginas de documentos anexados
  --turns <n>            rodadas de revisão esperadas
  --complexity <nível>   simples | padrao | complexa (decide o modelo)
  --volume <n>           quantas dessas por mês, para projetar
  --fx [taxa]            mostra também em reais

  -h, --help             esta ajuda
`

// Cada tarefa carrega um tamanho e uma complexidade tipicos — voce pode
// sobrescrever qualquer um no questionario ou por flag.
const TASKS = [
  { id: 'inicial', label: 'Petição inicial', pages: 15, docsPages: 30, turns: 3, skill: 'adconsum', complexity: 'padrao' },
  { id: 'contestacao', label: 'Contestação / defesa', pages: 12, docsPages: 30, turns: 3, skill: 'adconsum', complexity: 'padrao' },
  { id: 'recurso', label: 'Recurso (apelação, agravo etc.)', pages: 10, docsPages: 60, turns: 3, skill: 'adconsum', complexity: 'complexa' },
  { id: 'contrato', label: 'Contrato — elaborar ou revisar', pages: 8, docsPages: 10, turns: 2, skill: 'adcontrat', complexity: 'padrao' },
  { id: 'parecer', label: 'Parecer jurídico / due diligence', pages: 6, docsPages: 25, turns: 2, skill: 'adimob', complexity: 'complexa' },
  { id: 'pesquisa', label: 'Pesquisa rápida / resposta objetiva', pages: 1, docsPages: 0, turns: 1, skill: 'nenhuma', complexity: 'simples' },
  { id: 'revisao', label: 'Revisão, resumo ou extração de documento', pages: 2, docsPages: 20, turns: 1, skill: 'nenhuma', complexity: 'simples' },
  { id: 'codigo', label: 'Código / tarefa técnica', pages: 3, docsPages: 5, turns: 8, skill: 'nenhuma', complexity: 'padrao' },
  { id: 'outro', label: 'Outro — eu digito o tamanho', pages: 5, docsPages: 10, turns: 3, skill: 'nenhuma', complexity: 'padrao' },
]

const COMPLEXITIES = [
  {
    id: 'simples',
    label: 'Simples — fato único, sem controvérsia, tarefa mecânica',
    model: 'claude-haiku-4-5',
    reason: 'Extrair, resumir, formatar ou responder algo direto não precisa do modelo mais caro.',
  },
  {
    id: 'padrao',
    label: 'Padrão — caso comum do dia a dia',
    model: 'claude-sonnet-5',
    reason: 'A maioria das peças-tipo sai com qualidade equivalente ao Opus por bem menos no preço de saída.',
  },
  {
    id: 'complexa',
    label: 'Complexa — múltiplas teses, valor alto, estratégia, fatos contraditórios',
    model: 'claude-opus-5',
    reason: 'Vale pagar mais quando o raciocínio mais profundo evita um erro caro — tese mal fundamentada, prazo, estratégia errada.',
  },
]

const MODEL_ORDER = ['claude-haiku-4-5', 'claude-sonnet-5', 'claude-opus-5']

function fail(message) {
  process.stderr.write(`\nErro: ${message}\n${HELP}\n`)
  process.exit(1)
}

function taskById(id) {
  return TASKS.find((t) => t.id === id)
}
function complexityById(id) {
  return COMPLEXITIES.find((c) => c.id === id)
}

function parseArgs(argv) {
  const o = { task: null, pages: null, docsPages: null, turns: null, complexity: null, volume: null, fx: null }
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
      case '--task': {
        const v = next(i)
        if (!v || !taskById(v)) {
          fail(`--task precisa ser uma destas: ${TASKS.map((t) => t.id).join(', ')}`)
        }
        o.task = v
        i += 1
        break
      }
      case '--pages': o.pages = numArg(i, '--pages'); i += 1; break
      case '--docs-pages': o.docsPages = numArg(i, '--docs-pages'); i += 1; break
      case '--turns': o.turns = Math.max(1, numArg(i, '--turns')); i += 1; break
      case '--complexity': {
        const v = next(i)
        if (!v || !complexityById(v)) fail('--complexity precisa ser: simples, padrao ou complexa')
        o.complexity = v
        i += 1
        break
      }
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
  return o
}

// ─── questionário interativo ──────────────────────────────────────────────

async function askMenu(rl, question, options, defaultIndex = 0) {
  console.log(`\n${question}`)
  options.forEach((opt, i) => {
    const mark = i === defaultIndex ? '›' : ' '
    console.log(`  ${mark} ${i + 1}. ${opt.label}`)
  })
  while (true) {
    const raw = (await rl.question(`  [${defaultIndex + 1}] > `)).trim()
    if (!raw) return options[defaultIndex]
    const n = Number(raw)
    if (Number.isInteger(n) && n >= 1 && n <= options.length) return options[n - 1]
    console.log(`  Digite um número de 1 a ${options.length}, ou Enter para o padrão.`)
  }
}

async function askNumber(rl, question, def) {
  const raw = (await rl.question(`\n${question} [${def}] > `)).trim()
  if (!raw) return def
  const n = Number(raw.replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) {
    console.log('  Número inválido — uso o padrão.')
    return def
  }
  return n
}

async function wizard() {
  const rl = createInterface({ input: stdin, output: stdout })
  console.log('\x1b[1m\nCONSULTOR — antes de gastar, vamos ver o que essa tarefa pede\x1b[0m')
  console.log('\x1b[2mEnter aceita o valor padrão entre colchetes.\x1b[0m')
  try {
    const task = await askMenu(rl, '1) O que você vai fazer?', TASKS)
    const pages = await askNumber(rl, '2) Páginas do resultado final', task.pages)
    const docsPages = await askNumber(
      rl,
      '3) Páginas de documentos anexados (autos, provas, contrato)',
      task.docsPages,
    )
    const complexityDefault = COMPLEXITIES.findIndex((c) => c.id === task.complexity)
    const complexity = await askMenu(
      rl,
      '4) Complexidade da tarefa',
      COMPLEXITIES,
      complexityDefault >= 0 ? complexityDefault : 1,
    )
    const turns = await askNumber(rl, '5) Quantas rodadas de revisão você espera fazer', task.turns)
    const volumeRaw = (
      await rl.question('\n6) Quantas dessas por mês, aproximadamente? (Enter pula) > ')
    ).trim()
    const volume = volumeRaw ? Number(volumeRaw.replace(',', '.')) || null : null
    return { task, pages, docsPages, complexity, turns, volume, fx: null }
  } finally {
    rl.close()
  }
}

function fromFlags(opts) {
  const task = taskById(opts.task)
  const complexity = complexityById(opts.complexity || task.complexity)
  return {
    task,
    pages: opts.pages ?? task.pages,
    docsPages: opts.docsPages ?? task.docsPages,
    complexity,
    turns: opts.turns ?? task.turns,
    volume: opts.volume,
    fx: opts.fx,
  }
}

// ─── diagnóstico ────────────────────────────────────────────────────────────

function diagnose(answers, pricing) {
  const simOpts = {
    pages: answers.pages,
    words: null,
    file: null,
    docsPages: answers.docsPages,
    docsWords: null,
    docsFile: null,
    turns: Math.max(1, answers.turns),
    skill: answers.task.skill,
    thinking: null,
    cacheTtl: '1h',
  }

  const recommended = simulate(simOpts, pricing, answers.complexity.model)
  const alternatives = MODEL_ORDER.filter((m) => m !== answers.complexity.model).map((m) =>
    simulate(simOpts, pricing, m),
  )

  const warnings = []
  if (answers.docsPages > 80 && answers.complexity.model !== 'claude-opus-5') {
    warnings.push(
      `${num(answers.docsPages)} páginas de documentos é volume grande — contexto extenso aumenta` +
        ' o risco de o modelo mais barato perder um detalhe relevante. Considere Opus mesmo achando a tarefa "padrão".',
    )
  }
  if (answers.pages > 25) {
    warnings.push(
      `${num(answers.pages)} páginas de resultado é peça longa. Revisões tendem a custar mais —` +
        ' o cache ajuda, mas cada rodada ainda relê tudo.',
    )
  }
  if (answers.turns > 6) {
    warnings.push(
      `${answers.turns} rodadas de revisão é bastante. Cada rodada relê o histórico inteiro —` +
        ' considere fechar o escopo antes de começar, em vez de revisar muitas vezes.',
    )
  }

  return { simOpts, recommended, alternatives, warnings }
}

// ─── saída ──────────────────────────────────────────────────────────────────

function b(text) {
  return `\x1b[1m${text}\x1b[0m`
}
function d(text) {
  return `\x1b[2m${text}\x1b[0m`
}

function render(answers, diagnosis, pricing) {
  const { recommended, alternatives, warnings } = diagnosis
  const fx = answers.fx === true ? pricing.fxUsdBrl || null : answers.fx

  const lines = []
  lines.push(b('\nDIAGNÓSTICO'))
  lines.push(`  Tarefa ...................... ${answers.task.label}`)
  lines.push(`  Tamanho estimado ............ ${num(answers.pages)} páginas de resultado`)
  lines.push(`  Documentos de entrada ....... ${num(answers.docsPages)} páginas`)
  lines.push(`  Rodadas de revisão .......... ${answers.turns}`)
  lines.push(`  Complexidade ................ ${answers.complexity.label}`)

  lines.push(b('\nMODELO RECOMENDADO'))
  lines.push(`  ${b(recommended.model)}`)
  lines.push(`  ${d(answers.complexity.reason)}`)

  if (warnings.length) {
    lines.push(b('\nATENÇÃO'))
    for (const w of warnings) lines.push(`  ⚠ ${w}`)
  }

  lines.push(b('\nCUSTO ESTIMADO'))
  lines.push(`  ${b(money(recommended.cost, fx))} para esta peça no modelo recomendado`)
  lines.push('')
  const rows = [recommended, ...alternatives]
    .sort((a, b2) => a.cost - b2.cost)
    .map((r) => [
      r.model === recommended.model ? `${r.model}  ← recomendado` : r.model,
      moneyShort(r.cost),
      fx ? moneyBrl(r.cost, fx) : null,
    ])
  const headers = ['Modelo', 'Custo', fx ? 'R$' : null].filter(Boolean)
  lines.push(table(headers, rows.map((r) => r.filter((c) => c !== null)), ['l', 'r', 'r']))

  if (answers.volume) {
    const monthly = recommended.cost * answers.volume
    lines.push(b('\nPROJEÇÃO MENSAL'))
    lines.push(
      `  ${answers.volume} peças/mês × ${moneyShort(recommended.cost)} = ${money(monthly, fx)}`,
    )
    lines.push('')
    lines.push(comparePlans(monthly, pricing, fx))
    lines.push('')
    lines.push(`  ${b('Sugestão:')} ${suggestPlan(monthly, pricing)}`)
  }

  lines.push(b('\nPRÓXIMO PASSO'))
  lines.push(`  1. Rode a tarefa em Claude Code, e troque o modelo se necessário:`)
  lines.push(`     ${d(`/model ${recommended.model}`)}`)
  lines.push(`  2. No fim, confira o custo real medido (não a estimativa):`)
  lines.push(`     ${d('npm run meter -- --by turn')}`)
  lines.push(`  3. De tempos em tempos, veja se o plano ainda faz sentido:`)
  lines.push(`     ${d('npm run meter -- --since 30d --plan --fx')}`)

  lines.push(
    d(
      '\n  Isto é uma sugestão de ponto de partida, não um veredito. O julgamento sobre qual\n' +
        '  modelo o caso exige continua seu — principalmente em casos de valor ou risco altos.',
    ),
  )
  return lines.join('\n')
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const pricing = loadPricing()

  const answers = opts.task ? fromFlags(opts) : await wizard()
  const diagnosis = diagnose(answers, pricing)

  process.stdout.write(`${render(answers, diagnosis, pricing)}\n`)
}

main().catch((error) => {
  process.stderr.write(`\nFalhou: ${error.stack || error.message}\n`)
  process.exit(1)
})
