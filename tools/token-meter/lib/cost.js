import { resolvePrice } from './pricing.js'

const MTOK = 1_000_000

export function emptyTotals() {
  return {
    requests: 0,
    // Tokens brutos: e o numero que os contadores ingenuos mostram
    rawInput: 0,
    input: 0,
    output: 0,
    cacheWrite5m: 0,
    cacheWrite1h: 0,
    cacheRead: 0,
    // Tokens equivalentes: convertidos pelo multiplicador de cache. E o que
    // realmente entra na conta.
    billedInputEquivalent: 0,
    webSearch: 0,
    webFetch: 0,
    costInput: 0,
    costOutput: 0,
    costServerTools: 0,
    cost: 0,
    // Quanto a entrada custaria sem nenhum desconto de cache — base da
    // comparacao "token bruto x token cobrado"
    costInputNoCache: 0,
    estimated: false,
  }
}

// Custo de uma unica requisicao de API.
export function costOfRequest(pricing, request) {
  const price = resolvePrice(pricing, request.model, request.speed)
  const m = pricing.cacheMultipliers
  const t = request.tokens

  const inputEquivalent =
    t.input + t.cacheWrite5m * m.write5m + t.cacheWrite1h * m.write1h + t.cacheRead * m.read
  const rawInput = t.input + t.cacheWrite5m + t.cacheWrite1h + t.cacheRead

  const costInput = (inputEquivalent * price.input) / MTOK
  const costInputNoCache = (rawInput * price.input) / MTOK
  const costOutput = (t.output * price.output) / MTOK

  const st = pricing.serverTools || {}
  const costServerTools =
    (request.serverTools.webSearch * (st.webSearchPer1kRequests || 0)) / 1000 +
    (request.serverTools.webFetch * (st.webFetchPer1kRequests || 0)) / 1000

  return {
    price,
    inputEquivalent,
    rawInput,
    costInput,
    costInputNoCache,
    costOutput,
    costServerTools,
    cost: costInput + costOutput + costServerTools,
  }
}

export function addRequest(totals, pricing, request) {
  const c = costOfRequest(pricing, request)
  const t = request.tokens

  totals.requests += 1
  totals.rawInput += t.input + t.cacheWrite5m + t.cacheWrite1h + t.cacheRead
  totals.input += t.input
  totals.output += t.output
  totals.cacheWrite5m += t.cacheWrite5m
  totals.cacheWrite1h += t.cacheWrite1h
  totals.cacheRead += t.cacheRead
  totals.billedInputEquivalent += c.inputEquivalent
  totals.webSearch += request.serverTools.webSearch
  totals.webFetch += request.serverTools.webFetch
  totals.costInput += c.costInput
  totals.costInputNoCache += c.costInputNoCache
  totals.costOutput += c.costOutput
  totals.costServerTools += c.costServerTools
  totals.cost += c.cost
  if (!c.price.exact) totals.estimated = true

  return c
}

function bucket(map, key, meta) {
  let hit = map.get(key)
  if (!hit) {
    hit = { key, ...meta, totals: emptyTotals() }
    map.set(key, hit)
  }
  return hit
}

function localDay(timestamp) {
  if (!timestamp) return 'sem-data'
  const d = new Date(timestamp)
  if (Number.isNaN(d.getTime())) return 'sem-data'
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Recebe as sessoes parseadas e devolve totais gerais + quebras por dimensao.
// "Por cada coisa" = por projeto, por sessao, por dia, por modelo e por turno.
export function aggregate(pricing, sessions) {
  const totals = emptyTotals()
  const byProject = new Map()
  const bySession = new Map()
  const byDay = new Map()
  const byModel = new Map()
  const byTurn = new Map()
  const subagents = emptyTotals()
  let firstTs = null
  let lastTs = null

  for (const session of sessions) {
    for (const request of session.requests) {
      addRequest(totals, pricing, request)
      if (request.isSidechain) addRequest(subagents, pricing, request)

      const price = resolvePrice(pricing, request.model, request.speed)

      addRequest(
        bucket(byProject, request.project, { label: request.project, cwd: request.cwd }).totals,
        pricing,
        request,
      )
      addRequest(
        bucket(bySession, request.sessionId, {
          label: request.sessionId,
          project: request.project,
          branch: request.gitBranch,
          startedAt: session.startedAt,
          updatedAt: session.updatedAt,
          turns: session.turns.length,
        }).totals,
        pricing,
        request,
      )
      addRequest(
        bucket(byDay, localDay(request.timestamp), { label: localDay(request.timestamp) }).totals,
        pricing,
        request,
      )
      addRequest(
        bucket(byModel, `${price.modelId}${price.fast ? ' (fast)' : ''}`, {
          label: `${price.label}${price.fast ? ' · fast' : ''}`,
          exact: price.exact,
          input: price.input,
          output: price.output,
        }).totals,
        pricing,
        request,
      )
      addRequest(
        bucket(byTurn, `${request.sessionId}#${request.turnIndex}`, {
          label: request.turnLabel,
          index: request.turnIndex,
          sessionId: request.sessionId,
          project: request.project,
          startedAt: request.timestamp,
        }).totals,
        pricing,
        request,
      )

      if (request.timestamp) {
        if (!firstTs || request.timestamp < firstTs) firstTs = request.timestamp
        if (!lastTs || request.timestamp > lastTs) lastTs = request.timestamp
      }
    }
  }

  const sortByCost = (map) => [...map.values()].sort((a, b) => b.totals.cost - a.totals.cost)

  return {
    totals,
    subagents,
    firstTs,
    lastTs,
    byProject: sortByCost(byProject),
    bySession: sortByCost(bySession),
    byModel: sortByCost(byModel),
    byTurn: sortByCost(byTurn),
    // Dias em ordem cronologica, nao por custo — serve de serie temporal
    byDay: [...byDay.values()].sort((a, b) => a.key.localeCompare(b.key)),
  }
}

// Quanto os multiplicadores de cache economizaram frente a pagar tudo cheio.
export function cacheSavings(totals) {
  if (!totals.rawInput) return { saved: 0, ratio: 0, fullPrice: 0 }
  return {
    saved: Math.max(0, totals.costInputNoCache - totals.costInput),
    ratio: totals.billedInputEquivalent / totals.rawInput,
    fullPrice: totals.costInputNoCache + totals.costOutput + totals.costServerTools,
  }
}
