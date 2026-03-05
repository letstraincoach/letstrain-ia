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
    .select('id, nivel, status, exercicios')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!workout) return notFound()

  const exercicios = workout.exercicios as GeneratedWorkout

  return (
    <WorkoutScreen
      workoutId={workout.id}
      workout={exercicios}
      nivel={workout.nivel}
      jaExecutado={workout.status === 'executado'}
    />
  )
}
