import { z } from 'zod'

const ExerciseSchema = z.object({
  nome: z.string().min(1),
  grupo_muscular: z.array(z.string()).optional().default([]),
  series: z.number().int().min(1).max(10),
  repeticoes: z.string().min(1), // "12", "8-12", "30s", "falha"
  descanso_segundos: z.number().int().min(0).max(300),
  youtube_url: z.string().url().optional(),
  instrucoes: z.string().optional(),
})

export const WorkoutSchema = z.object({
  nome: z.string().min(1),
  duracao_estimada: z.number().int().min(10).max(120),
  aquecimento: z.array(ExerciseSchema).min(1).max(6),
  principal: z.array(ExerciseSchema).min(2).max(14),
  cooldown: z.array(ExerciseSchema).min(1).max(5),
})

export type GeneratedWorkout = z.infer<typeof WorkoutSchema>
export type WorkoutExercise = z.infer<typeof ExerciseSchema>
