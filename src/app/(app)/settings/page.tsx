import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import PushNotificationSetup from '@/components/push/PushNotificationSetup'
import SignOutButton from '@/components/settings/SignOutButton'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, subscriptionResult, pushResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('nome, nivel_atual, objetivo, local_treino, dias_por_semana')
      .eq('id', user.id)
      .single(),

    supabase
      .from('subscriptions')
      .select('plano, status, fim')
      .eq('user_id', user.id)
      .eq('status', 'ativa')
      .order('fim', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('push_subscriptions')
      .select('dias_treino, horario_lembrete, ativo')
      .eq('user_id', user.id)
      .eq('ativo', true)
      .limit(1)
      .maybeSingle(),
  ])

  const profile = profileResult.data
  const subscription = subscriptionResult.data
  const pushConfig = pushResult.data

  const nivel = (profile?.nivel_atual ?? 'adaptacao') as TrainingLevel
  const levelCfg = LEVEL_CONFIG[nivel]

  const objetivoLabel: Record<string, string> = {
    perda_peso: 'Perda de Peso',
    ganho_massa: 'Ganho de Massa',
    qualidade_vida: 'Qualidade de Vida',
  }

  const localLabel: Record<string, string> = {
    condominio: 'Academia de Condomínio',
    academia: 'Academia Convencional',
  }

  const fimFormatted = subscription?.fim
    ? new Date(subscription.fim).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Voltar
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-sm text-white/50 mt-1">{user.email}</p>
        </div>

        {/* Perfil */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Perfil</h2>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06]">
            {[
              { label: 'Nome', value: profile?.nome ?? '—' },
              {
                label: 'Nível',
                value: `${levelCfg.emoji} ${levelCfg.label}`,
              },
              {
                label: 'Objetivo',
                value: objetivoLabel[profile?.objetivo ?? ''] ?? '—',
              },
              {
                label: 'Local de treino',
                value: localLabel[profile?.local_treino ?? ''] ?? '—',
              },
              {
                label: 'Dias por semana',
                value: profile?.dias_por_semana ? `${profile.dias_por_semana} dias` : '—',
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm text-white/50">{row.label}</p>
                <p className="text-sm font-medium text-right max-w-[60%] truncate">{row.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Assinatura */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Assinatura</h2>
          {subscription ? (
            <div className="rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/[0.04] p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#FF8C00]">✅ Ativa</span>
                <span className="text-xs text-white/50 capitalize">{subscription.plano}</span>
              </div>
              {fimFormatted && (
                <p className="text-xs text-white/40">Renova em {fimFormatted}</p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
              <p className="text-sm text-white/60">Você não possui uma assinatura ativa.</p>
              <Link
                href="/assinatura"
                className="h-10 rounded-xl bg-[#FF8C00] text-black font-semibold text-sm flex items-center justify-center hover:bg-[#E07000] transition-colors"
              >
                Ver planos
              </Link>
            </div>
          )}
        </section>

        {/* Push Notifications */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Notificações</h2>
          <PushNotificationSetup
            initialDias={(pushConfig?.dias_treino as number[] | null) ?? []}
            initialHorario={pushConfig?.horario_lembrete as string | null}
          />
        </section>

        {/* Conta */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Conta</h2>
          <div className="flex flex-col gap-2">
            <SignOutButton />
          </div>
        </section>

        <div className="pb-8 text-center">
          <p className="text-xs text-white/20">Lets Train v0.1 · Feito com 💪</p>
        </div>
      </div>
    </div>
  )
}
