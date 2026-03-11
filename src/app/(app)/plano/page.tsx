import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { GeneratedWorkout } from '@/lib/ai/workout-schemas'
import { isNewFormat } from '@/lib/ai/workout-schemas'
import Icon from '@/components/ui/Icon'

export const dynamic = 'force-dynamic'

const BLOCO_ICON: Record<string, string> = {
  preparacao: 'sunrise',
  forca: 'dumbbell',
  circuito: 'bolt',
  cardio: 'running',
  finisher: 'trophy',
}

const BLOCO_LABEL: Record<string, string> = {
  preparacao: 'Preparação',
  forca: 'Força',
  circuito: 'Circuito',
  cardio: 'Cardio',
  finisher: 'Finisher',
}

const BLOCO_COR: Record<string, string> = {
  preparacao: '#F59E0B',
  forca: '#FF8C00',
  circuito: '#A855F7',
  cardio: '#22C55E',
  finisher: '#EF4444',
}

function getWorkoutBlocks(w: GeneratedWorkout) {
  if (isNewFormat(w)) {
    return [
      { key: 'preparacao', exs: w.preparacao ?? [] },
      { key: 'forca', exs: w.forca ?? [] },
      ...(w.cardio?.length
        ? [{ key: 'cardio', exs: w.cardio }]
        : [{ key: 'circuito', exs: w.circuito ?? [] }]),
      { key: 'finisher', exs: w.finisher ?? [] },
    ].filter((b) => b.exs.length > 0)
  }
  return [
    { key: 'preparacao', exs: w.aquecimento ?? [] },
    { key: 'forca', exs: w.principal ?? [] },
    { key: 'finisher', exs: w.cooldown ?? [] },
  ].filter((b) => b.exs.length > 0)
}

function getMuscleGroups(w: GeneratedWorkout): string[] {
  const blocks = isNewFormat(w)
    ? [w.forca, w.circuito, w.cardio]
    : [w.principal]
  const grupos = new Set<string>()
  blocks.filter(Boolean).forEach((b) => b!.forEach((e) => (e.grupo_muscular ?? []).forEach((g) => grupos.add(g))))
  return [...grupos].slice(0, 4)
}

export default async function PlanoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoje = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: planoAtivo } = await supabase
    .from('training_plans')
    .select('id, nome_plano, nivel, local_treino, total_dias, valido_ate, criado_em, plan_workouts(id, dia_numero, executado, workout_id, workout_json)')
    .eq('user_id', user.id)
    .eq('status', 'ativo')
    .gte('valido_ate', hoje)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!planoAtivo) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pb-24">
        <div className="max-w-sm mx-auto px-5 py-8 flex flex-col gap-6">
          <div>
            <Link href="/dashboard" className="text-sm text-white/30 hover:text-white/60 mb-4 inline-block">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Plano Semanal</h1>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center">
            <Icon name="document" className="text-4xl mb-3 text-white/30" />
            <p className="text-sm text-white/50">Nenhum plano ativo.</p>
            <p className="text-xs text-white/30 mt-1">Clique em &quot;Treinar Hoje&quot; no dashboard para gerar um novo plano.</p>
            <Link href="/workout/checkin"
              className="mt-4 inline-block text-sm text-[#FF8C00] hover:text-[#E07000] transition-colors">
              Gerar plano agora →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const planWorkouts = (planoAtivo.plan_workouts as Array<{
    id: string; dia_numero: number; executado: boolean; workout_id: string | null; workout_json: GeneratedWorkout
  }>).sort((a, b) => a.dia_numero - b.dia_numero)

  const completados = planWorkouts.filter((pw) => pw.executado).length
  const proximoDia = planWorkouts.find((pw) => !pw.executado)
  const validoAte = new Date(planoAtivo.valido_ate + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="max-w-sm mx-auto px-5 py-8 flex flex-col gap-6">

        {/* Header */}
        <div>
          <Link href="/dashboard" className="text-sm text-white/30 hover:text-white/60 mb-4 inline-block">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold">{planoAtivo.nome_plano}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
            <span>{planWorkouts.length} treinos</span>
            <span>·</span>
            <span>{completados}/{planWorkouts.length} concluídos</span>
            <span>·</span>
            <span>Válido até {validoAte}</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FF8C00] transition-all duration-500"
              style={{ width: `${Math.round((completados / planWorkouts.length) * 100)}%` }}
            />
          </div>
        </div>

        {/* Workout cards */}
        <div className="flex flex-col gap-4">
          {planWorkouts.map((pw) => {
            const w = pw.workout_json
            const isDone = pw.executado
            const isNext = !isDone && pw.dia_numero === (proximoDia?.dia_numero ?? 0)
            const blocos = getWorkoutBlocks(w)
            const musculos = getMuscleGroups(w)
            const totalExs = blocos.reduce((acc, b) => acc + b.exs.length, 0)

            return (
              <div
                key={pw.id}
                className={`rounded-2xl border overflow-hidden transition-colors ${
                  isDone
                    ? 'border-[#FF8C00]/30 bg-[#FF8C00]/[0.04]'
                    : isNext
                    ? 'border-[#FF8C00]/20 bg-white/[0.03]'
                    : 'border-white/[0.07] bg-white/[0.02]'
                }`}
              >
                {/* Day header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      background: isDone ? 'rgba(255,140,0,0.15)' : isNext ? 'rgba(255,140,0,0.10)' : 'rgba(255,255,255,0.04)',
                      borderColor: isDone ? 'rgba(255,140,0,0.40)' : isNext ? 'rgba(255,140,0,0.25)' : 'rgba(255,255,255,0.07)',
                    }}
                  >
                    {isDone ? (
                      <Icon name="check-circle" className="text-lg text-green-400" />
                    ) : isNext ? (
                      <Icon name="fire" className="text-lg text-[#FF8C00]" />
                    ) : (
                      <span className="text-xs font-bold text-white/25">D{pw.dia_numero}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                        Dia {pw.dia_numero}
                      </span>
                      {isDone && <span className="text-[9px] text-[#FF8C00]/70 font-semibold">CONCLUÍDO</span>}
                      {isNext && <span className="text-[9px] text-[#FF8C00] font-semibold">PRÓXIMO</span>}
                    </div>
                    <p className="text-sm font-semibold truncate">{w.nome}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-white/40">{w.duracao_estimada} min</p>
                    <p className="text-[10px] text-white/25">{totalExs} exerc.</p>
                  </div>
                </div>

                {/* Muscle groups */}
                {musculos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                    {musculos.map((m) => (
                      <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 capitalize">
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {/* Exercise blocks */}
                <div className="px-4 pb-3 flex flex-col gap-1.5">
                  {blocos.map((bloco) => (
                    <div key={bloco.key} className="flex items-center gap-2">
                      <Icon name={BLOCO_ICON[bloco.key] ?? 'document'} className="text-xs shrink-0" />
                      <span
                        className="text-[10px] font-semibold shrink-0 w-16"
                        style={{ color: BLOCO_COR[bloco.key] ?? '#888' }}
                      >
                        {BLOCO_LABEL[bloco.key] ?? bloco.key}
                      </span>
                      <p className="text-[10px] text-white/30 truncate flex-1">
                        {bloco.exs.map((e) => e.nome).join(' · ')}
                      </p>
                      <span className="text-[10px] text-white/20 shrink-0">{bloco.exs.length}×</span>
                    </div>
                  ))}
                </div>

                {/* CTA for completed or next */}
                {isDone && pw.workout_id && (
                  <Link
                    href={`/workout/${pw.workout_id}`}
                    className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-xs text-white/40">Ver treino realizado</span>
                    <span className="text-white/20 text-xs">→</span>
                  </Link>
                )}
                {isNext && (
                  <Link
                    href="/workout/checkin"
                    className="flex items-center justify-between px-4 py-2.5 border-t border-[#FF8C00]/10 hover:bg-[#FF8C00]/[0.03] transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#FF8C00]">Iniciar este treino →</span>
                    <span className="text-xs text-white/30">3 perguntas</span>
                  </Link>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
