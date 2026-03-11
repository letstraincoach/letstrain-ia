import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { GeneratedWorkout } from '@/lib/ai/workout-schemas'
import WorkoutHeatMap from '@/components/historico/WorkoutHeatMap'

const LOCAL_EMOJI: Record<string, string> = {
  hotel: '✈️',
  condominio: '🏠',
  academia: '🏋️',
}

const RATING_EMOJI = ['😞', '😕', '😐', '😊', '🤩']

function getWorkoutStats(exercicios: GeneratedWorkout) {
  const blocks = [
    exercicios.preparacao,
    exercicios.forca,
    exercicios.circuito,
    exercicios.cardio,
    exercicios.finisher,
    // legacy
    exercicios.aquecimento,
    exercicios.principal,
    exercicios.cooldown,
  ].filter(Boolean) as NonNullable<GeneratedWorkout['forca']>[]

  const totalExercicios = blocks.reduce((sum, b) => sum + b.length, 0)

  const grupos = new Set<string>()
  blocks.forEach(b => b.forEach(e => (e.grupo_muscular ?? []).forEach(g => grupos.add(g))))

  return { totalExercicios, grupos: [...grupos].slice(0, 3) }
}

function groupByMonth<T extends { data: string }>(workouts: T[]) {
  const groups: Record<string, T[]> = {}
  for (const w of workouts) {
    const key = w.data.slice(0, 7) // YYYY-MM
    if (!groups[key]) groups[key] = []
    groups[key].push(w)
  }
  return groups
}

function formatMonthKey(key: string) {
  const [year, month] = key.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  const nome = date.toLocaleDateString('pt-BR', { month: 'long' })
  return `${nome.charAt(0).toUpperCase() + nome.slice(1)} ${year}`
}

export default async function HistoricoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: workoutsRaw }, { data: progressData }] = await Promise.all([
    supabase
      .from('workouts')
      .select('id, data, local_treino, duracao_estimada, exercicios, workout_evaluations(rating)')
      .eq('user_id', user.id)
      .eq('status', 'executado')
      .order('data', { ascending: false })
      .order('criado_em', { ascending: false })
      .limit(120),
    supabase
      .from('user_progress')
      .select('streak_atual')
      .eq('id', user.id)
      .single(),
  ])

  const workouts = (workoutsRaw ?? []).map((w) => ({
    ...w,
    exercicios: w.exercicios as GeneratedWorkout | null,
    workout_evaluations: w.workout_evaluations as { rating: number }[] | null,
  }))

  const workoutDates = workouts.map((w) => ({
    data: w.data,
    rating: w.workout_evaluations?.[0]?.rating ?? null,
  }))

  const groups = groupByMonth(workouts)
  const monthKeys = Object.keys(groups)

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="max-w-sm mx-auto px-5 py-8 flex flex-col gap-6">

        {/* Header */}
        <div>
          <Link href="/progress" className="text-sm text-white/30 hover:text-white/60 mb-4 inline-block">
            ← Progresso
          </Link>
          <h1 className="text-2xl font-bold">Histórico de Treinos</h1>
          <p className="text-sm text-white/40 mt-1">
            {workouts.length} treino{workouts.length !== 1 ? 's' : ''} realizados
            {workouts.length >= 120 && ' (últimos 120)'}
          </p>
        </div>

        {/* Heat Map */}
        {workouts.length > 0 && (
          <WorkoutHeatMap
            workoutDates={workoutDates}
            streakAtual={progressData?.streak_atual ?? 0}
          />
        )}

        {workouts.length === 0 && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center">
            <p className="text-4xl mb-3">🏋️</p>
            <p className="text-sm text-white/50">Nenhum treino realizado ainda.</p>
            <Link href="/workout/checkin"
              className="mt-4 inline-block text-sm text-[#FF8C00] hover:text-[#E07000] transition-colors">
              Começar agora →
            </Link>
          </div>
        )}

        {/* Meses */}
        {monthKeys.map((monthKey) => {
          const monthWorkouts = groups[monthKey]
          return (
            <div key={monthKey} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                  {formatMonthKey(monthKey)}
                </p>
                <span className="text-[10px] text-white/20">
                  {monthWorkouts.length} treino{monthWorkouts.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {monthWorkouts.map((w) => {
                  const ex = w.exercicios
                  const nomeTreino = ex?.nome ?? 'Treino'
                  const stats = ex ? getWorkoutStats(ex) : null

                  const dataFormatada = new Date(w.data + 'T12:00:00').toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'short',
                  })
                  const localEmoji = LOCAL_EMOJI[w.local_treino ?? 'condominio'] ?? '🏠'
                  const rating = w.workout_evaluations?.[0]?.rating ?? null

                  return (
                    <Link
                      key={w.id}
                      id={`workout-${w.data}`}
                      href={`/workout/${w.id}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-3 hover:border-white/20 transition-colors active:scale-[0.99]"
                    >
                      <div className="text-xl shrink-0">{localEmoji}</div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{nomeTreino}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">
                          {dataFormatada}
                          {w.duracao_estimada ? ` · ${w.duracao_estimada} min` : ''}
                          {stats && stats.totalExercicios > 0
                            ? ` · ${stats.totalExercicios} exerc.`
                            : ''}
                        </p>
                        {stats && stats.grupos.length > 0 && (
                          <p className="text-[10px] text-white/25 mt-0.5 truncate">
                            {stats.grupos.join(' · ')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rating && (
                          <span className="text-base">{RATING_EMOJI[rating - 1]}</span>
                        )}
                        <span className="text-white/20 text-sm">→</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}
