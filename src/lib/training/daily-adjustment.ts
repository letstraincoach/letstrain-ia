import type { GeneratedWorkout } from '@/lib/ai/workout-schemas'

export interface DailyCheckin {
  disposicao: number       // 1–10
  tempo_disponivel: number // minutos
  ultima_refeicao: string  // 'menos_1h' | '1_2h' | 'mais_2h' | 'em_jejum'
  feedbackSignal?: 'increase' | 'maintain' | 'decrease' | null
}

/**
 * Aplica ajustes de volume/intensidade ao treino pré-gerado com base no check-in do dia.
 * Nenhuma chamada de IA — regras puras.
 */
export function adjustWorkout(workout: GeneratedWorkout, checkin: DailyCheckin): GeneratedWorkout {
  // Deep clone para não mutar o original
  const w: GeneratedWorkout = JSON.parse(JSON.stringify(workout))

  const { disposicao, tempo_disponivel, ultima_refeicao, feedbackSignal } = checkin

  // ── Feedback histórico (ajusta baseline antes das regras do dia) ─────────
  if (feedbackSignal === 'decrease') {
    w.forca = w.forca?.map((e) => ({
      ...e,
      series: Math.max(1, e.series - 1),
      descanso_segundos: Math.min(300, e.descanso_segundos + 15),
    }))
    if (w.circuito && w.circuito.length > 2) w.circuito = w.circuito.slice(0, 2)
  } else if (feedbackSignal === 'increase') {
    w.forca = w.forca?.map((e) => ({
      ...e,
      series: Math.min(5, e.series + 1),
      descanso_segundos: Math.max(30, e.descanso_segundos - 15),
    }))
  }

  // ── Disposição ────────────────────────────────────────────────────────────
  if (disposicao <= 3) {
    // Energia baixa: reduz 1 série em força, mais descanso, finisher suave
    w.forca = w.forca?.map((e) => ({
      ...e,
      series: Math.max(1, e.series - 1),
      descanso_segundos: Math.min(300, e.descanso_segundos + 30),
    }))
    // Mantém só 1 exercício no finisher
    if (w.finisher && w.finisher.length > 1) w.finisher = w.finisher.slice(0, 1)
    // Circuito reduzido
    if (w.circuito && w.circuito.length > 2) w.circuito = w.circuito.slice(0, 2)
  } else if (disposicao >= 8) {
    // Alta energia: +1 série em força (máx 5)
    w.forca = w.forca?.map((e) => ({
      ...e,
      series: Math.min(5, e.series + 1),
    }))
  }

  // ── Tempo disponível ──────────────────────────────────────────────────────
  if (tempo_disponivel <= 30) {
    // Sessão curta: remove 1 exercício de força e finisher
    if (w.forca && w.forca.length > 2) w.forca = w.forca.slice(0, -1)
    if (w.finisher && w.finisher.length > 1) w.finisher = w.finisher.slice(0, 1)
  }

  if (tempo_disponivel <= 25) {
    // Sessão muito curta: também reduz cardio/circuito
    if (w.circuito && w.circuito.length > 2) w.circuito = w.circuito.slice(0, 2)
    if (w.cardio && w.cardio.length > 1) w.cardio = w.cardio.slice(0, 1)
    if (w.forca && w.forca.length > 2) w.forca = w.forca.slice(0, 2)
  }

  // ── Última refeição: em jejum ou < 1h ────────────────────────────────────
  if (ultima_refeicao === 'menos_1h' || ultima_refeicao === 'em_jejum') {
    // Reduz intensidade geral: -1 série em força e finisher leve
    w.forca = w.forca?.map((e) => ({
      ...e,
      series: Math.max(1, e.series - 1),
    }))
    if (w.finisher && w.finisher.length > 1) w.finisher = w.finisher.slice(0, 1)
  }

  // ── Recalcula duração estimada ────────────────────────────────────────────
  const totalExercicios = [
    ...(w.preparacao ?? []),
    ...(w.forca ?? []),
    ...(w.circuito ?? []),
    ...(w.cardio ?? []),
    ...(w.finisher ?? []),
  ].length

  const tempoDescanso = (w.forca ?? []).reduce(
    (sum, e) => sum + (e.descanso_segundos ?? 60) * e.series,
    0
  ) / 60

  const duracaoCalculada = Math.round(totalExercicios * 2.5 + tempoDescanso + 5)
  w.duracao_estimada = Math.min(tempo_disponivel, Math.max(15, duracaoCalculada))

  return w
}
