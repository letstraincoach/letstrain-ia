import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const metadata: Metadata = { title: 'Admin' }

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean)

const BRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 flex flex-col gap-1">
      <p className="text-xs text-white/40 uppercase tracking-widest font-medium">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-white/30">{sub}</p>}
    </div>
  )
}

export default async function AdminPage() {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdmin =
    ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(user.email ?? '')
  if (!isAdmin) redirect('/dashboard')

  // Queries com service client (bypass RLS)
  const service = createServiceClient()

  const [
    { count: totalUsers },
    { data: subs },
    { data: recentProfiles },
    { data: workoutStats },
  ] = await Promise.all([
    service.from('user_profiles').select('*', { count: 'exact', head: true }),
    service.from('subscriptions').select('status, plano, criado_em, user_id'),
    service
      .from('user_profiles')
      .select('id, nome, nivel_atual, onboarding_completo, criado_em')
      .order('criado_em', { ascending: false })
      .limit(15),
    service
      .from('workouts')
      .select('status, criado_em')
      .in('status', ['executado'])
      .gte('criado_em', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  // Métricas de assinatura
  const ativasMensal =
    subs?.filter((s) => s.status === 'ativa' && s.plano === 'mensal').length ?? 0
  const ativasAnual =
    subs?.filter((s) => s.status === 'ativa' && s.plano === 'anual').length ?? 0
  const totalAtivas = ativasMensal + ativasAnual
  const trials = subs?.filter((s) => s.status === 'trial').length ?? 0
  const canceladas =
    subs?.filter((s) => s.status === 'cancelada' || s.status === 'expirada').length ?? 0

  const mrr = ativasMensal * 49.9 + ativasAnual * (397 / 12)
  const arr = mrr * 12

  // Novos essa semana
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const newThisWeek =
    recentProfiles?.filter((p) => p.criado_em >= weekAgo).length ?? 0

  // Treinos concluídos esse mês
  const treinosMes = workoutStats?.length ?? 0

  // Conversão trial → ativo (dos que já passaram pelo trial)
  const totalTrialEver =
    subs?.filter((s) => s.status !== 'trial').length ?? 0 // todos que já saíram do trial
  const conversionRate =
    totalTrialEver > 0
      ? Math.round((totalAtivas / (totalAtivas + canceladas)) * 100)
      : 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-black text-lg tracking-tight">
            <span className="text-[#FF8C00]">LETS</span> TRAIN
          </span>
          <span className="text-white/20 text-sm">·</span>
          <span className="text-sm text-white/40 font-medium">Admin</span>
        </div>
        <p className="text-xs text-white/25">{user.email}</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">

        {/* KPIs principais */}
        <section>
          <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-4">
            Visão geral
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Usuários totais"
              value={String(totalUsers ?? 0)}
              sub={`+${newThisWeek} essa semana`}
            />
            <StatCard
              label="Assinaturas ativas"
              value={String(totalAtivas)}
              sub={`${ativasMensal} mensal · ${ativasAnual} anual`}
            />
            <StatCard label="Trials ativos" value={String(trials)} />
            <StatCard
              label="Conversão"
              value={`${conversionRate}%`}
              sub="trial → pago"
            />
          </div>
        </section>

        {/* Revenue */}
        <section>
          <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-4">
            Receita estimada
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="MRR" value={BRL(mrr)} sub="receita mensal recorrente" />
            <StatCard label="ARR" value={BRL(arr)} sub="projeção anual" />
            <StatCard
              label="Treinos / 30d"
              value={String(treinosMes)}
              sub="workouts concluídos"
            />
          </div>
        </section>

        {/* Breakdown assinaturas */}
        <section>
          <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-4">
            Status de assinaturas
          </p>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            {[
              { label: 'Ativa — mensal', count: ativasMensal, color: '#22c55e' },
              { label: 'Ativa — anual', count: ativasAnual, color: '#16a34a' },
              { label: 'Trial', count: trials, color: '#FF8C00' },
              { label: 'Cancelada / expirada', count: canceladas, color: '#ef4444' },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-5 py-3.5 ${i !== 0 ? 'border-t border-white/[0.04]' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: row.color }}
                  />
                  <span className="text-sm text-white/70">{row.label}</span>
                </div>
                <span className="font-bold text-sm">{row.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Últimos cadastros */}
        <section>
          <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-4">
            Últimos cadastros
          </p>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-3 px-5 py-2.5 border-b border-white/[0.04]">
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Nome</span>
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Nível</span>
              <span className="text-[10px] text-white/30 uppercase tracking-widest text-right">Cadastro</span>
            </div>
            {(recentProfiles ?? []).map((p, i) => {
              const date = new Date(p.criado_em).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              })
              return (
                <div
                  key={p.id}
                  className={`grid grid-cols-3 px-5 py-3 items-center ${i !== 0 ? 'border-t border-white/[0.04]' : ''}`}
                >
                  <span className="text-sm text-white/80 truncate">
                    {p.nome ?? '—'}
                    {!p.onboarding_completo && (
                      <span className="ml-2 text-[10px] text-white/25">onboarding</span>
                    )}
                  </span>
                  <span className="text-xs text-white/40 font-mono">{p.nivel_atual}</span>
                  <span className="text-xs text-white/30 text-right">{date}</span>
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}
