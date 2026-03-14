export interface FeedbackSummary {
  total: number
  avgRating: number
  feedbackCounts: {
    muito_facil: number
    na_medida: number
    muito_dificil: number
    nao_gostei: number
  }
  dominantFeedback: string | null
  intensitySignal: 'increase' | 'maintain' | 'decrease' | null
}

export function computeFeedbackSummary(
  evals: { rating: number | null; feedback_rapido: string | null }[]
): FeedbackSummary {
  if (evals.length === 0) {
    return {
      total: 0,
      avgRating: NaN,
      feedbackCounts: { muito_facil: 0, na_medida: 0, muito_dificil: 0, nao_gostei: 0 },
      dominantFeedback: null,
      intensitySignal: null,
    }
  }

  const ratings = evals.map((e) => e.rating).filter((r): r is number => r !== null)
  const avgRating =
    ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : NaN

  const counts = { muito_facil: 0, na_medida: 0, muito_dificil: 0, nao_gostei: 0 }
  for (const e of evals) {
    const fb = e.feedback_rapido as keyof typeof counts | null
    if (fb && fb in counts) counts[fb]++
  }

  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  const dominantFeedback = dominant[1] > 1 ? dominant[0] : null

  let intensitySignal: FeedbackSummary['intensitySignal'] = 'maintain'
  if (avgRating < 3 || counts.muito_dificil >= 3) {
    intensitySignal = 'decrease'
  } else if (avgRating >= 4 && counts.muito_facil >= 2) {
    intensitySignal = 'increase'
  }

  return { total: evals.length, avgRating, feedbackCounts: counts, dominantFeedback, intensitySignal }
}

export function formatFeedbackForPrompt(fb: FeedbackSummary): string {
  if (fb.total === 0) return ''

  const lines: string[] = [
    'FEEDBACK DOS ÚLTIMOS TREINOS (use para calibrar intensidade):',
    `Nota média: ${fb.avgRating.toFixed(1)}/5 (${fb.total} avaliações recentes)`,
  ]

  const labels: Record<string, string> = {
    muito_facil: 'Muito fácil',
    na_medida: 'Na medida',
    muito_dificil: 'Muito difícil',
    nao_gostei: 'Não gostei',
  }

  const parts = Object.entries(fb.feedbackCounts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${labels[key]}: ${count}x`)

  if (parts.length > 0) lines.push(`Sensação: ${parts.join(', ')}`)

  if (fb.intensitySignal === 'decrease') {
    lines.push(
      'AÇÃO: O aluno está achando os treinos DIFÍCEIS DEMAIS. REDUZA volume e intensidade: menos séries, mais descanso, exercícios menos complexos.'
    )
  } else if (fb.intensitySignal === 'increase') {
    lines.push(
      'AÇÃO: O aluno está achando os treinos FÁCEIS. AUMENTE a intensidade: mais séries, menos descanso, exercícios mais desafiadores, variações avançadas.'
    )
  } else {
    lines.push('AÇÃO: Intensidade adequada. Mantenha o nível atual.')
  }

  return lines.join('\n')
}
