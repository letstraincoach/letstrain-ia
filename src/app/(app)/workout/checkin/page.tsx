'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CheckinForm, { type CheckinData } from '@/components/workout/CheckinForm'
import WorkoutGeneratingLoader from '@/components/workout/WorkoutGeneratingLoader'
import Icon from '@/components/ui/Icon'

type PageState = 'loading' | 'checkin' | 'generating_plan' | 'starting' | 'error' | 'done_today'

const PLAN_STAGES = [
  { pct: 5,  label: 'Analisando seu perfil...',        delay: 0 },
  { pct: 20, label: 'Buscando exercícios ideais...',   delay: 2500 },
  { pct: 40, label: 'Montando estrutura da semana...', delay: 7000 },
  { pct: 60, label: 'Criando os treinos...',           delay: 20000 },
  { pct: 75, label: 'Ajustando cargas e séries...',    delay: 42000 },
  { pct: 88, label: 'Revisando e finalizando...',      delay: 70000 },
] as const

export default function CheckinPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | undefined>()
  const [treinoConcluidoId, setTreinoConcluidoId] = useState<string | null>(null)
  const [hasActivePlan, setHasActivePlan] = useState(false)
  const [planPreview, setPlanPreview] = useState<{ nome_plano: string; dia: number; total: number } | null>(null)
  const [tierImage, setTierImage] = useState('/levels/intermediario.jpg')
  const [planProgress, setPlanProgress] = useState(0)
  const [planStageLabel, setPlanStageLabel] = useState('Iniciando...')

  useEffect(() => {
    if (pageState !== 'generating_plan') return
    setPlanProgress(0)
    setPlanStageLabel('Iniciando...')
    const timers = PLAN_STAGES.map(({ pct, label, delay }) =>
      setTimeout(() => { setPlanProgress(pct); setPlanStageLabel(label) }, delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [pageState])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)

      const hoje = new Date().toISOString().split('T')[0]

      // Nível do usuário para imagem de fundo
      supabase.from('user_profiles').select('nivel_atual').eq('id', data.user.id).single().then(({ data: p }) => {
        const n = (p?.nivel_atual ?? 'adaptacao') as string
        const img = n === 'adaptacao' ? '/levels/adaptacao.jpg'
          : n.startsWith('iniciante') ? '/levels/iniciante.jpg'
          : n.startsWith('intermediario') ? '/levels/intermediario.jpg'
          : n.startsWith('avancado') ? '/levels/avancado.jpg'
          : '/levels/atleta.jpg'
        setTierImage(img)
      })

      // Verificar treino do dia
      const { data: treinoHoje } = await supabase
        .from('workouts')
        .select('id, status')
        .eq('user_id', data.user.id)
        .eq('data', hoje)
        .eq('status', 'executado')
        .limit(1)
        .maybeSingle()

      if (treinoHoje) {
        setTreinoConcluidoId(treinoHoje.id)
        setPageState('done_today')
        return
      }

      // Verificar se tem plano ativo com treinos disponíveis
      const { data: plano } = await supabase
        .from('training_plans')
        .select('id, nome_plano, plan_workouts(dia_numero, executado)')
        .eq('user_id', data.user.id)
        .eq('status', 'ativo')
        .gte('valido_ate', hoje)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (plano) {
        const planWorkouts = (plano.plan_workouts ?? []) as Array<{ dia_numero: number; executado: boolean }>
        const sorted = planWorkouts.sort((a, b) => a.dia_numero - b.dia_numero)
        const proxIdx = sorted.findIndex((pw) => !pw.executado)
        const executados = sorted.filter((pw) => pw.executado).length

        if (proxIdx !== -1) {
          setHasActivePlan(true)
          setPlanPreview({
            nome_plano: plano.nome_plano as string,
            dia: executados + 1,
            total: sorted.length,
          })
        }
      }

      setPageState('checkin')
    })
  }, [])

  async function handleCheckinSubmit(data: CheckinData) {
    setErrorMsg(null)

    // ── Caminho 1: tem plano ativo → start-today (sem IA, rápido) ────────────
    if (hasActivePlan) {
      setPageState('starting')
      try {
        const res = await fetch('/api/training-plan/start-today', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            disposicao: data.disposicao,
            tempo_disponivel: data.tempo_disponivel,
            ultima_refeicao: data.ultima_refeicao,
          }),
        })

        const json = await res.json() as {
          workout_id?: string
          error?: string
          paywall?: boolean
          no_plan?: boolean
          plan_complete?: boolean
        }

        if (res.status === 409 && json.workout_id) {
          router.push(`/workout/${json.workout_id}`)
          return
        }

        if (json.no_plan || json.plan_complete) {
          // Plano acabou → gerar novo
          setHasActivePlan(false)
          await generateAndStart(data)
          return
        }

        if (!res.ok || !json.workout_id) {
          setErrorMsg(json.error ?? 'Erro ao iniciar treino. Tente novamente.')
          setPageState('error')
          return
        }

        router.push(`/workout/${json.workout_id}`)
      } catch {
        setErrorMsg('Erro de conexão. Verifique sua internet e tente novamente.')
        setPageState('error')
      }
      return
    }

    // ── Caminho 2: sem plano → gerar plano + iniciar treino ──────────────────
    await generateAndStart(data)
  }

  async function generateAndStart(data: CheckinData) {
    // Passo 1: gerar plano (com IA — mostra loader especial)
    setPageState('generating_plan')

    try {
      const genRes = await fetch('/api/training-plan/generate', { method: 'POST' })
      const genJson = await genRes.json() as { plan_id?: string; error?: string; paywall?: boolean; already_exists?: boolean }

      if (genRes.status === 402 || genJson.paywall) {
        router.push('/assinatura')
        return
      }

      if (!genRes.ok && !genJson.already_exists) {
        // Fallback: usar gerador por-treino legado
        await legacyGenerate(data)
        return
      }

      // Passo 2: iniciar treino do plano
      setPageState('starting')
      const startRes = await fetch('/api/training-plan/start-today', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disposicao: data.disposicao,
          tempo_disponivel: data.tempo_disponivel,
          ultima_refeicao: data.ultima_refeicao,
        }),
      })

      const startJson = await startRes.json() as { workout_id?: string; error?: string }

      if (!startRes.ok || !startJson.workout_id) {
        // Fallback: legado
        await legacyGenerate(data)
        return
      }

      router.push(`/workout/${startJson.workout_id}`)
    } catch {
      // Fallback: tentar gerador legado
      await legacyGenerate(data)
    }
  }

  async function legacyGenerate(data: CheckinData) {
    setPageState('generating_plan')
    try {
      const res = await fetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json() as { workout_id?: string; error?: string; paywall?: boolean }

      if (res.status === 402 || json.paywall) {
        router.push('/assinatura')
        return
      }

      if (res.status === 409 && json.workout_id) {
        router.push(`/workout/${json.workout_id}`)
        return
      }

      if (!res.ok || !json.workout_id) {
        setErrorMsg(json.error ?? 'Erro ao gerar treino. Tente novamente.')
        setPageState('error')
        return
      }

      router.push(`/workout/${json.workout_id}`)
    } catch {
      setErrorMsg('Erro de conexão. Verifique sua internet e tente novamente.')
      setPageState('error')
    }
  }

  // ── Estados de tela ───────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-[#FF8C00] animate-spin" />
      </div>
    )
  }

  if (pageState === 'generating_plan') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] px-6 text-center gap-8">
        {/* Header */}
        <div>
          <p className="text-sm text-[#FF8C00] font-semibold uppercase tracking-widest mb-3">Lets Train IA</p>
          <h2 className="text-xl font-bold">Montando seu plano semanal</h2>
          <p className="text-sm text-white/40 mt-1">Isso acontece uma vez por semana</p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50 text-left leading-snug max-w-[200px]">{planStageLabel}</span>
            <span className="text-[#FF8C00] font-bold text-base ml-3">{planProgress}%</span>
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-[#FF8C00] to-[#FFB347] transition-all duration-1000 ease-out"
              style={{ width: `${planProgress}%` }}
            />
          </div>
          <p className="text-xs text-white/25 mt-1">
            Seu personal trainer está criando treinos personalizados para você
          </p>
        </div>

        {/* Decorative icons */}
        <div className="flex gap-5 text-2xl opacity-20">
          <Icon name="gym" />
          <Icon name="dumbbell" />
          <Icon name="fire" />
        </div>
      </div>
    )
  }

  if (pageState === 'starting') {
    return <WorkoutGeneratingLoader />
  }

  if (pageState === 'done_today') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-end justify-end">
        {/* Hero */}
        <div className="relative overflow-hidden w-full" style={{ minHeight: '55vh' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tierImage} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.55 }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.35) 55%, rgba(10,10,10,0.1) 100%)' }} />
          <div className="relative z-10 flex flex-col items-center gap-4 px-6 pb-8 pt-16 text-center max-w-sm mx-auto">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ color: '#4ADE80', backgroundColor: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}
            >
              Treino concluído
            </span>
            <h1 className="text-2xl font-bold">Você já treinou hoje!</h1>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              Descanse, recupere-se e volte amanhã mais forte.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-10 flex flex-col gap-3 w-full max-w-sm mx-auto bg-[#0a0a0a]">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
            <p className="text-xs text-white/35 leading-relaxed">
              A trava diária garante recuperação muscular adequada e evita o overtraining. Um treino bem feito vale mais do que dois apressados.
            </p>
          </div>
          {treinoConcluidoId && (
            <Link
              href={`/workout/${treinoConcluidoId}`}
              className="w-full h-12 rounded-xl bg-[#FF8C00] text-black font-semibold text-sm flex items-center justify-center"
            >
              Ver treino de hoje →
            </Link>
          )}
          <Link
            href="/dashboard"
            className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.03] text-white/70 font-medium text-sm flex items-center justify-center"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">

      {/* ── Hero cinematográfico ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 200 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tierImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.42 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.6) 55%, rgba(10,10,10,1) 100%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 80% 20%, rgba(255,140,0,0.18) 0%, transparent 65%)' }}
        />

        <div className="relative z-10 px-5 pt-8 pb-6 max-w-sm mx-auto flex flex-col gap-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-white/50 hover:text-white/80 transition-colors w-fit"
          >
            ← Voltar
          </button>
          <div>
            <p className="text-[10px] text-[#FF8C00] font-bold uppercase tracking-widest mb-1">
              {hasActivePlan ? 'Plano semanal ativo' : 'Treino personalizado'}
            </p>
            <h1 className="text-2xl font-bold">Check-in de hoje</h1>
            <p className="mt-1 text-sm text-white/50">
              {hasActivePlan
                ? '3 perguntas rápidas — seu treino já está pronto.'
                : '3 perguntas rápidas para personalizar seu treino.'}
            </p>
          </div>

          {/* Preview do plano */}
          {hasActivePlan && planPreview && (
            <div className="flex items-center gap-3 rounded-xl border border-[#FF8C00]/25 bg-[#FF8C00]/[0.07] px-4 py-3">
              <div className="min-w-0">
                <p className="text-[10px] text-[#FF8C00] uppercase tracking-wider font-semibold">Plano ativo</p>
                <p className="text-sm font-semibold truncate">{planPreview.nome_plano}</p>
                <p className="text-xs text-white/40">Treino {planPreview.dia} de {planPreview.total}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="px-5 pb-10 flex flex-col gap-4 max-w-sm mx-auto w-full">
        {pageState === 'error' && errorMsg && (
          <div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-sm text-red-400">{errorMsg}</p>
            </div>
            <button
              className="mt-3 text-sm text-[#FF8C00] hover:text-[#E07000] transition-colors"
              onClick={() => setPageState('checkin')}
            >
              Tentar novamente
            </button>
          </div>
        )}

        <CheckinForm
          onSubmit={handleCheckinSubmit}
          loading={false}
          userId={userId}
        />
      </div>
    </div>
  )
}
