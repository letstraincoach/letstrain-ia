import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import JejumTimer from '@/components/dashboard/JejumTimer'
import LetsCoinsWidget from '@/components/dashboard/LetsCoinsWidget'
import NutritionWidget from '@/components/nutrition/NutritionWidget'
import { getTrainer } from '@/lib/trainers/config'
import { calcularMetaCalorica, calcularMetaProteina } from '@/lib/nutrition/foods'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Start of current week (Monday) in Brasília (UTC-3)
  const brasiliaOffset = -3 * 60 * 60 * 1000
  const nowBrasilia = new Date(Date.now() + brasiliaOffset)
  const dayOfWeek = nowBrasilia.getUTCDay() // 0=Sun, 1=Mon...
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const mondayBrasilia = new Date(nowBrasilia.getTime() - daysFromMonday * 24 * 60 * 60 * 1000)
  const startOfWeek = mondayBrasilia.toISOString().split('T')[0]
  const hoje = nowBrasilia.toISOString().split('T')[0]

  const [
    profileResult,
    progressResult,
    lastWorkoutResult,
    weeklyResult,
    achievementsResult,
    userAchievementsResult,
    foodLogsResult,
  ] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('nome, nivel_atual, objetivo, onboarding_completo, jejum_inicio, dias_por_semana, personal_slug, peso, altura, idade, sexo')
      .eq('id', user.id)
      .single(),

    supabase
      .from('user_progress')
      .select('treinos_totais, treinos_nivel_atual, streak_atual, streak_maximo, lets_coins')
      .eq('id', user.id)
      .single(),

    supabase
      .from('workouts')
      .select('id, data, status')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .single(),

    // Workouts completed this week (Mon → today)
    supabase
      .from('workouts')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'executado')
      .gte('data', startOfWeek)
      .lte('data', hoje),

    // All treinos_totais achievements (ordered by goal asc)
    supabase
      .from('achievements')
      .select('id, nome, icone_emoji, criterio_valor')
      .eq('criterio_tipo', 'treinos_totais')
      .order('criterio_valor', { ascending: true }),

    supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id),

    // Food logs de hoje para o widget de nutrição
    supabase
      .from('food_logs')
      .select('calorias_total, proteina_total')
      .eq('user_id', user.id)
      .eq('data', hoje),
  ])

  const profile         = profileResult.data
  const progress        = progressResult.data
  const lastWorkout     = lastWorkoutResult.data
  const weeklyCount     = weeklyResult.data?.length ?? 0
  const metaSemanal     = profile?.dias_por_semana ?? 3

  if (profile && !profile.onboarding_completo) redirect('/quiz')

  const nivel    = (profile?.nivel_atual ?? 'adaptacao') as TrainingLevel
  const levelCfg = LEVEL_CONFIG[nivel]
  const treinos  = progress?.treinos_nivel_atual ?? 0
  const treinosNecessarios = levelCfg.treinos_necessarios ?? 1
  const progressoPct = Math.min(Math.round((treinos / treinosNecessarios) * 100), 100)

  const treinouHoje      = lastWorkout?.data === hoje && lastWorkout.status === 'executado'
  const treinoGeradoHoje = lastWorkout?.data === hoje && lastWorkout.status === 'gerado'
  const metaBatida       = weeklyCount >= metaSemanal

  // Próxima conquista por treinos totais
  const treinosTotal  = progress?.treinos_totais ?? 0
  const unlockedIds   = new Set((userAchievementsResult.data ?? []).map(a => a.achievement_id))
  const proximaConquista = (achievementsResult.data ?? [])
    .find(a => !unlockedIds.has(a.id) && (a.criterio_valor ?? 0) > treinosTotal) ?? null

  // Nutrição — totais do dia para o widget
  const foodLogs = foodLogsResult.data ?? []
  const caloriasHoje = foodLogs.reduce((s, l) => s + (l.calorias_total ?? 0), 0)
  const proteinaHoje = foodLogs.reduce((s, l) => s + parseFloat(String(l.proteina_total ?? 0)), 0)
  const metaCalorias = calcularMetaCalorica({
    peso: profile?.peso ?? null,
    altura: profile?.altura ?? null,
    idade: profile?.idade ?? null,
    sexo: (profile?.sexo ?? null) as 'masculino' | 'feminino' | null,
    objetivo: profile?.objetivo ?? null,
    dias_por_semana: profile?.dias_por_semana ?? null,
  })
  const metaProteina = calcularMetaProteina(profile?.peso ?? null)

  const trainer   = getTrainer(profile?.personal_slug)
  const firstName = profile?.nome?.split(' ')[0] ?? 'Atleta'
  const brasiliaHour = nowBrasilia.getUTCHours()
  const saudacao =
    brasiliaHour >= 5 && brasiliaHour < 12 ? 'Bom dia' :
    brasiliaHour >= 12 && brasiliaHour < 18 ? 'Boa tarde' :
    'Boa noite'

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-6">

        {/* Saudação + Personal */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-white/50">{saudacao},</p>
            <h1 className="text-2xl font-bold">{firstName} 👋</h1>
          </div>
          <Link
            href="/settings/perfil"
            className="shrink-0 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 hover:border-white/15 transition-colors"
          >
            <span className="text-base">{trainer.emoji}</span>
            <div className="text-right">
              <p className="text-[10px] text-white/30 leading-none">Personal</p>
              <p className="text-xs font-semibold text-white/70 leading-tight">{trainer.nome.replace('Personal ', '')}</p>
            </div>
          </Link>
        </div>

        {/* Card principal — status do dia */}
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
              <p className="text-xs text-white/50">Descanse bem. Você é incrível.</p>
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
          ) : metaBatida ? (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl bg-green-400/10 border border-green-400/20 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-green-400">Meta da semana batida! 🎉</p>
                <p className="text-xs text-white/40 mt-0.5">Descanso é parte do treino.</p>
              </div>
              <Link
                href="/workout/checkin"
                className="w-full h-11 rounded-xl border border-white/10 text-white/60 font-medium text-sm flex items-center justify-center hover:border-white/20 transition-colors"
              >
                Treinar mesmo assim →
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

        {/* Meta Semanal */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Meta da semana</p>
            <span
              className="text-xs font-bold tabular-nums"
              style={{ color: metaBatida ? '#4ADE80' : '#FF8C00' }}
            >
              {weeklyCount} / {metaSemanal} treinos
            </span>
          </div>

          {/* Barras de progresso */}
          <div className="flex gap-1.5">
            {Array.from({ length: metaSemanal }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: i < weeklyCount
                    ? (metaBatida ? '#4ADE80' : '#FF8C00')
                    : 'rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>

          <p className="text-xs text-white/40">
            {metaBatida
              ? '✅ Meta batida! Você pode descansar ou treinar extra.'
              : `Faltam ${metaSemanal - weeklyCount} treino${metaSemanal - weeklyCount > 1 ? 's' : ''} para bater a meta desta semana`}
          </p>
        </div>

        {/* Próxima conquista */}
        {proximaConquista && (
          <Link
            href="/progress/conquistas"
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 hover:border-white/20 transition-colors active:scale-[0.98]"
          >
            <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl grayscale opacity-40 shrink-0">
              {proximaConquista.icone_emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/35 uppercase tracking-widest mb-0.5">Próxima conquista</p>
              <p className="text-sm font-semibold truncate">{proximaConquista.nome}</p>
              <p className="text-xs text-white/40 mt-0.5">
                {(proximaConquista.criterio_valor ?? 0) - treinosTotal} treino{(proximaConquista.criterio_valor ?? 0) - treinosTotal !== 1 ? 's' : ''} restante{(proximaConquista.criterio_valor ?? 0) - treinosTotal !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-white/20 text-sm shrink-0">→</span>
          </Link>
        )}

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

        {/* Lets Coins */}
        <LetsCoinsWidget coins={progress?.lets_coins ?? 0} />

        {/* Jejum Intermitente */}
        <JejumTimer jejumInicio={profile?.jejum_inicio ?? null} />

        {/* Registro Alimentar */}
        <NutritionWidget
          calorias={Math.round(caloriasHoje)}
          metaCalorias={metaCalorias}
          proteina={parseFloat(proteinaHoje.toFixed(1))}
          metaProteina={metaProteina}
        />

        {/* Conquistas — acesso rápido */}
        <Link
          href="/progress/conquistas"
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 hover:border-white/20 transition-colors active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-semibold">Conquistas</p>
              <p className="text-xs text-white/40">Veja seu álbum de figurinhas</p>
            </div>
          </div>
          <span className="text-white/30 text-sm">→</span>
        </Link>

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
