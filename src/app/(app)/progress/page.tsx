import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import AlbumConquistas from '@/components/gamification/AlbumConquistas'

// ── Calendário de treinos (últimos 35 dias) ──────────────────────────────────
function WorkoutCalendar({ executedDates }: { executedDates: Set<string> }) {
  const today = new Date()
  const days: Date[] = []
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }

  const firstDow = days[0].getDay()
  const paddingDays = Array(firstDow).fill(null) as null[]
  const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-xs text-white/30 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square rounded-md" />
        ))}
        {days.map((d) => {
          const iso = d.toISOString().split('T')[0]
          const isToday = iso === today.toISOString().split('T')[0]
          const trained = executedDates.has(iso)

          return (
            <div
              key={iso}
              title={iso}
              className={`aspect-square rounded-md flex items-center justify-center
                ${trained
                  ? 'bg-[#FF8C00] shadow-[0_0_8px_rgba(255,140,0,0.4)]'
                  : isToday
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-white/[0.04]'
                }`}
            >
              {isToday && !trained && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#FF8C00]" />
          <span className="text-xs text-white/40">Treinou</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-white/[0.04] border border-white/20" />
          <span className="text-xs text-white/40">Hoje</span>
        </div>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, progressResult, workoutsResult, allAchievementsResult, userAchievementsResult] =
    await Promise.all([
      supabase
        .from('user_profiles')
        .select('nome, nivel_atual')
        .eq('id', user.id)
        .single(),

      supabase
        .from('user_progress')
        .select('treinos_totais, treinos_nivel_atual, streak_atual, streak_maximo')
        .eq('id', user.id)
        .single(),

      supabase
        .from('workouts')
        .select('data, status')
        .eq('user_id', user.id)
        .eq('status', 'executado')
        .gte('data', (() => {
          const d = new Date()
          d.setDate(d.getDate() - 34)
          return d.toISOString().split('T')[0]
        })()),

      supabase
        .from('achievements')
        .select('id, codigo, nome, descricao, icone_emoji, criterio_tipo'),

      supabase
        .from('user_achievements')
        .select('achievement_id, desbloqueado_em')
        .eq('user_id', user.id),
    ])

  const profile        = profileResult.data
  const progress       = progressResult.data
  const workouts       = workoutsResult.data ?? []
  const allAchievements = allAchievementsResult.data ?? []
  const userAchievements = userAchievementsResult.data ?? []

  const nivel    = (profile?.nivel_atual ?? 'adaptacao') as TrainingLevel
  const levelCfg = LEVEL_CONFIG[nivel]

  const treinos           = progress?.treinos_nivel_atual ?? 0
  const treinosNecessarios = levelCfg.treinos_necessarios ?? 1
  const progressoPct      = Math.min(Math.round((treinos / treinosNecessarios) * 100), 100)

  const executedDates      = new Set(workouts.map((w) => w.data as string))
  const unlockedCount      = userAchievements.length

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
          >
            ← Voltar
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Meu Progresso</h1>
          <p className="text-sm text-white/50 mt-1">Sua evolução na jornada Lets Train</p>
        </div>

        {/* Nível atual + barra de progresso */}
        <div
          className="rounded-3xl border p-6 flex flex-col gap-4"
          style={{ borderColor: levelCfg.cor + '30', backgroundColor: levelCfg.corBg }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50 mb-1">Nível atual</p>
              <span className="text-xl font-bold flex items-center gap-2" style={{ color: levelCfg.cor }}>
                {levelCfg.emoji} {levelCfg.label}
              </span>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: levelCfg.cor + '20' }}
            >
              {levelCfg.emoji}
            </div>
          </div>

          <p className="text-xs text-white/50 leading-relaxed">{levelCfg.descricao}</p>

          {levelCfg.proximo && (
            <>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Progresso para {LEVEL_CONFIG[levelCfg.proximo].emoji} {LEVEL_CONFIG[levelCfg.proximo].label}</span>
                <span>{treinos} / {treinosNecessarios}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-black/30 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressoPct}%`, backgroundColor: levelCfg.cor }}
                />
              </div>
              <p className="text-xs text-white/40">
                {treinosNecessarios - treinos > 0
                  ? `Faltam ${treinosNecessarios - treinos} treinos para subir de nível`
                  : 'Pronto para subir! Complete mais um treino 🎉'}
              </p>
            </>
          )}

          {!levelCfg.proximo && (
            <p className="text-xs text-white/60 font-semibold">
              Você chegou ao topo! 👑 Nível máximo alcançado.
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Treinos totais',   value: String(progress?.treinos_totais ?? 0), icon: '🏋️' },
            { label: 'Sequência atual',  value: `🔥 ${progress?.streak_atual ?? 0}`,   icon: null },
            { label: 'Melhor sequência', value: `⚡ ${progress?.streak_maximo ?? 0}`,  icon: null },
            { label: 'Conquistas',       value: `${unlockedCount} / ${allAchievements.length}`, icon: '🏆' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-1"
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Calendário */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold">Calendário (últimas 5 semanas)</h2>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <WorkoutCalendar executedDates={executedDates} />
          </div>
        </div>

        {/* Álbum de Conquistas */}
        <AlbumConquistas
          achievements={allAchievements}
          userAchievements={userAchievements}
          totalDesbloqueadas={unlockedCount}
        />

        <div className="pb-8" />
      </div>
    </div>
  )
}
