import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import JejumTimer from '@/components/dashboard/JejumTimer'
import NutritionWidget from '@/components/nutrition/NutritionWidget'
import DailyTipCard from '@/components/dashboard/DailyTipCard'
import PalavraDoDiaCard from '@/components/dashboard/PalavraDoDiaCard'
import { getTrainer } from '@/lib/trainers/config'
import { calcularMetaCalorica, calcularMetaProteina } from '@/lib/nutrition/foods'
import Icon from '@/components/ui/Icon'
import AvatarEmotion from '@/components/ui/AvatarEmotion'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const brasiliaOffset = -3 * 60 * 60 * 1000
  const nowBrasilia = new Date(Date.now() + brasiliaOffset)
  const dayOfWeek = nowBrasilia.getUTCDay()
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
    activeSubResult,
    activePlanResult,
    dailyTipResult,
    palavraDoDiaResult,
  ] = await Promise.all([
    supabase.from('user_profiles').select('nome, nivel_atual, objetivo, onboarding_completo, jejum_inicio, dias_por_semana, personal_slug, peso, altura, idade, sexo, avatar_url').eq('id', user.id).single(),
    supabase.from('user_progress').select('treinos_totais, treinos_nivel_atual, streak_atual, streak_maximo, lets_coins').eq('id', user.id).single(),
    supabase.from('workouts').select('id, data, status').eq('user_id', user.id).order('criado_em', { ascending: false }).limit(1).single(),
    supabase.from('workouts').select('id').eq('user_id', user.id).eq('status', 'executado').gte('data', startOfWeek).lte('data', hoje),
    supabase.from('achievements').select('id, nome, icone_emoji, criterio_valor').eq('criterio_tipo', 'treinos_totais').order('criterio_valor', { ascending: true }),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id),
    supabase.from('food_logs').select('calorias_total, proteina_total').eq('user_id', user.id).eq('data', hoje),
    supabase.from('subscriptions').select('id').eq('user_id', user.id).eq('status', 'ativa').limit(1).maybeSingle(),
    supabase.from('training_plans').select('id, nome_plano, total_dias, plan_workouts(dia_numero, executado, workout_id, workout_json)').eq('user_id', user.id).eq('status', 'ativo').gte('valido_ate', hoje).order('criado_em', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('daily_tips').select('tip, categoria').eq('user_id', user.id).eq('data', hoje).maybeSingle(),
    supabase.from('palavras_do_dia').select('versiculo_referencia, versiculo_texto, interpretacao').eq('user_id', user.id).eq('data', hoje).maybeSingle(),
  ])

  const profile         = profileResult.data
  const progress        = progressResult.data
  const lastWorkout     = lastWorkoutResult.data
  const dailyTip        = dailyTipResult.data ?? null
  const palavraDoDia    = palavraDoDiaResult.data ?? null
  const weeklyCount     = weeklyResult.data?.length ?? 0
  const metaSemanal     = profile?.dias_por_semana ?? 3
  const temAssinatura   = !!activeSubResult.data
  const treinosGratuitos = Math.min(progress?.treinos_totais ?? 0, 3)
  const treinosRestantes = Math.max(3 - treinosGratuitos, 0)

  const planoAtivo = activePlanResult?.data ?? null
  const planWorkoutsSorted = planoAtivo
    ? (planoAtivo.plan_workouts as Array<{ dia_numero: number; executado: boolean; workout_id: string | null; workout_json: { nome?: string } | null }>)
        .sort((a, b) => a.dia_numero - b.dia_numero)
    : []
  const planDiaAtual = planWorkoutsSorted.filter((pw) => pw.executado).length + 1
  const planTemTreino = planWorkoutsSorted.some((pw) => !pw.executado)
  const proximoDia = planWorkoutsSorted.find((pw) => !pw.executado)

  if (profile && !profile.onboarding_completo) redirect('/quiz')

  const nivel    = (profile?.nivel_atual ?? 'adaptacao') as TrainingLevel
  const levelCfg = LEVEL_CONFIG[nivel]
  const treinos  = progress?.treinos_nivel_atual ?? 0
  const treinosNecessarios = levelCfg.treinos_necessarios ?? 1
  const progressoPct = Math.min(Math.round((treinos / treinosNecessarios) * 100), 100)

  const treinouHoje      = lastWorkout?.data === hoje && lastWorkout.status === 'executado'
  const treinoGeradoHoje = lastWorkout?.data === hoje && lastWorkout.status === 'gerado'
  const metaBatida       = weeklyCount >= metaSemanal

  const treinosTotal  = progress?.treinos_totais ?? 0
  const unlockedIds   = new Set((userAchievementsResult.data ?? []).map(a => a.achievement_id))
  const proximaConquista = (achievementsResult.data ?? []).find(a => !unlockedIds.has(a.id) && (a.criterio_valor ?? 0) > treinosTotal) ?? null

  const foodLogs = foodLogsResult.data ?? []
  const caloriasHoje = foodLogs.reduce((s, l) => s + (l.calorias_total ?? 0), 0)
  const proteinaHoje = foodLogs.reduce((s, l) => s + parseFloat(String(l.proteina_total ?? 0)), 0)
  const metaCalorias = calcularMetaCalorica({ peso: profile?.peso ?? null, altura: profile?.altura ?? null, idade: profile?.idade ?? null, sexo: (profile?.sexo ?? null) as 'masculino' | 'feminino' | null, objetivo: profile?.objetivo ?? null, dias_por_semana: profile?.dias_por_semana ?? null })
  const metaProteina = calcularMetaProteina(profile?.peso ?? null)

  const trainer   = getTrainer(profile?.personal_slug)
  const firstName = profile?.nome?.split(' ')[0] ?? 'Atleta'
  const avatarUrl = profile?.avatar_url ?? null

  // Dias sem treinar (para emoção do avatar)
  const ultimoTreinoData = lastWorkout?.status === 'executado' ? lastWorkout.data : null
  const diasSemTreinar = ultimoTreinoData
    ? Math.floor((new Date(hoje).getTime() - new Date(ultimoTreinoData).getTime()) / (1000 * 60 * 60 * 24))
    : 99
  const brasiliaHour = nowBrasilia.getUTCHours()
  const saudacao = brasiliaHour >= 5 && brasiliaHour < 12 ? 'Bom dia' : brasiliaHour >= 12 && brasiliaHour < 18 ? 'Boa tarde' : 'Boa noite'

  // Imagem de fundo por tier
  const tierImage = nivel === 'adaptacao'
    ? '/levels/adaptacao.jpg'
    : nivel.startsWith('iniciante')
    ? '/levels/iniciante.jpg'
    : nivel.startsWith('intermediario')
    ? '/levels/intermediario.jpg'
    : nivel.startsWith('avancado')
    ? '/levels/avancado.jpg'
    : '/levels/atleta.jpg'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 200 }}>
        {/* Imagem de fundo do tier */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tierImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.4 }}
        />

        {/* Gradiente overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.65) 60%, rgba(10,10,10,1) 100%)',
          }}
        />

        {/* Glow da cor do nível */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 80% 20%, ${levelCfg.cor}20 0%, transparent 65%)`,
          }}
        />

        {/* Conteúdo */}
        <div className="relative z-10 px-5 pt-8 pb-7">
          <div className="flex items-start justify-between">
            {/* Saudação + nível */}
            <div>
              <p className="text-sm text-white/40 font-medium">{saudacao}</p>
              <h1 className="text-[26px] font-bold tracking-tight mt-0.5">{firstName}</h1>
              <span
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: levelCfg.cor + '22',
                  color: levelCfg.cor,
                  border: `1px solid ${levelCfg.cor}40`,
                }}
              >
                {levelCfg.label}
              </span>
            </div>

            {/* Ações rápidas */}
            <div className="flex items-center gap-2 mt-1">
              <PalavraDoDiaCard initialPalavra={palavraDoDia} />
              <Link href="/settings/perfil">
                <AvatarEmotion avatarUrl={avatarUrl} diasSemTreinar={diasSemTreinar} size={40} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <div className="px-4 flex flex-col gap-4 pb-4">

        {/* ── CARD PRINCIPAL — TREINAR HOJE ── */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1c0900 0%, #120700 50%, #0a0a0a 100%)',
            border: '1px solid rgba(255,140,0,0.14)',
          }}
        >
          <div className="p-5">
            {/* Status + streak */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] text-[#FF8C00] uppercase tracking-widest font-bold mb-1">Treino de hoje</p>
                <p className="text-sm text-white/60">
                  {treinouHoje
                    ? 'Concluído — descanse bem.'
                    : treinoGeradoHoje
                    ? 'Seu treino está aguardando!'
                    : metaBatida
                    ? 'Meta da semana batida! 🎉'
                    : 'Pronto para começar?'}
                </p>
              </div>
              {(progress?.streak_atual ?? 0) > 0 && (
                <div className="flex flex-col items-end shrink-0">
                  <p className="text-[10px] text-white/30 mb-0.5">Sequência</p>
                  <p className="text-lg font-bold flex items-center gap-1">
                    <Icon name="fire" className="text-[#FF8C00]" />
                    {progress!.streak_atual}
                  </p>
                </div>
              )}
            </div>

            {/* CTA */}
            {treinouHoje ? (
              <div className="flex flex-col gap-2">
                <div className="rounded-2xl p-3.5 text-center" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.18)' }}>
                  <p className="font-semibold text-sm text-green-400">✓ Treino concluído hoje!</p>
                  <p className="text-xs text-white/40 mt-0.5">Você é incrível. Descanse bem.</p>
                </div>
                {lastWorkout && (
                  <Link href={`/workout/${lastWorkout.id}`} className="text-center text-xs text-[#FF8C00] py-1">
                    Ver treino de hoje →
                  </Link>
                )}
              </div>
            ) : treinoGeradoHoje && lastWorkout ? (
              <Link
                href={`/workout/${lastWorkout.id}`}
                className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #E05500 100%)', color: '#000' }}
              >
                ▶ Continuar Treino
              </Link>
            ) : metaBatida ? (
              <div className="flex flex-col gap-2">
                <div className="rounded-2xl p-3.5 text-center" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.18)' }}>
                  <p className="font-semibold text-sm text-green-400">Meta da semana batida! 🎉</p>
                  <p className="text-xs text-white/40 mt-0.5">Descanso é parte do treino.</p>
                </div>
                <Link
                  href="/workout/checkin"
                  className="w-full h-11 rounded-xl font-medium text-sm text-white/50 flex items-center justify-center transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Treinar mesmo assim →
                </Link>
              </div>
            ) : (
              <Link
                href="/workout/checkin"
                className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #E05500 100%)', color: '#000' }}
              >
                <Icon name="dumbbell" /> Treinar Hoje
              </Link>
            )}
          </div>

          {/* Barra de progresso de nível */}
          {levelCfg.proximo && (
            <div className="px-5 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-white/30 uppercase tracking-widest">Progresso → {LEVEL_CONFIG[levelCfg.proximo].label} {LEVEL_CONFIG[levelCfg.proximo].emoji}</span>
                <span className="text-[10px] text-white/25 tabular-nums">{treinos}/{treinosNecessarios}</span>
              </div>
              <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressoPct}%`, background: 'linear-gradient(90deg, #FF8C00, #FFB347)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-3xl font-bold tabular-nums">{progress?.treinos_totais ?? 0}</p>
            <p className="text-xs text-white/40 mt-1">Treinos totais</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-3xl font-bold tabular-nums flex items-center gap-1">
              <Icon name="fire" className="text-[#FF8C00] text-2xl" />
              {progress?.streak_maximo ?? 0}
            </p>
            <p className="text-xs text-white/40 mt-1">Melhor sequência</p>
          </div>
        </div>

        {/* ── PLANO SEMANAL ── */}
        {planoAtivo && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Link href="/plano" className="flex items-center justify-between px-4 pt-4 pb-2">
              <div>
                <p className="text-[10px] text-[#FF8C00] uppercase tracking-widest font-bold">Plano semanal</p>
                <p className="text-sm font-semibold mt-0.5 truncate">{planoAtivo.nome_plano}</p>
              </div>
              <span className="text-xs text-white/25 tabular-nums">
                {planWorkoutsSorted.filter(pw => pw.executado).length}/{planWorkoutsSorted.length} →
              </span>
            </Link>

            <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
              {planWorkoutsSorted.map((pw) => {
                const isDone   = pw.executado
                const isNext   = !isDone && pw.dia_numero === planDiaAtual
                const nomeCurto = (pw.workout_json?.nome ?? `Treino ${pw.dia_numero}`).replace(/treino\s+/i, '').slice(0, 16)

                return (
                  <div key={pw.dia_numero} className="flex flex-col items-center gap-1.5 shrink-0" style={{ minWidth: 60 }}>
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center border transition-all"
                      style={{
                        background: isDone ? 'rgba(255,140,0,0.12)' : isNext ? 'rgba(255,140,0,0.07)' : 'rgba(255,255,255,0.03)',
                        borderColor: isDone ? 'rgba(255,140,0,0.40)' : isNext ? 'rgba(255,140,0,0.22)' : 'rgba(255,255,255,0.07)',
                      }}
                    >
                      {isDone ? (
                        <span className="text-green-400 text-lg">✓</span>
                      ) : isNext ? (
                        <Icon name="fire" className="text-lg text-[#FF8C00]" />
                      ) : (
                        <span className="text-[11px] font-bold text-white/20">D{pw.dia_numero}</span>
                      )}
                    </div>
                    <p
                      className="text-[9px] text-center leading-tight"
                      style={{ color: isDone ? 'rgba(255,140,0,0.6)' : isNext ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.22)', maxWidth: 60 }}
                    >
                      {nomeCurto}
                    </p>
                  </div>
                )
              })}
            </div>

            {planTemTreino && !treinouHoje && proximoDia && (
              <Link
                href="/workout/checkin"
                className="flex items-center justify-between px-4 py-3 transition-colors"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-sm font-semibold text-[#FF8C00]">Iniciar treino {planDiaAtual} →</p>
                <p className="text-xs text-white/25">3 perguntas rápidas</p>
              </Link>
            )}
          </div>
        )}

        {/* ── META SEMANAL ── */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Meta da semana</p>
            <span className="text-xs font-bold tabular-nums" style={{ color: metaBatida ? '#4ADE80' : '#FF8C00' }}>
              {weeklyCount} / {metaSemanal}
            </span>
          </div>
          <div className="flex gap-1.5 mb-3">
            {Array.from({ length: metaSemanal }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-full transition-all duration-500"
                style={{ background: i < weeklyCount ? (metaBatida ? '#4ADE80' : '#FF8C00') : 'rgba(255,255,255,0.08)' }}
              />
            ))}
          </div>
          <p className="text-xs text-white/35">
            {metaBatida
              ? '✓ Meta batida! Pode descansar ou treinar extra.'
              : `Faltam ${metaSemanal - weeklyCount} treino${metaSemanal - weeklyCount > 1 ? 's' : ''} para bater a meta`}
          </p>
        </div>

        {/* ── FREEMIUM BANNER ── */}
        {!temAssinatura && (
          <Link
            href="/assinatura"
            className="rounded-2xl p-4 flex flex-col gap-3 transition-all active:scale-[0.98]"
            style={{
              background: treinosRestantes === 0 ? 'rgba(255,140,0,0.08)' : 'rgba(255,255,255,0.02)',
              border: treinosRestantes === 0 ? '1px solid rgba(255,140,0,0.30)' : '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                  {treinosRestantes === 0 ? '🔒 Plano gratuito encerrado' : '🎁 Plano gratuito'}
                </p>
                <p className="text-sm font-semibold" style={{ color: treinosRestantes === 0 ? '#FF8C00' : 'rgba(255,255,255,0.8)' }}>
                  {treinosRestantes === 0
                    ? 'Assine para continuar treinando'
                    : `${treinosRestantes} treino${treinosRestantes !== 1 ? 's' : ''} gratuito${treinosRestantes !== 1 ? 's' : ''} restante${treinosRestantes !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: i < treinosGratuitos ? '#FF8C00' : 'rgba(255,255,255,0.10)' }}
                  />
                ))}
              </div>
            </div>
            <div
              className="w-full h-9 rounded-xl font-semibold text-xs flex items-center justify-center"
              style={
                treinosRestantes === 0
                  ? { background: '#FF8C00', color: '#000' }
                  : { border: '1px solid rgba(255,140,0,0.28)', color: '#FF8C00' }
              }
            >
              {treinosRestantes === 0 ? 'Assinar Agora →' : 'Ver planos →'}
            </div>
          </Link>
        )}

        {/* ── PRÓXIMA CONQUISTA ── */}
        {proximaConquista && (
          <Link
            href="/progress/conquistas"
            className="flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', filter: 'grayscale(1)', opacity: 0.4 }}
            >
              {proximaConquista.icone_emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Próxima conquista</p>
              <p className="text-sm font-semibold truncate">{proximaConquista.nome}</p>
              <p className="text-xs text-white/35 mt-0.5">
                {(proximaConquista.criterio_valor ?? 0) - treinosTotal} treino{(proximaConquista.criterio_valor ?? 0) - treinosTotal !== 1 ? 's' : ''} restante{(proximaConquista.criterio_valor ?? 0) - treinosTotal !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-white/20 text-sm shrink-0">→</span>
          </Link>
        )}

        {/* ── DICA DIÁRIA ── */}
        <DailyTipCard
          initialTip={dailyTip}
          trainerEmoji={trainer.icon}
          trainerNome={trainer.nome}
        />

        {/* ── NUTRIÇÃO ── */}
        <NutritionWidget
          calorias={Math.round(caloriasHoje)}
          metaCalorias={metaCalorias}
          proteina={parseFloat(proteinaHoje.toFixed(1))}
          metaProteina={metaProteina}
        />

        {/* ── JEJUM ── */}
        <JejumTimer jejumInicio={profile?.jejum_inicio ?? null} />

        {/* ── CONQUISTAS ── */}
        <Link
          href="/progress/conquistas"
          className="flex items-center justify-between rounded-2xl px-5 py-4 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <Icon name="trophy" className="text-2xl text-[#FF8C00]" />
            <div>
              <p className="text-sm font-semibold">Conquistas</p>
              <p className="text-xs text-white/35">Álbum de figurinhas</p>
            </div>
          </div>
          <span className="text-white/20 text-sm">→</span>
        </Link>

      </div>
    </div>
  )
}
