import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profileResult, progressResult, lastWorkoutResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('nome, nivel_atual, objetivo, onboarding_completo')
      .eq('id', user.id)
      .single(),

    supabase
      .from('user_progress')
      .select('treinos_totais, treinos_nivel_atual, streak_atual, streak_maximo')
      .eq('id', user.id)
      .single(),

    supabase
      .from('workouts')
      .select('id, data, status')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .single(),
  ])

  const profile = profileResult.data
  const progress = progressResult.data
  const lastWorkout = lastWorkoutResult.data

  if (profile && !profile.onboarding_completo) {
    redirect('/quiz')
  }

  const nivel = (profile?.nivel_atual ?? 'adaptacao') as TrainingLevel
  const levelCfg = LEVEL_CONFIG[nivel]

  const treinos = progress?.treinos_nivel_atual ?? 0
  const treinosNecessarios = levelCfg.treinos_necessarios ?? 1
  const progressoPct = Math.min(Math.round((treinos / treinosNecessarios) * 100), 100)

  const hoje = new Date().toISOString().split('T')[0]
  const treinouHoje = lastWorkout?.data === hoje && lastWorkout.status === 'executado'
  const treinoGeradoHoje = lastWorkout?.data === hoje && lastWorkout.status === 'gerado'

  const firstName = profile?.nome?.split(' ')[0] ?? 'Atleta'

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-6">

        {/* Saudação */}
        <div>
          <p className="text-sm text-white/50">Bom dia,</p>
          <h1 className="text-2xl font-bold">{firstName} 👋</h1>
        </div>

        {/* Card principal — Treinar Hoje */}
        <div
          className="rounded-3xl border p-6 flex flex-col gap-4"
          style={{ borderColor: levelCfg.cor + '30', backgroundColor: levelCfg.corBg }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50 mb-0.5">Seu nível</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: levelCfg.cor }}>
                {levelCfg.emoji} {levelCfg.label}
              </span>
            </div>
            {(progress?.streak_atual ?? 0) > 0 && (
              <div className="text-right">
                <p className="text-xs text-white/50 mb-0.5">Sequência</p>
                <p className="text-sm font-bold">🔥 {progress!.streak_atual} dias</p>
              </div>
            )}
          </div>

          {treinouHoje ? (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <span className="text-3xl">✅</span>
              <p className="font-semibold text-sm">Treino concluído hoje!</p>
              <p className="text-xs text-white/50">Você é incrível. Volte amanhã.</p>
              {lastWorkout && (
                <Link href={`/workout/${lastWorkout.id}`} className="text-xs text-[#FF8C00] hover:text-[#E07000] transition-colors mt-1">
                  Ver treino de hoje →
                </Link>
              )}
            </div>
          ) : treinoGeradoHoje && lastWorkout ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-white/70">Você tem um treino aguardando!</p>
              <Link
                href={`/workout/${lastWorkout.id}`}
                className="w-full h-12 rounded-xl bg-[#FF8C00] text-black font-semibold text-sm flex items-center justify-center hover:bg-[#E07000] transition-colors active:scale-[0.98]"
              >
                Continuar Treino →
              </Link>
            </div>
          ) : (
            <Link
              href="/workout/checkin"
              className="w-full h-14 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98]"
            >
              💪 Treinar Hoje
            </Link>
          )}
        </div>

        {/* Progresso para o próximo nível */}
        {levelCfg.proximo && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70 font-medium">Progresso de nível</span>
              <span className="text-white/40 text-xs">{treinos} / {treinosNecessarios}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressoPct}%`, backgroundColor: levelCfg.cor }}
              />
            </div>
            <p className="text-xs text-white/40">
              {treinosNecessarios - treinos > 0
                ? `Faltam ${treinosNecessarios - treinos} treinos para ${LEVEL_CONFIG[levelCfg.proximo].label} ${LEVEL_CONFIG[levelCfg.proximo].emoji}`
                : 'Pronto para subir de nível! 🎉'}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-1">
            <p className="text-2xl font-bold">{progress?.treinos_totais ?? 0}</p>
            <p className="text-xs text-white/50">Treinos totais</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-1">
            <p className="text-2xl font-bold">🔥 {progress?.streak_maximo ?? 0}</p>
            <p className="text-xs text-white/50">Melhor sequência</p>
          </div>
        </div>

        {/* Nav rápida */}
        <nav className="grid grid-cols-3 gap-2 pb-8">
          {[
            { href: '/progress', label: 'Progresso', icon: '📈' },
            { href: '/workout/checkin', label: 'Treinar', icon: '🏋️' },
            { href: '/settings', label: 'Perfil', icon: '⚙️' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] py-3 px-2 hover:border-white/20 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs text-white/60">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
