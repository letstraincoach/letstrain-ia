import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileEditor from '@/components/settings/ProfileEditor'

export default async function EditarPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('nome, objetivo, dias_por_semana, preferencia_treino')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-8">

        <div className="flex items-center gap-3">
          <Link href="/settings" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Voltar
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
          <p className="text-sm text-white/50 mt-1">Atualize seus objetivos e preferências de treino</p>
        </div>

        <ProfileEditor
          userId={user.id}
          initialNome={profile?.nome ?? ''}
          initialObjetivo={profile?.objetivo ? (profile.objetivo as string).split(',').map((s: string) => s.trim()) : []}
          initialDias={profile?.dias_por_semana ?? 3}
          initialPreferencia={(profile?.preferencia_treino as string | null) ?? ''}
        />

      </div>
    </div>
  )
}
