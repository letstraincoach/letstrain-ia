import { z } from 'zod'

const ExerciseSchema = z.object({
  nome: z.string().min(1),
  grupo_muscular: z.array(z.string()).optional().default([]),
  series: z.number().int().min(1).max(10),
  repeticoes: z.string().min(1), // "12", "8-12", "30s", "falha"
  descanso_segundos: z.number().int().min(0).max(300),
  youtube_url: z.string().optional(),
  instrucoes: z.string().optional(),
  biset: z.boolean().optional(),  // true = 1º exercício do par bi-set (execute o próximo sem descanso)
  triset: z.boolean().optional(), // true = 1º ou 2º exercício do trio (execute o próximo sem descanso)
})

// Nova estrutura Lets Train — 4 blocos
export const WorkoutSchema = z.object({
  nome: z.string().min(1),
  duracao_estimada: z.number().int().min(10).max(120),

  // ── Nova estrutura (4 blocos) ───────────────────────────
  preparacao: z.array(ExerciseSchema).min(1).max(5).optional(),  // mobilidade + ativação + cardio leve
  forca: z.array(ExerciseSchema).min(2).max(10).optional(),       // força guiada ou funcional
  circuito: z.array(ExerciseSchema).min(2).max(8).optional(),     // circuito metabólico (hipertrofia)
  cardio: z.array(ExerciseSchema).min(1).max(6).optional(),       // cardio aeróbico (emagrecimento/qualidade)
  finisher: z.array(ExerciseSchema).min(1).max(4).optional(),     // finisher curto e intenso

  // ── Legacy (treinos gerados antes da migração) ──────────
  aquecimento: z.array(ExerciseSchema).optional(),
  principal: z.array(ExerciseSchema).optional(),
  cooldown: z.array(ExerciseSchema).optional(),
})

export type GeneratedWorkout = z.infer<typeof WorkoutSchema>
export type WorkoutExercise = z.infer<typeof ExerciseSchema>

/** Verifica se o workout usa a nova estrutura de 4 blocos */
export function isNewFormat(w: GeneratedWorkout): boolean {
  return !!(w.preparacao || w.forca || w.circuito || w.cardio || w.finisher)
}
