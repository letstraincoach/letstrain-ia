import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import PushNotificationSetup from '@/components/push/PushNotificationSetup'
import SignOutButton from '@/components/settings/SignOutButton'
import TelefoneInput from '@/components/settings/TelefoneInput'
import BillingPortalButton from '@/components/settings/BillingPortalButton'
import Icon from '@/components/ui/Icon'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, subscriptionResult, pushResult, equipmentResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('nome, nivel_atual, objetivo, local_treino, dias_por_semana, preferencia_treino, condominio_nome, condominio_cep, condominio_fotos, peso, altura, idade, sexo, telefone')
      .eq('id', user.id)
      .single(),

    supabase
      .from('subscriptions')
      .select('plano, status, fim, trial_ends_at, stripe_customer_id')
      .eq('user_id', user.id)
      .in('status', ['ativa', 'trial'])
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

    supabase
      .from('user_equipment')
      .select('id, nome_custom')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: true }),
  ])

  const profile = profileResult.data
  const subscription = subscriptionResult.data
  const pushConfig = pushResult.data
  const equipment = equipmentResult.data ?? []

  const nivel = (profile?.nivel_atual ?? 'adaptacao') as TrainingLevel
  const levelCfg = LEVEL_CONFIG[nivel]

  const objetivoLabel: Record<string, string> = {
    perda_peso: 'Perda de Peso',
    ganho_massa: 'Ganho de Massa',
    qualidade_vida: 'Qualidade de Vida',
  }

  const preferenciaLabel: Record<string, string> = {
    isolados: 'Treinos Isolados',
    grupos_musculares: 'Grupos Musculares',
    superior_inferior: 'Superior + Inferior',
  }

  const localLabel: Record<string, string> = {
    condominio: 'Academia de Condomínio',
    hotel: 'Hotel / Viagem',
  }

  const fimFormatted = subscription?.fim
    ? new Date(subscription.fim).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  const trialEndsFormatted = subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  const isTrial = subscription?.status === 'trial'
  const hasPortal = !!subscription?.stripe_customer_id

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
          <div className="flex items-center justify-between">
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Perfil</h2>
            <Link
              href="/settings/perfil"
              className="text-xs text-[#FF8C00] hover:text-[#E07000] transition-colors"
            >
              Editar →
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06]">
            {[
              { label: 'Nome', value: profile?.nome ?? '—' },
              {
                label: 'Nível',
                value: `${levelCfg.emoji} ${levelCfg.label}`,
              },
              {
                label: 'Objetivo',
                value: profile?.objetivo
                  ? profile.objetivo.split(',').map((o: string) => objetivoLabel[o.trim()] ?? o.trim()).join(', ')
                  : '—',
              },
              {
                label: 'Preferência',
                value: preferenciaLabel[profile?.preferencia_treino ?? ''] ?? '—',
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

        {/* Academia do Condomínio */}
        {profile?.local_treino === 'condominio' && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Minha Academia</h2>
              <Link
                href="/settings/equipamentos"
                className="text-xs text-[#FF8C00] hover:text-[#E07000] transition-colors"
              >
                Gerenciar →
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-4">
              {/* Nome e CEP */}
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <Icon name="home" className="text-white/50" /> {profile.condominio_nome ?? 'Condomínio'}
                </p>
                {profile.condominio_cep && (
                  <p className="text-xs text-white/40">
                    CEP {profile.condominio_cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')}
                  </p>
                )}
              </div>

              {/* Fotos */}
              {profile.condominio_fotos && profile.condominio_fotos.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-white/40">{profile.condominio_fotos.length} foto(s) da academia</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {(profile.condominio_fotos as string[]).slice(0, 6).map((url, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {profile.condominio_fotos.length > 6 && (
                      <div className="w-16 h-16 rounded-xl bg-white/[0.03] border border-white/10 shrink-0 flex items-center justify-center">
                        <span className="text-xs text-white/40">+{profile.condominio_fotos.length - 6}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Equipamentos */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/40">
                  {equipment.length > 0
                    ? `${equipment.length} equipamento(s) detectado(s)`
                    : 'Nenhum equipamento cadastrado'}
                </p>
                <Link
                  href="/settings/equipamentos"
                  className="text-xs text-[#FF8C00] hover:text-[#E07000] transition-colors"
                >
                  Ver lista →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Medidas */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Medidas</h2>
            <Link
              href="/atualizar-medidas"
              className="text-xs text-[#FF8C00] hover:text-[#E07000] transition-colors"
            >
              Atualizar →
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06]">
            {[
              { label: 'Peso', value: profile?.peso ? `${profile.peso} kg` : '—' },
              { label: 'Altura', value: profile?.altura ? `${profile.altura} cm` : '—' },
              { label: 'Idade', value: profile?.idade ? `${profile.idade} anos` : '—' },
              {
                label: 'Sexo',
                value: profile?.sexo === 'masculino' ? 'Masculino' : profile?.sexo === 'feminino' ? 'Feminino' : '—',
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm text-white/50">{row.label}</p>
                <p className="text-sm font-medium">{row.value}</p>
              </div>
            ))}
          </div>
          {(!profile?.peso || !profile?.altura || !profile?.idade) && (
            <p className="text-xs text-white/30 leading-relaxed">
              Complete suas medidas para ver o{' '}
              <Link href="/progress" className="text-[#FF8C00] hover:text-[#E07000] transition-colors">
                Lets Body Score
              </Link>{' '}
              na tela de progresso.
            </p>
          )}
        </section>

        {/* Contato */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Contato</h2>
          <TelefoneInput userId={user.id} initialTelefone={profile?.telefone ?? null} />
        </section>

        {/* Assinatura */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Assinatura</h2>

          {isTrial ? (
            <div className="rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/[0.04] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#FF8C00] flex items-center gap-1.5"><Icon name="gift" /> Trial ativo</span>
                <span className="text-xs text-white/50 capitalize">{subscription!.plano}</span>
              </div>
              {trialEndsFormatted && (
                <p className="text-xs text-white/40">
                  Gratuito até <strong className="text-white/60">{trialEndsFormatted}</strong>. Após isso, cobramos automaticamente.
                </p>
              )}
              {hasPortal && (
                <BillingPortalButton label="Gerenciar assinatura" variant="ghost" />
              )}
            </div>
          ) : subscription ? (
            <div className="rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/[0.04] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#FF8C00] flex items-center gap-1.5"><Icon name="check-circle" /> Ativa</span>
                <span className="text-xs text-white/50 capitalize">{subscription.plano}</span>
              </div>
              {fimFormatted && (
                <p className="text-xs text-white/40">Renova em {fimFormatted}</p>
              )}
              {hasPortal && (
                <BillingPortalButton label="Gerenciar assinatura →" variant="ghost" />
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
          <p className="text-xs text-white/20 flex items-center justify-center gap-1">Lets Train v0.1 · Feito com <Icon name="dumbbell" /></p>
        </div>
      </div>
    </div>
  )
}
