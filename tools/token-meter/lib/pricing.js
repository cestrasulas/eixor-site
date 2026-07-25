import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const PRICING_PATH = path.join(here, '..', 'pricing.json')

export function loadPricing(overridePath) {
  const file = overridePath || PRICING_PATH
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  return {
    ...raw,
    file,
    // Cache de resolucao: o mesmo modelo aparece em centenas de requisicoes
    _resolved: new Map(),
  }
}

// Normaliza um id de modelo para bater com a tabela de precos.
// Cobre sufixos de data (claude-opus-4-5-20251101), prefixos de provedor
// (anthropic.claude-opus-5) e a variante -fast que ja foi aposentada.
function normalizeModelId(model) {
  let id = String(model || '').trim().toLowerCase()
  id = id.replace(/^anthropic\./, '')
  id = id.replace(/^us\.anthropic\./, '')
  id = id.replace(/@\d{8}$/, '')
  id = id.replace(/-\d{8}$/, '')
  id = id.replace(/-fast$/, '')
  id = id.replace(/\[1m\]$/, '')
  return id
}

// Retorna { input, output, label, exact } para um modelo + velocidade.
// `speed` vem de usage.speed no transcript ("standard" | "fast").
export function resolvePrice(pricing, model, speed) {
  const key = `${model}::${speed || 'standard'}`
  const cached = pricing._resolved.get(key)
  if (cached) return cached

  const id = normalizeModelId(model)
  const table = pricing.models
  let entry = table[id]
  let exact = Boolean(entry)

  if (!entry) {
    // Tenta prefixo: um id novo tende a comecar igual a um conhecido
    const hit = Object.keys(table).find((k) => id.startsWith(k) || k.startsWith(id))
    if (hit) entry = table[hit]
  }
  if (!entry) entry = pricing.fallback

  const useFast = speed === 'fast' && entry.fast
  const price = {
    label: entry.label || id || 'desconhecido',
    modelId: id || 'desconhecido',
    input: useFast ? entry.fast.input : entry.input,
    output: useFast ? entry.fast.output : entry.output,
    fast: Boolean(useFast),
    exact,
  }

  pricing._resolved.set(key, price)
  return price
}
