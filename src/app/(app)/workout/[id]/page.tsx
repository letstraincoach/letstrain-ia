import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { GeneratedWorkout } from '@/lib/ai/workout-schemas'
import WorkoutScreen from '@/components/workout/WorkoutScreen'

interface Props {
  params: Promise<{ id: string }>
}

export default async function WorkoutPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: workout } = await supabase
    .from('workouts')
    .select('id, nivel, status, exercicios, fc_media, fc_maxima, calorias_reais, peso_treino')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!workout) return notFound()

  const exercicios = workout.exercicios as GeneratedWorkout

  const biometrics =
    workout.status === 'executado' &&
    (workout.peso_treino || workout.fc_media || workout.fc_maxima || workout.calorias_reais)
      ? {
          peso_treino: workout.peso_treino ?? undefined,
          fc_media: workout.fc_media ?? undefined,
          fc_maxima: workout.fc_maxima ?? undefined,
          calorias_reais: workout.calorias_reais ?? undefined,
        }
      : undefined

  return (
    <WorkoutScreen
      workoutId={workout.id}
      workout={exercicios}
      nivel={workout.nivel}
      jaExecutado={workout.status === 'executado'}
      biometrics={biometrics}
    />
  )
}
