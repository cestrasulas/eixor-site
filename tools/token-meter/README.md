# Taxímetro de tokens

Três ferramentas, um objetivo: você nunca mais gastar sem saber quanto vai custar.

| Ferramenta | Responde | Quando usar |
|---|---|---|
| `consultor.js` | Que modelo uso, e quanto vai custar? | **Antes** de começar a tarefa |
| `meter.js` | Quanto estou gastando agora / gastei? | **Durante** e **depois**, medindo de verdade |
| `estimate.js` | Quanto custaria/custou uma peça específica? | Peça sem transcript (app, sessão web encerrada) |

Lê os transcripts que o Claude Code já grava em `~/.claude/projects`, sem
depender de nenhuma API externa e sem nenhuma dependência nova no projeto
(só Node.js).

## Comece aqui — passo a passo

**1. Antes de abrir a tarefa**, pergunte ao consultor o que ela pede:

```bash
npm run consultor
```

Ele faz um questionário curto (tipo de peça, tamanho, complexidade) e devolve
o modelo recomendado, o custo estimado e a comparação entre Haiku/Sonnet/Opus.
Pressione Enter para aceitar cada valor padrão — leva 20 segundos.

**2. Durante o trabalho**, se quiser ver o custo subindo em tempo real, deixe
isto rodando num terminal ao lado:

```bash
npm run meter -- --watch
```

**3. Ao terminar**, confira o que realmente foi cobrado — não a estimativa:

```bash
npm run meter -- --by turn
```

**4. De vez em quando** (semanal ou mensal), veja se o plano que você paga
ainda faz sentido para o seu ritmo de uso:

```bash
npm run meter -- --since 30d --plan --fx
```

Isso é o ciclo inteiro: **consultor antes → watch durante → meter depois →
plan de tempos em tempos.** Os detalhes de cada um estão abaixo.

> As flags vêm depois de `--` porque o npm precisa saber que elas são do script,
> não dele. Se preferir, chame direto: `node tools/token-meter/consultor.js`.

## Por que o contador da conversa parece exagerado

Você notou certo: o indicador que aparece dentro da conversa mostra um número
muito maior do que o que é realmente cobrado. Três motivos, todos tratados aqui:

**1. Ele mostra contexto, não consumo.** A cada turno o histórico inteiro é
reenviado ao modelo. Se a conversa tem 100k tokens e você manda 10 mensagens,
o indicador soma ~1M — mas você não pagou 1M em preço cheio.

**2. Cache de prompt custa uma fração.** Tudo que é reenviado e já estava em cache
sai por **10%** do preço de entrada. Escrever no cache custa 1,25× (TTL de 5 min)
ou 2× (TTL de 1 hora). Numa sessão longa de código, a leitura de cache costuma ser
80–90% dos tokens de entrada — ou seja, o gasto real fica perto de 1/5 do bruto.
A coluna **Cobrado/bruto** mostra exatamente essa razão.

**3. O transcript repete cada requisição.** O mesmo `requestId` aparece em várias
linhas do arquivo (uma por bloco de conteúdo transmitido). Quem soma linha por
linha conta o mesmo gasto 2–4 vezes. Aqui a deduplicação é por
`requestId` + `message.id`.

O resumo mostra os dois números lado a lado — tokens brutos e tokens
efetivamente cobrados — justamente para você conseguir comparar com o
indicador da conversa e entender a diferença.

## Só mede o que ficou gravado

`meter.js` lê transcripts. Se a sessão não deixou transcript, não há o que medir —
e **isso não é recuperável depois**:

| Onde você trabalhou | Deixa transcript? |
|---|---|
| Claude Code na sua máquina | **sim**, acumula em `~/.claude/projects` |
| Claude Code na web / Cowork | some com o container quando a sessão encerra |
| App ou site do Claude (conversa normal) | **não**, não existe transcript |

Ou seja: uma inicial redigida semana passada no app, ou numa sessão web já
encerrada, não pode ser medida retroativamente. Para essas, use o
`estimate.js` abaixo. Para medir de verdade daqui pra frente, rode o trabalho
em Claude Code na sua máquina e o `--by turn` passa a dar o custo peça por peça.

## Consultor (`consultor.js`) — antes de gastar

Responde três perguntas de uma vez: que tipo de tarefa é essa, qual modelo
cabe nela, e quanto vai custar. É o ponto de partida — pense nele como um
orçamento antes de abrir a peça.

```bash
npm run consultor                                    # questionário guiado
npm run consultor -- --task inicial --fx             # direto, sem perguntar
npm run consultor -- --task recurso --docs-pages 90 --pages 25 --volume 15 --fx
```

**Modo guiado** (sem flags): pergunta o tipo de tarefa (petição inicial,
contestação, recurso, contrato, parecer, pesquisa rápida, revisão de
documento, código, ou outro), tamanho do resultado, páginas de documentos
anexados, complexidade e quantas revisões você espera fazer. Enter aceita o
padrão de cada pergunta.

**Modo direto** (`--task <id>`): pula o questionário, usa os valores padrão
da tarefa ou os que você passar por flag. Serve para repetir a mesma consulta
depois, ou automatizar. Veja `--task` disponíveis com `--help`.

A recomendação de modelo segue uma regra simples e visível — não é mágica:

| Complexidade | Modelo | Quando |
|---|---|---|
| Simples | Haiku 4.5 | extrair, resumir, formatar, responder algo direto |
| Padrão | Sonnet 5 | a maioria das peças-tipo do dia a dia |
| Complexa | Opus 5 | múltiplas teses, valor alto, estratégia, fatos contraditórios |

Com muitos documentos anexados ou muitas revisões esperadas, o consultor avisa
mesmo que você não tenha marcado complexidade alta — volume grande de contexto
aumenta o risco de o modelo mais barato perder detalhe.

**É sugestão de ponto de partida, não veredito.** O julgamento sobre qual
modelo o caso exige continua seu, principalmente em causas de valor ou risco
altos — a ferramenta não lê os autos, só estima tamanho e custo.

> O questionário interativo espera você digitar cada resposta e ver a próxima
> pergunta antes de responder — é assim que um terminal normal funciona.
> Não dá para "pré-preencher" todas as respostas de uma vez via pipe (o
> Node descarta linhas enviadas antes de o programa perguntar por elas); para
> automatizar, use `--task` com as flags.

## Estimador por peça (`estimate.js`)

Reconstrói o custo de uma peça a partir do tamanho dela — serve tanto para
orçar antes quanto para estimar o que já foi feito sem transcript.

```bash
# Uma inicial de 18 páginas, com 40 páginas de documentos anexados, 3 revisões
npm run estimate -- --pages 18 --docs-pages 40 --skill adconsum --fx

# Comparando modelos e projetando 30 peças por mês
npm run estimate -- --pages 18 --docs-pages 40 --compare --volume 30 --fx

# A partir de um arquivo de texto real que você já produziu
npm run estimate -- --file peca.md --docs-file doc1.md,doc2.md
```

O modelo de custo reproduz o que a cobrança faz: o primeiro turno escreve o
contexto no cache (1,25× ou 2×), os turnos de revisão leem do cache (0,1×), e a
saída inclui o **raciocínio (thinking)**, que é cobrado como saída e não aparece
na tela. Nesta sessão de código o thinking foi ~63% da saída cobrada — por isso
ele entra no cálculo com 50% por padrão (ajuste com `--thinking`).

Arquivos `.docx` e `.pdf` são binários e não dão para contar direto: salve como
`.txt`/`.md` ou informe o número de páginas.

É estimativa, não fatura. Os parâmetros de conversão (tokens por palavra,
palavras por página) estão em `pricing.json` → `textEstimate`.

## Qual plano suporta o consumo (`--plan`)

```bash
npm run meter -- --since 14d --plan --fx
```

Projeta o consumo medido para 30 dias e compara com Free, Pro, Max 5x, Max 20x e
API paga por uso. Precisa de pelo menos 1 hora de amostra; com poucos dias a
projeção linear erra fácil, então quanto mais dias de uso normal, melhor.

**A comparação é por valor, não por tokens** — e isso é uma limitação real, não
uma escolha de preguiça: a Anthropic não publica limite em tokens para Pro/Max.
O limite é por janela de 5 horas mais teto semanal, e o consumo do site, do app
e do Claude Code sai do mesmo bolso. O que dá para afirmar com honestidade é
"seu uso equivale a US$ X de API; a assinatura Y custa Z".

### Quantos tokens cabem em cada plano — o que dá para saber

Direto ao ponto: **não existe um número oficial de tokens por sessão, por
semana ou por mês.** Não é a ferramenta que não mede — é que a Anthropic não
publica esse número. O limite real é dinâmico (janela de 5h + teto semanal),
varia por conta, e só aparece em **Settings → Usage** dentro da sua própria
conta Claude. Ninguém fora da Anthropic tem acesso a ele, nem terceiros.

O que existe são medições de terceiros que testaram na prática em 2026
(não oficiais — guarde essa ressalva; ficam em `pricing.json` →
`planLimitsReference`):

| Plano | Janela de 5h | Teto semanal |
|---|---|---|
| Pro | ~44 mil tokens equivalentes (~10–40 mensagens, varia com a complexidade) | não divulgado |
| Max 5x | dobrada em 06/05/2026 | ~140–280h de Sonnet + ~15–35h de Opus |
| Max 20x | dobrada em 06/05/2026 | ~240–480h de Sonnet + ~24–40h de Opus |

Total mensal: **não medido em lugar nenhum**, nem por terceiros — os planos
resetam por semana, não por mês, e Sonnet/Opus consomem baldes separados nos
planos Max. A única forma real de parametrizar isso para o seu caso é medir o
seu próprio uso com `--plan` por algumas semanas e comparar com o que sua
conta mostra em Settings → Usage.

## Recortes

```bash
npm run meter -- --today                    # só hoje
npm run meter -- --since 7d                 # últimos 7 dias (aceita 30m, 12h, 2w, ou ISO)
npm run meter -- --here                     # só o projeto do diretório atual
npm run meter -- --project eixor            # filtra projeto por trecho do nome
npm run meter -- --session 94bd             # uma sessão (aceita prefixo do id)
npm run meter -- --by turn --limit 30        # ranking dos pedidos mais caros
npm run meter -- --by day,model             # escolhe as quebras
npm run meter -- --fx                       # mostra também em reais
npm run meter -- --fx 5.85                  # com sua própria cotação
```

Quebras disponíveis em `--by`: `day`, `project`, `model`, `session`, `turn`.
O padrão é `day,project,model,session`.

## Saídas

| Comando | O que faz |
|---|---|
| (nenhuma flag) | relatório no terminal |
| `--watch [ms]` | painel ao vivo, atualiza sozinho (padrão 2000ms) |
| `--html [arquivo]` | dashboard autocontido, abre no navegador |
| `--json` | dados crus, para você plugar em outra coisa |
| `--csv arquivo.csv` | uma linha por requisição de API, para abrir na planilha |

O modo `--watch` é o taxímetro propriamente dito: deixe rodando num terminal ao
lado enquanto trabalha. Ele mostra o total, o gasto de hoje, o gasto dos últimos
10 minutos com projeção por hora, e quanto o **pedido atual** já consumiu.

## Preços

Tudo vem de [`pricing.json`](./pricing.json), em USD por milhão de tokens (MTok),
conferido contra a
[tabela oficial](https://platform.claude.com/docs/en/about-claude/pricing) em
julho/2026:

| Modelo | Entrada | Saída |
|---|---:|---:|
| Fable 5 / Mythos 5 | $10 | $50 |
| Opus 5 / 4.8 / 4.7 / 4.6 / 4.5 | $5 | $25 |
| **Sonnet 5** | **$2** | **$10** |
| Sonnet 4.6 / 4.5 | $3 | $15 |
| Haiku 4.5 | $1 | $5 |
| Opus 4.1 / 4 (descontinuados) | $15 | $75 |

⚠️ **Sonnet 5 está em preço promocional de $2/$10 até 31/08/2026.** A partir de
01/09 passa a $3/$15 — troque os dois valores no `pricing.json` na virada, ou as
estimativas de Sonnet vão sair 33% baratas demais.

Multiplicadores de cache: leitura `0.1×`, escrita `1.25×` (5min) / `2×` (1h).
Opus 5 e 4.8 em *fast mode* custam $10/$50 — a ferramenta detecta pelo campo
`speed` do transcript e cobra a tarifa certa. Busca web custa $10 por 1.000
buscas; web fetch não tem custo extra além dos tokens do conteúdo trazido.

Modelos 4.7+ (Opus 5, Sonnet 5) usam tokenizador novo que gera ~30% mais tokens
para o mesmo texto — o `estimate.js` já leva isso em conta.

Se a Anthropic mudar os preços, edite o JSON — nada no código precisa mudar.
Modelos fora da tabela usam o `fallback` e o relatório marca o total como
estimado, para você não confundir com número fechado. O único valor que você
precisa manter na mão é `fxUsdBrl`, a cotação do dólar.

## Limites do que isso mede

- Mede **o que passou pela API nas sessões do Claude Code**. Uso pelo app,
  pelo site ou por outras integrações não aparece aqui.
- Se você usa assinatura (plano com limite de uso) em vez de API paga, o custo
  em dólar é o **valor equivalente** do consumo, não uma fatura. Ainda serve
  para comparar o peso de cada tarefa.
- O container do Claude Code na web é efêmero: os transcripts de uma sessão
  remota vivem naquele container. Rodando na sua máquina, o histórico é
  cumulativo e o relatório fica mais rico com o tempo.
- Não é fatura oficial. É a mesma conta que a fatura faz, com os tokens que o
  próprio transcript registra — bom para decidir e comparar, não para contestar
  cobrança.

## Estrutura

```
tools/token-meter/
  consultor.js           # CLI de consulta prévia: tarefa -> modelo -> custo
  meter.js               # CLI de medição: argumentos, modo watch, saídas
  estimate.js            # CLI de estimativa por peça (usado pelo consultor)
  pricing.json           # tabela de preços e parâmetros editáveis
  lib/
    transcripts.js      # acha e parseia os .jsonl, deduplica requisições
    cost.js             # custo por requisição e agregações
    pricing.js          # resolve id de modelo -> preço
    format.js           # números, moeda e tabelas em pt-BR
    plans.js            # comparativo de assinaturas
    report.js           # relatório de terminal
    html.js             # dashboard HTML
```
