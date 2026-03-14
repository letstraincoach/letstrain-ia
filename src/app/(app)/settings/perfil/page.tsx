import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileEditor from '@/components/settings/ProfileEditor'
import AvatarEditor from '@/components/settings/AvatarEditor'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'

export default async function EditarPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('nome, objetivo, dias_por_semana, preferencia_treino, personal_slug, avatar_url, nivel_atual')
    .eq('id', user.id)
    .single()

  const nivel     = (profile?.nivel_atual ?? 'adaptacao') as TrainingLevel
  const levelCfg  = LEVEL_CONFIG[nivel]
  const firstName = profile?.nome?.split(' ')[0] ?? 'Atleta'

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

      {/* ── Banner cinematográfico ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 180 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tierImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.45 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.6) 55%, rgba(10,10,10,1) 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 20% 30%, ${levelCfg.cor}22 0%, transparent 65%)`,
          }}
        />

        {/* Voltar + título */}
        <div className="relative z-10 px-5 pt-8 pb-6 flex flex-col gap-6">
          <Link href="/settings" className="text-sm text-white/50 hover:text-white/80 transition-colors w-fit">
            ← Voltar
          </Link>
          <div>
            <p className="text-xs text-white/40 mb-1">{firstName}</p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Editar Perfil</h1>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: levelCfg.cor + '22',
                  color: levelCfg.cor,
                  border: `1px solid ${levelCfg.cor}40`,
                }}
              >
                {levelCfg.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="px-5 pb-10 flex flex-col gap-8 max-w-sm mx-auto">

        <AvatarEditor
          userId={user.id}
          currentAvatarUrl={(profile?.avatar_url as string | null) ?? null}
        />

        <ProfileEditor
          userId={user.id}
          initialNome={profile?.nome ?? ''}
          initialObjetivo={profile?.objetivo ? (profile.objetivo as string).split(',').map((s: string) => s.trim()) : []}
          initialDias={profile?.dias_por_semana ?? 3}
          initialPreferencia={(profile?.preferencia_treino as string | null) ?? ''}
          initialPersonal={(profile?.personal_slug as string | null) ?? 'guilherme'}
        />

      </div>
    </div>
  )
}
