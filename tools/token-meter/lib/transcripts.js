import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export function defaultProjectsRoot() {
  return process.env.CLAUDE_PROJECTS_DIR || path.join(os.homedir(), '.claude', 'projects')
}

function readdirSafe(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
}

// Lista todos os transcripts (.jsonl) que o Claude Code grava em ~/.claude/projects.
// Cada arquivo e uma sessao; a pasta que o contem e o projeto (cwd codificado).
export function listTranscripts(root = defaultProjectsRoot()) {
  const out = []
  for (const dir of readdirSafe(root)) {
    if (!dir.isDirectory()) continue
    const full = path.join(root, dir.name)
    for (const f of readdirSafe(full)) {
      if (!f.isFile() || !f.name.endsWith('.jsonl')) continue
      const file = path.join(full, f.name)
      let mtimeMs = 0
      let size = 0
      try {
        const st = fs.statSync(file)
        mtimeMs = st.mtimeMs
        size = st.size
      } catch {
        continue
      }
      out.push({
        file,
        projectDir: dir.name,
        sessionId: f.name.replace(/\.jsonl$/, ''),
        mtimeMs,
        size,
      })
    }
  }
  return out.sort((a, b) => a.mtimeMs - b.mtimeMs)
}

// A pasta guarda o cwd com "/" trocado por "-". Serve de fallback quando
// nenhuma linha do transcript trouxe o campo cwd.
function projectNameFromDir(dirName) {
  const cleaned = String(dirName).replace(/^-+/, '')
  const parts = cleaned.split('-').filter(Boolean)
  return parts.length ? parts[parts.length - 1] : dirName
}

function textOf(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join(' ')
}

// Um prompt "de verdade" (digitado pelo usuario) abre um novo turno.
// Resultados de ferramenta, lembretes de sistema e anexos nao contam.
function isHumanPrompt(entry) {
  if (entry.type !== 'user') return false
  if (entry.toolUseResult) return false
  if (entry.isMeta) return false
  if (entry.isSidechain) return false
  const content = entry.message?.content
  if (Array.isArray(content) && content.some((b) => b?.type === 'tool_result')) return false
  if (entry.origin?.kind === 'human') return true
  return Boolean(entry.promptSource)
}

function label(text, max = 90) {
  const flat = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!flat) return '(sem texto)'
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

// Le um transcript e devolve a lista de REQUISICOES de API distintas.
// O arquivo repete a mesma requisicao em varias linhas (uma por bloco de
// conteudo transmitido), sempre com o mesmo requestId + message.id — sem
// deduplicar, o consumo aparece 3x ou 4x maior do que foi cobrado. Essa e a
// principal razao pela qual contadores ingenuos exageram o gasto.
export function parseTranscript(source) {
  const { file, projectDir, sessionId } = source
  let raw
  try {
    raw = fs.readFileSync(file, 'utf8')
  } catch {
    return null
  }

  const seen = new Set()
  const requests = []
  const turns = []
  let turn = null
  let cwd = null
  let version = null
  let gitBranch = null
  let firstTs = null
  let lastTs = null

  for (const line of raw.split('\n')) {
    if (!line.trim()) continue
    let entry
    try {
      entry = JSON.parse(line)
    } catch {
      continue
    }

    if (entry.cwd) cwd = entry.cwd
    if (entry.version) version = entry.version
    if (entry.gitBranch) gitBranch = entry.gitBranch
    if (entry.timestamp) {
      if (!firstTs) firstTs = entry.timestamp
      lastTs = entry.timestamp
    }

    if (isHumanPrompt(entry)) {
      turn = {
        index: turns.length + 1,
        label: label(textOf(entry.message?.content)),
        startedAt: entry.timestamp || null,
        requests: 0,
      }
      turns.push(turn)
      continue
    }

    if (entry.type !== 'assistant') continue
    const usage = entry.message?.usage
    if (!usage) continue

    // Chave de deduplicacao. Se requestId faltar, cai no uuid da linha (unico),
    // o que no pior caso conta demais em vez de colapsar requisicoes distintas.
    const dedupeKey = `${entry.requestId || entry.uuid || ''}::${entry.message?.id || ''}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    const creation = usage.cache_creation || {}
    const write1h = creation.ephemeral_1h_input_tokens || 0
    const write5mRaw = creation.ephemeral_5m_input_tokens
    const creationTotal = usage.cache_creation_input_tokens || 0
    // Quando o split por TTL nao vem, assume tudo como cache de 5 minutos.
    const write5m =
      write5mRaw === undefined ? Math.max(0, creationTotal - write1h) : write5mRaw

    if (turn) turn.requests += 1

    requests.push({
      sessionId,
      project: cwd ? path.basename(cwd) : projectNameFromDir(projectDir),
      cwd: cwd || null,
      gitBranch: gitBranch || null,
      version: version || null,
      requestId: entry.requestId || null,
      messageId: entry.message?.id || null,
      timestamp: entry.timestamp || null,
      model: entry.message?.model || 'desconhecido',
      speed: usage.speed || 'standard',
      effort: entry.effort || null,
      isSidechain: Boolean(entry.isSidechain),
      turnIndex: turn ? turn.index : 0,
      turnLabel: turn ? turn.label : '(fora de turno / retomada de sessão)',
      tokens: {
        input: usage.input_tokens || 0,
        output: usage.output_tokens || 0,
        cacheWrite5m: write5m,
        cacheWrite1h: write1h,
        cacheRead: usage.cache_read_input_tokens || 0,
      },
      serverTools: {
        webSearch: usage.server_tool_use?.web_search_requests || 0,
        webFetch: usage.server_tool_use?.web_fetch_requests || 0,
      },
    })
  }

  return {
    file,
    sessionId,
    project: cwd ? path.basename(cwd) : projectNameFromDir(projectDir),
    cwd: cwd || null,
    gitBranch,
    version,
    startedAt: firstTs,
    updatedAt: lastTs,
    turns,
    requests,
  }
}
