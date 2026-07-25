import { money, moneyShort, table } from './format.js'

// Compara um consumo mensal (em valor equivalente de API) com o preco das
// assinaturas.
//
// Por que a comparacao e por VALOR e nao por tokens: a Anthropic nao publica
// limite em tokens para Pro/Max. O limite e por janela de 5 horas mais teto
// semanal, e o consumo do site, do app e do Claude Code sai do mesmo bolso.
// O que da para dizer com honestidade e: "o que voce consome equivale a X de
// API; a assinatura Y custa Z". Se X for muito maior que Z, a assinatura e
// vantajosa em preco — mas voce provavelmente vai encostar no teto de uso.
export function comparePlans(monthlyCost, pricing, fx) {
  const rows = Object.values(pricing.plans).map((plan) => {
    let verdict
    if (plan.monthly === 0) {
      verdict = 'não inclui Claude Code'
    } else {
      const ratio = monthlyCost / plan.monthly
      if (ratio <= 0.5) verdict = 'sobra folga — plano maior que a necessidade'
      else if (ratio <= 1) verdict = 'consumo cabe no valor pago'
      else if (ratio <= 4) verdict = `vale ${ratio.toFixed(1)}× a mensalidade — bom negócio`
      else verdict = `vale ${ratio.toFixed(1)}× a mensalidade — risco de bater no teto`
    }
    return [plan.label, plan.monthly ? `US$ ${plan.monthly}/mês` : 'US$ 0', verdict]
  })
  rows.push(['API (pago por uso)', money(monthlyCost, fx), 'sem teto, você paga o que usar'])
  return table(['Plano', 'Preço/mês', 'Leitura'], rows, ['l', 'r', 'l'])
}

// Sugere o plano a partir do consumo equivalente mensal.
export function suggestPlan(monthlyCost, pricing) {
  const p = pricing.plans
  if (monthlyCost < 10) {
    return `Pro (US$ ${p.pro.monthly}) — seu consumo equivalente é baixo; Max seria desperdício.`
  }
  if (monthlyCost < 60) {
    return `Pro (US$ ${p.pro.monthly}) resolve na maior parte dos meses; suba para Max 5x se bater no teto em dias de pico.`
  }
  if (monthlyCost < 350) {
    return `Max 5x (US$ ${p.max5.monthly}) — é onde seu consumo equivalente compensa a mensalidade.`
  }
  if (monthlyCost < 900) {
    return `Max 20x (US$ ${p.max20.monthly}) — abaixo disso você bateria no teto do Max 5x com frequência.`
  }
  return `Max 20x (US$ ${p.max20.monthly}) e, mesmo assim, avalie API paga por uso: nesse volume o teto semanal pesa mais que o preço.`
}

// Projeta o consumo medido para 30 dias.
export function projectMonthly(totalCost, firstTs, lastTs) {
  if (!firstTs || !lastTs) return null
  const spanMs = new Date(lastTs) - new Date(firstTs)
  const spanDays = spanMs / 86_400_000
  // Menos de uma hora de amostra nao sustenta projecao mensal
  if (spanMs < 3600_000) return { spanDays, monthly: null, tooShort: true }
  return { spanDays, monthly: (totalCost / spanDays) * 30, tooShort: false }
}

export function renderPlanSection(agg, opts, pricing) {
  const projection = projectMonthly(agg.totals.cost, agg.firstTs, agg.lastTs)
  const lines = [`\x1b[1m\nQUAL PLANO SUPORTA ESSE CONSUMO\x1b[0m`]

  if (!projection) {
    lines.push('  Sem carimbo de tempo suficiente para projetar.')
    return lines.join('\n')
  }

  if (projection.tooShort) {
    lines.push(
      `  A amostra tem menos de 1 hora (${(projection.spanDays * 24).toFixed(1)}h) — pouco para projetar um mês.`,
      `  Consumo medido até agora: ${money(agg.totals.cost, opts.fx)}.`,
      `  \x1b[2mRode o meter por alguns dias de trabalho normal e repita com --plan.\x1b[0m`,
    )
    return lines.join('\n')
  }

  lines.push(
    `  Amostra .................... ${projection.spanDays.toFixed(1)} dias, ${moneyShort(agg.totals.cost)} medidos`,
    `  Projeção para 30 dias ...... ${money(projection.monthly, opts.fx)}`,
    '',
    comparePlans(projection.monthly, pricing, opts.fx),
    '',
    `  \x1b[1mSugestão:\x1b[0m ${suggestPlan(projection.monthly, pricing)}`,
    `  \x1b[2mProjeção linear a partir de uma amostra curta erra fácil. Quanto mais dias\n` +
      `  de uso normal na amostra, mais confiável.\x1b[0m`,
  )
  return lines.join('\n')
}
