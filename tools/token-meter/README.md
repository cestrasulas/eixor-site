# Taxímetro de tokens

Mede quantos tokens você consumiu e quanto custou — por projeto, por sessão, por
dia, por modelo e **por cada pedido que você fez**. Lê os transcripts que o Claude
Code já grava em `~/.claude/projects`, sem depender de nenhuma API externa e sem
nenhuma dependência nova no projeto (só Node.js).

```bash
npm run meter                    # resumo de tudo
npm run meter -- --watch         # taxímetro ao vivo
npm run meter -- --html          # dashboard HTML
```

> As flags vêm depois de `--` porque o npm precisa saber que elas são do script,
> não dele. Se preferir, chame direto: `node tools/token-meter/meter.js --watch`.

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

Tudo vem de [`pricing.json`](./pricing.json), em USD por milhão de tokens (MTok).
Os valores estão como na tabela pública de julho/2026:

| Modelo | Entrada | Saída |
|---|---:|---:|
| Fable 5 / Mythos 5 | $10 | $50 |
| Opus 5 / 4.8 / 4.7 / 4.6 / 4.5 | $5 | $25 |
| Sonnet 5 / 4.6 / 4.5 | $3 | $15 |
| Haiku 4.5 | $1 | $5 |

Multiplicadores de cache: leitura `0.1×`, escrita `1.25×` (5min) / `2×` (1h).
Opus 5 e 4.8 em *fast mode* custam $10/$50 — a ferramenta detecta pelo campo
`speed` do transcript e cobra a tarifa certa.

Se a Anthropic mudar os preços, edite o JSON — nada no código precisa mudar.
Modelos fora da tabela usam o `fallback` e o relatório marca o total como
estimado, para você não confundir com número fechado.

Dois valores no `pricing.json` merecem atenção: `fxUsdBrl` (a cotação, que você
deve atualizar) e `serverTools` (custo por requisição de busca web — confirme na
página de preços antes de tratar como oficial; o padrão é $10 por 1.000 buscas).

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
  meter.js              # CLI: argumentos, modo watch, saídas
  pricing.json          # tabela de preços editável
  lib/
    transcripts.js      # acha e parseia os .jsonl, deduplica requisições
    cost.js             # custo por requisição e agregações
    pricing.js          # resolve id de modelo -> preço
    format.js           # números, moeda e tabelas em pt-BR
    report.js           # relatório de terminal
    html.js             # dashboard HTML
```
